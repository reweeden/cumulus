import * as log from '@cumulus/common/log';
import mime from 'mime-types';
import { s3 } from '@cumulus/aws-client/services';
import * as S3 from '@cumulus/aws-client/S3';
import { Client, ConnectConfig, SFTPWrapper } from 'ssh2';
import { PassThrough, Readable } from 'stream';
import { FileEntry } from 'ssh2-streams';

export type SftpClientConstructorConfig = {
  host: string,
  port: number,
  username?: string,
  password?: string,
  privateKey?: string
};

export class SftpClient {
  private host: string;
  private sshClient: Client;
  private connected: boolean;
  private clientOptions: ConnectConfig;

  constructor(config: SftpClientConstructorConfig) {
    this.host = config.host;

    this.clientOptions = {
      host: config.host,
      port: config?.port ?? 22,
      username: config.username,
      password: config.password,
      privateKey: config.privateKey
    };

    this.sshClient = new Client();
    this.connected = false;
  }

  async end() {
    if (!this.connected) return;

    await new Promise((resolve, reject) => {
      this.sshClient
        .on('close', () => {
          this.connected = false;
          resolve();
        })
        .on('error', reject)
        .end();
    });
  }

  /**
   * build remote url
   *
   * @param {string} remotePath - the full path to the remote file to be fetched
   * @returns {string} - remote url
   * @private
   */
  private buildRemoteUrl(remotePath: string) {
    // FIXME Don't use path.join
    // return `sftp://${path.join(this.host, '/', remotePath)}`;
    return `sftp://${this.host}/${remotePath}`;
  }

  /**
   * Download a remote file to disk
   *
   * @param {string} remotePath - the full path to the remote file to be fetched
   * @param {string} localPath - the full local destination file path
   * @returns {Promise<string>} - the local path that the file was saved to
   */
  async download(remotePath: string, localPath: string) {
    const remoteUrl = this.buildRemoteUrl(remotePath);

    log.info(`Downloading ${remoteUrl} to ${localPath}`);

    await this.fastGet(remotePath, localPath);

    log.info(`Finished downloading ${remoteUrl} to ${localPath}`);

    return localPath;
  }

  /**
   * Transfer the remote file to a given s3 location
   *
   * @param {string} remotePath - the full path to the remote file to be fetched
   * @param {string} bucket - destination s3 bucket of the file
   * @param {string} key - destination s3 key of the file
   * @returns {Promise.<{ s3uri: string, etag: string }>} an object containing
   *    the S3 URI and ETag of the destination file
   */
  async syncToS3(remotePath: string, bucket: string, key: string) {
    const remoteUrl = this.buildRemoteUrl(remotePath);
    const s3uri = S3.buildS3Uri(bucket, key);

    log.info(`Copying ${remoteUrl} to ${s3uri}`);

    const readable = await this.createReadStream(remotePath);
    const pass = new PassThrough();
    readable.pipe(pass);

    const params = {
      Bucket: bucket,
      Key: key,
      Body: pass,
      ContentType: mime.lookup(key) || undefined
    };

    const result = await S3.promiseS3Upload(params);

    log.info(`Finished copying ${remoteUrl} to ${s3uri}`);

    return {
      s3uri,
      etag: result.ETag
    };
  }

  /**
   * List file in remote path
   *
   * @param {string} remotePath - the remote path to be listed
   * @returns {Promise<Array<Object>>} list of file objects
   */
  async list(remotePath: string) {
    let remoteFiles: FileEntry[];
    try {
      remoteFiles = await this.readdir(remotePath);
    } catch (error) {
      if (error.message.includes('No such file')) {
        remoteFiles = [];
      } else {
        throw error;
      }
    }

    return remoteFiles.map((remoteFile) => ({
      name: remoteFile.filename,
      path: remotePath,
      type: remoteFile.longname.substr(0, 1),
      size: remoteFile.attrs.size,
      time: remoteFile.attrs.mtime * 1000
    }));
  }

  /**
   * Transfer an s3 file to remote path
   *
   * @param {Object} s3object
   * @param {string} s3object.Bucket - S3 bucket
   * @param {string} s3object.Key - S3 object key
   * @param {string} remotePath - the full remote destination file path
   * @returns {Promise}
   */
  async syncFromS3(
    s3object: { Bucket: string, Key: string },
    remotePath: string
  ) {
    const s3uri = S3.buildS3Uri(s3object.Bucket, s3object.Key);

    if (!(await S3.s3ObjectExists(s3object))) {
      return Promise.reject(new Error(`Sftp.syncFromS3 ${s3uri} does not exist`));
    }

    const remoteUrl = this.buildRemoteUrl(remotePath);

    log.info(`Uploading ${s3uri} to ${remoteUrl}`);

    const readStream = await S3.getObjectReadStream({
      s3: s3(),
      bucket: s3object.Bucket,
      key: s3object.Key
    });

    return this.uploadFromStream(readStream, remotePath);
  }

  /**
   * Upload data from stream to a remote file
   *
   * @param {Readable} readStream - the stream content to be written to the file
   * @param {string} remotePath - the full remote destination file path
   * @returns {Promise}
   * @private
   */
  async uploadFromStream(readStream: Readable, remotePath: string) {
    const writeStream = await this.createWriteStream(remotePath);

    return new Promise((resolve, reject) => {
      writeStream.on('error', reject);
      readStream.on('error', reject);
      readStream.pipe(writeStream);
      writeStream.on('close', resolve);
    });
  }

  async unlink(path: string) {
    const sftpSession = await this.createSftpSession();

    await new Promise((resolve, reject) => {
      sftpSession.unlink(path, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private async getSshClient() {
    if (!this.connected) {
      await new Promise((resolve, reject) => {
        this.sshClient
          .on('ready', () => {
            this.connected = true;
            resolve();
          })
          .on('error', reject)
          .connect(this.clientOptions);
      });
    }

    return this.sshClient;
  }

  private async createSftpSession(): Promise<SFTPWrapper> {
    const sshClient = await this.getSshClient();

    return new Promise((resolve, reject) => {
      sshClient.sftp((err, sftp) => {
        if (err) reject(err);
        else resolve(sftp);
      });
    });
  }

  private async createReadStream(path: string) {
    const sftpSession = await this.createSftpSession();

    return sftpSession.createReadStream(path);
  }

  private async createWriteStream(path: string) {
    const sftpSession = await this.createSftpSession();

    return sftpSession.createWriteStream(path);
  }

  private async fastGet(remotePath: string, localPath: string) {
    const sftpSession = await this.createSftpSession();

    await new Promise((resolve, reject) => {
      sftpSession.fastGet(remotePath, localPath, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private async readdir(location: string): Promise<FileEntry[]> {
    const sftpSession = await this.createSftpSession();

    return new Promise((resolve, reject) => {
      sftpSession.readdir(location, (error, list) => {
        if (error) reject(error);
        else resolve(list);
      });
    });
  }
}

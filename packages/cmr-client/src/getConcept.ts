import got from 'got';
import Logger from '@cumulus/logger';
import { OutgoingHttpHeaders } from 'http';

const log = new Logger({ sender: 'cmr-client' });

/**
 * Get the CMR JSON metadata from the cmrLink
 *
 * @param {string} conceptLink - link to concept in CMR
 * @param {Object} headers - the CMR headers
 * @returns {Object} - metadata as a JS object, null if not
 * found
 */
async function getConceptMetadata(
  conceptLink: string,
  headers: OutgoingHttpHeaders
): Promise<null|unknown> {
  let response: got.Response<string>;

  try {
    response = await got.get(conceptLink, { headers });
  } catch (error) {
    log.error(`Error getting concept metadata from ${conceptLink}`, error);
    return null;
  }

  if (response.statusCode !== 200) {
    log.error(`Received statusCode ${response.statusCode} getting concept metadata from ${conceptLink}`);
    return null;
  }

  const body = JSON.parse(response.body);

  return <unknown>(body.feed.entry[0]);
}

export = getConceptMetadata;

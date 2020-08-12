import Logger from '@cumulus/logger';
import got, { Headers, Response } from 'got';
import { parseCmrXmlResponse } from './Utils';

import getUrl from './getUrl';
import { ParsedCmrXmlResponse } from './types';

const log = new Logger({ sender: 'cmr-client' });

/**
 * Deletes a record from the CMR
 *
 * @param {string} type - the concept type. Choices are: collection, granule
 * @param {string} identifier - the record id
 * @param {string} provider - the CMR provider id
 * @param {Object} headers - the CMR headers
 * @returns {Promise.<Object>} the CMR response object
 */
async function deleteConcept(
  type: string,
  identifier: string,
  provider: string,
  headers: Headers
): Promise<ParsedCmrXmlResponse> {
  const url = `${getUrl('ingest', provider)}${type}/${identifier}`;
  log.info(`deleteConcept ${url}`);

  let result: Response<string>;
  try {
    result = await got.delete(url, { headers });
  } catch (error) {
    result = error.response;
  }
  const cmrResponse = await parseCmrXmlResponse(result.body);

  if (result.statusCode === 200) {
    return cmrResponse;
  }

  let errorMessage = `Failed to delete, statusCode: ${result.statusCode}, statusMessage: ${result.statusMessage}`;

  if (cmrResponse.errors) {
    errorMessage = `${errorMessage}, CMR error message: ${JSON.stringify(cmrResponse.errors.error)}`;
  }

  log.info(errorMessage);

  if (result.statusCode === 404) {
    return cmrResponse;
  }

  throw new Error(errorMessage);
}

export = deleteConcept;

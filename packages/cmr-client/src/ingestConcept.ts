import got, { Headers } from 'got';
import get from 'lodash/get';
import Logger from '@cumulus/logger';

import validate from './validate';
import getUrl from './getUrl';
import { parseCmrXmlResponse } from './Utils';
import { ConceptType, ParsedCmrXmlResponse } from './types';

const log = new Logger({ sender: 'cmr-client' });

const logDetails: {[key: string]: unknown} = {
  file: 'cmr-client/ingestConcept.js'
};

/**
 * Posts a record of any kind (collection, granule, etc) to
 * CMR
 *
 * @param {string} type - the concept type. Choices are: collection, granule
 * @param {string} xmlString - the CMR record in xml
 * @param {string} identifierPath - the concept's unique identifier
 * @param {string} provider - the CMR provider id
 * @param {Object} headers - the CMR headers
 * @returns {Promise.<Object>} the CMR response object
 */
async function ingestConcept(
  type: ConceptType,
  xmlString: string,
  identifierPath: string,
  provider: string,
  headers: Headers
): Promise<ParsedCmrXmlResponse> {
  let cmrResponse = await parseCmrXmlResponse(xmlString);

  const identifier = <string>get(cmrResponse, identifierPath);
  logDetails.granuleId = identifier;

  try {
    await validate(type, xmlString, identifier, provider);

    const response = await got.put(
      `${getUrl('ingest', provider)}${type}s/${identifier}`,
      {
        body: xmlString,
        headers
      }
    );

    cmrResponse = await parseCmrXmlResponse(response.body);

    if (cmrResponse.errors) {
      const xmlObjectError = JSON.stringify(cmrResponse.errors.error);
      throw new Error(`Failed to ingest, CMR error message: ${xmlObjectError}`);
    }

    return cmrResponse;
  } catch (error) {
    log.error(error, logDetails);
    throw error;
  }
}
export = ingestConcept;

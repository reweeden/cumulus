import got from 'got';
import ValidationError from './ValidationError';
import getUrl from './getUrl';
import { parseCmrXmlResponse } from './Utils';

/**
 * Posts a given xml string to the validate endpoint of the CMR
 * and returns the results
 *
 * @param {string} type - service type
 * @param {string} xml - the xml document
 * @param {string} identifier - the document identifier
 * @param {string} provider - the CMR provider
 * @returns {Promise.<true>} returns true if the document is valid
 */
async function validate(
  type: string,
  xml: string,
  identifier: string,
  provider: string
): Promise<true> {
  let result;
  try {
    result = await got.post(`${getUrl('validate', provider)}${type}/${identifier}`, {
      body: xml,
      headers: {
        'Content-type': 'application/echo10+xml'
      }
    });

    if (result.statusCode === 200) {
      return true;
    }
  } catch (error) {
    result = error.response;
  }

  const parsed = await parseCmrXmlResponse(result.body);
  const error = parsed.errors?.error;

  throw new ValidationError(
    `Validation was not successful, CMR error message: ${JSON.stringify(error)}`
  );
}

export = validate;

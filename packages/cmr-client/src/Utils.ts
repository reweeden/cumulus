import xml2js from 'xml2js';
import { ParsedCmrXmlResponse } from './types';

export async function parseCmrXmlResponse(
  xmlString: string
): Promise<ParsedCmrXmlResponse> {
  return new Promise((resolve, reject) => {
    xml2js.parseString(
      xmlString,
      {
        ignoreAttrs: true,
        mergeAttrs: true,
        explicitArray: false
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
}

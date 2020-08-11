import xml2js from 'xml2js';

export async function parseXMLString(xmlString: string): Promise<unknown> {
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

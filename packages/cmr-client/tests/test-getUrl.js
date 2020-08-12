'use strict';

const test = require('ava');

const {
  getProviderUrl,
  getSearchUrl,
  getTokenUrl,
  getValidateUrl
} = require('../getUrl');

test('getTokenUrl returns the correct URL for the OPS env', (t) => {
  t.is(
    getTokenUrl('OPS'),
    'https://cmr.earthdata.nasa.gov/legacy-services/rest/tokens'
  );
});

test('getTokenUrl returns the UAT URL any value other than OPS', (t) => {
  t.is(
    getTokenUrl('asdf'),
    'https://cmr.uat.earthdata.nasa.gov/legacy-services/rest/tokens'
  );
});

test('getSearchUrl returns the correct URL if cmrHost is specified', (t) => {
  t.is(
    getSearchUrl({ cmrHost: 'my.cmr.host' }),
    'https://my.cmr.host/search/'
  );
});

test('getSearchUrl ignores the specified environment if cmrHost is specified', (t) => {
  t.is(
    getSearchUrl({ cmrHost: 'my.cmr.host', cmrEnvironment: 'SIT' }),
    'https://my.cmr.host/search/'
  );
});

test('getSearchUrl returns the correct URLs for each environment', (t) => {
  [
    ['OPS', 'https://cmr.earthdata.nasa.gov/search/'],
    ['UAT', 'https://cmr.uat.earthdata.nasa.gov/search/'],
    ['SIT', 'https://cmr.sit.earthdata.nasa.gov/search/']
  ].forEach(([cmrEnvironment, expected]) => t.is(getSearchUrl({ cmrEnvironment }), expected));
});

test('getSearchUrl throws an exception for an invalid environment', (t) => {
  t.throws(
    () => getSearchUrl({ cmrEnvironment: 'INVALID' }),
    { instanceOf: TypeError }
  );
});

test('getValidateUrl returns the correct URL if cmrHost is specified', (t) => {
  t.is(
    getValidateUrl({ cmrProvider: 'my-provider', cmrHost: 'my.cmr.host' }),
    'https://my.cmr.host/ingest/providers/my-provider/validate/'
  );
});

test('getValidateUrl ignores the specified environment if cmrHost is specified', (t) => {
  t.is(
    getValidateUrl({
      cmrProvider: 'my-provider',
      cmrHost: 'my.cmr.host',
      cmrEnvironment: 'SIT'
    }),
    'https://my.cmr.host/ingest/providers/my-provider/validate/'
  );
});

test('getValidateUrl returns the correct URLs for each environment', (t) => {
  [
    ['OPS', 'https://cmr.earthdata.nasa.gov/ingest/providers/my-provider/validate/'],
    ['UAT', 'https://cmr.uat.earthdata.nasa.gov/ingest/providers/my-provider/validate/'],
    ['SIT', 'https://cmr.sit.earthdata.nasa.gov/ingest/providers/my-provider/validate/']
  ].forEach(([cmrEnvironment, expected]) => {
    t.is(
      getValidateUrl({ cmrProvider: 'my-provider', cmrEnvironment }),
      expected,
      `${cmrEnvironment} = ${expected}`
    );
  });
});

test('getValidateUrl throws an exception for an invalid environment', (t) => {
  t.throws(
    () => getValidateUrl({ cmrProvider: 'asdf', cmrEnvironment: 'INVALID' }),
    { instanceOf: TypeError }
  );
});

test('getProviderUrl returns the correct URL if cmrHost is specified', (t) => {
  t.is(
    getProviderUrl({ cmrProvider: 'my-provider', cmrHost: 'my.cmr.host' }),
    'https://my.cmr.host/ingest/providers/my-provider/'
  );
});

test('getProviderUrl ignores the specified environment if cmrHost is specified', (t) => {
  t.is(
    getProviderUrl({
      cmrProvider: 'my-provider',
      cmrHost: 'my.cmr.host',
      cmrEnvironment: 'SIT'
    }),
    'https://my.cmr.host/ingest/providers/my-provider/'
  );
});

test('getProviderUrl returns the correct URLs for each environment', (t) => {
  [
    ['OPS', 'https://cmr.earthdata.nasa.gov/ingest/providers/my-provider/'],
    ['UAT', 'https://cmr.uat.earthdata.nasa.gov/ingest/providers/my-provider/'],
    ['SIT', 'https://cmr.sit.earthdata.nasa.gov/ingest/providers/my-provider/']
  ].forEach(([cmrEnvironment, expected]) => {
    t.is(
      getProviderUrl({ cmrProvider: 'my-provider', cmrEnvironment }),
      expected,
      `${cmrEnvironment} = ${expected}`
    );
  });
});

test('getProviderUrl throws an exception for an invalid environment', (t) => {
  t.throws(
    () => getProviderUrl({ cmrProvider: 'asdf', cmrEnvironment: 'INVALID' }),
    { instanceOf: TypeError }
  );
});

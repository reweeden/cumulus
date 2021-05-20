'use strict';

const test = require('ava');
const cryptoRandomString = require('crypto-random-string');

const {
  getGranuleQueryFields,
  getGranuleStatus,
  getMessageGranules,
  messageHasGranules,
} = require('../Granules');

const randomId = (prefix) => `${prefix}${cryptoRandomString({ length: 10 })}`;

test('getMessageGranules returns granules from payload.granules', (t) => {
  const granules = [{
    granuleId: randomId('granule'),
  }];
  const testMessage = {
    payload: {
      granules,
    },
  };
  const result = getMessageGranules(testMessage);
  t.deepEqual(result, granules);
});

test('getMessageGranules returns an empty array when granules are absent from message', (t) => {
  const testMessage = {};
  const result = getMessageGranules(testMessage);
  t.deepEqual(result, []);
});

test('getGranuleStatus returns workflow status', (t) => {
  t.is(
    getGranuleStatus(
      'completed',
      { status: 'foo' }
    ),
    'completed'
  );
});

test('getGranuleStatus returns status from granule', (t) => {
  t.is(
    getGranuleStatus(
      undefined,
      { status: 'failed' }
    ),
    'failed'
  );
});

test('getGranuleQueryFields returns query fields, if any', (t) => {
  const queryFields = { foo: 'bar' };
  t.deepEqual(
    getGranuleQueryFields(
      {
        meta: {
          granule: {
            queryFields,
          },
        },
      }
    ),
    queryFields
  );
});

test('getGranuleQueryFields returns undefined', (t) => {
  t.is(
    getGranuleQueryFields({}),
    undefined
  );
});

test('messageHasGranules returns undefined if message does not have granules', (t) => {
  t.is(
    messageHasGranules({}),
    false
  );
});

test('messageHasGranules returns granules object if message has granules', (t) => {
  const payloadObject = { payload: { granules: ['someGranuleObject'] } };
  t.is(
    messageHasGranules(payloadObject),
    true
  );
});

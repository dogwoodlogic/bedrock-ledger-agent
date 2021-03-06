/*
 * Copyright (c) 2017-2018 Digital Bazaar, Inc. All rights reserved.
 */
const bedrock = require('bedrock');
const brDidClient = require('bedrock-did-client');

require('bedrock-ledger-node');
require('bedrock-ledger-context');
require('bedrock-ledger-agent');
require('bedrock-ledger-validator-signature');
require('bedrock-ledger-storage-mongodb');
require('bedrock-ledger-consensus-uni');
require('bedrock-ledger-consensus-continuity');
require('bedrock-ledger-consensus-continuity-es-most-recent-participants');
require('bedrock-ledger-context');

bedrock.events.on('bedrock.init', () => {
  const jsonld = bedrock.jsonld;
  const mockData = require('./mocha/mock.data');

  const oldLoader = jsonld.documentLoader;

  jsonld.documentLoader = function(url, callback) {
    if(Object.keys(mockData.ldDocuments).includes(url)) {
      return callback(null, {
        contextUrl: null,
        document: mockData.ldDocuments[url],
        documentUrl: url
      });
    }
    oldLoader(url, callback);
  };
  // override jsonld.documentLoader in brDidClient so this document loader
  // can be used for did: and https: URLs
  brDidClient.jsonld.documentLoader = jsonld.documentLoader;
});

require('bedrock-test');
bedrock.start();

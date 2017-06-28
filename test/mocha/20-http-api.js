/*
 * Copyright (c) 2017 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
'use strict';

const async = require('async');
const bedrock = require('bedrock');
const brLedger = require('bedrock-ledger');
const brLedgerAgent = require('bedrock-ledger-agent');
const config = bedrock.config;
const helpers = require('./helpers');
const mockData = require('./mock.data');
let request = require('request');
request = request.defaults({json: true, strictSSL: false});
//require('request-debug')(request);
const url = require('url');

const urlObj = {
  protocol: 'https',
  host: config.server.host,
  pathname: config['ledger-agent'].routes.agents
};

describe('Ledger Agent HTTP API', () => {
  before(done => {
    helpers.prepareDatabase(mockData, done);
  });
  beforeEach(done => {
    helpers.removeCollection('ledger_testLedger', done);
  });
  describe.only('authenticated as regularUser', () => {
    const regularActor = mockData.identities.regularUser;

    it('should add ledger agent for new ledger', done => {
      const configBlock = mockData.blocks.configBlock;

      request.post(helpers.createHttpSignatureRequest({
        url: url.format(urlObj),
        body: configBlock,
        identity: regularActor
      }), (err, res) => {
        res.statusCode.should.equal(201);
        done(err);
      });
    });
    it.only('should add a ledger agent for an existing ledger node', done => {
      const configBlock = mockData.blocks.configBlock;
      const options = {
        owner: regularActor.id
      };

      async.auto({
        createNode: callback =>
          brLedger.add(regularActor, configBlock, options, callback),
        createAgent: ['createNode', (results, callback) => {
          request.post(helpers.createHttpSignatureRequest({
            url: url.format(urlObj),
            qs: {ledgerNodeId: results.createNode.id},
            identity: regularActor
          }), (err, res) => {
            res.statusCode.should.equal(201);
            done(err);
          });
        }]
      }, err => done(err));
    });
  });
});
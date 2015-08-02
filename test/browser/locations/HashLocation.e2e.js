/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let __   = require('../_config/');
let test = unitjs;
let t    = test;

describe('['+ __E2E_DRIVER + '] HashLocation', function() {
  let client = {};

  beforeEach(function(done) {
    client = webdriver.createClient().init(done);
  });

  afterEach(function(done) {
    client.end(done);
  });

  it('should to add the hash and the trailing slash in URL', function(done) {
    client
      .url(__.url + '/locations/HashLocation.html')
      .waitForVisible('body', 2000)
      .assertUrlEquals(__.url + '/locations/HashLocation.html#/')
      .assertFrontTests()
      .call(done)
    ;
  });

  it('should not add another hash and trailing slash in URL', function(done) {
    client
      .url(__.url + '/locations/HashLocation.html#/')
      .waitForVisible('body', 2000)
      .assertUrlEquals(__.url + '/locations/HashLocation.html#/')
      .assertFrontTests()
      .call(done)
    ;
  });
});
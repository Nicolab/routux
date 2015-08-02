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

describe('['+ __E2E_DRIVER + '] Router', function() {
  let client = {};

  beforeEach(function(done) {
    client = webdriver.createClient().init(done);
  });

  afterEach(function(done) {
    client.end(done);
  });

  it('should run', function(done) {
    client
      .url(__.url + '/routing/router.html')
      .waitForVisible('body', 2000)
      .assertFrontTests()
      .call(done)
    ;
  });
});
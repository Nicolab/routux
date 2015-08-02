/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let router;
let __   = require('../_config/');
let test = unitjs;
let t = test;

describe('HashLocation', function() {
  before(() => {
    router = new routux.Router();
    router.run();
  });

  it('should run', function() {
    test
      .object(router)
      .isInstanceOf(routux.Router)
      .hasProperty('running', true)
    ;
  });
});
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

describe('Location', function() {
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

  describe('Location URLs', function() {
    it('Get base URL (absolute)', function() {
      let baseUrl = __.url + '/locations/Location.html';
      t.string(router.location.baseUrl).isIdenticalTo(baseUrl);
    });

    it('Get current path', function() {
      t.string(router.location.current).isIdenticalTo('/');
    });

    it('Get current URL (relative)', function() {
      t.string(router.location.url).isIdenticalTo('#/');
    });

    it('Get current URL (absolute)', function() {
      t.string(router.location.fullUrl).isIdenticalTo(router.baseUrl + '#/');
    });
  });
});
/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let utils = {
  execOnDOMContentLoaded(cb) {
    document.addEventListener('DOMContentLoaded', cb);
  },

  createSpiedCtrls() {
    let spy = unitjs.spy;

    return {
      mw1: spy(),
      mw2: spy(),
      mw3: spy(),
      mw4: spy(),
      mw5: spy(),
      mwA: spy(),
      mwC: spy(),
      mwC2: spy(),
      home: spy(),
      routeA: spy(),
      routeA2: spy(),
      routeB: spy(),
      routeC: spy(),
      routeD: spy(),
      routeE: spy(),
      errorHandler1: spy(),
      errorHandler2: spy(),
      errorHandler3: spy()
    };
  }
}

module.exports = utils;
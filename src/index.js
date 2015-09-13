/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

import Route from './Route';
import Router from './Router';

let routux = {
  Router,
  Route,
  noConflict() {
    if(window) {
      window.routux = null;
      delete window.routux;
    }

    return this;
  }
};

if(window) {
  window.routux = routux;
}

export default routux;
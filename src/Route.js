/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let ptr = require('path-to-regexp');
let routeId = -1;

class Route {

  constructor(cfg = {}) {
    this.router      = cfg.router;
    this.middlewares = cfg.middlewares;
    this.pattern     = cfg.pattern;
    this.name        = cfg.name || this.pattern;

    routeId++;

    Object.defineProperty(this, '_uid', {
      enumerable   : true,
      configurable : false,
      writable     : false,
      value        : routeId
    });

    if(!this.middlewares.length) {
      throw new Error('A route must have one middleware (or more).');
    }

    this.reset();
  }

  reset() {
    this.params  = {};
    this.query   = {};
    this.regexp  = ptr(this.pattern, this.router.opt.regexp);
    this.getPath = ptr.compile(this.pattern);

    return this;
  }

  /**
   * Base URL (absolute).
   * Shortcut of `Router.location.baseUrl`.
   *
   * @type {string}
   */
  get baseUrl() {
    return this.router.location.baseUrl;
  }

  /**
   * Get URL (relative) of this route.
   *
   * @param  {object} [params] Route parameters.
   * @return {string}  The route URL (relative).
   */
  getUrl(params) {
    return this.router.getUrl(this, params);
  }

  /**
   * Get URL (absolute) of this route.
   *
   * @param  {object} [params] Route parameters.
   * @return {string}  The route URL (absolute).
   */
  getFullUrl(params) {
    return this.router.getFullUrl(this, params);
  }
}

export default Route;
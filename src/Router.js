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
import {mergeRecursive} from './lib/utils';
import HashLocation from './lib/locations/HashLocation';

let routerId = -1;

class Router {

  /**
   * @constructor
   * @param  {object} [options] Router options.
   */
  constructor(options) {
    var _this = this;

    routerId++;

    Object.defineProperty(this, '_uid', {
      enumerable   : true,
      configurable : false,
      writable     : false,
      value        : routerId
    });

    this.opt = {

      // location handler
      location: {
        Adapter: HashLocation,
        opt: []
      },

      regexp: {

        // Enable case sensitivity.
        // When true the route will be case sensitive.
        // Disabled by default, treating `/Foo` and `/foo` as the same.
        sensitive: false,

        // Enable strict routing.
        // When false the trailing slash is optional.
        // Disabled by default, `/foo` and `/foo/` are treated the same by the router.
        strict: false,

        // When false the path will match at the beginning.
        end: true
      }
    };

    mergeRecursive(this.opt, options);

    this.running  = false;
    this._routes  = [];
    this.routes   = {};
    this.location = new this.opt.location.Adapter(this.opt.location.opt);

    this.reset();

    this.location.addChangeListener(function() {
      _this.build().run();
    });

    this.location.ensureSlash();
  }

  /**
   * Base URL (absolute).
   * Shortcut of `Router.location.baseUrl`.
   *
   * @type {string}
   */
  get baseUrl() {
    return this.location.baseUrl;
  }

  /**
   * URL (relative).
   * Shortcut of `Router.location.url`.
   *
   * @type {string}
   */
  get url() {
    return this.location.url;
  }

  /**
   * URL (absolute).
   * Shortcut of `Router.location.fullUrl`.
   *
   * @type {string}
   */
  get fullUrl() {
    return this.location.fullUrl;
  }

  /**
   * Current location without URL prefix (relative).
   * Shortcut of `Router.location.current`.
   *
   * @type {string}
   */
  get current() {
    return this.location.current;
  }

  /**
   * Reset the router context.
   * @return {Router}  Current instance.
   */
  reset() {
    this.matches = {};
    this._matches = [];

    // current request
    this.req = {
      current: this.location.current,
      query: this.location.qs.current,
      params: {},
      ctx: {}
    };

    return this;
  }

  /**
   * Get the `Route` instance of a given route.
   * This method is useful to be assured to get a `Route` instance
   * from a variable.
   *
   * @param {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   *
   * @param {object} [params] Route parameters.
   *
   * @return {Route} The route instance.
   */
  getRoute(route) {
    let refErrorMsg = 'First argument of "Router.getRoute()" must be a valid ' +
      '"route" (route name or "Route" instance).'
    ;

    if(!route) {
      throw new ReferenceError(refErrorMsg);
    }

    if(typeof route === 'string') {
      route = this.routes[route];
    } else if(route.name) {
      route = this.routes[route.name];
    }

    if(!route instanceof Route) {
      throw new ReferenceError(refErrorMsg);
    }

    return route;
  }

  /**
   * Get the route path of a given route.
   *
   * @param {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   *
   * @param  {object} [params] Route parameters.
   *
   * @return {string}  The route path.
   */
  getPath(route, params) {
    return this.getRoute(route).getPath(params);
  }

  /**
   * Get the route URL (relative) of a given route.
   *
   * @param {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   *
   * @param  {object} [params] Route parameters.
   *
   * @return {string}  The route URL (relative).
   */
  getUrl(route, params) {
    return this.location.urlPrefix + this.getPath(route, params);
  }

  /**
   * Get the route URL (absolute) of a given route.
   *
   * @param {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   *
   * @param  {object} [params] Route parameters.
   *
   * @return {string}  The route URL (absolute).
   */
  getFullUrl(route, params) {
    let url = this.getUrl(route, params);

    url = url.charAt(0) === '/' ? url.substring(1) : url;

    return this.location.baseUrl + url;
  }

  /**
   * Go to a given document by passing his route.
   *
   * @param  {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   * @param  {object} [params]   Parameters used for generate the path.
   * @return {Router}  Current instance.
   */
  goTo(route, params) {
    if(!route) {
      throw new ReferenceError('First argument of "Router.goTo()" must be a valid "route".');
    }

    return this.goToLocation(this.getPath(route, params));
  }

  /**
   * Replace the current document with a new one by passing his route.
   *
   * @param  {Route|object|string} route `Route` instance
   * or route name or an `object` containing a property `name`.
   * @param  {object} [params]   Parameters used for generate the path.
   * @return {Router}  Current instance.
   */
  replaceWith(route, params) {
    return this.replaceLocation(this.getPath(route, params));
  }

  /**
   * Go to a given location by passing the path.
   *
   * @param  {string}  path The path.
   * @return {Router}  Current instance.
   */
  goToLocation(path) {
    this.location.push(path);
    return this;
  }

  /**
   * Replace the current document with a new one by passing the path.
   *
   * @param  {string}  path The path.
   * @return {Router}  Current instance.
   */
  replaceLocation(path) {
    this.location.replace(path);
    return this;
  }

  /**
   * Go to the preview URL of the history list.
   *
   * @return {Router}  Current instance.
   */
  goBack() {
    this.location.historyBack();
    return this;
  }

  /**
   * Go to the preview URL of the history list.
   *
   * @return {Router}  Current instance.
   */
  goForward() {
    this.location.historyForward();
    return this;
  }

  /**
   * Add a route listener or a middleware.
   * @param {string|function} Route name, pattern or middleware.
   * @param {function|string} [middleware] Required if the first argument is
   * the pattern or route name.
   * @param {function} [...middleware]
   * @return {Router}
   */
  use(middleware/*|pattern|name [, ...middleware]*/) {
    let nextIndex, name, pattern, middlewares;

    nextIndex = this._routes.length;

    // use(fn1[, fn2, ...])
    if(typeof middleware === 'function') {
      pattern     = '/:path*';
      middlewares = Array.prototype.slice.call(arguments, 0);
      name        = '__route_' + nextIndex;
    }

    // use({name, pattern, middlewares})
    else if(typeof middleware === 'object') {
      pattern     = middleware.pattern || '/:path*';
      name        = middleware.name || '__route_' + nextIndex;
      middlewares = middleware.middlewares;
    }

    // use('home', '/', fn1[, fn2, ...])
    else if(typeof arguments[0] === 'string'
    && typeof arguments[1] === 'string') {
      name        = arguments[0];
      pattern     = arguments[1];
      middlewares = Array.prototype.slice.call(arguments, 2);
    }

    // use('/', fn1[, fn2, ...])
    else{
      pattern     = middleware;
      name        = '__route_' + nextIndex;
      middlewares = Array.prototype.slice.call(arguments, 1);
    }

    this.routes[name] = new Route({
      router     : this,
      name       : name,
      pattern    : pattern,
      middlewares: middlewares
    });

    this._routes.push(this.routes[name]);

    // Init the route
    return this.buildRoute(this._routes[nextIndex]);
  }

  /**
   * Build the router context and all routes.
   *
   * @return {Router}  Current instance.
   */
  build() {
    this.reset();

    for(var i = 0, ln = this._routes.length; i < ln; i++) {
      this.buildRoute(this._routes[i]);
    }

    return this;
  }

  /**
   * Build a route.
   *
   * @param  {Route}   route The route to build.
   * @return {Router}  Current instance.
   */
  buildRoute(route) {
    let keyName;
    route.reset().regexp.result = route.regexp.exec(this.location.current);

    if(route.regexp.result) {
      for(var iK = 0, lnK = route.regexp.keys.length; iK < lnK; iK++) {
        keyName = route.regexp.keys[iK].name;

        route.query           = this.req.query;
        route.params[keyName] = route.regexp.result[iK + 1];

        this.req.params[keyName] = route.params[keyName];
      }

      this.matches[route.name] = route;
      this._matches.push(this.matches[route.name]);
    }

    return this;
  }

  /**
   * Run the router
   *
   * @return {Router}  Current instance.
   */
  run() {
    let stack, next;

    stack = [];

    next = (error) => {
      if(stack.length) {
        let {route, middleware} = stack.shift();

        // if the middleware does not handle the error
        if(middleware.length < 3) {
          if(error) {
            return next(error);
          }

          middleware.call(route, this.req, (err) => {
            next(err);
          });
        }
        // the middleware handle the error
        else{
          middleware.call(route, error, this.req, (err) => {
            next(err);
          });
        }
      }
    };

    // list the matched routes
    for(let i = 0, ln = this._matches.length; i < ln; i++) {
      let route = this._matches[i];

      // add (in the stack) all middlewares of this route
      for(let mwIdx = 0, mwLn = route.middlewares.length; mwIdx < mwLn; mwIdx++) {
        stack.push({
          route: route,
          middleware: route.middlewares[mwIdx]
        });
      }
    }

    this.running = true;

    // start the middlewares stack
    next();

    return this;
  }
}

export default Router;

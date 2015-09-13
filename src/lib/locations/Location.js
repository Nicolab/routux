/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

import qs from 'qs';

class Location {

  /**
   * Indicates a new location is being pushed to the history stack.
   * @type {string}
   */
  PUSH = 'push';

  /**
   * Indicates the current location should be replaced.
   * @type {string}
   */
  REPLACE = 'replace';

  /**
   * Indicates the most recent entry should be removed from the history stack.
   * @type {string}
   */
  POP = 'pop';

  _actionType = null;
  _isListening = false;
  _listeners = [];

  constructor(opt = {}) {
    let _this = this;
    this.opt = opt;

    // Query String parser
    this.qs = {
      __proto__: qs
    };

    // Improve qs ...

    // parse current query string with the given options
    this.qs.currentWith = (options) => {
      return _this.qs.parse(_this.queryString, options);
    };

    // Current qs
    Object.defineProperty(this.qs, 'current', {
      get() {
        return _this.qs.parse(_this.normalizePath(_this.queryString));
      }
    });

    this.urlPrefix = this.pathPrefix = '/';
  }

  /**
   * Current location.
   * @type {string}
   */
  get current() {
    throw new ReferenceError(
      'Location.current is not implemented by the adapter used.'
    );
  }

  get queryString() {
    throw new ReferenceError(
      'Location.queryString is not implemented by the adapter used.'
    );
  }

  get baseUrl() {
    throw new ReferenceError(
      'Location.baseUrl is not implemented by the adapter used.'
    );
  }

  get url() {
    throw new ReferenceError(
      'Location.url is not implemented by the adapter used.'
    );
  }

  get fullUrl() {
    return this.baseUrl + this.url;
  }

  ensureSlash() {
    var path = this.current;

    if(path.charAt(0) === '/') {
      return true;
    }

    this.replace('/' + path);

    return false;
  }

  normalizePath(path) {
    if(path.charAt(0) === '/') {
      return decodeURI(path);
    }

    return '/' + decodeURI(path);
  }

  historyBack() {
    this.pop();
  }

  historyForward() {
    this.push();
  }

  _onChange() {
    let curActionType;

    if(this.ensureSlash()) {

      // If we don't have an Location._actionType then all we know is the path
      // changed. It was probably caused by the user clicking the Back
      // button, but may have also been the Forward button or manual
      // manipulation. So just guess 'pop'.
      curActionType = this._actionType;
      this._actionType = null;

      this.notifyChange(curActionType || this.POP);
    }
  }

  notifyChange(type) {
    let change, _this;

    _this = this;

    change = {
      path: this.current,
      type: type
    };

    this._listeners.forEach((listener) => {
      listener.call(_this, change);
    });
  }

  addChangeListener(listener) {
    this._listeners.push(listener);

    // Do this BEFORE listening for hashchange.
    this.ensureSlash();
  }

  removeChangeListener(listener) {
    this._listeners = this._listeners.filter(function (fn) {
      return fn !== listener;
    });
  }

  /*------------------------------------------------------------------------*\
    Actions
  \*------------------------------------------------------------------------*/

  push(/*path*/) {
    this._actionType = this.PUSH;
  }

  replace(/*path*/) {
    this._actionType = this.REPLACE;
  }

  pop() {
    this._actionType = this.POP;
  }
}

export default Location;
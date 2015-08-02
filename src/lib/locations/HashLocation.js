/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

import Location from './Location';

/**
 * A Location that uses `window.location.hash`.
 */
class HashLocation extends Location {

  constructor(opt) {
    super(opt);

    // prefix by hash
    this.pathPrefix = this.opt.pathPrefix || '#';

    // URL prefix
    this.urlPrefix = this.pathPrefix;

    this._onChange = this._onChange.bind(this);
  }

  get current() {
    // We can't use window.location.hash here because it's not
    // consistent across browsers - Firefox will pre-decode it!
    return this.normalizePath(window.location.href);
  }

  get queryString() {
    return window.location.search.substring(1);
  }

  /**
   * Current base URL (absolute).
   * @type {string}
   */
  get baseUrl() {
    return window.location.origin + window.location.pathname;
  }

  /**
   * Current URL (relative)
   * @type {string}
   */
  get url() {
    return this.urlPrefix + this.normalizePath(window.location.hash);
  }

  /**
   * Current URL (absolute)
   * @type {string}
   */
  get fullUrl() {
    let url = this.url.charAt(0) === '/' ? this.url.substring(1) : this.url;
    return this.baseUrl + url;
  }

  normalizePath(path) {
    if(path && path.indexOf(this.baseUrl) === 0) {
      path = path.slice(this.baseUrl.length);
    }

    if(path.indexOf(this.pathPrefix) === -1) {
      return decodeURI(path);
    }

    return decodeURI(path.split(this.pathPrefix)[1] || '');
  }

  historyBack() {
    super.pop.call(this);
    window.history.back();
  }

  historyForward() {
    super.push.call(this);
    window.history.forward();
  }

  push(path) {
    super.push.call(this, path);

    if(typeof path !== 'undefined') {
      window.location.hash = this.pathPrefix + path;
    }
  }

  replace(path) {
    super.replace.call(this, path);
    window.location.replace(
      window.location.pathname + window.location.search + this.pathPrefix + path
    );
  }

  addChangeListener(listener) {
    super.addChangeListener.call(this, listener);

    if(!this._isListening) {
      if(window.addEventListener) {
        window.addEventListener('hashchange', this._onChange, false);
      }
      else {
        window.attachEvent('onhashchange', this._onChange);
      }

      this._isListening = true;
    }
  }

  removeChangeListener(listener) {
    super.removeChangeListener.call(this, listener);

    if(this._listeners.length === 0) {
      if(window.removeEventListener) {
        window.removeEventListener('hashchange', this._onChange, false);
      }
      else {
        window.removeEvent('onhashchange', this._onChange);
      }

      this._isListening = false;
    }
  }
}

export default HashLocation;
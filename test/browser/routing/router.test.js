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
let {assert} = unitjs;
let t = test;

describe('Router', function() {
  it('should be in global scope', function() {
    test
      .object(routux)
        .hasProperty('Router')
        .hasProperty('Route')
        .hasProperty('noConflict')

      .function(routux.Router)
      .function(routux.Route)
      .function(routux.noConflict)
    ;
  });

  it('should not run', function() {
    let router = new routux.Router();

    test
      .object(router)
      .isInstanceOf(routux.Router)
      .hasProperty('running', false)
    ;
  });

  it('should run', function() {
    let router = new routux.Router();
    test
      .object(router.run())
        .isInstanceOf(routux.Router)
        .hasProperty('running', true)

      .object(router)
      .isInstanceOf(routux.Router)
      .hasProperty('running', true)
    ;
  });

  it('Create a router', function() {
    let router = new routux.Router();

    t.object(router).isInstanceOf(routux.Router);
  });

  it('Create a route', function() {
    let router = new routux.Router();
    let spyCtrl = test.spy();

    t.array(router._routes).hasLength(0);
    t.object(router.routes).isEmpty();

    router.use('/test', spyCtrl);

    t.array(router._routes).hasLength(1);
    t.object(router.routes).hasProperty('__route_0');
    t.string(router.routes.__route_0.name).isIdenticalTo('__route_0');
    t.string(router.getPath('__route_0')).isIdenticalTo('/test');
  });

  it('Generate an unique route name', function() {
    let router = new routux.Router();

    router.use('/route1', () => {});
    t.object(router.routes).hasProperty('__route_0');
    t.string(router.routes.__route_0.name).isIdenticalTo('__route_0');

    router.use('/route2', () => {});
    t.object(router.routes).hasProperty('__route_1');
    t.string(router.routes.__route_1.name).isIdenticalTo('__route_1');
  });

  it('Remove routux from global (window)', function() {
    let _routux;

    test
      .given(() => {
        test
          .undefined(_routux)
          .object(routux)
            .isIdenticalTo(window.routux)
            .hasProperty('noConflict')
        ;
      })

      .when(() => {
        _routux = routux.noConflict();
      })

      .then(() => {
        test
          .object(_routux)
            .hasProperty('Router')
            .hasProperty('Route')
            .hasProperty('noConflict')

          .function(_routux.Router)
          .function(_routux.Route)
          .function(_routux.noConflict)

          .string(typeof routux)
            .isEqualTo('undefined')
            .isIdenticalTo(typeof window.routux)

          .object(window)
            .hasNotProperty('routux')

          .if(window.routux = _routux)
            .object(routux)
              .isIdenticalTo(_routux)
        ;
      })
    ;
  });

  describe('Routes URLs', function() {
    let router;

    before(() => {
      router = new routux.Router();
      router.run();
    });

    it('Get base URL (absolute)', function() {
      let baseUrl = __.url + '/routing/router.html';
      t.string(router.baseUrl).isIdenticalTo(baseUrl);
    });

    it('Get route path', function() {
      router.use('home', '/', () => {});
      router.use('hello', '/hello-world', () => {});
      router.use('resource.id', '/resource/:id', () => {});
      router.run();

      t.string(router.getPath('home')).isIdenticalTo('/');
      t.string(router.getPath('hello')).isIdenticalTo('/hello-world');
      t.string(router.getPath('resource.id', {id: 'foo'})).isIdenticalTo('/resource/foo');

      test
        .error(() => router.getPath())
        .error(() => router.getPath(''))
        .error(() => router.getPath('unknown'))
      ;
    });

    it('Get route URL (relative)', function() {
      router.use('home', '/', () => {});
      router.use('hello', '/hello-world', () => {});
      router.use('resource.id', '/resource/:id', () => {});
      router.run();

      t.string(router.getUrl('home')).isIdenticalTo('#/');
      t.string(router.getUrl('hello')).isIdenticalTo('#/hello-world');
      t.string(router.getUrl('resource.id', {id: 'foo'})).isIdenticalTo('#/resource/foo');

      test
        .error(() => router.getUrl())
        .error(() => router.getUrl(''))
        .error(() => router.getUrl('unknown'))
      ;
    });

    it('Get route URL (absolute)', function() {
      router.use('home', '/', () => {});
      router.use('hello', '/hello-world', () => {});
      router.use('resource.id', '/resource/:id', () => {});
      router.run();

      t.string(router.getFullUrl('home')).isIdenticalTo(router.baseUrl + '#/');
      t.string(router.getFullUrl('hello')).isIdenticalTo(router.baseUrl + '#/hello-world');
      t.string(router.getFullUrl('resource.id', {id: 'foo'})).isIdenticalTo(router.baseUrl + '#/resource/foo');

      test
        .error(() => router.getFullUrl())
        .error(() => router.getFullUrl(''))
        .error(() => router.getFullUrl('unknown'))
      ;
    });
  });
});
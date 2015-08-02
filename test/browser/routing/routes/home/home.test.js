/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let __   = require('../../../_config/');
let test = unitjs;
let {assert} = unitjs;
let t = test;

let router = new routux.Router();
let utils = require('../../../_fixtures/utils');
let ctrl = utils.createSpiedCtrls();

describe('Route: /home', function() {
  before(function() {
    router.use((req, next) => {
      test
        .string(req.current)
          .isIdenticalTo('/home')

        .object(req.query)

        .object(req.params)
          .hasProperty('path', 'home')

        .object(req.ctx)
          .hasNotProperty('mw1Hook')
          .hasNotProperty('mw2Hook')

        .function(next)
      ;

      req.ctx.mw1Hook = true;
      ctrl.mw1(req, next);

      next();
    });

    router.use((req, next) => {
      test
        .string(req.current)
          .isIdenticalTo('/home')

        .object(req.query)

        .object(req.params)
          .hasProperty('path', 'home')

        .object(req.ctx)
          .hasProperty('mw1Hook', true)
          .hasNotProperty('mw2Hook')

        .function(next)
      ;

      req.ctx.mw2Hook = true;
      ctrl.mw2(req, next);

      next();
    });

    router.use('/home', ctrl.home);
    router.use('/routeA', ctrl.routeA);
    router.use('/routeA', ctrl.mwA);
    router.use('/routeA', ctrl.routeA2);
    router.use('/routeB', ctrl.routeB);
    router.use('/routeC', ctrl.mwC);
    router.use('/routeC', ctrl.mwC2);
    router.use('/routeC', ctrl.routeC);
    router.use('/routeD', ctrl.mw3, ctrl.routeD);
    router.use('/routeE', ctrl.mw4, ctrl.mw5, ctrl.routeE);

    router.use((err, req, next) => {
      ctrl.errorHandler1(err, req, next);
      next(err);
    });

    router.use((err, req, next) => ctrl.errorHandler2(err, req, next));
    router.run();
  });

  it('home should be called', function() {
    assert(router.location.current === '/home', 'current location must be "/home"');
    assert(ctrl.home.callCount === 1, 'ctrl "home" must be called once');
  });

  it('Generic middlewares must be called', function() {
    assert(router.location.current === '/home', 'current location must be "/home"');
    assert(ctrl.home.callCount === 1, 'ctrl "home" must be called once');

    assert(ctrl.mw1.callCount === 1, 'mw1 must be called');
    assert(ctrl.mw2.callCount === 1, 'mw2 must be called');
  });

  it('"req" must be the same object reference', function() {
    let mw1Req = ctrl.mw1.args[0][0];
    let mw1Next = ctrl.mw1.args[0][1];

    let mw2Req = ctrl.mw1.args[0][0];
    let mw2Next = ctrl.mw1.args[0][1];

    test
      .given('req is the same reference for each call')
      .object(mw1Req)
        .isIdenticalTo(mw2Req)

      .object(mw1Req.ctx)
        .hasProperty('mw1Hook', true)
        .hasProperty('mw2Hook', true)

      .object(mw2Req.ctx)
        .hasProperty('mw1Hook', true)
        .hasProperty('mw2Hook', true)
    ;
  });

  it('Others routes, ctrls and middlewares must be never called', function() {
    assert(router.location.current === '/home', 'current location must be "/home"');
    assert(ctrl.home.callCount === 1, 'ctrl "home" must be called once');

    assert(!ctrl.routeA.called, 'ctrl must be not called');
    assert(!ctrl.routeA2.called, 'ctrl must be not called');
    assert(!ctrl.routeB.called, 'ctrl must be not called');
    assert(!ctrl.routeC.called, 'ctrl must be not called');
    assert(!ctrl.routeD.called, 'ctrl must be not called');
    assert(!ctrl.routeE.called, 'ctrl must be not called');
    assert(!ctrl.mwA.called, 'middleware must be not called');
    assert(!ctrl.mwC.called, 'middleware must be not called');
    assert(!ctrl.mwC2.called, 'middleware must be not called');
    assert(!ctrl.mw3.called, 'middleware must be not called');
    assert(!ctrl.mw4.called, 'middleware must be not called');
    assert(!ctrl.mw5.called, 'middleware must be not called');
    assert(!ctrl.errorHandler1.called, 'errorHandler must be not called');
    assert(!ctrl.errorHandler2.called, 'errorHandler must be not called');
  });
});
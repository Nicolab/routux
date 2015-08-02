/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let path        = require('path');
let rootPath    = path.resolve();
let _           = require('lodash');
let webdriverio = require('webdriverio');
let test        = require('unit.js');
let assert      = test.assert;
let webdriver;

//GLOBAL.__routux = require(path.join(rootPath, 'dist/routux.min.js'));


/*----------------------------------------------------------------------------*\
  Custom commands
\*----------------------------------------------------------------------------*/

/**
 * Add all custom commands.
 *
 * @param  {object} client Webdriver.io client.
 * @return {object} Webdriver.io client populated with the custom commands.
 */
function addCommands(client) {
  addAssertElementExistsCommand(client);
  addAssertContainsTextCommand(client);
  addAssertUrlEqualsCommand(client);
  addGetFrontReportCommand(client);
  addAssertFrontTestsCommand(client);

  return client;
}


function addAssertUrlEqualsCommand(client) {

  /**
   * Assert URL equals `expected`.
   *
   * @param {string} expected
   */
  client.addCommand('assertUrlEquals', function assertUrlEquals(expected) {
    let done = arguments[arguments.length - 1];

    return this
      .url(function(err, res) {
        if(err) {
          test.dump(err, text).fail(err.message + '\n\n' + (err.stack));
        }

        test
          .string(res.value)
            .isIdenticalTo(expected)
        ;
      })
      .call(done)
    ;
  });

  return client;
}

function addAssertContainsTextCommand(client) {

  /**
   * Assert element contains `expected` text.
   *
   * @param {string} selector
   * @param {string} expected
   */
  client.addCommand('assertContainsText', function assertContainsText(selector, expected) {
    let done = arguments[arguments.length - 1];

    return this
      .getText(selector, function(err, text) {
        if(err) {
          test.dump(err, text).fail(err.message + '\n\n' + (err.stack));
        }

        test.string(text).contains(expected);
      })
      .call(done)
    ;
  });

  return client;
}

function addAssertElementExistsCommand(client) {

  /**
   * Assert that element exists.
   *
   * @param {string} selector
   */
  client.addCommand('assertElementExists', function assertContainsText(selector) {
    let done = arguments[arguments.length - 1];

    return this
      .isExisting(selector)
      .then(function(isExisting) {
        assert(isExisting, selector + ' element does not exist');
        return isExisting;
      })
      .call(done)
    ;
  });

  return client;
}

function addGetFrontReportCommand(client) {

  /**
   * Get front runner report.
   */
  client.addCommand('getFrontReport', function getFrontReport(timeout = 10000) {
    return this
      .waitForExist('#runner', timeout)
      .assertElementExists('#mocha')
      .getValue('#runner', function(err, report) {
        if(err) {
          console.error('getFrontReport error');
          test.dump(err, report).fail(err.message + '\n\n' + (err.stack));
          return;
        }

        test
          .string(report)

          .given(report = JSON.parse(report))

          .object(report)
            .hasProperty('runnerState')
            .hasProperty('url')
            .hasProperty('stats')

          .string(report.runnerState)
            .isNotEmpty()

          .string(report.url)
            .isNotEmpty()

          .object(report.stats)
            .hasProperty('passes')
            .hasProperty('failures')

          .then(() => {
            if(report.err) {
              test.dump(report).fail(report.err.message + '\n\n' + (report.err.stack));
            }
          })
        ;

        return report;
      })
    ;
  });

  return client;
}

function addAssertFrontTestsCommand(client) {

  /**
   * Assert that the front tests passes.
   */
  client.addCommand('assertFrontTests', function assertFrontTests(timeout = 10000) {
    let done = arguments[arguments.length - 1];

    return this.getFrontReport(timeout, function(err, report) {
      if(err) {
        console.error('assertFrontTests error');
        test.dump(report).fail(err.message);
        return;
      }

      if(report && report.failures) {
        test.dump(report).fail(`
          assertFrontTests: There is ${report.failures}
          failure${(report.failures > 1 ? 's' : '')} in the tests of the front.

          Current (${report.currentRunnable.state}): ${report.currentRunnable.title}.
        `);
      }
      else if(!report) {
        test.fail('Cannot get the front report.');
      }
      else if(report.err) {
        test.dump(report).fail(report.err.message + '\n\n' + (report.err.stack));
      }

      return report;
    })
    .call(done);
  });

  return client;
}

/*----------------------------------------------------------------------------*\
  Utils
\*----------------------------------------------------------------------------*/

/**
 * Create a generic client.
 *
 * @param {object} [options] Webdriver.io options
 * @param {bool} [addCustomCommands=true] Add custom commands.
 * @return {object} Webdriver.io client.
 */
function createClient(options, addCustomCommands) {
  let clientOptions, client;

  addCustomCommands =
    addCustomCommands === true || addCustomCommands === undefined
    ? true
    : false
  ;

  clientOptions = _.merge(
    {
      desiredCapabilities: {}
    },
    options
  );

  switch(__E2E_DRIVER) {
    case 'phantomjs':
      clientOptions.desiredCapabilities = {
        browserName: 'phantomjs',
        'phantomjs.binary.path': require('phantomjs').path,
        'phantomjs.cli.args':
          '--webdriver=4444 ' +
          '--webdriver-selenium-grid-hub=http://localhost:4444'
      };
    break;

    case 'chrome':
      clientOptions.desiredCapabilities = {
        browserName: 'chrome'
      };
    break;

    case 'firefox':
      clientOptions.desiredCapabilities = {
        browserName: 'firefox'
      };
    break;

    default:
      throw new ReferenceError('Bad E2E driver, check the value of __E2E_DRIVER');
  }

  client = webdriverio.remote(clientOptions);

  return addCustomCommands ? addCommands(client) : client;
}


/*----------------------------------------------------------------------------*\
  Expose
\*----------------------------------------------------------------------------*/

webdriver = {
  webdriverio: webdriverio,
  createClient: createClient,
  useDriver: function(name) {
    GLOBAL.__E2E_DRIVER = name;

    console.log(
      '\n',
      _.repeat('#', 8),
      'E2E test (' + __E2E_DRIVER + ' driver)',
      _.repeat('#', 8),
      '\n'
    );

    return webdriver;
  }
};


/*----------------------------------------------------------------------------*\
  Expose
\*----------------------------------------------------------------------------*/

GLOBAL.webdriver = webdriver;
GLOBAL.unitjs = test;

module.exports = webdriver;
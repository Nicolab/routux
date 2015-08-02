/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

/*----------------------------------------------------------------------------*\
  Test
\*----------------------------------------------------------------------------*/

let {cfg, src, paths, pl, gp} = require('./index');

let gulp     = require('gulp');
let path     = require('path');
let es       = require('event-stream');
let selenium = require('selenium-standalone');

function installSelenium(done) {
  if(selenium._isInstalled) {
    return done();
  }

  selenium.install({
    // check for more recent versions of selenium here:
    // http://selenium-release.storage.googleapis.com/index.html
    version: '2.45.0',
    baseURL: 'http://selenium-release.storage.googleapis.com',
    drivers: {
      chrome: {
        // check for more recent versions of chrome driver here:
        // http://chromedriver.storage.googleapis.com/index.html
        version: '2.15',
        arch: process.arch,
        baseURL: 'http://chromedriver.storage.googleapis.com'
      }
    },
    logger(message) {
      console.log(message);
    }
  },
  function(err) {
    if (err) {
      return done(err);
    }

    selenium._isInstalled = true;

    done();
  }); // selenium.install()
}

function runSelenium(driver, done) {
  let start = function(err) {
    if(err) {
      return done(err);
    }

    selenium.start(function (err, child) {
      if (err) {
        return done(err);
      }

      gulp.src('./public/**/main.e2e.js', {read: false})
        .pipe(gp.mocha({
          timeout: 10000,
          require: [
            path.join(__dirname, '..', '/test/drivers', driver)
          ]
        }))
        .on('end', function() {
          child.kill();
          done();
        })
        .on('error', function(err) {
          child.kill();
          done(err);
        })
      ;
    });
  };

  installSelenium(start);
}

gulp.task('test.build', function(done) {
  let validJsType = ['e2e', 'test'];
  let validJsExt  = ['js'];

  let getJsType = (filePath) => {
    let types, type, ext, seg;

    if(!filePath) {
      return;
    }

    seg = filePath.split('.');

    if(seg.length !== 3) {
      return;
    }

    [type, ext] = seg.splice(-2);

    if(validJsExt.indexOf(ext) === -1 || validJsType.indexOf(type) === -1) {
      return;
    }

    return type;
  };

  let buildJs = (file, cb) => {
    let jsType = getJsType(file.relative);

    // create a clone
    let webpackCfg = Object.create(cfg.webpack);
    webpackCfg.module.loaders[0].include = false;
    webpackCfg.entry.main = './test/browser/' + file.relative;

    gulp.src(webpackCfg.entry.main)
      .pipe(gp.webpack(webpackCfg))
      .pipe(gp.rename(function(p) {
        p.basename += '.' + jsType;
      }))
      .pipe(gulp.dest(path.join(paths.public, path.dirname(file.relative))))
      .on('error', (err) => cb(err))
      .on('end', () => cb(null, file))
    ;
  };

  let buildEjs = (file, cb) => {
    gulp.src(file.path)
      .pipe(pl.ejs())
      .pipe(gulp.dest(path.join(paths.public, path.dirname(file.relative))))
      .on('error', (err) => cb(err))
      .on('end', () => cb(null, file))
    ;
  };

  gulp.src([
    './test/browser/**/*.e2e.js',
    './test/browser/**/*.test.js',
    './test/browser/**/*.ejs',
    '!./test/browser/**/_*',
    '!./test/browser/**/_*/*',
    '!./test/browser/_*/**/*'
  ])
    .pipe(es.map(function(file, cb) {
      let extName = path.extname(file.relative).replace('.', '');

      if(validJsExt.indexOf(extName) !== -1) {
        buildJs(file, cb);
      } else {
        buildEjs(file, cb);
      }
    }))
    .on('end', () => {
      gulp
        .src(paths.dist + '/routux.min.js')
        .pipe(gulp.dest(paths.public))
        .on('end', done)
        .on('error', done)
      ;
    })
    .on('error', done)
  ;
});

gulp.task('test.watch', function(done) {
  gulp.watch(
    [
      src.test,
      src.webpack,
      src.webpackTest,
      './test/browser/**/*.js',
      './test/browser/**/*.ejs'
    ],
    gulp.series('test.build', done)
  );
});


/* TODO: phantomjs task
gulp.task('test.phantomjs', function (done) {
  runSelenium('phantomjs', done);
});
*/

gulp.task('test.chrome', function (done) {
  runSelenium('chrome', done);
});

gulp.task('test.firefox', function (done) {
  runSelenium('firefox', done);
});

gulp.task('test.all', gulp.series(
  //TODO: 'test.phantomjs',
  'test.chrome',
  'test.firefox'
));
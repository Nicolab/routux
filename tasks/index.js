/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let cfg, src, paths, pl, gp;

let path     = require('path');
let es       = require('event-stream');
let ejs      = require('ejs-mate');
let lazypipe = require('lazypipe');
let webpack  = require('webpack');
let pkg      = require('../package.json');


/*----------------------------------------------------------------------------*
  Gulp plugins
*----------------------------------------------------------------------------*/

gp = {
  concat   : require('gulp-concat'),
  uglify   : require('gulp-uglify'),
  header   : require('gulp-header'),
  rename   : require('gulp-rename'),
  webserver: require('gulp-webserver'),
  webpack  : require('gulp-webpack'),
  mocha    : require('gulp-mocha')
};

/*----------------------------------------------------------------------------*
  Config
*----------------------------------------------------------------------------*/

paths = {
  public: './public',
  src: './src',
  dist: './dist',
  test: './test'
};

src = {
  public: paths.public,
  webpack: paths.src  + '/**/*.js',
  webpackTest: paths.test + '/**/*.js',
  test: paths.test  + '/**/*.[js,ejs]',
  dist: paths.dist  + '/**/*.js'
};

cfg = {
  webserver: {
    port: 8080
  },

  banner: '/*! '+ pkg.name + ' v'+ pkg.version + ' | '+ pkg.licenses[0].type +
    ' (c) '+ (new Date().getFullYear()) +' ' + pkg.author.name +
    ' - ' + pkg.homepage +' */',

  test: {
    src: [
      './test/**/*.test.js'
    ]
  },

  webpack: {

    debug: true,
    watch: false,
    devtool: false,
    entry: {
      main: paths.src + '/index.js'
    },
    output: {
      filename: '[name].js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          include: path.join(__dirname, '..', 'src'),
          loader: 'babel-loader?stage=0&optional=runtime'
        }
      ]
    },
    plugins: [
      new webpack.IgnorePlugin(/_[a-z-A-Z0-9-]\//),
      new webpack.optimize.DedupePlugin()
    ],
  },

  get ejs() {
    return {
      opt: {

        // engine config
        engine: {

          // ejs options
          settings: {
            'view engine' : 'ejs',
            views         : path.join(__dirname, '..', 'test/browser')
          },

          // locals variables
          locals: {}
        }
      }
    };
  }
};

// prod
cfg.webpackProd = Object.create(cfg.webpack);

// dev
cfg.webpackDev = Object.create(cfg.webpack);
cfg.webpackDev.devtool = '#eval-source-map';


/*----------------------------------------------------------------------------*
  Pipelines
*----------------------------------------------------------------------------*/

pl = {};

pl.webpackDev = lazypipe()
  .pipe(gp.webpack, cfg.webpackDev)
;

pl.webpackProd = lazypipe()
  .pipe(gp.webpack, cfg.webpackProd)
;

pl.build = lazypipe()
  .pipe(gp.rename, function(file) {
    file.basename = 'routux';
  })
;

pl.minify = lazypipe()
  .pipe(gp.rename, function(file) {
    file.basename = 'routux.min';
  })
  .pipe(gp.uglify)
  .pipe(gp.header, cfg.banner)
;

// pass `locals` variables with `cfg.ejs.opt.engine.locals`
pl.ejs = lazypipe()
  .pipe(function() {
    return es.map(function(file, cb) {
      ejs(
        file.path,
        cfg.ejs.opt.engine,
        function(err, str) {
          if(err) {
            cb(err);
            return;
          }

          file.contents = new Buffer(str);
          cb(err, file);
        }
      );
    });
  })
  .pipe(gp.rename, {
    extname: '.html'
  })
;

module.exports = {cfg, pl, gp, src, paths};
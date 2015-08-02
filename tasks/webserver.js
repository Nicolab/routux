/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let {paths, cfg, gp} = require('./index');
let gulp = require('gulp');

/*----------------------------------------------------------------------------*\
  Web server
\*----------------------------------------------------------------------------*/

gulp.task('webserver', function(done) {
  return gulp.src(paths.public)
    .pipe(gp.webserver({
      port: cfg.webserver.port,
      livereload: true,
      directoryListing: {
        enable: true,
        path: paths.public
      },
      open: false
    }))
    .on('end', done)
    .on('error', done)
  ;
});
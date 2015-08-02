/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let gulp = require('gulp');

// Generic
require('./tasks/clean');
require('./tasks/webserver');

// env
require('./tasks/dev');
require('./tasks/dist');
require('./tasks/test');


/*----------------------------------------------------------------------------*
  Bundles
*----------------------------------------------------------------------------*/

gulp.task('default', gulp.series(
  'clean',
  'test.build',
  'test.all',
  gulp.parallel('dev.build', 'dist.build')
));

gulp.task('dev', gulp.series(
  'clean.public',
  'dev.build',
  gulp.parallel('webserver', 'dev.watch')
));

gulp.task('prod', gulp.series(
  'clean.dist',
  'test.build',
  'test.all',
  'dist.build'
));

gulp.task('test', gulp.series(
  'clean',
  'dist.build',
  'test.build',
  'webserver',
  'test.all',
  'test.watch'
));

gulp.task('testing', gulp.series(
  'clean',
  'dist.build',
  'test.build',
  'webserver',
  'test.chrome',
  'test.watch'
));


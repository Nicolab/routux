/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let {paths} = require('./index');
let gulp = require('gulp');
let del = require('del');

/*----------------------------------------------------------------------------*\
  Clean
\*----------------------------------------------------------------------------*/

gulp.task('clean.dist', function(done) {
  del(paths.dist, done);
});

gulp.task('clean.public', function(done) {
  del(paths.public, done);
});

gulp.task('clean', gulp.parallel(
  'clean.public',
  'clean.dist'
));

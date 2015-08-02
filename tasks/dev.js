/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let {paths, src, cfg, pl} = require('./index');
let gulp = require('gulp');

gulp.task('dev.build', function(done) {
  return gulp.src(cfg.webpackDev.entry.main)
    .pipe(pl.webpackDev())
    .pipe(pl.build())
    .pipe(gulp.dest(paths.public + '/assets'))
    .on('end', done);
});

gulp.task('dev.watch', function(done) {
  gulp.watch(src.webpackDev, gulp.series('dev.build', done));
});
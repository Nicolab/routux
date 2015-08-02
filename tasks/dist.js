/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

let {paths, src, cfg, gp, pl} = require('./index');
let gulp = require('gulp');


gulp.task('dist.build', function(done) {
  return gulp.src(cfg.webpackProd.entry.main)
    .pipe(pl.webpackProd())
    .pipe(pl.minify())
    .pipe(gulp.dest(paths.dist))
    .on('end', done);
});

gulp.task('dist.watch', function(done) {
  gulp.watch(src.webpack, gulp.series('dist.build', done));
});
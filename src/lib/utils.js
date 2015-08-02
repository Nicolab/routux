/**
 * This file is part of Routux.
 *
 * (c) Nicolas Tallefourtane <dev@nicolab.net>
 *
 * For the full copyright and license information, please view the LICENSE file
 * distributed with this source code or visit https://github.com/Nicolab/routux.
 */

'use strict';

var mergeRecursive = function(obj/*, from*/) {
  var ln = arguments.length;

  if (ln < 2) {
    throw new Error('There should be at least 2 arguments passed to mergeRecursive()');
  }

  for (var i = 1; i < ln; i++) {
    for (var p in arguments[i]) {
      if (obj[p] && typeof obj[p] === 'object') {
        obj[p] = mergeRecursive(obj[p], arguments[i][p]);
      } else {
        obj[p] = arguments[i][p];
      }
    }
  }

  return obj;
};

module.exports = {
  mergeRecursive: mergeRecursive
};
# Routux

A fast and productive router to improve the UX (User eXperience) of any frontend application.
Inspired by the router of Express JS (amongst others), Routux supports:

  * middlewares,
  * Regex pattern,
  * named route,
  * route reverse,
  * asynchronicity,
  * error handler,
  * ... and others useful features.


## Getting started

### Install from NPM

Terminal:
```sh
npm install routux --save
```

JS:
```js
var routux = require('routux');
var router = routux.Router();

router.use('/', function(req, next) {
  // Your logic here
});

router.run();
```

### Or install from source file

Download [dist/routux.min.js](https://cdn.rawgit.com/Nicolab/routux/master/dist/routux.min.js) file and add in your HTML file:

```html
<script src="./path-of-your-js-files/routux.min.js"></script>
```

Then `routux` is in the global scope:

```js
var router = new routux.Router();

router.use('/', function(req, next) {
  // Your logic here
});

router.run();
```

#### Use CDN

```html
<script src="https://cdn.rawgit.com/Nicolab/routux/master/dist/routux.min.js"></script>
```

You can change `master` by a [specific version](https://github.com/Nicolab/routux/releases).
<br>Example for `v0.2.7`:

```html
<script src="https://cdn.rawgit.com/Nicolab/routux/v0.2.7/dist/routux.min.js"></script>
```

> Note: please, use the [latest version](https://github.com/Nicolab/routux/releases/latest)

## Usage

See the [doc](/doc/index.md) and the [examples](/examples) directory.


## Development of Routux core

Routux is developped in ES6 (EcmaScript6) in [src](https://github.com/Nicolab/routux/tree/master/src) directory and compiled to ES5 in the [dist/routux.min.js](https://cdn.rawgit.com/Nicolab/routux/master/dist/routux.min.js) file.

Build a minified distributable, in the terminal:
```sh
gulp dist.build
```

Develop with the automatic rebuilds (the distributable and the unit tests):
```sh
gulp testing
```

### Unit tests

Routux is unit tested with [Unit.js](http://unitjs.com), [Mocha](http://unitjs.com/guide/mocha.html) and [Webdriver.io](http://www.webdriver.io).

_TODO: There are still things to test._


## LICENSE

[MIT](https://github.com/Nicolab/routux/blob/master/LICENSE) (c) 2016, Nicolas Tallefourtane.


## Author

Routux is designed and built with love by

| [![Nicolas Tallefourtane - Nicolab.net](http://www.gravatar.com/avatar/d7dd0f4769f3aa48a3ecb308f0b457fc?s=64)](http://nicolab.net) |
|---|
| [Nicolas Talle](http://nicolab.net) |
| [![Make a donation via Paypal](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PGRH4ZXP36GUC) |

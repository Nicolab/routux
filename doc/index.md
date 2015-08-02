# Routux documentation

__In progress__

The code source is fully documented, see:

  * [src/index.js](src/index.js)
  * [src/Router.js](src/Router.js)
  * [src/Route.js](src/Route.js)
  * Also, [examples](examples) directory.


## Basic routes

A route controller receive 2 arguments, `req` and `next` (optional).

  * `req` is an object containing the current request.
  * `next` is an optional function used only in the route [middleware](#middleware). When `next()` is executed, the controller of the next route that matches is called.
  `next()` can receive only one argument, it's an error. If an argument is passed to the `next(error)` function,  it considered as an error.

```js
var router = new routux.Router();

router.use('/my-route', function(req, next) {
  console.log('my route');

  // your logic here...
});

router.use('/', function(req) {
  // "/"
  console.log(req.current);
});

router.use('/another/route', function(req) {
  // "/another/route"
  console.log(req.current);
});

// listen
router.run();
```

## Named routes

```js
var router = new routux.Router();

router.use('home', '/', function(req) {
  // "/"
  console.log(req.current);

  // "#/"
  console.log(router.getUrl('home'));

  // "http://your-domain.ltd#/"
  console.log(router.getFullUrl('home'));
});

router.use('another', '/another/route', function(req) {
  // "/another/route"
  console.log(req.current);

  // "#/another/route"
  console.log(router.getUrl('another'));

  // "http://your-domain.ltd#/another/route"
  console.log(router.getFullUrl('another'));
});

// listen
router.run();
```

## Route defined with an object

```js
router.use({
  name: 'home',
  pattern: '/',
  middlewares: [
    function(req, next) {
      console.log('Route middleware called before');
      next();
    },
    function(req, next) {
      console.log('Route controller');
    }
  ]
});
```

It's equivalent of:

```js
router.use('home', '/',
  function(req, next) {
    console.log('Route middleware called before');
    next();
  },
  function(req, next) {
    console.log('Route controller');
  }
);
```

Or more readable:

```js
function myMiddleware(req, next) {
  console.log('Route middleware called before');
  next();
}

router.use('home', '/', myMiddleware, function(req, next) {
  console.log('Route controller');
});
```

## Route with parameter

Considers the URL `http://your-domain.ltd#/user/42`:

```js
router.use('user.edit', '/user/:id', function(req) {
  // 42
  console.log(req.params.id);

  // "#/user/10"
  console.log(router.getUrl('user.edit', { id: 10}));

  // "http://your-domain.ltd#/user/10"
  console.log(router.getFullUrl('user.edit', { id: 10}));
});
```

## Route with query

Considers the URL `http://your-domain.ltd?sort=desc#/user/42`:

```js
router.use('user.edit', '/user/:id', function(req) {
  // desc
  console.log(req.query.sort);

  // 42
  console.log(req.params.id);

  // "#/user/10"
  console.log(router.getUrl('user.edit', { id: 10}));

  // "http://your-domain.ltd?sort=desc#/user/10"
  console.log(router.getFullUrl('user.edit', { id: 10}));
});
```

## Custom context of the current request

An object of context (`req.ctx`) is passed with the request.

`req.ctx` is an empty object, it is intended to store what you want
(e.g: for your controller or for other routes or for what you want).

```js
router.use('home', '/', function(req) {
  req.ctx.date = new Date();
  req.ctx.anyValue = 'Any value !';

  // your logic here...
});
```

## Accessing to a Route instance

A `Route` instance can be acceded from the scope (`this`) of a route controller:

```js
router.use('home', '/', function(req) {

  // true
  console.log(this instanceof routux.Route);

  // true
  console.log(this.router === router);

  // "home"
  console.log(this.name);

  // "/"
  console.log(this.pattern);

  // uniq identifier of the route
  console.log(this._uid);

  // multiple data can be getted from a Route instance
  console.log(this.params);
  console.log(this.query);
  console.log(this.middlewares);
  console.log(this.baseUrl);
  // ...
});
```

Also, a `Route` instance can be getted with the router:

```js
var route = router.getRoute('home');

// true
console.log(route instanceof routux.Route);

// true
console.log(route.router === router);

// "home"
console.log(route.name);

// "/"
console.log(route.pattern);

// uniq identifier of the route
console.log(route._uid);

// multiple data can be getted from a Route instance
console.log(route.params);
console.log(route.query);
console.log(route.middlewares);
console.log(route.baseUrl);
// ...
```

## Middleware

Like the router of _Express.js_, _Routux_ support the middlewares :v:<br>
A middleware can be defined in several ways (as needed).

### Middleware for all routes

Executed for all routes:

```js
// This middleware adds the date in the context
router.use(function(req, next) {
  req.ctx.date = new Date();
  next();
});

router.use('home', '/', function(req, next) {
  // print the date
  console.log(req.ctx.date);
});
```

### Middleware for a given route

```js
router.use('/', function(req, next) {
  req.ctx.date = new Date();
  next();
});

router.use('home', '/', function(req, next) {
  // print the date
  console.log(req.ctx.date);
});

router.use('other', '/other', function(req, next) {
  // print `undefined`
  console.log(req.ctx.date);
});
```

### Reusable middleware

It is often convenient to use the same middleware in several routes

Example, considers 2 middlewares:

```js
// this middleware log the current request
function logRequest(req, next) {
  console.log(req);
  next();
}

// this middleware ensures that the user is authentified
function requireAuth(req, next) {
  if(req.ctx.user) {
    next();
  } else {
    next(new Error('This route require authentification.'))
  }
}
```

Now we can use in our routes:

```js
router.use('home', '/', logRequest, function(req, next) {
  // the request (req) is printed in the console
  // Add your logic here...
});

router.use('account', '/acount', requireAuth, function(req, next) {
  // The authentification is checked by the middleware,
  // we have the guarantee that the user is authenticated.
  // Otherwise this route is not executed

  // Add your logic here...
});
```

In a route, we can use multiple middlewares:

```js
router.use('account', '/acount', logRequest, requireAuth, function(req, next) {
  // The request (req) is printed in the console

  // The authentification is checked by the middleware,
  // we have the guarantee that the user is authenticated.
  // Otherwise this route is not executed

  // Add your logic here...
});
```

### Error handler

An error handler is a special middleware that is able to handle errors.
It works like a conventional middleware, the only difference is when an error is declared, _Routux_ skips all routes until it finds an error handler.

For creating an error handler, simply add the error argument:

```js
router.use(function(error, req, next) {
  // print the error encountered in the standard output
  console.log(error);
});
```

As conventional middlewares, it is possible to chain the error handler:

```js
router.use(function(error, req, next) {
  if(error.code === 404) {
    // example, load your custom 404 error page (not found)
    myFramework.render('pageNotFound');
  } else {
    // if not an error 404, let for the next error handler
    next(error);
  }
});

router.use(function(error, req, next) {
  // print the error encountered
  console.error(error);
});
```

Error handler in real world, considers for the examples an Ajax lib named `http` that call a server.

```js
router.use('user.edit', '/user/:id', function(req, next) {
  http
    .get(apiUrl + '/user/' + this.params.id)
    .onSuccess(function(user) {
      req.ctx.user = user;
      next();
    })
    .onError(function(error) {
      next(error);
    })
  ;
});

router.use('user.edit', '/user/:id', function(req, next) {
  // the user object
  console.log(req.ctx.user);
});

// Your custom error handler, executed if an error was encountered
// ( remember the next(error) function called in onError() function)
router.use(function(err, req, next) {
  // print the error
  console.log(err);
});
```

## Location

The router uses `location` object to determine the current state of the application and update it when needed.
<br>By default the [HashLocation](src/lib/locations/HashLocation.js) adapter is used.<br>
You can also supply the router with your own `location` implementation by creating your own adapter.

### API

For examples below, considers the full URL `http://domain.ltd/page.html?show=stats#/user/42`.

> Note: some properties below can be getted from the router (shortcut).

#### baseUrl

Current base URL (absolute).

```js
// print: "http://domain.ltd/page.html"
console.log(router.location.baseUrl);
```

Shortcut:

```js
// print: "http://domain.ltd/page.html"
console.log(router.baseUrl);
```

#### current

Current location (without URL prefix).

```js
// print: "user"
console.log(router.location.current);
```

Shortcut:

```js
// print: "user"
console.log(router.current);
```

#### url

The URL (relative).

```js
// print: "#/user"
console.log(router.location.url);
```

Shortcut:

```js
// print: "#/user"
console.log(router.url);
```

#### fullUrl

The full URL (absolute).

```js
// print: "http://domain.ltd/page.html?show=stats#/user/42"
console.log(router.location.fullUrl);
```

Shortcut:

```js
// print: "http://domain.ltd/page.html?show=stats#/user/42"
console.log(router.fullUrl);
```

#### queryString

The query string.

```js
// print: "show=stats"
console.log(router.location.queryString);
```

#### qs

The query string object.
<br>See [qs](https://www.npmjs.com/package/qs) package.

```js
console.log(router.location.qs);
```

2 features are added: `qs.current` and `qs.currentWith()`.

##### qs.current

Current query string parsed.

##### qs.currentWith()

Parse current query string with the given options.

#### pathPrefix

The path prefix.

```js
// print: "#"
console.log(router.location.pathPrefix);
```

#### urlPrefix

The URL prefix.
<br>By default is the same value of `pathPrefix` but can be changed from the router options.

```js
// print: "#"
console.log(router.location.urlPrefix);
```

### Location adapter

If you need your own `location` implementation, you can create your own `location` adapter.
<br>See [HashLocation](src/lib/locations/HashLocation.js) for a good example.


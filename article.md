# The foundations of universal JavaScript

In the [last tutorial][1], we wrote a Node program using Babel. This allowed us to use ES6 features now and experiment with new language proposals in a backwards-compatible way. We looked at testing, linting, and running programs in production.

Now let's turn our attention to programs that share code between the server and client.  These are most popularly called *isomorphic* or *universal* JavaScript applications. Since Babel compiles down to ES5 JavaScript, it allows us to write modern JavaScript (ES6 and beyond) and have it work the same across the majority of platforms[^1] in use today.

There are [*many* isomorphic examples][4] in the wild but it can be hard to wrap your head around all the ideas present in them.  This article aims to explain the core foundations of isomorphism:

1. A common JavaScript for client/server
2. A common module system
3. 3rd-party modules that can function on both client and server

## A common JavaScript

As we discussed prior, Babel solves our first problem well in a modern JavaScript fashion.  So we will forgo more discourse on that point. Yet, Babel itself isn't required for this step; you just need a subset of JavaScript that can work across all the platforms you want to support.  ES5 is likely a safe bet in that regard.  If you need older JavaScript support (IE8), you may want to consider using [a shim][17] or limiting yourself to ES3.

## A common module system

Node has a nice established module system.  Browsers... well not so much. If we want to share code that uses `require('lodash')` (the common way to use modules in Node) with the browser, we have to teach the browser some tricks.  This is where [webpack][20] enters in.

Webpack makes client-side development more "Node-like" with the same module system[^2] semantics.  This is important because if we are to share code, we want a `require` (or ES6 `import`) statement to resolve the same way.  It also exposes Node globals (properties and methods on Node's `global` object) as well to keep things familiar (like `process` and `Buffer`).

But client-side development isn't just JavaScript. It's CSS; it's images; it's HTML; it's a lot of things.  Webpack understands those dependencies too and let's you `require` them using *loaders*.  We'll come back to that in a bit.

## 3rd-party isomorphic modules

Not all modules are created the same.  Some work only within a Node environment, others work only in the browser.  But there are a growing number that can work on both sides.  When sharing, use modules that work on both sides.

As an example, Node has a built-in HTTP client as do browsers with Ajax.  [Superagent][8], an isomorphic HTTP client, provides a common API for client and server, tapping into built-in facilities behind the scenes.  Here is a list of some popular isomorphic modules:

1. Utility libraries like [lodash][5] and [Ramda][6]
2. User interface/markup libraries like [React][7][^3]
3. Ajax/HTTP clients like [Superagent][8] and [Mach][9]
4. Routing libraries like [React Router][10] or [Director][11]
5. Testing libraries like [tape][12] and [Mocha][13].

## Let's build something: How's your reaction time?

Let's build a program that incorporates those core foundations as well as have some fun testing your reaction time via the [Stroop effect][3].  If you are unfamiliar, here is a little synopsis from Wikipedia:

>> When the name of a color (e.g., "blue", "green", or "red") is printed in a color not denoted by the name (e.g., the word "red" printed in blue ink instead of red ink), naming the color of the word takes longer and is more prone to errors than when the color of the ink matches the name of the color.

Our program will generate a color test. A player then must:

1. Name the *written* color as soon as possible.
2. Generate a new test by either refreshing the page (a server-side action) or clicking the color (a client-side action).
3. Repeat these steps till you've gone mad, or share with a friend.

A sample test looks like:

![Stroop effect test](screenshot.png)

Feeling a little insane yet?  Let's put this app together.

## Our application structure and dependencies

Our application will have the following structure:

```
.
├── modules
│   ├── client        // Client-side modules
│   ├── server        // Server-side modules
│   └── shared        // Shared modules
├── .babelrc          // Babel configuration
├── index.js
├── package.json
└── webpack.config.js // Webpack configuration
```

To kick things off, get a starter *package.json* file created by running `npm init -y` in the project directory.  Then, install the development dependencies we will use by running:

```sh
npm install babel webpack webpack-dev-server babel-loader concurrently --save-dev
```

* `babel` includes what we need to run node and Babel together in development
* `webpack` is our client-side build system
* `webpack-dev-server` serves and watches our client-side build in development
* `babel-loader` teaches webpack how to load client-side JavaScript files using Babel
* `concurrently` allows us to execute multiple programs concurrently

We will also need a couple application dependencies.  Install them by running:

```sh
npm install babel-runtime react --save
```

* `React` is for rendering and managing events in our Stroop component
* `babel-runtime` will only include those modules we need when working with Babel.  This is a plus for production.  On the server, we will load less data in memory; on the client, we will have a smaller payload.

## Configuring Babel for client and server development

Let's get our Babel configuration set up next. Here, both server and client side share a single *.babelrc* configuration file.  Create that file with following content:

<<(.babelrc)

* `"stage": 0` indicates that, in addition to ES6, we will make use of any new language proposals
* `"optional": ["runtime"]` indicates that we want to use the babel-runtime

Now add an `index.js` file in the project root to bootstrap Babel for our server-side code:

<<(index.js)

* The `babel/register-without-polyfill` will load Babel without all the polyfills since we are using `babel-runtime` to detect.
* Require the main `./modules/server` after registering.

We will skip client-side integration with Babel for now and come back to it later.

## Writing the shared code

Since we are focusing on shared code, let's start with that first.  We will be using the isomorphic React library to do our rendering on both the client and the server side as well as making a shared utility to generate a random color/label pair.

Create a file called *stroop.js* and put the following contents inside:

<<(modules/shared/stroop.js)

If you haven't worked with React, it may be baffling to see `<h1>` tags showing up in your JavaScript!  Those are [JSX tags][14], supported by Babel out of the box.  We also make use of the [bind proposal][18] (`::`) and [class properties proposal][19].  This component outputs our main Stroop UI attaching events.

In addition to React, we also import a small utility called *getRandomColorName.js* which as you probably can guess returns a random color name we can use in our application.  Add that file to the shared directory with the following contents:

<<(modules/shared/getRandomColorName.js)

That's it for shared code.  Let's turn our attention to the server.

## Writing the server

Now we have a shared component and the necessary utilities it needs to run, we need a web server to host our content.  Under the *modules/server* folder let's add a *index.js* file to serve as the entry point to our server-side code.

<<(modules/server/index.js)

* Import the shared `Stroop` component to render and the `getRandomColorName` function to generate a new color pair on each request.
* Use React's `renderToString` method to give us HTML markup we can pass to the client.  `renderToString` includes tracking information that React uses on the client.
* Use the `renderToStaticMarkup` method to insert our component into a larger page content.  The `renderToStaticMarkup` renders just markup without any React tracking information.
* Set the proper content type and encoding.

The `renderToString` method, `serverData` variable and the `<script>` tags pass the necessary data to the client in order to render its side.  We also include a `<script>` to a `bundle.js` file.  This is our webpack development server we will talk about momentarily.

We now have a working application (on the server-side)! Try it out by running `node index.js` in the project root and visiting [http://localhost:3000][15] in your favorite browser.  Whenever you refresh the browser, you will get a new test.  Groovy!

## Setting up webpack

One of the things webpack helps solve our 'having a common module system' problem for client-side code.  It also gives us tools to bundle our client-side JavaScript code and add source maps.  In fact, you can bundle a lot more than just JavaScript with webpack: styles, images, other text formats to name a few.  Webpack calls these *loaders*.  For our project, we just need the `babel-loader` installed earlier.

By default, webpack will look for a configuration file called `webpack.config.js`.  Go ahead and add that file the following contents:

<<(webpack.config.js)

1. `devtool` specifies what development tool to use when bundling, if any.  Here we use `source-map` to generate full source maps with our JavaScript.  With source maps we can debug our code as we wrote it, instead of the compiled version.
2. `output` specifies where to place the bundle (`path`), what to call it (`filename`) and where to host it when using a development server (`publicPath`).
3. `module` teaches webpack how to `require` (or `import`) different types of files.  Here we specify that we want any `.js` files to use the `babel` loader.  We exclude anything within `node_modules` as those shouldn't need Babel.
4. `devServer` defines options for the webpack-dev-server.  We host our webpack server on a different port than our HTTP server in so we can run both in tandem.  For this reason, we enable CORS.[^4]

This is just a fraction of all you can do with webpack, I would encourage reading [Pete Hunt's webpack-howto][16] to further your understanding.

## Writing the client

Our client-side code will look similar to the server-side.  Add an *index.js* file inside the *client* folder with the following contents:

<<(modules/client/index.js)

That's it for client code. We include our `Stroop` component and when the DOM has loaded we grab the container div for our component (which we gave an id of `app` on the server-side) then we render the `Stroop` component passing the same data that we used to render the component on the server side.  React is smart enough to know we are operating against the same markup and will only attach event listeners so we can click on the color test to generate a new one.

## Putting it all together

We are almost set.  Can you hardly stand it?!  We just need a little npm script to tie it together. Edit the `package.json` file, and add the following `start` script to the scripts section:

```json
...
"scripts": {
  "start": "concurrent --kill-others \"webpack-dev-server\" \"node index.js\"",
},
...
```

* `conncurrent` starts both our node and webpack servers together and `--kill-others` shuts down both if either exits.
* `webpack-dev-server` bundles and watches our client-side code using the *webpack.config.js* settings and hosts them on port 3001.
* `node index.js` starts our server and hosts the app on port 3000.

To run our app.  We just execute:

```js
npm start
```

Now you can refresh (server) the page to generate a new test or click (client) on the color.  Happy Strooping!

## Wrapping up

In this article, we discussed what it takes to build an isomorphic web application and went through a simple example covering the foundations.  Yet, I left one important piece out that I leave for you to implement: bundling this application for production.

Here are some steps:

1. Set up a `build-server` npm script to bundle the server-side code.  Hint: look at the [prior article][1].
2. Set up a `build-client` npm script that runs `NODE_ENV=production webpack`.  This will output a bundled client-side JavaScript file and source map in the *public* directory for distribution.  The `NODE_ENV=production` part helps eliminate extra debugging code for React but is becoming more common practice for other libraries.
3. Modify *modules/server/index.js* to behave differently when `NODE_ENV=production`.

    1. First, serve the *public/bundle.js* file when requested.  Hint: `req.url` and `fs.createReadStream`.
    2. Second, render static markup that uses the *public/bundle.js* file as the script source instead of the webpack-dev-server `localhost:3001` one.

Ultimately after running your build scripts, you should be able to run `NODE_ENV=production node build` and see your working production app and still run `npm start` and see the development version.  Good luck!

[1]: https://strongloop.com/strongblog/javascript-babel-future/
[2]: https://babeljs.io/docs/advanced/caveats/
[3]: https://en.wikipedia.org/wiki/Stroop_effect
[4]: https://github.com/search?l=JavaScript&q=isomorphic&type=Repositories&utf8=✓
[5]: http://lodash.com
[6]: http://ramdajs.com
[7]: http://reactjs.com
[8]: http://visionmedia.github.io/superagent
[9]: https://github.com/mjackson/mach
[10]: https://github.com/rackt/react-router
[11]: https://github.com/flatiron/director
[12]: https://github.com/substack/tape
[13]: https://mochajs.org
[14]: https://facebook.github.io/react/docs/jsx-in-depth.html
[15]: http://localhost:3000
[16]: https://github.com/petehunt/webpack-howto
[17]: https://github.com/es-shims/es5-shim
[18]: https://github.com/zenparsing/es-function-bind
[19]: https://gist.github.com/jeffmo/054df782c05639da2adb
[20]: https://webpack.github.io/

[^1]: There are some [browser caveats](https://babeljs.io/docs/advanced/caveats/).  For ES3 environments, also include the [es5-shim](https://github.com/es-shims/es5-shim).
[^2]: Browserify is another good alternative to Webpack.
[^3]: If you are developing in React, you are in luck as isomorphism is an important part of many modules.
[^4]: This setup becomes immensely helpful when using hot reloading with webpack.


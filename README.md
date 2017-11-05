FLOW PROJECT
============

Test application, to build some flow stuff with webpack and vue.


TODO
----

1) ~~HtmlWebpackPlugin usage;~~
2) ~~SCSS/SASS usage;~~
3) ~~Sources maps;~~
4) ~~Resources importing;~~
5) ~~Resources urls in styles;~~
6) ~~Split to chunks;~~
7) ~~Minimization + Tree Shaking;~~
8) ~~Webpack development server;~~
9) ~~HMR (for code and for styles);~~
10) ~~Vue framework apply;~~
11) ~~Alerts frontend component;~~
12) ~~Authentication frontend component;~~
13) Simple application backend;
14) Simple application routing;
15) Application authentication and authorization logic;
16) ...
00) Unit testing;
00) Coverage.


TECHNOLOGY STACK
----------------

1) [Node.js 8](https://nodejs.org "Node.js - official site") for __backend and tools scripts__
2) [Express 4](https://expressjs.com "Express - official site") as __backend framework__
3) [Vue.js 2](https://vuejs.org "Vue.js - official site") as __frontend framework__
2) [Webpack 3](https://webpack.js.org "Webpack - official site") as __frontend bundler__
4) [Babel 6](https://babeljs.io "Babel - official site") as __js transpiler__
5) [Sass 3](http://sass-lang.com "Sass - official site") as __css transpiler__


INSTALLATION
------------

#### Install npm dependencies

```
npm install
```

> __!!!__: Be sure about current shell mode. If it's in _production_ - there need
also to do ``npm install`` with ``--dev-only`` key, because in most cases, npm in
production will ignore dev dependencies.


BUILDING
--------

#### Simple application build

```
npm run build
```

It's single run build, to build application into ``dist`` directory.


#### Watch application build

```
npm run watch
```

It's started bundler in __watch__ mode, to get notify when file system changes and
rebuild changed modules.


#### Dev server application build

```
npm run dev-server
```

It's started __webpack-dev-server__ to manage all project files more faster and flexible
with hot module replacement feature (it's allow to hot reload changed styles or code
parts directly in application runtime)


> __!!!__: In _production_ mode all files will minified without sourcesmaps with extracted
styles. Avoid to start _webpack-dev-server_ in production mode.
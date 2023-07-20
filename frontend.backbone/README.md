# ParsePort frontend

Dutch sentence parser for Spindle + Æthel (and maybe others in the future).

This is a client side web application based on [Backbone][1], [jQuery][2], [Lodash][3], [Handlebars][4] and [Machina][5] with support from [Gulp][6] and [Browserify][7] and code written in [TypeScript][8]. Styling is based on [Bulma][9] with [Sass][10] and i18n is taken care of using [i18next][11]. Its primary purpose is to provide a user interface, which may be supported by a separate backend application.

[1]: https://backbonejs.org
[2]: https://jquery.com
[3]: https://lodash.com
[4]: https://handlebarsjs.com
[5]: http://machina-js.org
[6]: https://gulpjs.com
[7]: http://browserify.org
[8]: https://www.typescriptlang.org
[9]: https://bulma.io
[10]: https://sass-lang.com
[11]: https://www.i18next.com


## Before you start

You need to install the following software:

 - Node.js >= 8
 - Yarn
 - any static webserver (deployment only)


## How it works

Alongside this README, you will find the following files and directories:

 - `package.json` lists the direct package dependencies and other metadata about this application.
 - `yarn.lock` pins the versions of all packages, including indirect dependencies.
 - `gulpfile.ts` contains automation configuration for common tasks such as building, testing, and running the development server. This file is consulted when you invoke `gulp`. This file also makes it possible to attach a separate backend application.
 - `config.json` contains default settings that the application may use at runtime. These can be overridden from the outside. Source modules transparently import the configuration from `config.json`, even if overridden.
 - `src/` contains the source files. More on the organization of these files below.
 - `dist/` (generated when needed) will contain the built application, consisting of an `index.html`, a single JavaScript bundle (which includes precompiled templates), a single CSS bundle and an `image/` softlink to the `src/image/` subdirectory.
 - `node_modules/` (generated when needed) will contain installed packages. When the application is built, (non-dev) dependencies may be either included in the script bundle or loaded separately in `<script>` tags in the `index.html`, depending on the `browserLibs` configuration in the gulpfile.

The `src/` directory contains the following files and directories.

 - `index.hbs` is the template for the `index.html`.
 - `main.ts` is the entry point of the script bundle.
 - `test-util.ts` contains utilities that are available to all unittests.
 - `i18n/` contains JSON-formatted i18next translation dictionaries. More on translation in the development section.
 - `image/` contains the images.
 - `style/` contains the Sass source files for the CSS bundle. `_bulma-custom.sass` ensures that we only import the parts of Bulma that we use.
 - `aspects/`, `core/` and `global/` contain script modules. These directories correspond to fixed levels of the import hierarchy discussed below.
 - Besides the above, an arbitrary number of other directories may exist. These directories should exclusively contain *unit modules* (see import hierarchy below). The purpose of these directories is to organize the units by topic, so we refer to them as *topic directories*.

Unittest modules live directly next to the script module they belong to. They have the same name but suffixed with `-test`. Only the modules in `core/` and the topic directories are subject to unittesting; the other modules mostly contain glue rather than logic and are more aptly verified in functional tests.


### Import hierarchy and event mechanics

In order to follow the [Law of Demeter][12], we organize our script modules in strict levels of dependency. Each level may only depend on itself and previous levels. The first three levels contain most of the logic while the latter three contain mostly glue. By adhering to this hierarchy, we keep the modules that contain the logic isolated and simple, which in turn simplifies testing and maintenance.

[12]: https://en.wikipedia.org/wiki/Law_of_Demeter

 1. External libraries.
 2. `core/*`, our "internal library" of standalone functions and base classes.
 3. Units, organized in topic directories. More on these below.
 4. `global/*`: fully composed global instances of unit classes as well as global configuration of external libraries.
 5. `aspects/*`: event bindings between global instances. The order of these bindings is arbitrary. For ease of maintenance, each module should correspond to a group of usage scenarios or an *aspect* of the application.
 6. The `main.ts` module. This is the entry point of the application. It imports the global configuration modules and the aspect modules for their side effects and kicks off `Backbone.history.start` when all conditions are met.

Units are the reusable building blocks of our application. They come in the following flavors. The flavor of a unit is always indicated with a file name suffix, e.g. `-template` or `-router`.

 - Handlebars templates. It is helpful to think of a template as a declarative way to define a function, that takes JSON as its input and returns HTML as its output. Indeed, this is exactly what the templates get precompiled into.
 - Subclasses of `core/model`, which is a subclass of [Backbone.Model][13].
 - Subclasses of `core/collection`, which is a subclass of [Backbone.Collection][14]. Generally, each collection unit class depends on one model unit class.
 - Subclasses of `core/view`, which is a subclass of [Backbone.View][15]. A view may depend on templates and on other views for rendering.
 - Subclasses of `core/router`, which is a subclass of [Backbone.Router][16]. Routers tend to be completely declarative, mapping route patterns to names.
 - Subclasses of `core/fsm`, which is a Backbone-friendly subclass of [machina.Fsm][5]. FSMs tend to be declarative, too, listing all the possible state transitions.

[13]: https://backbonejs.org/#Model
[14]: https://backbonejs.org/#Collection
[15]: https://backbonejs.org/#View
[16]: https://backbonejs.org/#Router

Besides the templates, all unit flavors are classes. We instantiate them in order to use them. There are two ways to do this. The first way is *locally* inside a method of another unit class. This creates a temporary instance which is owned by another object, although it may be long-lived. The second way is *globally* inside a `global/*` module (level 4 mentioned above). These instances exist for the entire duration of the application run.

The units are isolated, but their instances must cooperate in order to produce a coherent application. We achieve this by binding events on the instances from the outside after creation. In the *local* case, this binding takes place inside the method in which the instance was created.

In the *global* case, the binding is done in an aspect module (level 5 mentioned above). Within each aspect module, bindings should be grouped by event emitter. The same emitter may appear in multiple aspect modules, if the events in question correspond to different aspects of the application.


## Development

### Quickstart

```console
$ yarn       # installs all the packages
$ yarn gulp  # compiles, tests and runs the application
```

Once you have seen both of the following lines (not always in this order):

```console
frontend started http://localhost:8080
...
123456 bytes written (1.23 seconds) # OR: Finished 'dist' after 1.23 s
```

you can visit http://localhost:8080 in your browser in order to see the application in action.

Source files are watched for changes. Sources will be recompiled, tests will be restarted and the browser will livereload.

Packages are managed using `yarn add` and `yarn remove`.


### Gulp tasks and options

The general syntax for running gulp tasks is as follows:

```console
yarn gulp [taskname ...] [--option [OPTION_VALUE] ...]
```

The available task names are listed below. If you omit the task name, it runs the `default` task. When you pass multiple task names, they will be run in parallel.

 - `style`: compile the stylesheet bundle.
 - `template`: precompile the templates.
 - `index`: compile the `index.html`.
 - `image`: soft-link `src/image/` to `dist/image/`.
 - `script`: run `template` and compile the script bundle.
 - `dist`: build the application, i.e., do all of the above.
 - `unittest`: run `template` and compile, bundle and run the unittests.
 - `serve`: run the development server. Livereload if the build changes.
 - `watch`: build the application and then watch for file changes. On changes, rebuild and retest.
 - `clean`: delete all files that are generated by other tasks.
 - `default`: first run `clean`, then run `watch` and `serve` in parallel.

The following options are available in order to influence the behaviour of the tasks. You can safely pass each option to each task; if an option is irrelevant to a task, it will be ignored. The `--config`, `--proxy` and `--root` options are especially useful in order to attach a backend application.

 - `--config CONFIGFILE`: override the default `config.json` with the settings in `CONFIGFILE`. `CONFIGFILE` should either be an absolute path or a path relative to the gulpfile.
 - `--proxy PROXYFILE`: forward some requests to the development server to one or more other servers, as indicated by the settings in `PROXYFILE`. When this option is used, livereload is disabled.
 - `--root SERVER_ROOT`: serve files from the given `SERVER_ROOT` directory. If this option is omitted, `SERVER_ROOT` defaults to the directory that contains the gulpfile, as the server may need to find files both in `dist/` and in `node_modules/` when using the default `config.json`.
 - `--production`: minify the stylesheet and the script bundle and omit sourcemaps. Use minified CDN copies instead of bloaty local node modules for the external libraries that are included through `<script>` tags. If this option is specified, the development server does not need access to the `node_modules/`.


### Configuring which external libraries are bundled

By default, all external libraries are bundled together with our own TypeScript modules into a single large JavaScript file. Exceptions are configured in the `browserLibs` variable in the gulpfile. These exceptions are embedded separately in the `index.html` through `<script>` tags. It is recommended to add a library to the `browserLibs` if it is (1) large and (2) commonly used on other sites, because the user is then likely to benefit from caching. A nice side effect is that bundling is also faster.

`browserLibs` is an array in which each item configures a single library. It is important to understand that the order of the libraries matters. The libraries are embedded in the `index.html` in the order of the array, before the bundle. So if library `foo` is in the array and it depends on library `bar`, then `bar` must be in the `browserLibs`, too, *before* `foo`.

Each `browserLibs` item may have the following properties.

 - `module` (required): module name from which the library is imported in your own modules. For example, if you `import * as $ from 'jquery'`, then `'jquery'` is the value you need to set for the `module`.
 - `global` (required): global name by which the library is available when embedded. For example `'jQuery'`.
 - `cdn` (required): template string for the CDN URL from which the library should be loaded in production mode. In most cases, this is just `${cdnjsPattern}/\${filenameMin}` or `${jsdelivrPattern}/\${filenameMin}`. For special cases, look at the other libraries for examples and consult the [gulp-cdnizer documentation][17] for the available template property names.
 - `browser`: name of the module that should be embedded. Defaults to the same value as `module`. Use this if `module` is not self-contained, to load an alternative UMD module. For example, `'i18next'` resolves to `'i18next/index.js'`, which is not browser-friendly because it needs to import other modules. We set `browser` to `'i18next/dist/umd/i18next'` to fix this.
 - `alias`: array of other module names that should be replaced by the same external library. For example, `'underscore'` is currently set as an alias for `'lodash'`.
 - `package`: base name of the package, defaults to the same value as `module`. Override this if `module` is not the name of the proper package, e.g., a nested path inside the package rather than the package itself. For example, we import the Handlebars runtime from `'handlebars/dist/handlebars.runtime'` (the `module` name) so we specify that the `package` is `'handlebars'`.

[17]: https://www.npmjs.com/package/gulp-cdnizer#optionsfilescdn


### Proxy configuration

Suppose you have a backend application running on `localhost:8000` and you want to forward all requests for `/api` to this backend application. Create a JSON file with the following content:

```json
[{
  "context": ["/api/**"],
  "options": {"target": "http://localhost:8000"}
}]
```

And pass the path to this file as the `--proxy` option to Gulp. Now, whenever you send a request to (a subpath of) `localhost:8000/api/`, it will be tranparently handled by the backend application.

Now suppose that you have another backend application running on `localhost:7000` and you want it to handle everything not under `/static` or `/api`. No problem, just add another rule to the proxy file:

```json
[{
  "context": ["/api/**"],
  "options": {"target": "http://localhost:8000"}
}, {
  "context": ["/**", "!/static/**"],
  "options": {"target": "http://localhost:7000"}
}]
```

This is just a tip of the iceberg. You can rewrite paths and do other sophisticated things. For a full overview of the context and options notation, see the [http-proxy-middleware documentation][18].

[18]: https://www.npmjs.com/package/http-proxy-middleware


## Deployment

Deployment is quite simple, assuming that you'll be hosting the built application with a common webserver like Nginx or Apache. Roughly, you'll be following the steps below.


### 1. Override the config.json

Create a copy of the `config.json` and make sure that its contents are correct. The `baseUrl` should be the path component of the URL at which users will visit the home page. The `staticRoot` should be the path component under which your webserver will be serving the script bundle, the style bundle and the images. You may also need to review other settings, depending on whatever your code relies on, for example a path prefix of your backend API. The `nodeRoot` is not needed in deployment, so you can ignore it.


### 2. Build the application

```console
$ yarn
$ yarn gulp dist --production --config path/to/your/config-override.json
```

Copy the contents of the `dist` directory to wherever your webserver will be serving the files. For example, if your `staticRoot` is `/static/` and your server will be resolving requests to `/static/` by looking up the corresponding file in `/var/www/htdocs`, copy the contents of `dist` into `/var/www/htdocs`.


### 3. Configure your webserver

How to configure your webserver is completely beyond the scope of this README. However, we can mention the two most important goals:

 - Your webserver should resolve requests to your `staticRoot` against the contents of the `dist` directory, as mentioned above.
 - Requests to your `baseUrl`, as well as to any route within the application (relative to the `baseUrl`), should result in the `index.html` being sent as the response. Depending on your setup, you can realize this from the webserver itself or from a separate backend application.

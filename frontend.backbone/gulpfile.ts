import gulp = require('gulp');
import browserify = require('browserify');
import vinylStream = require('vinyl-source-stream');
import vinylBuffer = require('vinyl-buffer');
import tsify = require('tsify');
import watchify = require('watchify');
import exorcist = require('exorcist');
import exposify = require('exposify');
import aliasify = require('aliasify');
import log = require('fancy-log');
import cssnano = require('cssnano');
import autoprefixer = require('autoprefixer');
import fs = require('fs');
import path = require('path');
import streamqueue = require('streamqueue');
import proxy = require('http-proxy-middleware');
import del = require('del');
import yargs = require('yargs');
import glob = require('glob');
import loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

type LibraryProps = {
    module: string,
    browser?: string,
    global: string,
    alias?: string[],
    path?: string,
    package?: string,
    cdn: string,
};
type ExposeConfig = {
    [moduleName: string]: string,
};

// Task names.
const SCRIPT = 'script',
    UNITTEST = 'unittest',
    STYLE = 'style',
    TEMPLATE = 'template',
    INDEX = 'index',
    IMAGE = 'image',
    COMPLEMENT = 'complement',  // non-script static
    DIST = 'dist',
    SERVE = 'serve',
    WATCH = 'watch',
    CLEAN = 'clean';

// General configuration.
const sourceDir = `src`,
    buildDir = `dist`,
    nodeDir = `node_modules`,
    configModuleName = 'config.json',
    indexConfig = yargs.argv.config || configModuleName,
    indexTemplate = `${sourceDir}/index.hbs`,
    indexOutput = `${buildDir}/index.html`,
    imageDir = `${sourceDir}/image`,
    mainScript = `${sourceDir}/main.ts`,
    jsBundleName = `index.js`,
    jsSourceMapDest = `${buildDir}/${jsBundleName}.map`,
    jsModuleType = `commonjs`,
    tsOptions = {
        target: `es5`,
        lib: ['DOM', 'ES5', 'ES6', 'DOM.Iterable', 'ScriptHost'],
        resolveJsonModule: true,
        paths: {configModuleName: indexConfig},
        baseUrl: '.',
    },
    aliasOptions = {
        aliases: {[configModuleName]: `./${indexConfig}`},
        appliesTo: {excludeExtensions: ['.json']},
    },
    unittestBundleName = 'tests.js',
    unittestEntries = glob.sync(`${sourceDir}/**/*-test.ts`),
    templateRenameOptions = {extname: '.ts'},
    templateSourceGlob = `${sourceDir}/**/*-template.hbs`,
    templateOutputGlob = `${sourceDir}/**/*-template${templateRenameOptions.extname}`,
    templateModuleType = 'es6',
    templateCacheName = 'templates',
    hbsModuleTail = 'dist/handlebars.runtime',
    hbsModule = `handlebars/${hbsModuleTail}`,
    hbsKnownHelpers = {i18n: true, static: true},
    hbsGlobal = 'Handlebars',
    i18nModuleTail = 'dist/umd/i18next',
    i18nModule = `i18next/${i18nModuleTail}`,
    styleDir = `${sourceDir}/style`,
    mainStylesheet = `${styleDir}/main.sass`,
    styleSourceGlob = `${styleDir}/*.sass`,
    cssBundleName = 'index.css',
    production = yargs.argv.production || false,
    proxyConfig = yargs.argv.proxy,
    serverRoot = yargs.argv.root,
    ports = {frontend: 8080, unittest: 8088},
    jsdelivrPattern = 'https://cdn.jsdelivr.net/npm/${package}@${version}',
    unpkgPattern = 'https://unpkg.com/${package}@${version}',
    cdnjsBase = 'https://cdnjs.cloudflare.com/ajax/libs',
    cdnjsPattern = `${cdnjsBase}/\${package}/\${version}`;

// Libraries which are inserted through <script> tags rather than being bundled
// by Browserify. They will be inserted in the order shown.
const browserLibs: LibraryProps[] = [{
        module: 'jquery',
        global: '$',
        cdn: `${cdnjsPattern}/\${filenameMin}`,
    }, {
        module: 'lodash',
        global: '_',
        alias: ['underscore'],
        cdn: `${jsdelivrPattern}/\${filenameMin}`,
    }, {
        module: 'backbone',
        global: 'Backbone',
        cdn: `${cdnjsBase}/backbone.js/\${version}/backbone-min.js`,
    }, {
        module: hbsModule,
        global: hbsGlobal,
        package: 'handlebars',
        cdn: `${jsdelivrPattern}/${hbsModuleTail}.min.js`,
    }, {
        module: 'i18next',
        browser: i18nModule,
        global: 'i18next',
        cdn: `${cdnjsPattern}/\${filenameMin}`,
    }],
    browserLibsRootedPaths: string[] = [],
    cdnizerConfig = {files: browserLibs.map(lib => {
        let mod = lib.module,
            browser = lib.browser || mod,
            pkg = lib.package || mod;
        return {
            file: `/**/${browser}.*`,
            package: pkg,
            cdn: lib.cdn,
        };
    })};

browserLibs.forEach(lib => {
    let browser = lib.browser || lib.module;
    lib.path = path.relative(nodeDir, require.resolve(browser));
    browserLibsRootedPaths.push(path.join(nodeDir, lib.path));
});

// We override the filePattern (normally /\.js$/) because tsify
// outputs files without an extension. Basically, we tell exposify to
// not be picky. This is fine because we only feed JS files into
// browserify anyway.
exposify.filePattern = /./;
exposify.config = browserLibs.reduce((config: ExposeConfig, lib) => {
    config[lib.module] = lib.global;
    if (lib.alias) lib.alias.forEach(alias => config[alias] = lib.global);
    return config;
}, {});

function decoratedBrowserify(options) {
    return browserify(options)
        .plugin(tsify, tsOptions)
        .transform(aliasify, aliasOptions)
        .transform(exposify, {global: true});
}

const tsModules = decoratedBrowserify({
    debug: !production,
    entries: [mainScript],
    cache: {},
    packageCache: {},
});

const tsTestModules = decoratedBrowserify({
    entries: unittestEntries,
    cache: {},
    packageCache: {},
});

function ifProd(stream, otherwise?) {
    return plugins['if'](production, stream, otherwise);
}

function ifNotProd(stream) {
    return plugins['if'](!production, stream);
}

gulp.task(TEMPLATE, function() {
    return gulp.src(templateSourceGlob)
        .pipe(plugins.cached(templateCacheName))
        .pipe(plugins.handlebars({
            compilerOptions: {
                knownHelpers: hbsKnownHelpers,
                knownHelpersOnly: true,
            },
        }))
        .pipe(plugins.defineModule(templateModuleType, {
            require: {[hbsGlobal]: hbsModule},
        }))
        .pipe(plugins.rename(templateRenameOptions))
        .pipe(gulp.dest(sourceDir));
});

function jsBundle() {
    return tsModules.bundle()
        .pipe(ifNotProd(exorcist(jsSourceMapDest)))
        .pipe(vinylStream(jsBundleName))
        .pipe(ifProd(vinylBuffer()))
        .pipe(ifProd(plugins.uglify()))
        .pipe(gulp.dest(buildDir));
}

function jsUnittest() {
    const libs = gulp.src(browserLibsRootedPaths);
    const bundle = tsTestModules.bundle()
        .pipe(vinylStream(unittestBundleName))
        .pipe(vinylBuffer());
    const headless = plugins.jasmineBrowser.headless({
        driver: 'phantomjs',
        port: ports.unittest,
    });
    // The next line is a fix based on
    // https://github.com/gulpjs/gulp/issues/71#issuecomment-41512070
    headless.on('error', e => headless.end());
    return streamqueue({objectMode: true}, libs, bundle)
        .pipe(plugins.jasmineBrowser.specRunner({console: true}))
        .pipe(headless);
}

gulp.task(SCRIPT, gulp.series(TEMPLATE, jsBundle));

gulp.task(UNITTEST, gulp.series(TEMPLATE, jsUnittest));

gulp.task(STYLE, function() {
    let postcssPlugins = [autoprefixer()];
    if (production) postcssPlugins.push(cssnano());
    return gulp.src(mainStylesheet)
        .pipe(ifNotProd(plugins.sourcemaps.init()))
        .pipe(plugins.sass({includePaths: [nodeDir]}))
        .pipe(plugins.postcss(postcssPlugins))
        .pipe(plugins.rename(cssBundleName))
        .pipe(ifNotProd(plugins.sourcemaps.write('.')))
        .pipe(gulp.dest(buildDir));
});

gulp.task(INDEX, function(done) {
    fs.readFile(indexConfig, 'utf-8', function(error, data) {
        if (error) return done(error);
        gulp.src(indexTemplate)
            .pipe(plugins.hb().data(JSON.parse(data)).data({
                libs: browserLibs,
                jsBundleName,
                cssBundleName,
                production,
            }))
            .pipe(ifProd(plugins.cdnizer(cdnizerConfig)))
            .pipe(plugins.rename({extname: '.html'}))
            .pipe(gulp.dest(buildDir));
        return done();
    });
});

gulp.task(IMAGE, function() {
    return gulp.src(imageDir).pipe(gulp.symlink(buildDir));
});

gulp.task(COMPLEMENT, gulp.parallel(STYLE, INDEX, IMAGE));

gulp.task(DIST, gulp.parallel(SCRIPT, COMPLEMENT));

gulp.task(SERVE, function() {
    let serverOptions: any = {
        root: serverRoot || __dirname,
        port: ports.frontend,
        name: 'frontend',
        livereload: !proxyConfig,
        fallback: indexOutput,
    };
    if (proxyConfig) {
        const proxyData = JSON.parse(fs.readFileSync(proxyConfig, 'utf-8'));
        serverOptions.middleware = (connect, connectOptions) => proxyData.map(
            ({context, options}) => proxy(context, options)
        );
    }
    plugins.connect.server(serverOptions);
});

gulp.task(WATCH, gulp.series(gulp.parallel(TEMPLATE, COMPLEMENT), function() {
    tsModules.plugin(watchify);
    tsModules.on('update', jsBundle);
    tsModules.on('log', log);
    jsBundle();
    tsTestModules.plugin(watchify);
    tsTestModules.on('update', jsUnittest);
    jsUnittest();
    gulp.watch(styleSourceGlob, gulp.task(STYLE));
    gulp.watch(templateSourceGlob, gulp.task(TEMPLATE));
    gulp.watch([indexConfig, indexTemplate], gulp.task(INDEX));
}));

gulp.task(CLEAN, function() {
    return del([buildDir, templateOutputGlob]);
});

gulp.task('default', gulp.series(CLEAN, gulp.parallel(WATCH, SERVE)));

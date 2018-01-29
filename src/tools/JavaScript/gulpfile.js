/// <binding AfterBuild='test, minify, pack' Clean='clean' />

// TODO: TBD: can ECMAScript be upgraded? i.e. for features such as 'const' (vs 'var')
//const gulp = require("...")
var del = require("del");
var gulp = require("gulp");
var minify = require("gulp-minify");
var tar = require("gulp-tar");
var gzip = require("gulp-gzip");
var chutzpah = require("gulp-chutzpah");
var configureGulp = require("./gulp.config.js").configureGulp;

// The rest of the configuration is pretty much boilerplate, for use throughout the solution.
var cfg = configureGulp({
    root: "./Scripts/ExtensionsJS",
    bin: "./bin",
    spec: "./spec/**"
});

gulp.task("clean",
    /* Remember, this 'clean' occurs AFTER the assembly build, yet BEFORE the JavaScript tasks.
    Therefore, we want to leave the BIN folder alone, excepting for JavaScript artifacts.*/
    function() {
        /* del is an async function and not a gulp plugin (just standard nodejs). It returns a
        promise, so make sure you return that from this task function so gulp knows when the
        delete is complete. */
        return del([
                cfg.bin + "/*.min.js",
                cfg.bin + "/dist/**"
            ],
            { force: true });
    });

gulp.task("minify",
    function() {
        // More AWESOMENESS!
        return gulp.src(cfg.root + "/*.js")
            .pipe(minify({
                ext: {
                    src: ".js",
                    min: ".min.js"
                },
                ignoreFiles: [".min.js"]
            }))
            .pipe(gulp.dest(cfg.bin));
    });

/* TODO: TBD: of course, this is somewhat of a work in progress; what else do I need
to include? a README.md? organize a bit differently with its own bin folder? etc? */
gulp.task("pack",
    ["minify"],
    function() {
        // What can I say? This is simply FANTASTIC!
        return gulp.src([
                    cfg.root + "/*.js",
                    cfg.bin + "/*.min.js",
                    cfg.bin + "/package.json"
                ])
            .pipe(tar(cfg.name + ".tar"))
            .pipe(gzip())
            .pipe(gulp.dest(cfg.bin + "/dist"));
    });

gulp.task("test",
    function() {
        var opts = {
            "executable": "C:/Dev/NuGet/packages/Chutzpah.4.3.6/tools/chutzpah.console.exe"
        };
        return gulp.src(cfg.spec + "/*.js", { read: false })
            .pipe(chutzpah(opts));
    });

/// <binding AfterBuild='createTarballPackage' Clean='clean' />

// TODO: TBD: can ECMAScript be upgraded? i.e. for features such as 'const' (vs 'var')
//const gulp = require("...")
// ReSharper disable once PossiblyUnassignedProperty
var del = require("del");
// ReSharper disable once PossiblyUnassignedProperty
var gulp = require("gulp");
// ReSharper disable once PossiblyUnassignedProperty
var minify = require("gulp-minify");
// ReSharper disable once PossiblyUnassignedProperty
var tar = require("gulp-tar");
// ReSharper disable once PossiblyUnassignedProperty
var gzip = require("gulp-gzip");
// ReSharper disable once PossiblyUnassignedProperty
var chutzpah = require("gulp-chutzpah");
// ReSharper disable once PossiblyUnassignedProperty
var json = require("read-data").json;
// ReSharper disable once PossiblyUnassignedProperty
var fs = require("fs-jetpack");
// ReSharper disable once PossiblyUnassignedProperty
var path = require("path");
/* Initialize Simple Git for usage. Must also be careful of usage, the API is asynchronous,
through and through, so any follow on activity must, for the most part, occur during the
respective callbacks. */
// ReSharper disable once PossiblyUnassignedProperty
var git = require("simple-git")();
// ReSharper disable once PossiblyUnassignedProperty
var crc2json = require("crc2json");

/* TODO: TBD: will run with this approach for the time being. However, I may reconsider and run
with Verdaccio eventually. That and/or potentially dropping Visual Studio (2015) altogether in
favor of possibly Eclipse based hosting. */

var cfg = {
    name: "extensionsjs-array",
    src: "arr.js",
    pkgJson: "package.json",
    rootDir: path.join(".", "Scripts", "ExtensionsJS"),
    binDir: path.join(".", "bin"),
    specDirs: path.join(".", "spec", "**"),
    distDir: path.join(".", "bin", "dist"),
    gitDir: ".git",
    // Assumes some organizational structure about the Solution and Project directories.
    regRootDir: path.join("..", "..", "..", "..", "Node.js", "Registries")
};

gulp.task("clean",
    /* Remember, this 'clean' occurs AFTER the assembly build, yet BEFORE the JavaScript tasks.
    Therefore, we want to leave the BIN folder alone, excepting for JavaScript artifacts.*/
    function() {
        /* del is an async function and not a gulp plugin (just standard nodejs). It returns a
        promise, so make sure you return that from this task function so gulp knows when the
        delete is complete. */
        return del([
                path.join(cfg.binDir, "*.min.js"),
                path.join(cfg.distDir, "**")
            ],
            { force: true });
    });

gulp.task("stage",
    function() {
        if (!fs.exists(cfg.binDir)) {
            fs.dir(cfg.binDir);
        }
        var copyOpts = { overwrite: () => true };
        /* Do this in lieu of Visual Studio file item settings. Eventually, I think I may
        drop Visual Studio for purely JavaScript, especially Node.js, purposes altogether. */
        fs.copy(path.join(".", cfg.pkgJson), path.join(cfg.binDir, cfg.pkgJson), copyOpts);
        fs.copy(path.join(cfg.rootDir, cfg.src), path.join(cfg.binDir, cfg.src), copyOpts);
    });

gulp.task("minify",
    function() {
        // More AWESOMENESS!
        return gulp.src(path.join(cfg.rootDir, "*.js"))
            .pipe(minify({
                ext: {
                    src: ".js",
                    min: ".min.js"
                },
                ignoreFiles: [".min.js"]
            }))
            .pipe(gulp.dest(cfg.binDir));
    });

gulp.task("test",
    function() {
        /* TODO: TBD: this is a good point; if I decided to drop Visual Studio, that would also
        require potentially dropping Chutzpah, which is a Visual Studio test runner. Would need to
        decide which other runner I would be most comfortable with, or perhaps there is one geared
        toward supporting Eclipse, per se... */
        var opts = {
            "executable": "C:/Dev/NuGet/packages/Chutzpah.4.3.6/tools/chutzpah.console.exe"
        };
        return gulp.src(path.join(cfg.specDirs, "*.js"))
            .pipe(chutzpah(opts));
    });

/* TODO: TBD: may be worth including a README.md; at the same time, separate this
out into a dedicated repository. */
gulp.task("createTarballPackage",
    ["test", "minify", "stage"],
    function() {
        // What can I say? This is simply FANTASTIC!
        return gulp.src([
                path.join(cfg.binDir, "*.js"),
                path.join(cfg.binDir, "*.min.js"),
                path.join(cfg.binDir, cfg.pkgJson)
            ])
            .pipe(tar(cfg.name + ".tar"))
            .pipe(gzip())
            .pipe(gulp.dest(cfg.distDir));
    });

gulp.task("createPackageRegistryDir",
    function() {
        var repoDir = path.resolve(path.join(cfg.regRootDir, cfg.name)).replace(/\\/g, "/");
        if (fs.exists(repoDir)) {
            console.log("Package registry directory '" + repoDir + "' exists.");
        } else {
            // Only need to specify the Target Directotry itself.
            fs.dir(repoDir, { empty: false, mode: "700" });
        }
    });

gulp.task("publishPackageToLocalRegistry",
    ["createTarballPackage", "createPackageRegistryDir"],
    function() {
        var repoDir = path.join(cfg.regRootDir, cfg.name);
        git.cwd(repoDir);
        var tarballName = cfg.name + ".tar.gz";
        var commitAndTagPackage = () => {
            var pkg = json.sync(path.join(cfg.binDir, cfg.pkgJson));
            // We will assume that the Version has been appropriately bumped.
            var version = pkg.version;
            git.commit("publishing package version " + version,
                tarballName,
                cerr => {
                    if (cerr) {
                        throw cerr;
                    }
                    git.tag([version, "--force"],
                        terr => {
                            if (terr) {
                                throw terr;
                            }
                        });
                });
        };
        var doPublish = () => {
            var srcDir = cfg.distDir;
            var copyOpts = { matching: tarballName };
            if (fs.exists(path.join(repoDir, tarballName))) {
                /* We need to compare a couple of CRC32 results in order to determine whether to
                copy in the first place. Note, due to the asynchronous nature of these callbacks,
                we need to be careful about what to nest during which callback. */
                var processPathCrc = (rootDir, callback) => {
                    crc2json(rootDir,
                        map => {
                            // We need to sift through the entries for the requested value.
                            var value = undefined;
                            // ReSharper disable once MissingHasOwnPropertyInForeach
                            for (var k in map) {
                                // Checking for having own property does not work here for whatever reason.
                                if (k.endsWith(tarballName)) {
                                    value = map[k];
                                    break;
                                }
                            }
                            callback(value);
                        });
                };
                processPathCrc(srcDir,
                    x => {
                        processPathCrc(repoDir,
                            y => {
                                copyOpts.overwrite = () => x !== y;
                                fs.copy(srcDir, repoDir, copyOpts);
                                commitAndTagPackage();
                            });
                    });
            } else {
                /* Otherwise, simply copy the package when it does not exist. We must still
                specify overwrite, even though technically there is nothing to overwrite. */
                copyOpts.overwrite = () => true;
                fs.copy(srcDir, repoDir, copyOpts);
                git.add([tarballName]);
                commitAndTagPackage();
            }
        };
        // ReSharper disable once PossiblyUnassignedProperty
        if (fs.exists(path.join(repoDir, cfg.gitDir)) &&
            git.checkIsRepo(err => {
                if (err) {
                    throw err;
                }
            })) {
            doPublish();
        } else {
            git.init(false,
                err => {
                    if (err) {
                        throw err;
                    }
                    doPublish();
                });
        }
    });

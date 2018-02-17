/// <binding AfterBuild='createTarballPackage' Clean='clean' />

/* TODO: TBD: this much is all so BOILERPLATE, it's really a shame.
maybe there is a way for it not to be quite as much... */

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
// ReSharper disable once PossiblyUnassignedProperty
var git = require("simple-git")();
// ReSharper disable once PossiblyUnassignedProperty
var crc2json = require("crc2json");

var cfg = {
    name: "extensionsjs-number",
    src: "number.js",
    minSrc: "number.min.js",
    pkgJson: "package.json",
    rootDir: path.join(".", "Scripts", "ExtensionsJS"),
    binDir: path.join(".", "bin"),
    specDirs: path.join(".", "spec", "**"),
    distDir: path.join(".", "bin", "dist"),
    gitDir: ".git",
    /* Make sure that projects are Cloned with sufficient directory depth in order to allow
    Registries publication, i.e. /source/company/js/ExtensionsJS/repoClone/src/projectName/.../.
                                                    4.           3.        2.  1. */
    regRootDir: path.resolve(path.join("..", "..", "..", "..", "Node.js", "Registries")).replace(/\\/g, "/")
};

/* TODO: TBD: So much of this is still very much boilerplace, which is the intended goal. */
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

gulp.task("minify",
    function() {
        // More AWESOMENESS!
        return gulp.src(cfg.rootDir + "/*.js")
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
        // We will assume that the Version has been appropriately bumped.
        var version = json.sync(path.join(cfg.binDir, cfg.pkgJson)).version;
        var repoDir = path.join(path.join(cfg.regRootDir, cfg.name, version));
        if (fs.exists(repoDir)) {
            console.log("Package registry directory '" + repoDir + "' exists.");
        } else {
            // Only need to specify the Target Directotry itself.
            fs.dir(repoDir, { empty: false, mode: "700" });
        }
    });

// TODO: TBD: rinse and repeat from Array ExtensionsJS...
gulp.task("publishPackageToLocalDir",
    ["minify", "stage", "createPackageRegistryDir"],
    function() {
        var version = json.sync(path.join(cfg.binDir, cfg.pkgJson)).version;
        var repoDir = path.join(cfg.regRootDir, cfg.name, version).replace(/\\/g, "/");
        var items = [
            { name: cfg.src },
            { name: cfg.minSrc },
            { name: cfg.pkgJson }
        ];
        var processedItems = [];
        var archive = function() {
            if (!processedItems.length) {
                return;
            }
            var commitPackages = function() {
                git.commit("publishing " + cfg.name + " " + version);
            };
            var addPackages = function() {
                git.cwd(repoDir);
                var addingItems = [];
                var updatingItems = [];
                for (var j = 0; j < processedItems.length; j++) {
                    if (processedItems[j].adding) {
                        addingItems.push(processedItems[j].name);
                    }
                    if (processedItems[j].updating) {
                        updatingItems.push(processedItems[j].name);
                    }
                }
                if (addingItems.length) {
                    git.add(addingItems,
                        () => {
                            commitPackages();
                        });
                } else if (updatingItems.length) {
                    commitPackages();
                }
            };
            git.cwd(cfg.regRootDir);
            if (fs.exists(path.join(cfg.regRootDir, cfg.gitDir).replace(/\\/g, "/")) &&
                // ReSharper disable once PossiblyUnassignedProperty
                git.checkIsRepo(err => {
                    if (err) {
                        throw err;
                    }
                })) {
                addPackages();
            } else {
                git.init(false,
                    err => {
                        if (err) {
                            throw err;
                        }
                        addPackages();
                    });
            }
        };
        var processPathCrc = (rootDir, info, callback) => {
            crc2json(rootDir,
                map => {
                    // We need to sift through the entries for the requested value.
                    var value = undefined;
                    // ReSharper disable once MissingHasOwnPropertyInForeach
                    for (var k in map) {
                        // Checking for having own property does not work here for whatever reason.
                        if (k.endsWith(info.name)) {
                            value = map[k];
                            break;
                        }
                    }
                    callback(info, value);
                });
        };
        for (var i = 0; i < items.length; i++) {
            /* We are likely to get tripped up over the timing of functional callbacks here. But
            we will make an effort to string together the series of events that we are interested
            in achieving. */
            processPathCrc(cfg.binDir,
                items[i],
                (a, x) => {
                    processPathCrc(repoDir,
                        a,
                        (b, y) => {
                            var src = path.join(cfg.binDir, b.name).replace(/\\/g, "/");
                            var dest = path.join(repoDir, b.name).replace(/\\/g, "/");
                            b.adding = x && y === undefined;
                            b.updating = x && y && x !== y;
                            fs.copy(src, dest, { overwrite: b.adding || b.updating });
                            if (processedItems.push(b) === items.length) {
                                archive();
                            }
                        });
                });
        }
    });

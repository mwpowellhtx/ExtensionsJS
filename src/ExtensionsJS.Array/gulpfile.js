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
    minSrc: "arr.min.js",
    pkgJson: "package.json",
    rootDir: path.join(".", "Scripts", "ExtensionsJS"),
    binDir: path.join(".", "bin"),
    specDirs: path.join(".", "spec", "**"),
    distDir: path.join(".", "bin", "dist"),
    gitDir: ".git",
    /* Make sure that projects are Cloned with sufficient directory depth in order to allow
    Registries publication, i.e. /source/company/js/ExtensionsJS/repoClone/src/projectName/.../.
                                                    4.           3.        2.  1.
    */
    regRootDir: path.resolve(path.join("..", "..", "..", "..", "Node.js", "Registries")).replace(/\\/g, "/")
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
    function () {
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

/* TODO: TBD: so, a "local" registry could simply be a folder path, including version directory,
containing simply the package.json and any source and/or docs that may be part of that... that
would be perfectly sufficient, I would not necessarily need/want to "publish" anything into any
Git repositories. */

// TODO: TBD: let's also remember; providing this approach is successful, rinse and repeat in the other projects...
gulp.task("publishPackageToLocalDir",
    ["minify", "stage", "createPackageRegistryDir"],
    function() {
        var version = json.sync(path.join(cfg.binDir, cfg.pkgJson)).version;
        var repoDir = path.join(cfg.regRootDir, cfg.name, version).replace(/\\/g, "/");
        // TODO: TBD: re-factor "Git archive" as a separate step following the optional copy here, with appropriate flags captured during copy...
        // TODO: it does not seem to work quite right, getting hung up on what seems like async operations? during CRC-32?
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
            // TODO: TBD: there may be enough here well-organized enough that it can run as a follow on function to the core copy operation...
            var commitPackages = function() {
                git.commit("publishing " + cfg.name + " " + version);
            };
            var addPackages = function() {
                git.cwd(repoDir);
                // TODO: TBD: This level of gymnastics is on account of crc2json(...) apparent callback asynchronous behavior.
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
                (o, x) => {
                    processPathCrc(repoDir,
                        o,
                        (p, y) => {
                            var src = path.join(cfg.binDir, p.name).replace(/\\/g, "/");
                            var dest = path.join(repoDir, p.name).replace(/\\/g, "/");
                            p.adding = x && y === undefined;
                            p.updating = x && y && x !== y;
                            fs.copy(src, dest, { overwrite: p.adding || p.updating });
                            // TODO: TBD: instead of looking for the last one, it may not be guaranteed on account of crc2json async behavior.
                            if (processedItems.push(p) === items.length) {
                                archive();
                            }
                        });
                });
        }
    });

/* TODO: TBD: I will leave this one in for the time being. The heart of this task, however, has
been refactored as a function within the "publishPackageToLocalDir" task. */
//gulp.task("commitLocalPackagesToGitArchive",
//    ["publishPackageToLocalDir"],
//    function () {
//        // TODO: TBD: there may be enough here well-organized enough that it can run as a follow on function to the core copy operation...
//        var version = json.sync(path.join(cfg.binDir, cfg.pkgJson)).version;
//        var repoDir = path.join(cfg.regRootDir, cfg.name, version).replace(/\\/g, "/");
//        var items = [cfg.src, cfg.minSrc, cfg.pkgJson];
//        var commitPackages = function() {
//            git.commit("publishing " + cfg.name + " " + version);
//        };
//        var addPackages = function() {
//            git.cwd(repoDir);
//            git.add(items,
//                () => {
//                    commitPackages();
//                });
//        };
//        git.cwd(cfg.regRootDir);
//        // ReSharper disable once PossiblyUnassignedProperty
//        if (fs.exists(path.join(cfg.regRootDir, cfg.gitDir).replace(/\\/g, "/")) &&
//            git.checkIsRepo(err => {
//                if (err) {
//                    throw err;
//                }
//            })) {
//            addPackages();
//        } else {
//            git.init(false,
//                err => {
//                    if (err) {
//                        throw err;
//                    }
//                    addPackages();
//                });
//        }
//    });

/* TODO: TBD: The intended outcome here I think is valid, but the approach is broken. There are
too many callbacks operating in what appears to be an asynchronous manner and getting tongue
tied as a result. I took a step back, did a little refactoring, and now I think there is a
potentially viable approach. Make sure, and then rinse and repeat in the other projects. */
//gulp.task("publishPackageToLocalDir",
//    ["minify", "stage", "createPackageRegistryDir"],
//    function() {
//        var version = json.sync(path.join(cfg.binDir, cfg.pkgJson)).version;
//        var repoDir = path.join(cfg.regRootDir, cfg.name, version).replace(/\\/g, "/");
//        console.log("Ensuring directory '" + repoDir + "' exists");
//        fs.dir(repoDir);
//        var publishSrcs = function() {
//            console.log("Git working in directory '" + repoDir + "'");
//            // Not only copy the file itself, but it would be worthwhile committing to an overarching Git repository.
//            var items = [cfg.src, cfg.minSrc, cfg.pkgJson];
//            var addSrcs = [];
//            for (var i = 0; i < items.length; i++) {
//                var processPathCrc = (rootDir, name, callback) => {
//                    crc2json(rootDir,
//                        map => {
//                            // We need to sift through the entries for the requested value.
//                            var value = undefined;
//                            // ReSharper disable once MissingHasOwnPropertyInForeach
//                            for (var k in map) {
//                                // Checking for having own property does not work here for whatever reason.
//                                // ReSharper disable once ClosureOnModifiedVariable
//                                if (k.endsWith(name)) {
//                                    value = map[k];
//                                    break;
//                                }
//                            }
//                            callback(name, value);
//                        });
//                };
//                processPathCrc(cfg.binDir,
//                    items[i],
//                    (s, x) => {
//                        // ReSharper disable once ClosureOnModifiedVariable
//                        processPathCrc(repoDir,
//                            s,
//                            (t, y) => {
//                                console.log("Copying '" + t + "' from '" + cfg.binDir + "' to '" + repoDir + "'...");
//                                // ReSharper disable once ClosureOnModifiedVariable
//                                fs.copy(cfg.binDir,
//                                    repoDir,
//                                    {
//                                        overwrite: () => (x && y === undefined) || (y && x !== y),
//                                        matching: t
//                                    });
//                                if (!!!y) {
//                                    // ReSharper disable once ClosureOnModifiedVariable
//                                    console.log("Published file '" + t + "' did not previously exist...");
//                                    addSrcs.push(t);
//                                }
//                            });
//                    });
//            }
//            var commitSrcs = function() {
//                console.log("Committing sources...");
//                git.commit("publishing " + cfg.name + " version " + version,
//                    items,
//                    err => {
//                        if (err) {
//                            throw err;
//                        }
//                    });
//            };
//            git.cwd(repoDir);
//            if (addSrcs.length) {
//                console.log("Adding sources prior to commit...");
//                git.add(addSrcs,
//                    err => {
//                        if (err) {
//                            throw err;
//                        }
//                        commitSrcs();
//                    });
//            } else {
//                commitSrcs();
//            }
//        };
//        console.log("Git working in directory '" + cfg.regRootDir + "'");
//        git.cwd(cfg.regRootDir);
//        // ReSharper disable once PossiblyUnassignedProperty
//        if (fs.exists(path.join(cfg.regRootDir, cfg.gitDir)) &&
//            git.checkIsRepo(err => {
//                if (err) {
//                    throw err;
//                }
//            })) {
//            console.log("Publishing sources...");
//            publishSrcs();
//        } else {
//            console.log("Initializing Git repository '" + cfg.regRootDir + "'");
//            git.init(false,
//                err => {
//                    if (err) {
//                        throw err;
//                    }
//                    publishSrcs();
//                });
//        }
//    });

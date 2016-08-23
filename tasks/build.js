const gulp = require('gulp'),
    rimraf = require('rimraf'),
    grimraf = require('gulp-rimraf'),
    vfs = require('vinyl-fs'),
    fs = require('fs'),
    rseq = require('run-sequence'),
    merge = require('merge2'),
    vueify = require('gulp-vueify'),
    debug = require('gulp-debug'),
    source = require('vinyl-source-stream'),
    editJson = require('gulp-json-editor'),
    config = require('./config');

gulp.task('build:clean', () => vfs.src([`${config.paths.build}/*`, `!${config.paths.build}/{gofbot,gofbot/*,pywin,pywin/*}`]).pipe(grimraf()));

gulp.task('build:node', () => {
    const getNodeModules = () => Object.keys(JSON.parse(fs.readFileSync('package.json').toString()).dependencies).map(_ => `node_modules/${_}/**/*`);
    return merge(
        vfs.src(getNodeModules(), {base: '.'})
            .pipe(gulp.dest(config.paths.build)),
        gulp.src('package.json')
            .pipe(editJson(json => {
                delete json['devDependencies'];
                return json;
            }))
            .pipe(gulp.dest(config.paths.build))
    );
});

gulp.task('build:js', () => {
    return merge(
        gulp.src(`${config.paths.src}/**/*.vue`, {base: config.paths.app})
            .pipe(vueify())
            .pipe(gulp.dest(config.paths.build)),
        gulp.src(`${config.paths.app}/**/*.js`)
            .pipe(gulp.dest(config.paths.build))
    );

});


gulp.task('build:assets', () => merge(
    gulp.src(`${config.paths.src}/assets/**/*`, {base: config.paths.src}).pipe(gulp.dest(config.paths.build)),
    gulp.src(`${config.paths.app}/icons/**/*`).pipe(gulp.dest(config.paths.build))
));

gulp.task('build', _ => rseq('build:clean', ['gofbot', 'build:node', 'build:assets', 'build:js'], _));
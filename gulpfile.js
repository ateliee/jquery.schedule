let gulp = require('gulp');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let rename = require('gulp-rename');
let plumber = require('gulp-plumber');
let shell = require('gulp-shell');
let sass = require('gulp-sass');
let browserSync = require('browser-sync');

// js minify
gulp.task('js-minify', function () {
    return gulp.src(['./src/**/*.js', '!./src/**/*.min.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/'));
});

// dist clean
gulp.task('clean-dist', shell.task('rm -rf dist/*'));
// copy
gulp.task('copy-dist', function() {
    return gulp.src('src/**/*.js').pipe(gulp.dest('dist'));
});
// sass compile
gulp.task('sass-minify', function () {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./dist/css'));
});
gulp.task('sass', function () {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'));
});
// build
gulp.task('build', gulp.series(
    'clean-dist',
    gulp.parallel(
        'copy-dist',
        'js-minify',
        'sass',
        'sass-minify'
    )
));

// Static server
gulp.task('browser-sync', function() {
    return browserSync({
        server: {
            baseDir: "."
        },
        browser: 'google chrome',
        startPath: './demo'
    });
});
gulp.task('bs-reload', function () {
    browserSync.reload();
});

// Watch scss AND html files, doing different things with each.
gulp.task('watch', function (done) {
    gulp.watch("./src/sass/*.scss", gulp.series(
        'sass-minify',
        'bs-reload'
    ));
    gulp.watch("./src/js/*.js", gulp.series(
        'js-minify',
        'bs-reload'
    ));
    done();
});
gulp.task('serve', gulp.series('build', 'watch', 'browser-sync'));
gulp.task('default', gulp.task('serve'));
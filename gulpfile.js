let gulp = require('gulp');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let rename = require('gulp-rename');
let plumber = require('gulp-plumber');
const { deleteAsync } = require('del');
let sass = require('gulp-sass')(require('sass'));
let tagVersion = require('gulp-tag-version');
let babel = require('gulp-babel');
let { spawn } = require('child_process');

// js minify
gulp.task('js-minify', function () {
    return gulp.src(['./dist/**/*.js', '!./dist/**/*.min.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/'));
});

// dist clean
gulp.task('clean-dist', function () {
    return deleteAsync(['dist/**/*']);
});
// compile
gulp.task('compile', function () {
    return gulp.src('src/js/**/*.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(gulp.dest('dist/js'));
});
// sass compile
gulp.task('sass-minify', function () {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
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
        'compile',
        'sass'
    ),
    gulp.parallel(
        'js-minify',
        'sass-minify'
    )
));
gulp.task('tag', function () {
    return gulp.src(['./package.json']).pipe(tagVersion());
});

// Vite dev server
gulp.task('vite', function (done) {
    let child = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
    child.on('close', done);
});

// Watch scss AND js files
gulp.task('watch', function (done) {
    gulp.watch("./src/sass/**/*.scss", gulp.series(
        'sass',
        'sass-minify'
    ));
    gulp.watch("./src/js/**/*.js", gulp.series(
        'compile',
        'js-minify'
    ));
    done();
});
gulp.task('serve', gulp.series('build', gulp.parallel('watch', 'vite')));
gulp.task('default', gulp.task('serve'));

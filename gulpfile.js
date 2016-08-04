var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var browserSync = require('browser-sync');
var scss = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var pixrem = require('gulp-pixrem');
var rename = require('gulp-rename');

// bundle javascript
function bundle (watch) {
    var bundler = watchify(browserify('./src/index.js', { debug: true }).transform(babel.configure({
        presets: ["es2015"]
    })));

    function rebundle () {
        bundler.bundle()
            .on('error', function(err) { console.error(err); this.emit('end'); })
            .pipe(source('build.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./public/dist'));
    }

    if (watch) {
        bundler.on('update', function() {
            rebundle();
        });
    }

    rebundle();
}

// compile scss
gulp.task('scss', function () {
    return gulp
        .src('./src/style/main.scss')
        .pipe(sourcemaps.init())
        .pipe(scss({ outputStyle: 'compressed' }))
        .pipe(autoprefixer({ annotation: false, browsers: ['> 1%', 'last 5 versions', 'Firefox ESR', 'Opera 12.1'] }))
        .pipe(pixrem({ baseFontSize: '16px' }))
        .pipe(sourcemaps.write('maps/'))
        .pipe(rename('main.min.css'))
        .pipe(gulp.dest('./public/dist'))
        .pipe(browserSync.stream());
});

gulp.task('javascript', function () {
    return bundle();
});

gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './',
            index: './public/index.html'
        },
        open: false
    });

    gulp.watch('./src/*.js', ['javascript'], browserSync.reload);
    // watch SCSS
    gulp.watch('./src/style/**/*.scss', ['scss'], browserSync.reload);
    // watch HTML
    gulp.watch('./public/**/*.html', browserSync.reload);
});

// gulp.task('watch', function () { return watch(); });

gulp.task('default', ['javascript', 'scss', 'serve']);

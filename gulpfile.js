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
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;
var ifElse = require('gulp-if-else');

var isDev = !argv.prod;

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

gulp.task('uglify', function () {
    return gulp.src('./dist/responsibleTables.bundle.js')
        .pipe(uglify())
        .pipe(rename('responsibleTables.min.js'))
        .pipe(gulp.dest('dist'));
})

gulp.task('javascript', function () {
    // wrap in watchify for liveupdate
   var bundler = browserify('./src/responsibleTables.js', { debug: isDev }).transform(babel.configure({
        presets: ["es2015"]
    }));

    return bundler.bundle()
        .on('error', function(err) { console.error(err); this.emit('end'); })
        .pipe(source('responsibleTables.bundle.js'))
        .pipe(buffer())
        .pipe(ifElse(!isDev, uglify))
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('serve', function () {
    if (isDev) {
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
    }
});

gulp.task('default', ['javascript', 'scss', 'serve']);

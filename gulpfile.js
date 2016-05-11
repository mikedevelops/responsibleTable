const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');

const config = {
    package: 'responsibleTables',
    dir: {
        dist: {
            src: 'dist',
            dest: 'public/dist'
        }
    },
    javascript: {
        src: 'src',
        dest: 'dist',
        public: 'public/javascript'
    }
}

gulp.task('javascript', () => {
    return gulp.src(`${config.javascript.src}/*.js`)
            .pipe(sourcemaps.init())
            .pipe(babel({ presets: ['es2015'] }))
            .pipe(uglify())
            .pipe(rename(`${config.package}.min.js`))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(config.javascript.public))
            .pipe(browserSync.stream());
});

gulp.task('serve', () => {
    browserSync.init({
        open: false,
        server: {
            baseDir: './public/'
        }
    });

    gulp.watch(`${config.javascript.src}/*.js`, ['javascript'], reload);
});

gulp.task('copy', () => {
    return gulp.src(`${config.dir.dist.src}/**/*`)
            .pipe(gulp.dest(`${config.javascript.public}`));
});

gulp.task('default', [
    'javascript',
    'copy',
    'serve'
]);

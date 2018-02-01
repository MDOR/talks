import path from 'path';

import {argv} from 'yargs';
import gulp from 'gulp';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import htmlmin from 'gulp-html-minifier';
import sourcemaps from 'gulp-sourcemaps';
import gulpIf from 'gulp-if';
import plumber from 'gulp-plumber';
import minifycss from 'gulp-minify-css';
import autoprefixer from 'gulp-autoprefixer';
import livereload from 'gulp-livereload';
import webpack from 'gulp-webpack';

import config from './config/webpack';

const [reload, env] = [argv.reload === 'true', argv.env === 'production' ? 'production' : 'development'],
  jsConfig = config(env),
  rootFolder = env === 'development' ? 'dist' : 'docs',
  colors = {
    green: '\x1b[32m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };

console.log(`${colors.blue}%s${colors.reset}`, `livereload active: ${reload ? 'ON' : 'OFF'}`);
console.log(`${colors.blue}%s${colors.reset}`, `environment: ${env}`);

function generateCSSVendor(done) {
  gulp.src(['./node_modules/reveal/index.css'])
    .pipe(concat('vendor.css'))
    .pipe(gulpIf(env === 'production', minifycss()))
    .pipe(gulp.dest(`./${rootFolder}/css`));

  done();
}

function generateCSS(done) {
  gulp.src('./app/scss/*scss')
    .pipe(plumber())
    .pipe(gulpIf(env === 'development', sourcemaps.init()))
    .pipe(sass({
      style: 'nested',
      noCache: true
    }))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: true
    }))
    .pipe(gulpIf(env === 'development', sourcemaps.write('.')))
    .pipe(gulpIf(env !== 'development', minifycss()))
    .pipe(gulp.dest(`./${rootFolder}/css`))
    .pipe(gulpIf(reload, livereload()));

  done();
}

function generateJS(done) {
  gulp.src('./app/js/*.js')
    .pipe(plumber())
    .pipe(webpack(jsConfig))
    .pipe(gulp.dest(`./${rootFolder}/js`))
    .pipe(gulpIf(reload, livereload()));

  done();
}

function minifyHTML(done) {
  gulp.src('./app/html/*.html')
  .pipe(plumber())
  .pipe(htmlmin({collapseWhitespace: true, collapseInlineTagWhitespace: true, ignoreCustomFragments: [/<!--[\s\S]-->/]}))
  .pipe(gulp.dest(`./${rootFolder}`))
  .pipe(gulpIf(reload, livereload()));

  done();
}

gulp.task('watch', function () {
  let [open, connect, serveStatic] = [require('open'), require('connect'), require('serve-static')];

  connect()
    .use(serveStatic(path.resolve(`${__dirname}/dist`)))
    .listen(8080, () => {
      console.log(`${colors.blue}%s${colors.reset}`, 'Running on: localhost:8080');
      open('http://localhost:8080');
    });

  livereload.listen();

  gulp.watch(['./app/js/*.js', './app/js/**/*.js'], gulp.series(generateJS), done => done());
  gulp.watch(['./app/scss/*.scss', './app/scss/**/*.scss'], gulp.series(generateCSSVendor, generateCSS), done => done());
  gulp.watch(['./app/html/*.html'], gulp.series(minifyHTML), done => done());
});


gulp.task('build', gulp.series(generateCSSVendor, generateCSS, generateJS, minifyHTML, done => done()));

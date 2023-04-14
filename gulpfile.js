"use strict";

const { src, dest } = require("gulp");
const gulp = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require("gulp-strip-css-comments");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const rigger = require("gulp-rigger");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const imagewebp = require("gulp-webp");
const svgSprite = require("gulp-svg-sprite");
const del = require("del");
const browserSync = require("browser-sync").create();

/*Paths*/

const srcPath = "src/"
const distPath = "dist/"

const path = {
  build: {
    html: distPath,
    css: distPath + "assets/css/",
    js: distPath + "assets/js/",
    images: distPath + "assets/images/",
    fonts: distPath + "assets/fonts/",
    video: distPath + "assets/video/"
  },
  src: {
    html: srcPath + "*.html",
    css: srcPath + "assets/scss/styles.scss",
    js: srcPath + "assets/js/*.js",
    images: srcPath + "assets/images/**/*.{jpg,png,svg,ico,webmanifest,webp}",
    fonts: srcPath + "assets/fonts/**/*.{woff,woff2}",
    video: srcPath + "assets/video/*.{mp4,webm}"
  },
  watch: {
    html: srcPath + "**/*.html",
    css: srcPath + "assets/scss/**/*.scss",
    js: srcPath + "assets/js/**/*.js",
    images: srcPath + "assets/images/**/*.{jpg,png,svg,ico,webmanifest,webp}",
    fonts: srcPath + "assets/fonts/**/*.{woff,woff2}",
    video: srcPath + "assets/video/*.{mp4,webm}"
  },
  clean: "./" + distPath
}


function server() {
  browserSync.init({
    server: {
        baseDir: "./" + distPath
    }
});
} 

function html() {
  return src(path.src.html, {base:srcPath})
  .pipe(plumber())
  .pipe(dest(path.build.html))
  .pipe(browserSync.reload({stream: true}));
}

function css() {
  return src(path.src.css, {base:srcPath + "assets/scss/"})
  .pipe(plumber(
    {
      errorHandler : function(err) {
          notify.onError({
              title:    "SCSS Error",
              message:  "Error: <%= error.message %>"
          })(err);
          this.emit('end');
      }
    }
  ))
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(cssbeautify())
  .pipe(dest(path.build.css))
  .pipe(cssnano({
    zindex: false,
    discardComments: {
      removeAll: true
    }
  }))
  .pipe(removeComments())
  .pipe(rename({
    suffix: ".min",
    extname: ".css"
  }

  ))
  .pipe(dest(path.build.css))
  .pipe(browserSync.reload({stream: true}));
}

function js() {
  return src(path.src.js, {base:srcPath + "assets/js/"})
  .pipe(plumber(
    {
      errorHandler : function(err) {
          notify.onError({
              title:    "JS Error",
              message:  "Error: <%= error.message %>"
          })(err);
          this.emit('end');
      }
     }
  ))
  .pipe(rigger())
  .pipe(dest(path.build.js))
  .pipe(uglify())
  .pipe(rename({
    suffix: ".min",
    extname: ".js"
  }))
  .pipe(dest(path.build.js))
  .pipe(browserSync.reload({stream: true}));
}

function images() {
  return src(path.src.images, {base:srcPath + "assets/images/"})
  .pipe(imagemin(
    [
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 80, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
        plugins: [
          {cleanupIDs: false}
        ]
      })
    ]))
  .pipe(dest(path.build.images))
  .pipe(browserSync.reload({stream: true}));
}


function webpImages() {
  return src(path.src.images, {base: srcPath + "assets/images/"})
      .pipe(imagewebp())
      .pipe(dest(path.build.images))
}


function fonts() {
  return src(path.src.fonts, {base:srcPath + "assets/fonts/"})
  .pipe(dest(path.build.fonts))
  .pipe(browserSync.reload({stream: true}));
}

function video() {
  return src(path.src.video, {base:srcPath + "assets/video/"})
  .pipe(dest(path.build.video))
  .pipe(browserSync.reload({stream: true}));
}

function clean() {
  return del(path.clean)
}

function watchFiles() {
  gulp.watch([path.watch.html], html) 
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.fonts], fonts)
  gulp.watch([path.watch.images], images)
  gulp.watch([path.watch.video], video)
}



const build = gulp.series(clean, gulp.parallel(html, css, js, images, webpImages, video, fonts))
const watch = gulp.parallel(build, watchFiles, server)

exports.html=html
exports.css = css
exports.js = js
exports.images = images
exports.webpImages = webpImages
exports.clean = clean
exports.fonts = fonts
exports.video = video
exports.build = build
exports.watch = watch
exports.default = watch
const gulp = require("gulp");
const fileInclude = require("gulp-file-include");
const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob");
const server = require("gulp-server-livereload");
const clean = require("gulp-clean");
const fs = require("fs");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const webpack = require("webpack-stream");
const babel = require("gulp-babel");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");
const cheerio = require("gulp-cheerio");
const imagemin = require("gulp-imagemin");
const gulpif = require("gulp-if");
const isSvg = require("is-svg");
const browserSync = require("browser-sync").create();

// Плагин для обработки ошибок
const plumberNotify = (title) => ({
  errorHandler: notify.onError({
    title,
    message: "Error <%= error.message %>",
    sound: false,
  }),
});

gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
    notify: false,
  });

  gulp.watch("./dist/**/*").on("change", browserSync.reload);
});
// Обработка HTML файлов
gulp.task("html", function () {
  return gulp
    .src("./src/**/*.html")
    .pipe(plumber(plumberNotify("Html")))
    .pipe(
      fileInclude({
        prefix: "@@",
        basepath: "@file",
      })
    )
    .pipe(gulp.dest("./dist/"));
});

// Создание SVG спрайта
gulp.task("svg-sprite", function () {
  return gulp
    .src("src/icons/**/*.svg")
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(
      cheerio({
        run: function ($) {
          $("svg").attr("style", "display:none");
        },
        parserOptions: { xmlMode: true },
      })
    )
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("dist/icons"));
});

// Обработка SCSS файлов
gulp.task("sass", function () {
  return gulp
    .src("./src/scss/*.scss")
    .pipe(plumber(plumberNotify("SCSS")))
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./dist/css/"));
});

// Оптимизация изображений
gulp.task("images", function () {
  return gulp
    .src("./src/img/**/*")
    .pipe(plumber(plumberNotify("Images")))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
        }),
      ])
    )
    .on("end", function () {
      console.log("Images task completed");
    })
    .pipe(gulp.dest("./dist/img/"));
});

// Копирование шрифтов
gulp.task("fonts", function () {
  return gulp.src("./src/fonts/**/*").pipe(gulp.dest("./dist/fonts/"));
});

// Копирование файлов
gulp.task("files", function () {
  return gulp.src("./src/files/**/*").pipe(gulp.dest("./dist/files/"));
});

// Обработка JS файлов
gulp.task("js", function () {
  return gulp
    .src("./src/js/*.js")
    .pipe(plumber(plumberNotify("JS")))
    .pipe(babel())
    .pipe(webpack(require("./webpack.config.js")))
    .pipe(gulp.dest("./dist/js"));
});

// Очистка папки dist
gulp.task("clean", function (done) {
  if (fs.existsSync("./dist/")) {
    return gulp.src("./dist/").pipe(clean());
  }
  console.log("All is clean");
  done();
});

// Запуск локального сервера
gulp.task("server", function () {
  browserSync.init({
    server: {
      baseDir: "./dist/",
    },
    notify: false,
  });

  gulp.watch("./dist/**/*").on("change", browserSync.reload);
});

// Наблюдение за изменениями файлов
gulp.task("watch", function () {
  gulp.watch("./src/scss/**/*.scss", gulp.parallel("sass"));
  gulp.watch("./src/**/*.html", gulp.parallel("html"));
  gulp.watch("./src/img/**/*", gulp.parallel("images"));
  gulp.watch("./src/fonts/**/*", gulp.parallel("fonts"));
  gulp.watch("./src/files/**/*", gulp.parallel("files"));
  gulp.watch("./src/js/**/*.js", gulp.parallel("js"));
  gulp.watch("src/icons/**/*.svg", gulp.parallel("svg-sprite"));
});

// Основная задача по умолчанию
gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel(
      "html",
      "sass",
      "images",
      "fonts",
      "files",
      "js",
      "svg-sprite"
    ),
    gulp.parallel("server", "watch")
  )
);

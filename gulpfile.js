const gulp = require("gulp");
const webpack = require('webpack-stream');
const sass = require("gulp-sass")(require('sass'));
const autoprefixer = require('autoprefixer');
const cleanCss = require("gulp-clean-css");
const postCss = require("gulp-postcss");

const dist = "C:/OSPanel/domains/react-admin/admin";

const prod = "./build";

gulp.task("copy-html", () => {
  return gulp.src("./app/src/index.html")
          .pipe(gulp.dest(dist))
});

gulp.task("build-js", () => {
  return gulp.src("./app/src/index.js")
    .pipe(webpack({
      mode: 'development',
      output: {
        filename: 'script.js'
      },
      watch: false,
      devtool: "source-map",
      module: {
        rules: [
          {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { 
                    targets: "defaults",
                    debug: true,
                    corejs: 3,
                    useBuiltIns: "usage"
                    }], 
                  "@babel/preset-react"
                ],
                plugins: ['@babel/plugin-proposal-class-properties']
              }
            }
          }
          
        ]
      }
    }))
    .pipe(gulp.dest(dist))
})

gulp.task("build-sass", () => {
  return gulp.src("./app/scss/style.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dist))
})

gulp.task("copy-api", () => {
  gulp.src("./app/api/.*")
    .pipe(gulp.dest(dist + "/api"))
  return gulp.src("./app/api/*.*")
    .pipe(gulp.dest(dist + "/api"))
})

gulp.task("copy-assets", () => {
  return gulp.src("./app/assets/*.*")
    .pipe(gulp.dest(dist + "/assets"))
})

gulp.task("watch", () => {
  gulp.watch("./app/src/index.html", gulp.parallel("copy-html"));
  gulp.watch("./app/src/**/**.js", gulp.parallel("build-js"));
  gulp.watch("./app/scss/**/*.scss", gulp.parallel("build-sass"));
  gulp.watch("./app/api/**.*", gulp.parallel("copy-api"));
  gulp.watch("./app/assets/**.*", gulp.parallel("copy-assets"));
})

gulp.task("build", gulp.parallel("copy-html", "build-js", "build-sass", "copy-api", "copy-assets"));

gulp.task("prod", () => {
  gulp.src("./app/src/index.html")
    .pipe(gulp.dest(prod));
  gulp.src("./app/api/.*")
    .pipe(gulp.dest(prod + "/api"));
  gulp.src("./app/api/*.*")
    .pipe(gulp.dest(prod + "/api"));
  gulp.src("./app/assets/*.*")
    .pipe(gulp.dest(prod + "/assets"));
    gulp.src("./app/src/index.js")
    .pipe(webpack({
      mode: 'production',
      output: {
        filename: 'script.js'
      },
      module: {
        rules: [
          {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { 
                    targets: "defaults",
                    debug: false,
                    corejs: 3,
                    useBuiltIns: "usage"
                    }], 
                  "@babel/preset-react"
                ],
                plugins: ['@babel/plugin-proposal-class-properties']
              }
            }
          }
          
        ]
      }
    }))
    .pipe(gulp.dest(prod));

  return gulp.src("./app/scss/style.scss")
    .pipe(sass().on('error', sass.logError))
    .pipe(postCss([autoprefixer()]))
    .pipe(cleanCss())
    .pipe(gulp.dest(prod))
});

gulp.task("default", gulp.parallel("build", "watch"));

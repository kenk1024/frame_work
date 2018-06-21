// gulpfile.js

/*
パスの設定
---------------------------------*/
const paths = {
  //ソースのパス
  'src': 'src/',
  //出力先のパス
  'dist': 'dev/',
  //納品ファイルのパス
  'deploy': 'release/'
};


/*
対応ブラウザ設定の設定
---------------------------------*/
const browsers = {
  //対応ブラウザを設定する。
  'All': 'last 2 versions',   //PC Chrome,PC Firefox,PC Opera,Safari,Mac Chrome,Mac Firefox,Mac Operaなど
  'iOS': 'iOS >= 8',          //iOS Safari
  'Android': 'Android >= 6',  //Android Browser
  'IE': 'ie >= 11'             //IE
};


/*
サーバーの設定
---------------------------------*/
const servers = {
  //proxy server XAMMPなど外部のWebサーバーを使うときはそのURLに書き換える
  'pxserv': 'http://localhost:8050',
  //proxy server port
  'pxport': '8050',
  //webserver port
  'wbport': '8051'
};


/*
サーバーの設定
---------------------------------*/
const favicons = {
  //faviconにしたい画像（pngでアイコンサイズより大きいもの）を指定のフォルダに入れる
  'sizes': [16,32,48],  //マルチアイコンにしたいサイズを指定する
  'path': 'favicon'     //元画像を入れるフォルダ名
};


/*
スタイルガイド用ファイル結合の順番指定
---------------------------------*/
/*
const stylelist = {

};
*/
/*
gulp plugins
---------------------------------*/
//gulp本体
const gulp = require('gulp');
//エラーが起きても処理を止めない
const plumber = require('gulp-plumber');
//処理をデスクトップ通知する
const notify = require('gulp-notify');
//ファイル結合をする
const concat = require('gulp-concat');
//リネームする
const rename = require('gulp-rename');
//処理を待つ
const wait = require('gulp-wait');
//処理をキャッシュする
const cache = require('gulp-cached');
//変更されたファイルのみ処理させる
const changed = require('gulp-changed');
//新しいファイルのみ処理させる
const newer = require('gulp-newer');
//ファイル監視　変更されると処理をする
//const watch = require('gulp-watch');
//htmlを整形する
const prettify = require('gulp-prettify');
//Sassのコンパイルする
const sass = require('gulp-sass');
//Sassモジュール読み込み
const moduleimporter = require('sass-module-importer');
//sourcemapの書き出し
const sourcemaps = require('gulp-sourcemaps');
const identityMap = require('@gulp-sourcemaps/identity-map');
//PostCSS
const postcss = require('gulp-postcss');
//次世代のCSSの書き方ができる (Postcss-plugin)
const cssnext = require('postcss-cssnext');
//画像のパス、サイズ取得
const assets = require('postcss-assets');
//CSSのminifyをする (Postcss-plugin)
const cssnano = require('gulp-cssnano');
//cssの並び替えをする
const csscomb = require('gulp-csscomb');
//cssをminifyする
const minifycss = require('gulp-clean-css');
//jsをminifyする
const uglify = require('gulp-uglify');
//メディアクエリをまとめる　（メディアクエリの表記がないとエラーになる）
const cmq = require('css-mqpacker');
//画像ロスレス圧縮
const imagemin = require('gulp-imagemin');
//gif圧縮 (imagemin-plugin)
const gifsicle = require('imagemin-gifsicle');
//jpeg圧縮 (imagemin-plugin)
const jpegtran = require('imagemin-jpegtran');
//png圧縮 (imagemin-plugin)
const pngquant = require('imagemin-pngquant');
//svg圧縮 (imagemin-plugin)
const svgo = require('imagemin-svgo');
//Favicon作成
const ico = require('gulp-to-ico');
//CSS sprite画像・CSS生成
const spritesmith = require('gulp.spritesmith');
//gulp-webserver
const proxyserver = require('gulp-webserver');
//ブラウザの自動リロード同期
const browsersync = require('browser-sync');
//SSI
const connectssi = require('connect-ssi');
//ファイル削除
const del = require('del');
//style guide 作成
const styleguide = require('gulp-frontnote');
//filelog
const filelog = require('gulp-filelog');

/*
SSI-Server(proxyserver)
---------------------------------*/
gulp.task('proxyserver', function () {
  return gulp.src(paths.dist)
    .pipe(proxyserver({
      livereload: false,
      port: servers.pxport,
      middleware: [
        connectssi({
          ext: '.html',
          baseDir: __dirname + '/dist'
        })
      ],
    open: false
  }));
});


/*
server
---------------------------------*/
gulp.task('webserver', (cb) => {
  browsersync.init(null, {
    proxy: servers.pxserv,
    port: servers.wbport,
    browser: ["chrome.exe", "firefox.exe" ,"iexplore.exe"],
  });
  cb();
});


/*
ファイル更新監視
---------------------------------*/
gulp.task('watch', function () {
  gulp.watch([paths.src + '**/*.{css,scss}'],gulp.series('sass'));
  gulp.watch([paths.src + '**/*.{html,inc,shtml}'],gulp.series('html'));
  gulp.watch([paths.src + '**/*.{gif,jpg,jpeg,png,svg}'],gulp.series('image'));
  gulp.watch([paths.src + '**/*.js'],gulp.series('js'));
  gulp.watch([paths.src + '**/favicon/*.png'],gulp.series('favicon'));
});

//gulp.task('watch', gulp.parallel('watch:sass', 'watch:html', 'watch:image','watch:js','watch:favicon'));

/*
ブラウザリロード
---------------------------------*/
gulp.task('bs-reload', function(cb) {
  browsersync.reload({stream: true});
  cb();
});


/*
ファイルのコピー
---------------------------------*/
gulp.task('copy', function() {
  return gulp.src([paths.src + '**/*.*', '!' + paths.src + '/**/*.{css,scss,js,gif,jpg,jpeg,png,svg,html,shtml,inc,ico}'], {base: paths.src})
    .pipe(gulp.dest(paths.dist))
    .pipe(gulp.dest(paths.deploy));
});


/*
html出力
---------------------------------*/
gulp.task('html', function() {
  return gulp.src(paths.src + '**/*.{html,inc,shtml}', {base: paths.src})
    .pipe(newer(paths.dist))
    .pipe(plumber({
    errorHandler: function(err) {
      console.log(err.messageFormatted);
      this.emit('end');
    }
  }))
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.reload({stream: true}));
});


/*
納品html出力
---------------------------------*/
gulp.task('deployhtml', function() {
  return gulp.src(paths.dist + '**/*.{html,inc,shtml}', {base: paths.dist})
    .pipe(gulp.dest(paths.deploy));
});


/*
sassコンパイル
---------------------------------*/
gulp.task('sass', function() {
  const processors = [
    cssnext({
      browsers: [browsers.All,browsers.iOS,browsers.Android,browsers.IE],
      grid: true
    }),
//    assets({loadPaths: [paths.src + 'common/img']}),
    cmq({sort: true})
  ];
  return gulp.src(paths.src + '**/*.scss', {base: paths.src})
    .pipe(plumber({
      errorHandler: notify.onError("エラーがあります。: <%= error.message %>")
  }))
    .pipe(sourcemaps.init())
    .pipe(sass({
    importer: moduleimporter()
  }))
    .pipe(csscomb())
    .pipe(postcss(processors))
    .pipe(cssnano({
      colormin:false,
      core:false,
      minifyFontValues:false,
      minifySelectors:false,
      discardUnused: {fontFace: false},
      reduceIdents: false
    }))
    .pipe(sourcemaps.write('./map'))
    .pipe(gulp.dest(paths.dist))
    .pipe(browsersync.reload({stream: true}))
    .pipe(minifycss({compatibility: {properties: {colors: false}}}))
    .pipe(gulp.dest(paths.deploy));
  });


/*
納品CSS出力（minify）
---------------------------------*/
gulp.task('deploycss', function() {
  return gulp.src(paths.dist + '**/*.css', {base: paths.dist})
    .pipe(minifycss())
    .pipe(gulp.dest(paths.deploy));
});


/*
画像の最適化
---------------------------------*/
gulp.task('image', function(){
  return gulp.src([paths.src + '**/*.{gif,jpg,jpeg,png,svg}', '!' + paths.src + '**/' + favicons.path + '/*.png'], {base: paths.src})
    //.pipe(cache('image'))
    .pipe(plumber({
      errorHandler: function(err) {
      console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(newer(paths.dist))
    .pipe(imagemin())
    .pipe(gulp.dest(paths.dist))
    .pipe(gulp.dest(paths.deploy))
    .pipe(browsersync.reload({
    stream: true
  }));
});

/*
納品画像出力
---------------------------------*/
gulp.task('deployimage', function() {
  return gulp.src(paths.dist + '**/*.{gif,jpg,jpeg,png,svg,ico}', {base: paths.dist})
    .pipe(gulp.dest(paths.deploy));
});


/*
Favicon作成
---------------------------------*/
gulp.task('favicon', function() {
  return gulp.src(paths.src + '**/' + favicons.path + '/*.png', {base: paths.src})
    .pipe(ico('favicon.ico', { resize: true, sizes: favicons.sizes}))
    .pipe(gulp.dest(paths.dist))
    .pipe(gulp.dest(paths.deploy))
    .pipe(browsersync.reload({
    stream: true
  }));
});

/*
jsのコピー
---------------------------------*/
gulp.task('js', function() {
  return gulp.src(paths.src + '**/*.js', {base: paths.src})
    .pipe(newer(paths.dist))
    .pipe(plumber({
      errorHandler: notify.onError("エラーがあります。: <%= error.message %>")
  }))
    //.pipe(uglify())
    .pipe(gulp.dest(paths.dist))
    //.pipe(uglify())
    .pipe(gulp.dest(paths.deploy))
    .pipe(browsersync.reload({
    stream: true
  }));
});


/*
納品js出力（minify）
---------------------------------*/
gulp.task('deployjs', function(){
  return gulp.src(paths.dist + '**/*.js', {base: paths.dist})
    .pipe(plumber({
      errorHandler: function(err) {
      console.log(err.messageFormatted);
        this.emit('end');
      }
    }))
    .pipe(newer(paths.deploy))
    .pipe(uglify())
    .pipe(gulp.dest(paths.deploy))
    .pipe(browsersync.reload({
    stream: true
  }));
});

/*
deploy前にdeployディレクトリ内を削除
---------------------------------*/
gulp.task('clean-dist', function () {
  del.sync(paths.dist + '**/*.*');
});

/*
deploy前にdeployディレクトリ内を削除
---------------------------------*/
gulp.task('clean-deploy', function () {
  del.sync(paths.deploy + '**/*.*');
});

/*
html,sass,image,js,faviconの並列処理
---------------------------------*/
gulp.task('dist', gulp.parallel('html','sass','js','image','favicon'),function(done) {
  done();
});

/*
納品ファイル用html,sass,image,jsの並列処理
---------------------------------*/
gulp.task('deploy', gulp.series('clean-deploy',gulp.parallel('deployhtml','deploycss','deployjs','deployimage','copy'),function() {
}));

//標準の処理
gulp.task('default', gulp.series('copy','dist','proxyserver','webserver',/*'bs-reload',*/'watch'),function(done) {
  done();
});

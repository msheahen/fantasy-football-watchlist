var gulp = require('gulp');
var gutil = require('gulp-util');

/* Let's preprocess our scss into css files!  */
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var scss = require('postcss-scss');
var autoprefixer = require('autoprefixer');

var postcssProcessors = [
	autoprefixer( {
		browsers: 'last 2 versions'
	} )
];

var sassFiles = 'src/styles/*.scss';

gulp.task('css', function() {
	gulp.src(sassFiles)
		// PostCSS
		.pipe(
			postcss(postcssProcessors, {syntax: scss})
		)
		// SASS to CSS
		.pipe(
			sass({ outputStyle: 'compressed' })
			.on('error', gutil.log)
		)
		.pipe(gulp.dest('dist/assets/css'));
});

/* Yay, now let's uglify our javascript and
concatenate our libaries into a vendor.js file!! */
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var myJSfiles = 'src/scripts/*.js';
var vendorJSfiles = ['src/scripts/vendor/jquery.min.js', 'src/scripts/vendor/bootstrap.min.js', 'src/scripts/vendor/idb.min.js', 'src/scripts/vendor/handlebars-v4.0.5.js'];
var jsSWFile = 'src/scripts/sw/service-worker.js';

gulp.task('js', function() {
	gulp.src(myJSfiles)
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'));
	gulp.src(vendorJSfiles)
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/assets/js'));
	gulp.src(jsSWFile)
		.pipe(concat('service-worker.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/'));
});



/*
Sweet, now we need to move our html files into dist and
*/

gulp.task('copy', function() {
    gulp.src('src/views/*.html')
        .pipe(gulp.dest('dist/'));
		gulp.src('src/assets/data/*.json')
			.pipe(gulp.dest('dist/assets/data'));
		gulp.src('src/assets/images/*')
			.pipe(gulp.dest('dist/assets/images'));
			gulp.src('src/assets/images/teams/*')
				.pipe(gulp.dest('dist/assets/images/teams'));
		gulp.src('src/assets/fonts/*')
			.pipe(gulp.dest('dist/assets/fonts'));
		gulp.src('src/manifest.json')
			.pipe(gulp.dest('dist/'));
});

/*
serve it up!
*/
var browserSync = require('browser-sync');
gulp.task('connectWithBrowserSync', function() {
	browserSync.create();
	browserSync.init({
		server: './dist'
	});
});



/*
watch for changes in our code to we can auto-reload
*/
gulp.task('watch', function() {
	gulp.watch(sassFiles,['css']).on('change', browserSync.reload);
	gulp.watch(myJSfiles,['js']).on('change', browserSync.reload);
	gulp.watch(['src/views/*.html'], ['copy']).on('change', browserSync.reload);
});


/*
 gulp serve will get our page up and running!
 */
gulp.task('serve', ['connectWithBrowserSync', 'css', 'js', 'copy', 'watch']);

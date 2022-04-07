var compress_images = require('compress-images');
var fs = require('fs-extra');
var tmp = "tmp-media";
function moveImages() {
  fs.copySync(tmp, "build/static/media/", {override : true})
  console.log(`Replaced files from ${tmp} to build/static/media/`);
}

function removeTempFolder() {
  fs.removeSync(tmp);
  console.log(`Clean up ${tmp} folder.`);
}

function compressImages() {
  // compress_images('test/*[!_orig].[a-z0-9]*.{jpg,JPG,jpeg,JPEG,png,svg,gif}', `${tmp}/`,
  compress_images('build/static/media/*[!_nocompress].[a-z0-9]*.{jpg,JPG,jpeg,JPEG,png,svg,gif}', `${tmp}/`,
  { compress_force: true, statistic: true, autoupdate: false }, false,
    { jpg: {engine: 'mozjpeg', command: ['-quality', '80']}},
    { png: { engine: 'pngquant', command: ['--quality=20-50' , '--speed=1'] } },
    { svg: { engine: 'svgo', command: '--multipass' } },
    { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } },
    function (error, completed, statistic) {
      // remove files that increased in size after compression
      let { size_in, size_output, path_out_new} = statistic;
      if(size_output >= size_in) {
        fs.remove(path_out_new)
      }

      if (completed === true) {
        moveImages();
        removeTempFolder();
        console.log('done.');
      }
      if(error) {
        console.error(error);
        process.exit(1);
      }
  });
}

compressImages()

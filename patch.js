const fs = require('fs');
const f = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js';

fs.readFile(f, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  if (data.indexOf('new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)') === -1) {
    var result = data.replace(/node: false/g, 'node: {crypto: true, stream: true, fs: \'empty\'}');
    result = result.replace('...extraPlugins', 'new webpack.IgnorePlugin(/^\\.\\/locale$/, /moment$/), ...extraPlugins');
    result = result.replace('const plugins_1 = require("../plugins");', 'const webpack = require("webpack"); const plugins_1 = require("../plugins");');

    fs.writeFile(f, result, 'utf8', function (err) {
      if (err) return console.log(err);
    });
  }
});
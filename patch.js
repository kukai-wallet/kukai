const fs = require('fs');
const common = 'node_modules/@angular-devkit/build-angular/src/webpack/configs/common.js';
const tdcore = 'node_modules/@tezos-domains/core/dist/core.es2015.js'

const fallback = `
fallback: {
  path: require.resolve('path-browserify'),
  process: require.resolve('process/browser'),
  fs: require.resolve('fs'),
  assert: require.resolve('assert'),
  crypto: require.resolve('crypto-browserify'),
  http: require.resolve('stream-http'),
  https: require.resolve('https-browserify'),
  os: require.resolve('os-browserify/browser'),
  buffer: require.resolve('buffer'),
  stream: require.resolve('stream-browserify')
},
alias: {
  assert: "assert",
  buffer: "buffer",
  crypto: "crypto-browserify",
  http: "stream-http",
  https: "https-browserify",
  os: "os-browserify/browser",
  path: "path-browserify",
  process: "process/browser",
  stream: "stream-browserify"
},
`;

const plugins = `
new webpack_2.ProvidePlugin({
  process: 'process/browser',
  Buffer: ['buffer', 'Buffer']
}),
new webpack_2.EnvironmentPlugin({'NODE_DEBUG': false}),
`;

let data = fs.readFileSync(tdcore, 'utf8');
data = data.replace("import { randomInt } from 'crypto';", "import { randomBytes } from 'crypto';");
data = data.replace("return randomInt(0xFFFFFFFFFFFF);", "return randomBytes(0xFFFFFFFFFFFF);");
fs.writeFileSync(tdcore, data, 'utf8');

data = fs.readFileSync(common, 'utf8');
if (data.indexOf("fallback: {") === -1) {
  data = data.replace('(scriptTarget, isPlatformServer),', `(scriptTarget, isPlatformServer),
      ${fallback}
    `);
  data = data.replace('plugins_1.DedupeModuleResolvePlugin({ verbose }),', `plugins_1.DedupeModuleResolvePlugin({ verbose }),
      ${plugins}
    `)
  fs.writeFileSync(common, data, 'utf8');
}
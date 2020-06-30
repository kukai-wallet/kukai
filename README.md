# Kukai

## Development
Kukai is built using Angular 9

Install dependencies:

`npm i`

Run during development:

`ng serve --open`

## Troubleshooting
1) Download and install LTS version https://nodejs.org/en/
2) Upgrade npm: `npm install -g npm`
3) Rebuild node-sass: `npm rebuild node-sass`
4) Modify `node` from `node: false` to `node: {crypto: true, stream: true, fs: 'empty'}` in node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js - line 99

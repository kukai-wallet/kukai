# Kukai

## Installing

Kukai can be run in the browser at [kukai.app](https://kukai.app/) or as a [standalone app](https://github.com/kukai-wallet/kukai/releases).

## Development
Kukai is built using Angular 8 and Electron

Install dependencies:

`npm install`

Package for deployment:

`npm run package-electron-all`

Run during development:

`ng serve --open`

## Troubleshooting
1) Download and install LTS version https://nodejs.org/en/
2) Upgrade npm: `npm install -g npm`
3) To have a global installation for Angular Cli use the following commands: `npm i -g @angular/cli@1.6.8`
4) Rebuild node-sass: `npm rebuild node-sass`
5) Modify `node` from `node: false` to `node: {crypto: true, stream: true, fs: 'empty'}` in node_modules/@angular-devkit/build-angular/src/angular-cli-files/models/webpack-configs/browser.js - line 99

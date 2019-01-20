# Kukai

## Installing

Kukai can be run in the browser at [kukai.app](https://kukai.app/) or as a [standalone app](https://github.com/kukai-wallet/kukai/releases).

## Development
Kukai is built using Angular 5 and Electron

Install dependencies:

`npm install`

Package for deployment:

`npm run package-electron-all`

Run during development:

`ng serve --open`

## Troubleshooting
Wallet needs Node v10 and has been built with Angular 5.2.5 and Angular Cli 1.6.8
1) Download and install LTS version https://nodejs.org/en/
2) Upgrade npm: `npm install -g npm`
3) To have a global installation for Angular Cli use the following commands: `npm i -g @angular/cli@1.6.8`
4) Rebuild node-sass: `npm rebuild node-sass`
5) Modify `crypto` from `crypto: 'empty'` to `crypto: true` in \node_modules\@angular\cli\models\webpack-configs\browser.js - line 104

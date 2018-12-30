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

## Upgrade to Node v10
1) Download and install LTS version https://nodejs.org/en/
2) Upgrade npm: `npm install -g npm`
3) Rebuild node-sass: `npm rebuild node-sass`

// This file is required by karma.conf.js and loads recursively all the .spec and framework files
// zone imports
import 'zone.js/dist/long-stack-trace-zone';
import 'zone.js/dist/proxy.js';
import 'zone.js/dist/sync-test';
import 'zone.js/dist/jasmine-patch';
import 'zone.js/dist/async-test';
import 'zone.js/dist/fake-async-test';

// core testing
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

// fixes typing errors in Atom editor
import {} from 'jasmine';

// Unfortunately there's no typing for the `__karma__` variable. Just declare it as any.
declare var __karma__: any;
declare var require: any;

// Prevent Karma from running prematurely.
__karma__.loaded = function () {};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Then we find all the tests.
const context = require.context('./app/', true, /\.spec\.ts$/);

// And load the modules.
context
  .keys()
  .filter(function (element, index) {
    // The regex in require.context didn't work for filtering integration testing off
    //return !element.endsWith('.component.spec.ts') && !element.endsWith('.pipe.spec.ts');
    return element.endsWith('spec.ts');
  })
  .map(context);
// Finally, start Karma to run the tests.
__karma__.start();

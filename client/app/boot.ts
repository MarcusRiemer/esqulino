// /<reference path="../node_modules/angular2/typings/browser.d.ts"/>

import {bootstrap}           from 'angular2/platform/browser'
import {HTTP_PROVIDERS}      from 'angular2/http';
import {ROUTER_PROVIDERS}    from 'angular2/router';
import {SqlScratchComponent} from './app.component'

// Add all operators to Observable
import 'rxjs/Rx';

bootstrap(SqlScratchComponent, [HTTP_PROVIDERS, ROUTER_PROVIDERS]);

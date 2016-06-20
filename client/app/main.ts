import {bootstrap}           from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS}      from '@angular/http';
import {ROUTER_PROVIDERS}    from '@angular/router';
import {SqlScratchComponent} from './app.component'

// Add all operators to Observable
import 'rxjs/Rx';

bootstrap(SqlScratchComponent, [HTTP_PROVIDERS, ROUTER_PROVIDERS]);

import {bootstrap}           from 'angular2/platform/browser'
import {HTTP_PROVIDERS}      from 'angular2/http';
import {SqlScratchComponent} from './app.component'

bootstrap(SqlScratchComponent, [HTTP_PROVIDERS]);

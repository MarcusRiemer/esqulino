import {bootstrap}            from '@angular/platform-browser-dynamic'
import {HTTP_PROVIDERS}       from '@angular/http'
import {
    disableDeprecatedForms, provideForms
} from '@angular/forms';

import {SqlScratchComponent}  from './app.component'
import {APP_ROUTER_PROVIDERS} from './app.routes'


// Add all operators to Observable
import 'rxjs/Rx';

bootstrap(SqlScratchComponent, [
    HTTP_PROVIDERS, APP_ROUTER_PROVIDERS,
    disableDeprecatedForms(), provideForms()
]);

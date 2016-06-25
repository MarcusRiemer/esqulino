import {Component}                      from '@angular/core'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {CORE_DIRECTIVES}                from '@angular/common'
import {ROUTER_DIRECTIVES}              from '@angular/router'

import {ServerApiService}               from './shared/serverapi.service'

@Component({
    selector: 'sql-scratch',
    template: `<router-outlet></router-outlet>`,
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ServerApiService]
})
export class SqlScratchComponent {

}

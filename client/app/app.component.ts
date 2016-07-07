import {Component}                      from '@angular/core'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {CORE_DIRECTIVES}                from '@angular/common'
import {ROUTER_DIRECTIVES}              from '@angular/router'

import {ServerApiService}               from './shared/serverapi.service'

import {EditorComponents}               from './editor/editor.routes'
import {FrontComponents}                from './front/front.routes'

@Component({
    selector: 'sql-scratch',
    template: `<router-outlet></router-outlet>`,
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ServerApiService],
    precompile: [...EditorComponents, ...FrontComponents]
})
export class SqlScratchComponent {

}

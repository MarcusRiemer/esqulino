import {Component, OnInit}              from 'angular2/core'
import {HTTP_PROVIDERS}                 from 'angular2/http'
import {CORE_DIRECTIVES, NgForm}        from 'angular2/common'
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router'

import {ServerApiService}               from './shared/serverapi.service'

import {EditorComponent}                from './editor/editor.component'
import {FrontComponent}                 from './front/front.component'


@Component({
    selector: 'sql-scratch',
    template: `<router-outlet></router-outlet>`,
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ServerApiService]
})
@RouteConfig([
    { path: '/front/...', name: "Front", component: FrontComponent, useAsDefault : true },
    { path: '/editor/:projectId/...', name: "Editor", component: EditorComponent }
])
export class SqlScratchComponent {

}

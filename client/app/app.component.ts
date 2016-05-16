import {Component, OnInit}              from '@angular/core'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {CORE_DIRECTIVES, NgForm}        from '@angular/common'
import {Routes, Router, ROUTER_DIRECTIVES}      from '@angular/router'

import {ServerApiService}               from './shared/serverapi.service'

import {EditorComponent}                from './editor/editor.component'
import {FrontComponent}                 from './front/front.component'


@Component({
    selector: 'sql-scratch',
    template: `<router-outlet></router-outlet>`,
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ServerApiService]
})
@Routes([
    { path: 'editor/:projectId', component: EditorComponent },
    { path: 'about', component: FrontComponent },
    { path: '', component: FrontComponent }
])
export class SqlScratchComponent {
    constructor(private _router: Router) {}

    ngOnInit() {

    }
}

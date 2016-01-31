import {Component, OnInit}              from 'angular2/core';
import {CORE_DIRECTIVES}                from 'angular2/common';
import {HTTP_PROVIDERS}                 from 'angular2/http';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';

import {SchemaComponent} from './schema.component';

@Component({
    templateUrl: 'app/editor/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: '/schema', name : "Schema", component : SchemaComponent, useAsDefault: true },
])
export class EditorComponent {
}

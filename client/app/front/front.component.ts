import {Component, OnInit}              from '@angular/core'
import {HTTP_PROVIDERS}                 from '@angular/http'
import {CORE_DIRECTIVES}                from '@angular/common'
import {ROUTER_DIRECTIVES}              from '@angular/router'

import {ProjectDescriptionService} from '../shared/project.description.service'

@Component({
    templateUrl: 'app/front/templates/index.html',
    directives: [CORE_DIRECTIVES, ROUTER_DIRECTIVES],
    providers: [HTTP_PROVIDERS, ProjectDescriptionService]
})
export class FrontComponent {

}

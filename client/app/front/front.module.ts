import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'

import {ProjectDescriptionService}      from '../shared/project.description.service'

import {FrontComponent}                 from './front.component'
import {frontRouting}                    from './front.routes'

import {AboutComponent}                 from './about.component'
import {ImprintComponent}               from './imprint.component'
import {ProjectListComponent}           from './project-list.component'
import {ProjectListItemComponent}       from './project-list-item.component'

@NgModule({
    imports : [
        CommonModule,
        frontRouting
    ],
    declarations : [
        AboutComponent,
        FrontComponent,
        ImprintComponent,
        ProjectListComponent,
        ProjectListItemComponent,
    ],
    providers : [
        ProjectDescriptionService,
    ],
    exports: [
        AboutComponent,
        FrontComponent,
        ImprintComponent,
        ProjectListComponent,
    ]
})
export default class FrontModule { }

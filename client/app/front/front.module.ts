import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'

import AppSharedModule                  from '../shared/shared.module'

import {FrontComponent}                 from './front.component'
import {frontRouting}                   from './front.routes'

import {AboutComponent}                 from './about.component'
import {ImprintComponent}               from './imprint.component'
import {ProjectListComponent}           from './project-list.component'
import {ProjectListItemComponent}       from './project-list-item.component'

@NgModule({
    imports : [
        CommonModule,
        AppSharedModule,
        frontRouting
    ],
    declarations : [
        AboutComponent,
        FrontComponent,
        ImprintComponent,
        ProjectListComponent,
        ProjectListItemComponent,
    ],
    exports: [
        AboutComponent,
        FrontComponent,
        ImprintComponent,
        ProjectListComponent,
    ]
})
export default class FrontModule { }

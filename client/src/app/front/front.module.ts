import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'

import {SharedAppModule}                from '../shared/shared.module'

import {FrontComponent}                 from './front.component'
import {frontRouting}                   from './front.routes'

import {AboutComponent}                 from './about.component'
import {AboutPupilComponent}            from './pupil.component'
import {AboutTeacherComponent}          from './teacher.component'
import {ImprintComponent}               from './imprint.component'
import {ProjectListComponent}           from './project-list.component'
import {ProjectListItemComponent}       from './project-list-item.component'

@NgModule({
    imports : [
        CommonModule,
        SharedAppModule,
        frontRouting
    ],
    declarations : [
        AboutComponent,
        AboutPupilComponent,
        AboutTeacherComponent,
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
export class FrontModule { }

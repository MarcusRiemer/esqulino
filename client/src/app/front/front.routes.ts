import {Routes, RouterModule}      from '@angular/router'

import {FrontComponent}            from './front.component'
import {ImprintComponent}          from './imprint.component'
import {ProjectListComponent}      from './project-list.component'
import {AboutComponent}            from './about.component'
import {AboutPupilComponent}       from './pupil.component'
import {AboutTeacherComponent}     from './teacher.component'
import {VideoDisplayComponent}     from './video-display.component'

export const frontRoutes : Routes = [
    {
        path : '',
        component: FrontComponent,
        children : [
            { path: 'projects', component: ProjectListComponent},
            { path: 'imprint',  component: ImprintComponent},
            { path: 'pupil',    component: AboutPupilComponent},
            { path: 'teacher',  component: AboutTeacherComponent},
            { path: 'videos',   component: VideoDisplayComponent},
            { path: '',         component: AboutComponent},
        ]
    }
]

export const frontRouting = RouterModule.forChild(frontRoutes);

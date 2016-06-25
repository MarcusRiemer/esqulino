import { RouterConfig }          from '@angular/router'

import {FrontComponent}            from './front.component'
import {ProjectListComponent}      from './project-list.component'
import {AboutComponent}            from './about.component'

export const FrontRoutes : RouterConfig = [
    {
        path: '',
        redirectTo: '/about',
        terminal: true
    },
    {
        path : 'about',
        component: FrontComponent,
        children : [
            { path: 'projects', component: ProjectListComponent},
            { path: '',         component: AboutComponent},
        ]
    }
]

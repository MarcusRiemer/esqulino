import {Routes, RouterModule}           from '@angular/router'

import {editorRoutes}                   from './editor/editor.routes'
import {frontRoutes}                    from './front/front.routes'

const routes : Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: '/about',
                pathMatch: 'full',
            },
            {
                path: 'editor/:projectId',
                children: [...editorRoutes]
                //loadChildren: '/app/editor/editor.module'
            },
            {
                path: 'about',
                children: [...frontRoutes]
                //loadChildren: '/app/front/front.module'
            }
        ]
    },
]

export const routing = RouterModule.forRoot(routes);

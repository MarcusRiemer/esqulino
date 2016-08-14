import {Routes, RouterModule}           from '@angular/router'

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
                loadChildren: '/app/editor/editor.module#EditorModule'
            },
            {
                path: 'about',
                loadChildren: '/app/front/front.module#FrontModule'
            }
        ]
    },
]

export const routing = RouterModule.forRoot(routes);

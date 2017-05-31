import {Routes, RouterModule}           from '@angular/router'

import {PageExistsGuard}                from './page-exists.guard'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageTreeEditorComponent}        from './tree/editor.component'

export const pageEditorRoutes : Routes = [
    {
        path: "",
        component : PageEditorHostComponent,
        children : [
            { path: 'create', component : PageCreateComponent },
            {
                path: ':pageId',
                component : PageTreeEditorComponent,
                canActivate: [PageExistsGuard]
            },
        ]
    }
]

export const pageEditorRouting = RouterModule.forChild(pageEditorRoutes);

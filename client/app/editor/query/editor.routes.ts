import {Routes, RouterModule}           from '@angular/router'

import {QueryExistsGuard}               from './query-exists.guard'

import {QueryCreateComponent}           from './create.component'
import {QueryEditorComponent}           from './editor.component'
import {QueryEditorHostComponent}       from './host.component'

export const queryEditorRoutes : Routes = [
    {
        path: "",
        component : QueryEditorHostComponent,
        children : [
            { path: 'create', component : QueryCreateComponent },
            {
                path: ':queryId',
                component : QueryEditorComponent,
                canActivate: [QueryExistsGuard]
            }
        ]
    }
]

export const queryEditorRouting = RouterModule.forChild(queryEditorRoutes);

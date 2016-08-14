import {Routes, RouterModule}           from '@angular/router'

import {QueryCreateComponent}           from './create.component'
import {QueryEditorComponent}           from './editor.component'
import {QueryEditorHostComponent}       from './host.component'

const editorRoutes : Routes = [
    {
        path: "",
        component : QueryEditorHostComponent,
        children : [
            { path: 'create', component : QueryCreateComponent },
            { path: ':queryId', component : QueryEditorComponent }
        ]
    }
]

export const queryEditorRouting = RouterModule.forChild(editorRoutes);

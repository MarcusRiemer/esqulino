import {Routes, RouterModule}           from '@angular/router'

import {PageEditorHostComponent}        from './host.component'
import {PageCreateComponent}            from './create.component'
import {PageTreeEditorComponent}        from './tree/editor.component'
import {PageVisualEditorComponent}      from './wysiwyg/editor.component'

export const pageEditorRoutes : Routes = [
    {
        path: "",
        component : PageEditorHostComponent,
        children : [
            { path: 'create', component : PageCreateComponent },
            { path: 'visual/:pageId', component : PageVisualEditorComponent },
            { path: ':pageId', component : PageTreeEditorComponent },
        ]
    }
]

export const pageEditorRouting = RouterModule.forChild(pageEditorRoutes);

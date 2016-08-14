import {Routes, RouterModule}           from '@angular/router'

import {EditorComponent}                from './editor.component'
import {SettingsComponent}              from './settings.component'
import {SchemaComponent}                from './schema.component'

const editorRoutes : Routes = [
    {
        path: "",
        component : EditorComponent,
        children : [
            {
                path: '',
                redirectTo: 'settings',
                pathMatch: 'full'
            },
            {
                path: 'settings',
                component: SettingsComponent
            },
            {
                path: 'schema',
                component: SchemaComponent
            },
            {
                path: 'query',
                loadChildren: '/app/editor/query/editor.module#QueryEditorModule'
            },
            {
                path: 'page',
                loadChildren: '/app/editor/page/page-editor.module#PageEditorModule'
            }
        ]
    }
]

export const editorRouting = RouterModule.forChild(editorRoutes);

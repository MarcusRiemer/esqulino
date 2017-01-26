import {Routes, RouterModule}           from '@angular/router'

import {EditorComponent}                from './editor.component'
import {SettingsComponent}              from './settings.component'

import {ProjectExistsGuard}             from './project-exists.guard'

import {queryEditorRoutes}              from './query/editor.routes'
import {pageEditorRoutes}               from './page/page-editor.routes'
import {schemaEditorRoutes}             from './schema/schema.routes'

export const editorRoutes : Routes = [
    {
        path: "",
        component : EditorComponent,
        canActivate : [ProjectExistsGuard],
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
                children: [...schemaEditorRoutes]
            },
            {
                path: 'query',
                children: [...queryEditorRoutes]
                //loadChildren: '/app/editor/query/editor.module'
            },
            {
                path: 'page',
                children: [...pageEditorRoutes]
                //loadChildren: '/app/editor/page/page-editor.module'
            }
        ]
    }
]

export const editorRouting = RouterModule.forChild(editorRoutes);

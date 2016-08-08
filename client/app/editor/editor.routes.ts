import { RouterConfig }          from '@angular/router'

import {EditorComponent}                from './editor.component'
import {SettingsComponent}              from './settings.component'
import {SchemaComponent}                from './schema.component'

import {PageCreateComponent}            from './page/create.component'
import {PageTreeEditorComponent}        from './page/tree/editor.component'
import {PageVisualEditorComponent}      from './page/wysiwyg/editor.component'

import {QueryCreateComponent}           from './query/create.component'
import {QueryEditorComponent}           from './query/editor.component'

export const EditorRoutes : RouterConfig = [
    {
        path: "editor/:projectId",
        component : EditorComponent,
        children : [
            { path: '', redirectTo: 'settings', terminal: true},
            { path: 'settings', component : SettingsComponent },
            { path: 'schema', component : SchemaComponent },
            { path: 'query/create', component : QueryCreateComponent },
            { path: 'query/:queryId', component : QueryEditorComponent },
            { path: 'page/create', component : PageCreateComponent },
            { path: 'page/visual/:pageId', component : PageVisualEditorComponent },
            { path: 'page/:pageId', component : PageTreeEditorComponent },
        ]
    }
]

export const EditorComponents = [
    EditorComponent, SettingsComponent, SchemaComponent,
    QueryCreateComponent, QueryEditorComponent,
    PageCreateComponent, PageTreeEditorComponent, PageVisualEditorComponent
]

import {Routes, RouterModule}           from '@angular/router'
import {SchemaHostComponent}            from './host.component'
import {SchemaComponent}                from './schema.component'
import {SchemaTableEditorComponent}     from './schema-table-editor.component'
import {SchemaTableDetailsComponent}    from './schema-table-details.component'

export const schemaEditorRoutes : Routes = [
    {
        path: "",
        component : SchemaHostComponent,
        children : [
            { path: '', component : SchemaComponent },
            { path: 'edit/:tableName', component : SchemaTableEditorComponent },
            { path : 'details/:tableName', component : SchemaTableDetailsComponent},
        ]
    }
]

export const schemaEditorRouting = RouterModule.forChild(schemaEditorRoutes);

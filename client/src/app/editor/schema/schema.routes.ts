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
            // TODO: Redirect für die "Standard"-URL auf das gerade aktuelle Schema
            // Offene Frage: Aktuelles Schema als Service (eher nicht?) oder bei
            // jedem Seitenaufruf aus der URL neu laden?
            /*
            { path: '', redirect : "" },
            { path: ':schemaName', component : SchemaComponent },
            { path: ':schemaName/edit/:tableName', component : SchemaTableEditorComponent },
            { path : ':schemaName/details/:tableName', component : SchemaTableDetailsComponent},
            */
            { path: '', component : SchemaComponent },
            { path: 'edit/:tableName', component : SchemaTableEditorComponent },
            { path : 'details/:tableName', component : SchemaTableDetailsComponent},

        ]
    }
]

export const schemaEditorRouting = RouterModule.forChild(schemaEditorRoutes);

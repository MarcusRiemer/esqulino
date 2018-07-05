import { Routes, RouterModule } from '@angular/router'

import { SchemaHostComponent } from './host.component'
import { SchemaComponent } from './schema.component'
import { SchemaTableEditorComponent } from './schema-table-editor.component'
import { SchemaTableDataComponent } from './schema-table-data.component'
import { SchemaRedirectComponent } from './schema-redirect.component'

export const schemaEditorRoutes: Routes = [
  {
    path: "",
    component: SchemaHostComponent,
    children: [
      // If no schema is present in the URL: Redirect to the default schema
      { path: '', component: SchemaRedirectComponent },
      { path: ':schemaName', component: SchemaComponent },
      { path: ':schemaName/edit/:tableName', component: SchemaTableEditorComponent },
      { path: ':schemaName/create', component: SchemaTableEditorComponent },
      { path: ':schemaName/details/:tableName', component: SchemaTableDataComponent },
    ]
  }
]

export const schemaEditorRouting = RouterModule.forChild(schemaEditorRoutes);

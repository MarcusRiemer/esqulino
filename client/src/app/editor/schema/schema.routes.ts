import { Routes, RouterModule } from "@angular/router";

import { SchemaHostComponent } from "./host.component";
import { SchemaComponent } from "./schema.component";
import { SchemaUploadComponent } from "./schema-upload.component";
import { SchemaTableEditorComponent } from "./schema-table-editor.component";
import { SchemaTableDataComponent } from "./schema-table-data.component";
import { SchemaTableImportComponent } from "./schema-table-import.component";
import { SchemaRedirectComponent } from "./schema-redirect.component";

// TODO: Guard to restrict some routes for databases without tables.
export const schemaEditorRoutes: Routes = [
  {
    path: "",
    component: SchemaHostComponent,
    children: [
      // If no schema is present in the URL: Redirect to the default schema
      { path: "", component: SchemaRedirectComponent },
      { path: ":schemaName", component: SchemaComponent },
      {
        path: ":schemaName/edit/:tableName",
        component: SchemaTableEditorComponent,
      },
      { path: ":schemaName/create", component: SchemaTableEditorComponent },
      {
        path: ":schemaName/details/:tableName",
        component: SchemaTableDataComponent,
      },
      { path: ":schemaName/import", component: SchemaTableImportComponent },
      { path: ":schemaName/upload", component: SchemaUploadComponent },
    ],
  },
];

export const schemaEditorRouting = RouterModule.forChild(schemaEditorRoutes);

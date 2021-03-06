import { NgModule, ModuleWithProviders } from "@angular/core";

import { EditorSharedComponentsModule } from "../shared-components/editor-shared-components.module";
import { RegistrationService } from "../registration.service";

import { schemaEditorRouting } from "./schema.routes";

import { SchemaHostComponent } from "./host.component";
import { SchemaRedirectComponent } from "./schema-redirect.component";
import { SchemaComponent } from "./schema.component";
import { SchemaUploadComponent } from "./schema-upload.component";
import { SchemaTableComponent } from "./schema-table.component";
import { SchemaTableCompositionComponent } from "./schema-table-composition.component";
import { SchemaTableEditorComponent } from "./schema-table-editor.component";
import { SchemaTableDataComponent } from "./schema-table-data.component";
import { SchemaTableImportComponent } from "./schema-table-import.component";
import { TableEditorSidebarStackComponent } from "./table-editor-stack.sidebar";
import { TableEditorSidebarControlsComponent } from "./table-editor-controls.sidebar";

@NgModule({
  imports: [EditorSharedComponentsModule, schemaEditorRouting],
  declarations: [
    SchemaHostComponent,
    SchemaRedirectComponent,
    SchemaComponent,
    SchemaUploadComponent,
    SchemaTableComponent,
    SchemaTableCompositionComponent,
    SchemaTableEditorComponent,
    SchemaTableDataComponent,
    SchemaTableImportComponent,
    TableEditorSidebarStackComponent,
    TableEditorSidebarControlsComponent,
  ],
  exports: [SchemaHostComponent],
})
export class SchemaEditorModule {
  static forRoot(): ModuleWithProviders<SchemaEditorModule> {
    return {
      ngModule: SchemaEditorModule,
    };
  }

  constructor(reg: RegistrationService) {
    console.log("Registering Database-Schema-Editor ...");

    // Register the schema-editor-sidebar
    reg.registerSidebarType({
      typeId: TableEditorSidebarStackComponent.SIDEBAR_IDENTIFIER,
      componentType: TableEditorSidebarStackComponent,
    });

    reg.registerSidebarType({
      typeId: TableEditorSidebarControlsComponent.SIDEBAR_IDENTIFIER,
      componentType: TableEditorSidebarControlsComponent,
    });

    console.log("Registered Database-Schema-Editor!");
  }
}

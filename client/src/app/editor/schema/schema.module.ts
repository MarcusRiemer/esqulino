import { NgModule, ModuleWithProviders } from "@angular/core";

import { SharedAppModule } from "../../shared/shared.module";
import { RegistrationService } from "../registration.service";
import { SchemaService } from "../schema.service";

import { SchemaHostComponent } from "./host.component";
import { SchemaRedirectComponent } from "./schema-redirect.component";
import { SchemaComponent } from "./schema.component";
import { SchemaUploadComponent } from "./schema-upload.component";
import { SchemaTableComponent } from "./schema-table.component";
import { SchemaTableCompositionComponent } from "./schema-table-composition.component";
import { SchemaTableEditorComponent } from "./schema-table-editor.component";
import { SchemaTableDataComponent } from "./schema-table-data.component";
import { SchemaTableImportComponent } from "./schema-table-import.component";
import { SchemaVisualComponent } from "./schema-visual.component";
import { SchemaTableVisualComponent } from "./schema-table-visual.component";
import { SchemaConnectorComponent } from "./schema-connector-component";
import { TableEditorSidebarStackComponent } from "./table-editor-stack.sidebar";
import { TableEditorSidebarControlsComponent } from "./table-editor-controls.sidebar";
import { DragulaModule } from "ng2-dragula";
import { EditorSharedComponentsModule } from "../shared-components/editor-shared-components.module";

@NgModule({
  imports: [
    SharedAppModule,
    DragulaModule.forRoot(),
    EditorSharedComponentsModule,
  ],
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
    SchemaVisualComponent,
    SchemaTableVisualComponent,
	SchemaConnectorComponent,
    TableEditorSidebarStackComponent,
    TableEditorSidebarControlsComponent,
  ],
  entryComponents: [
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

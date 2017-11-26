import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'
import { SchemaService } from '../schema.service'

import { SchemaHostComponent } from './host.component'
import { SchemaRedirectComponent } from './schema-redirect.component'
import { SchemaComponent } from './schema.component'
import { SchemaTableComponent } from './schema-table.component'
import { SchemaTableCompositionComponent } from './schema-table-composition.component'
import { SchemaTableEditorComponent } from './schema-table-editor.component'
import { SchemaTableDataComponent } from './schema-table-data.component'
import { TableEditorSidebarStackComponent } from './table-editor-stack.sidebar'
import { TableEditorSidebarControlsComponent } from './table-editor-controls.sidebar'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    SchemaHostComponent,
    SchemaRedirectComponent,
    SchemaComponent,
    SchemaTableComponent,
    SchemaTableCompositionComponent,
    SchemaTableEditorComponent,
    SchemaTableDataComponent,
    TableEditorSidebarStackComponent,
    TableEditorSidebarControlsComponent
  ],
  entryComponents: [
    TableEditorSidebarStackComponent,
    TableEditorSidebarControlsComponent
  ],
  exports: [
    SchemaHostComponent
  ]
})
export class SchemaEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SchemaEditorModule,
      providers: [SchemaService]
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering SchemaEditor ...");

    // Register the schema-editor-sidebar
    reg.registerSidebarType({
      typeId: TableEditorSidebarStackComponent.SIDEBAR_IDENTIFIER,
      componentType: TableEditorSidebarStackComponent
    });

    reg.registerSidebarType({
      typeId: TableEditorSidebarControlsComponent.SIDEBAR_IDENTIFIER,
      componentType: TableEditorSidebarControlsComponent
    });


    console.log("Registered SchemaEditor!");
  }
}

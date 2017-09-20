import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { CodeGeneratorComponent } from './code-generator.component'
import { LanguageService } from './language.service'
import { NodeComponent } from './node.component'
import { SyntaxTreeEditorComponent } from './editor.component'
import { TreeSidebarComponent } from './tree.sidebar'
import { ValidationComponent } from './validation.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    CodeGeneratorComponent,
    NodeComponent,
    SyntaxTreeEditorComponent,
    ValidationComponent,
    TreeSidebarComponent
  ],
  entryComponents: [
    TreeSidebarComponent
  ]
})
export class SyntaxTreeEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SyntaxTreeEditorModule,
      providers: [LanguageService]
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering TreeEditor ...");

    reg.registerSidebarType({
      componentType: TreeSidebarComponent,
      typeId: TreeSidebarComponent.SIDEBAR_IDENTIFIER
    });

    console.log("Registered TreeEditor!");
  }
}

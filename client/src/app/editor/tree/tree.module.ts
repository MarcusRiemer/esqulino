import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { NodeComponent } from './node.component'
import { SyntaxTreeEditorComponent } from './editor.component'
import { ValidationComponent } from './validation.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    NodeComponent,
    SyntaxTreeEditorComponent,
    ValidationComponent
  ]
})
export class SyntaxTreeEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SyntaxTreeEditorModule,
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering TreeEditor ...");

    console.log("Registered TreeEditor!");
  }
}

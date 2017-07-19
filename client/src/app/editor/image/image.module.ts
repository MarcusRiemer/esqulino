import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { ImageListComponent } from './image-list.component'
import { ImageUploadComponent } from './image-upload.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    ImageListComponent,
    ImageUploadComponent
  ],
  providers: [
  ],
  entryComponents: [
  ],
  exports: [
  ]
})
export class ImageEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: ImageEditorModule,
      providers: []
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering ImageEditor ...");

    console.log("Registered ImageEditor!");
  }
}
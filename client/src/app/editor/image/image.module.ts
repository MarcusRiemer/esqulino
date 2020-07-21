import { NgModule, ModuleWithProviders } from "@angular/core";

import { EditorSharedComponentsModule } from "../shared-components/editor-shared-components.module";
import { RegistrationService } from "../registration.service";

import { ImageListComponent } from "./image-list.component";
import { ImageUploadComponent } from "./image-upload.component";
import { ImageEditComponent } from "./image-edit.component";
import { ImageSelectorComponent } from "./image-selector.component";
import { ImageService } from "./image.service";

@NgModule({
  imports: [EditorSharedComponentsModule],
  declarations: [
    ImageListComponent,
    ImageUploadComponent,
    ImageEditComponent,
    ImageSelectorComponent,
  ],
  exports: [ImageSelectorComponent],
})
export class ImageEditorModule {
  static forRoot(): ModuleWithProviders<ImageEditorModule> {
    return {
      ngModule: ImageEditorModule,
      providers: [ImageService],
    };
  }

  constructor(_: RegistrationService) {
    console.log("Registering ImageEditor ...");

    console.log("Registered ImageEditor!");
  }
}

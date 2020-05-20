import { Routes, RouterModule } from "@angular/router";

import { ImageListComponent } from "./image-list.component";
import { ImageUploadComponent } from "./image-upload.component";
import { ImageEditComponent } from "./image-edit.component";

export const imageEditorRoutes: Routes = [
  {
    path: "",
    component: ImageListComponent,
  },
  {
    path: "upload",
    component: ImageUploadComponent,
  },
  {
    path: ":imageId/edit",
    component: ImageEditComponent,
  },
];

export const imageEditorRouting = RouterModule.forChild(imageEditorRoutes);

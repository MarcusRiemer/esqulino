import { Routes, RouterModule } from '@angular/router'

import { ImageListComponent } from './image-list.component'
import { ImageUploadComponent } from './image-upload.component'

export const imageEditorRoutes: Routes = [
  {
    path: "",
    component: ImageListComponent,
  },
  {
    path: "upload",
    component: ImageUploadComponent,
  }
]

export const imageEditorRouting = RouterModule.forChild(imageEditorRoutes);

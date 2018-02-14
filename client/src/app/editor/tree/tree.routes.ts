import { Routes, RouterModule } from '@angular/router'

import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'
import { BlockEditorComponent } from './block/block-editor.component'

import { ResourceChangedGuard } from './resource-changed.guard'

export const syntaxTreeEditorRoutes: Routes = [
  {
    path: ':resourceId',
    redirectTo: ':resourceId/block',
    pathMatch: 'full'
  },
  {
    path: ':resourceId/raw',
    canActivate: [ResourceChangedGuard],
    component: RawTreeEditorComponent
  },

  {
    path: ':resourceId/block',
    canActivate: [ResourceChangedGuard],
    component: BlockEditorComponent
  },
]

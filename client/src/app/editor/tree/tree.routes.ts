import { Routes, RouterModule } from '@angular/router'

import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'
import { BlockEditorComponent } from './block/block-editor.component'

import { ResourceChangedGuard } from './resource-changed.guard'

export const syntaxTreeEditorRoutes: Routes = [
  /*{ path: '', component: RawTreeEditorComponent },
  { path: ':resourceId', redirectTo: ':resourceId/block', pathMatch: 'full' },
  { path: ':resourceId/raw', component: RawTreeEditorComponent },
  { path: ':resourceId/block', component: BlockEditorComponent },*/

  /*{
    path: ':resourceId',
    canActivate: [ResourceChangedGuard],
    children: [
      // { path: '', redirectTo: 'block', pathMatch: 'full' },
      { path: 'raw', component: RawTreeEditorComponent },
      { path: 'block', component: BlockEditorComponent },
    ]
  },*/
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

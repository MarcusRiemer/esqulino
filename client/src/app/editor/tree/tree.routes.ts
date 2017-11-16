import { Routes, RouterModule } from '@angular/router'

import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'
import { BlockEditorComponent } from './block/block-editor.component'

export const syntaxTreeEditorRoutes: Routes = [
  { path: '', component: RawTreeEditorComponent },
  { path: ':resourceId', redirectTo: ':resourceId/block', pathMatch: 'full' },
  { path: ':resourceId/raw', component: RawTreeEditorComponent },
  { path: ':resourceId/block', component: BlockEditorComponent },
]

import { Routes, RouterModule } from '@angular/router'

import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'
import { BlockEditorComponent } from './block/block-editor.component'

export const syntaxTreeEditorRoutes: Routes = [
  { path: '', component: RawTreeEditorComponent },
  { path: 'raw/:resourceId', component: RawTreeEditorComponent },

  { path: 'block/:resourceId', component: BlockEditorComponent },
]

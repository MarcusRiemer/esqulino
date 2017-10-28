import { Routes, RouterModule } from '@angular/router'

import { SyntaxTreeEditorComponent } from './editor.component'

export const syntaxTreeEditorRoutes: Routes = [
  { path: '', component: SyntaxTreeEditorComponent },
  { path: ':resourceId', component: SyntaxTreeEditorComponent }
]

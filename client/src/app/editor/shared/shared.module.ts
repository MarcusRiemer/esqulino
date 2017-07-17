import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { DatabaseEmptyComponent } from './database-empty.component'
import { QueryIconComponent } from './query-icon.component'
import { SidebarItemHost } from './sidebar-item-host.component'
import { TrashComponent } from './trash.component'
import { TrashService } from './trash.service'
import { ContenteditableModel } from './contenteditable-model.directive'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  declarations: [
    QueryIconComponent,
    SidebarItemHost,
    ContenteditableModel,
    TrashComponent,
    DatabaseEmptyComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,

    QueryIconComponent,
    SidebarItemHost,
    TrashComponent,
    ContenteditableModel,
    DatabaseEmptyComponent,
  ]
})
export class SharedEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SharedEditorModule,
      providers: [
        TrashService
      ]
    });
  }

}

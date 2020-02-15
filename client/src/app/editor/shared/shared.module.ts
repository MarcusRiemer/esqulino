import { NgModule, ModuleWithProviders } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'

import { SharedAppModule } from '../../shared/shared.module'

import { DatabaseEmptyComponent } from './database-empty.component'
import { QueryIconComponent } from './query-icon.component'
import { SidebarItemHost } from './sidebar-item-host.component'
import { TrashComponent } from './trash.component'
import { TrashService } from './trash.service'
import { ContenteditableModel } from './contenteditable-model.directive'
import { SourceIconComponent } from './source-icon.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedAppModule,
  ],
  declarations: [
    QueryIconComponent,
    SidebarItemHost,
    ContenteditableModel,
    TrashComponent,
    DatabaseEmptyComponent,
    SourceIconComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedAppModule,

    QueryIconComponent,
    SidebarItemHost,
    TrashComponent,
    ContenteditableModel,
    DatabaseEmptyComponent,
    SourceIconComponent,
  ]
})
export class SharedEditorModule {
  static forRoot(): ModuleWithProviders<SharedEditorModule> {
    return ({
      ngModule: SharedEditorModule,
      providers: [
        TrashService
      ]
    });
  }

}

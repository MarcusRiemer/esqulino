import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { ResourceChangedGuard } from './resource-changed.guard'
import { CodeGeneratorComponent } from './code-generator.component'
import { DraggableDirective } from './draggable.directive'
import { DropTargetDirective } from './drop-target.directive'
import { DropPlaceholderDirective } from './drop-placeholder.directive'
import { LanguageModelSelectorComponent } from './language-model-selector.component'
import { LanguageSelectorComponent } from './language-selector.component'
import { TreeSidebarComponent } from './tree.sidebar'
import { TreeSidebarFixedBlocksComponent } from './tree-sidebar-fixed-blocks.component'
import { ValidationComponent } from './validation.component'

import { NodeComponent } from './raw/node.component'
import { NodeChildrenComponent } from './raw/node-children.component'
import { NodePlaceholderComponent } from './raw/node-placeholder.component'
import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'

import { BlockEditorComponent } from './block/block-editor.component'
import { BlockLayoutDirective } from './block/block-layout.directive'
import { BlockBaseDirective } from './block/block-base.directive'
import { BlockHostComponent } from './block/block-host.component'
import { BlockRenderComponent } from './block/block-render.component'
import { BlockRenderBlockComponent } from './block/block-render-block.component'
import { BlockRenderDropTargetComponent } from './block/block-render-drop-target.component'
import { BlockRenderIteratorComponent } from './block/block-render-iterator.component'

import { DatabaseSchemaSidebarComponent } from './query/database-schema-sidebar.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    BlockEditorComponent,
    BlockRenderComponent,
    BlockRenderBlockComponent,
    BlockRenderDropTargetComponent,
    BlockRenderIteratorComponent,
    BlockHostComponent,
    BlockLayoutDirective,
    BlockBaseDirective,
    CodeGeneratorComponent,
    DatabaseSchemaSidebarComponent,
    DraggableDirective,
    DropTargetDirective,
    DropPlaceholderDirective,
    NodeComponent,
    NodeChildrenComponent,
    NodePlaceholderComponent,
    RawTreeEditorComponent,
    ValidationComponent,
    TreeSidebarComponent,
    TreeSidebarFixedBlocksComponent,
    LanguageModelSelectorComponent,
    LanguageSelectorComponent,
  ],
  entryComponents: [
    DatabaseSchemaSidebarComponent,
    TreeSidebarComponent,
    TreeSidebarFixedBlocksComponent
  ],
  providers: [
    ResourceChangedGuard
  ]
})
export class SyntaxTreeEditorModule {
  public static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SyntaxTreeEditorModule,
      providers: []
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering TreeEditor ...");

    reg.registerSidebarType({
      componentType: TreeSidebarComponent,
      typeId: TreeSidebarComponent.SIDEBAR_IDENTIFIER
    });

    console.log("Registered TreeEditor!");
  }
}

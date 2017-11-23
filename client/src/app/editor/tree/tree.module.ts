import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { CodeGeneratorComponent } from './code-generator.component'
import { DraggableDirective } from './draggable.directive'
import { DropTargetDirective } from './drop-target.directive'
import { DropPlaceholderDirective } from './drop-placeholder.directive'
import { DragService } from './drag.service'
import { LanguageService } from './language.service'
import { LanguageModelSelectorComponent } from './language-model-selector.component'
import { TreeSidebarComponent } from './tree.sidebar'
import { ValidationComponent } from './validation.component'

import { NodeComponent } from './raw/node.component'
import { NodeChildrenComponent } from './raw/node-children.component'
import { NodePlaceholderComponent } from './raw/node-placeholder.component'
import { RawTreeEditorComponent } from './raw/raw-tree-editor.component'

import { BlockEditorComponent } from './block/block-editor.component'
import { BlockLayoutDirective } from './block/block-layout.directive'
import { BlockHostComponent } from './block/block-host.component'
import { BlockRenderComponent } from './block/block-render.component'
import { BlockRenderBlockComponent } from './block/block-render-block.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    BlockEditorComponent,
    BlockRenderComponent,
    BlockRenderBlockComponent,
    BlockHostComponent,
    BlockLayoutDirective,
    CodeGeneratorComponent,
    DraggableDirective,
    DropTargetDirective,
    DropPlaceholderDirective,
    NodeComponent,
    NodeChildrenComponent,
    NodePlaceholderComponent,
    RawTreeEditorComponent,
    ValidationComponent,
    TreeSidebarComponent,
    LanguageModelSelectorComponent,
  ],
  entryComponents: [
    TreeSidebarComponent
  ]
})
export class SyntaxTreeEditorModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SyntaxTreeEditorModule,
      providers: [DragService, LanguageService]
    } as ModuleWithProviders);
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

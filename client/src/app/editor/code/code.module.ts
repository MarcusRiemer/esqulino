import { NgModule, ModuleWithProviders } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { ResourceChangedGuard } from './resource-changed.guard'
import { CodeGeneratorComponent } from './code-generator.component'
import { CreateCodeResourceComponent } from './create-code-resource.component'
import { DraggableDirective } from './draggable.directive'
import { DropTargetDirective } from './drop-target.directive'
import { EditorComponentsService } from './editor-components.service'
import { LanguageModelSelectorComponent } from './language-model-selector.component'
import { LanguageEmittedSelectorComponent } from './language-emitted-selector.component'
import { CodeSidebarComponent } from './code.sidebar'
import { CodeSidebarFixedBlocksComponent } from './code-sidebar-fixed-blocks.component'
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
import { BlockRenderInputComponent } from './block/block-render-input.component'
import { BlockRenderErrorComponent } from './block/block-render-error.component'

import { DatabaseSchemaSidebarComponent } from './query/database-schema-sidebar.component'
import { QueryPreviewComponent } from './query/query-preview.component'
import { QueryService } from './query/query.service'

import { WorldRenderComponent } from './truck/world-render.component';
import { WorldSelectorComponent } from './truck/world-selector.component';
import { TruckWorldService } from './truck/truck-world.service';
import { WorldControllerComponent } from './truck/world-controller.component';
import { WorldSensorsComponent } from './truck/world-sensors.component';
import { UserFunctionsSidebarComponent } from './truck/user-functions-sidebar.component';

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  declarations: [
    BlockEditorComponent,
    BlockRenderComponent,
    BlockRenderBlockComponent,
    BlockRenderDropTargetComponent,
    BlockRenderErrorComponent,
    BlockRenderInputComponent,
    BlockHostComponent,
    BlockLayoutDirective,
    BlockBaseDirective,
    CodeGeneratorComponent,
    CreateCodeResourceComponent,
    DatabaseSchemaSidebarComponent,
    DraggableDirective,
    DropTargetDirective,
    NodeComponent,
    NodeChildrenComponent,
    NodePlaceholderComponent,
    RawTreeEditorComponent,
    ValidationComponent,
    CodeSidebarComponent,
    CodeSidebarFixedBlocksComponent,
    LanguageModelSelectorComponent,
    LanguageEmittedSelectorComponent,
    QueryPreviewComponent,
    WorldRenderComponent,
    WorldControllerComponent,
    WorldSensorsComponent,
    WorldSelectorComponent,
    UserFunctionsSidebarComponent
  ],
  entryComponents: [
    DatabaseSchemaSidebarComponent,
    CodeSidebarComponent,
    CodeSidebarFixedBlocksComponent,
    QueryPreviewComponent,
    ValidationComponent,
    CodeGeneratorComponent,
    WorldRenderComponent,
    WorldControllerComponent,
    WorldSensorsComponent,
    UserFunctionsSidebarComponent
  ],
  providers: [
    ResourceChangedGuard
  ],
  exports: [
    BlockHostComponent
  ]
})
export class CodeEditorModule {
  public static forRoot(): ModuleWithProviders {
    return ({
      ngModule: CodeEditorModule,
      providers: [EditorComponentsService, QueryService, TruckWorldService]
    });
  }

  constructor(reg: RegistrationService) {
    console.log("Registering CodeEditor ...");

    reg.registerSidebarType({
      componentType: CodeSidebarComponent,
      typeId: CodeSidebarComponent.SIDEBAR_IDENTIFIER
    });

    console.log("Registered CodeEditor!");
  }
}

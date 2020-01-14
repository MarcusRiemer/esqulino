import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { SharedEditorModule } from '../shared/shared.module'
import { RegistrationService } from '../registration.service'

import { ResourceChangedGuard } from './resource-changed.guard'
import { CodeGeneratorComponent } from './code-generator.component'
import { CreateCodeResourceComponent } from './create-code-resource.component'
import { EditorComponentsService } from './editor-components.service'
import { LanguageModelSelectorComponent } from './language-model-selector.component'
import { LanguageEmittedSelectorComponent } from './language-emitted-selector.component'
import { CodeSidebarComponent } from './code.sidebar'
import { CodeSidebarFixedBlocksComponent } from './code-sidebar-fixed-blocks.component'
import { ValidationComponent } from './validation.component'

import { BlockEditorComponent } from './block/block-editor.component'
import { BlockBaseDirective } from './block/block-base.directive'
import { BlockDebugOptionsService } from '../block-debug-options.service'
import { BlockHostComponent } from './block/block-host.component'
import { BlockRenderComponent } from './block/block-render.component'
import { BlockRenderBlockComponent } from './block/block-render-block.component'
import { BlockRenderDropTargetComponent } from './block/block-render-drop-target.component'
import { BlockRenderInputComponent } from './block/block-render-input.component'
import { BlockRenderErrorComponent } from './block/block-render-error.component'
import { BlockRootComponent } from './block/block-root.component'
import { CodeResourceSettingsComponent } from './block/code-resource-settings.component'
import { DropDebugComponent } from './block/drop-debug.component'

import { DatabaseSchemaSidebarComponent } from './query/database-schema-sidebar.component'
import { QueryPreviewComponent } from './query/query-preview.component'
import { QueryService } from './query/query.service'

import { WorldRenderComponent } from './truck/world-render.component';
import { WorldSelectorComponent } from './truck/world-selector.component';
import { TruckWorldService } from './truck/truck-world.service';
import { WorldControllerComponent } from './truck/world-controller.component';
import { WorldSensorsComponent } from './truck/world-sensors.component';
import { UserFunctionsSidebarComponent } from './truck/user-functions-sidebar.component';

import { DefinedTypesSidebarComponent } from './meta/defined-types.sidebar.component'

@NgModule({
  imports: [
    SharedEditorModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  declarations: [
    BlockEditorComponent,
    BlockRenderComponent,
    BlockRenderBlockComponent,
    BlockRenderDropTargetComponent,
    BlockRenderErrorComponent,
    BlockRenderInputComponent,
    BlockRootComponent,
    BlockHostComponent,
    BlockBaseDirective,
    CodeGeneratorComponent,
    CodeResourceSettingsComponent,
    CreateCodeResourceComponent,
    DropDebugComponent,
    DatabaseSchemaSidebarComponent,
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
    UserFunctionsSidebarComponent,
    DefinedTypesSidebarComponent
  ],
  entryComponents: [
    BlockRootComponent,
    DatabaseSchemaSidebarComponent,
    CodeSidebarComponent,
    CodeSidebarFixedBlocksComponent,
    CodeResourceSettingsComponent,
    DropDebugComponent,
    QueryPreviewComponent,
    ValidationComponent,
    CodeGeneratorComponent,
    WorldRenderComponent,
    WorldControllerComponent,
    WorldSensorsComponent,
    UserFunctionsSidebarComponent,
    DefinedTypesSidebarComponent
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
      providers: [
        EditorComponentsService,
        BlockDebugOptionsService,
        QueryService,
        TruckWorldService
      ]
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

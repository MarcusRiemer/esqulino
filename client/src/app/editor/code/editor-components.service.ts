import { Injectable } from "@angular/core";
import { ComponentPortal, ComponentType } from "@angular/cdk/portal";

import { EditorComponentDescription } from "../../shared/block/block-language.description";

import { ValidationComponent } from "./validation.component";
import { CodeGeneratorComponent } from "./code-generator.component";
import { JsonAstComponent } from "./json-ast.component";

import { BlockRootComponent } from "./block/block-root.component";
import { CodeResourceSettingsComponent } from "./block/code-resource-settings.component";
import { DropDebugComponent } from "./block/drop-debug.component";

import { QueryPreviewComponent } from "./query/query-preview.component";

import { WorldRenderComponent } from "./truck/world-render.component";
import { WorldControllerComponent } from "./truck/world-controller.component";
import { WorldSensorsComponent } from "./truck/world-sensors.component";
import { TruckWorldEditorComponent } from "./truck/world-editor/truck-world-editor.component";
import { RegexTestComponent } from "./regex/regex-test.component";

type ComponentTypeId = EditorComponentDescription["componentType"];

/**
 * Allows registration of available editor components and hands them
 * out on demand.
 */
@Injectable()
export class EditorComponentsService {
  private readonly _availableComponents: {
    [key in ComponentTypeId]?: ComponentType<any>;
  } = {
    "block-root": BlockRootComponent,
    "code-resource-settings": CodeResourceSettingsComponent,
    "json-ast": JsonAstComponent,
    "drop-debug": DropDebugComponent,
    "query-preview": QueryPreviewComponent,
    validator: ValidationComponent,
    "generated-code": CodeGeneratorComponent,
    "regex-test": RegexTestComponent,
    "truck-world": WorldRenderComponent,
    "truck-controller": WorldControllerComponent,
    "truck-sensors": WorldSensorsComponent,
    "truck-world-editor": TruckWorldEditorComponent,
  };

  createComponent(
    description: EditorComponentDescription
  ): ComponentPortal<{}> {
    const typeId = description.componentType;
    const toInstantiate = this._availableComponents[typeId];
    if (toInstantiate) {
      return new ComponentPortal(toInstantiate);
    } else {
      throw new Error(`No known editor component of type id "${typeId}"`);
    }
  }
}

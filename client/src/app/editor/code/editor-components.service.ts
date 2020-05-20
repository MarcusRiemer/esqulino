import { Injectable } from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";

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

/**
 * Allows registration of available editor components and hands them
 * out on demand.
 */
@Injectable()
export class EditorComponentsService {
  createComponent(
    description: EditorComponentDescription
  ): ComponentPortal<{}> {
    switch (description.componentType) {
      case "block-root":
        return new ComponentPortal(BlockRootComponent);
      case "code-resource-settings":
        return new ComponentPortal(CodeResourceSettingsComponent);
      case "json-ast":
        return new ComponentPortal(JsonAstComponent);
      case "drop-debug":
        return new ComponentPortal(DropDebugComponent);
      case "query-preview":
        return new ComponentPortal(QueryPreviewComponent);
      case "validator":
        return new ComponentPortal(ValidationComponent);
      case "generated-code":
        return new ComponentPortal(CodeGeneratorComponent);
      case "truck-world":
        return new ComponentPortal(WorldRenderComponent);
      case "truck-controller":
        return new ComponentPortal(WorldControllerComponent);
      case "truck-sensors":
        return new ComponentPortal(WorldSensorsComponent);
    }
  }
}

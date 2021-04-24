// It would be nicer to not load all the core blocks of blockly, but using
// only these to imports somehow lead to a defect right-click menu in the workspace.
// import "node_modules/blockly/core";
// import "node_modules/blockly/msg/en";

import { NgModule } from "@angular/core";

import { SharedAppModule } from "../../../shared/shared.module";
import { EditorComponentsService } from "../editor-components.service";

import { BlocklyComponent } from "./blockly.component";
import { BlocklyBlocksService } from "./blockly-blocks.service";

@NgModule({
  imports: [SharedAppModule],
  providers: [BlocklyBlocksService],
  declarations: [BlocklyComponent],
  exports: [BlocklyComponent],
})
export class BlocklyEditorModule {
  constructor(editorComponents: EditorComponentsService) {
    // Ensure that the blockly component is available
    editorComponents.registerComponent("blockly", BlocklyComponent);

    console.log("Registered BlocklyEditor!");
  }
}

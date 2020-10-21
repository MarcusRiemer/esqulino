// It would be nicer to not load all the core blocks of blockly, but using
// only these to imports somehow lead to a defect right-click menu in the workspace.
// import "node_modules/blockly/core";
// import "node_modules/blockly/msg/en";

import { NgModule } from "@angular/core";

import { SharedAppModule } from "../../../shared/shared.module";

import { BlocklyComponent } from "./blockly.component";
import { BlocklyRoutingModule } from "./blockly.routes";
import { BlocklyBlocksService } from "./blockly-blocks.service";

@NgModule({
  imports: [BlocklyRoutingModule, SharedAppModule],
  providers: [BlocklyBlocksService],
  declarations: [BlocklyComponent],
  exports: [BlocklyComponent],
})
export class BlocklyEditorModule {
  constructor() {
    console.log("Registered BlocklyEditor!");
  }
}

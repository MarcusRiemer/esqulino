import { NgModule } from "@angular/core";

import { NgxBlocklyModule } from "ngx-blockly";

import { SharedAppModule } from "../../../shared/shared.module";

import { BlocklyComponent } from "./blockly.component";
import { BlocklyRoutingModule } from "./blockly.routes";

@NgModule({
  imports: [BlocklyRoutingModule, SharedAppModule, NgxBlocklyModule],
  declarations: [BlocklyComponent],
})
export class BlocklyEditorModule {
  constructor() {
    console.log("Registered BlocklyEditor!");
  }
}

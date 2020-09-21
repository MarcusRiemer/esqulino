import { Component } from "@angular/core";

import { NgxBlocklyConfig, NgxBlocklyGeneratorConfig } from "ngx-blockly";

@Component({
  template: `
    <ngx-blockly
      [config]="config"
      [generatorConfig]="generatorConfig"
      (xmlCode)="onCode($event)"
    ></ngx-blockly>
  `,
})
export class BlocklyComponent {
  readonly config: NgxBlocklyConfig = {
    toolbox:
      '<xml id="toolbox" style="display: none">' +
      '<block type="controls_if"></block>' +
      '<block type="controls_repeat_ext"></block>' +
      '<block type="logic_compare"></block>' +
      '<block type="math_number"></block>' +
      '<block type="math_arithmetic"></block>' +
      '<block type="text"></block>' +
      '<block type="text_print"></block>' +
      "</xml>",
    scrollbars: true,
    trashcan: true,
  };

  readonly generatorConfig: NgxBlocklyGeneratorConfig = {
    xml: true,
  };

  onCode(code: string) {
    console.log(code);
  }
}

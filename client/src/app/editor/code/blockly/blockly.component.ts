import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from "@angular/core";

import * as Blockly from "blockly";

import { BlocklyBlocksService } from "./blockly-blocks.service";

/**
 * Host component for a blockly workspace. Blockly seems to use a global
 * variable for the pool of available blocks, so different instances of
 * this component may not be entirely independent.
 */
@Component({
  template: `
    <div #blocklyOutlet class="blockly-outlet"></div>
  `,
})
export class BlocklyComponent implements AfterViewInit, OnDestroy {
  // The DOM element in which blockly is hosted
  @ViewChild("blocklyOutlet")
  blocklyOutlet: ElementRef;

  // The canvas the user is interacting with
  private _workspace: Blockly.WorkspaceSvg;

  constructor(private _blocklyBlocks: BlocklyBlocksService) {}

  /**
   * Injecting Blockly into the outlet and register relevant events.
   */
  ngAfterViewInit(): void {
    const generated = this._blocklyBlocks.load();
    console.log("Generated blockly settings", generated);
    console.log("XML Toolbox", generated.toolbox);

    Blockly.defineBlocksWithJsonArray(generated.blocks);

    this._workspace = Blockly.inject(
      this.blocklyOutlet.nativeElement,
      Object.assign({}, this.config, { toolbox: generated.toolbox })
    );

    this._workspace.addChangeListener(this.onWorkspaceChangeCallback);
  }

  ngOnDestroy(): void {
    this._workspace.removeChangeListener(this.onWorkspaceChangeCallback);
  }

  /**
   * The user has interacted with the workspace.
   */
  onWorkspaceChangeCallback(evt: Blockly.Events.Change) {
    const xml = Blockly.Xml.domToPrettyText(
      Blockly.Xml.workspaceToDom(Blockly.Workspace.getById(evt.workspaceId))
    );

    console.log("Updated workspace", xml);
  }

  readonly config: Blockly.BlocklyOptions = {
    media: "/blockly-media/",
    trashcan: true,
    toolboxPosition: "end",
  };

  onCode(code: string) {
    console.log(code);
  }
}

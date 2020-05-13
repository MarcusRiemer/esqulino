import { Component, Input, HostBinding } from "@angular/core";

import { Node, printableNodeDebug } from "../../../shared/syntaxtree";
import { VisualBlockDescriptions } from "../../../shared/block";

@Component({
  templateUrl: "templates/block-render-container.html",
  selector: `editor-block-container`,
})
export class BlockRenderContainerComponent {
  @Input()
  public node: Node;
  @Input()
  public visual: VisualBlockDescriptions.EditorContainer;

  @HostBinding("class")
  get cssClasses() {
    const other = this.visual?.cssClasses ?? [];
    return [this.orientation, ...other];
  }

  /**
   * @return Some visuals that should render for the same node
   */
  get childVisuals() {
    if (VisualBlockDescriptions.isEditorContainer(this.visual)) {
      if (this.visual.children.some((v) => !v)) {
        const name = printableNodeDebug(this.node);
        throw new Error(`Undefined child in container for node ${name}`);
      }
      return this.visual.children;
    } else {
      return [];
    }
  }

  get orientation() {
    return this.visual.orientation;
  }
}

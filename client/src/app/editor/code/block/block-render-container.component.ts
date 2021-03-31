import {
  Component,
  Input,
  HostBinding,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";

import {
  SyntaxNode,
  Orientation,
  printableNodeDebug,
} from "../../../shared/syntaxtree";
import { VisualBlockDescriptions } from "../../../shared/block";

const DEFAULT_ORIENTATION: Orientation = "vertical";

@Component({
  templateUrl: "templates/block-render-container.html",
  selector: `editor-block-container`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockRenderContainerComponent implements OnChanges {
  @Input()
  public node: SyntaxNode;
  @Input()
  public visual: VisualBlockDescriptions.EditorContainer;

  @HostBinding("class")
  public cssClasses: string[] = [];

  private get _cssClasses() {
    const other = this.visual?.cssClasses ?? [];
    return [this.orientation, ...other];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["visual"]) {
      this.orientation = this.visual?.orientation ?? DEFAULT_ORIENTATION;
      this.cssClasses = this._cssClasses;
      this.childVisuals = this._childVisuals;
    }
  }

  public childVisuals = this._childVisuals;

  /**
   * @return Some visuals that should render for the same node
   */
  get _childVisuals() {
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

  public orientation: Orientation = DEFAULT_ORIENTATION;
}

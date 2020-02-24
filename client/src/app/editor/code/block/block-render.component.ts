import { Component, Input, HostBinding } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import {
  Node, NodeLocation, locationIncLastIndex
} from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';
import { RenderedCodeResourceService } from './rendered-coderesource.service';

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render.html',
  selector: `editor-block-render`,
  // TODO: Move animations to host component
  //       https://stackoverflow.com/questions/38975808/adding-an-angular-animation-to-a-host-element
  animations: [
    trigger('background', [
      state('neutral', style({ "background": "white" })),
      state('executed', style({ "background": "lime" })),
      state('replaced', style({ "background": "red" })),
      // Easings function examples at https://easings.net/
      transition('executed => neutral', animate('2000ms cubic-bezier(0.215, 0.61, 0.355, 1)'))
    ]),
    trigger('isEmbraced', [
      state('false', style({ "transform": "scale(1.0)" })),
      state('true', style({ "transform": "scale(1.1)" })),
      transition('false <=> true', animate(200))
    ])
  ]
})
export class BlockRenderComponent {
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorBlockBase;

  @HostBinding('class')
  private _hostClassNodeType = "errLang errType";

  constructor(
    private _renderData: RenderedCodeResourceService
  ) {
  }


  ngOnInit() {
    this._hostClassNodeType = this.node.languageName + " " + this.node.typeName;
    if (!this.node) {
      debugger;
    }
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockConstant(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorConstant);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInterpolated(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorInterpolated);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockInput(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorInput);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockIterator(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorIterator);
  }

  /**
   * Dirty Hack: Template "Typecast"
   */
  asBlockContainer(block: VisualBlockDescriptions.EditorBlockBase) {
    return (block as VisualBlockDescriptions.EditorContainer);
  }

  /**
   * @return The blocks that should be rendered between iterated blocks
   */
  get iteratorSeparatorBlocks() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.visual.between || []);
    } else {
      return ([]);
    }
  }

  /**
   * @return The actual nodes that should be displayed.
   */
  get childNodes() {
    if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return (this.node.getChildrenInCategory(this.visual.childGroupName));
    } else {
      return ([]);
    }
  }

  /**
   * @return Some visuals that should render for the same node
   */
  get childVisuals() {
    if (VisualBlockDescriptions.isEditorContainer(this.visual)) {
      if (this.visual.children.some(v => !v)) {
        debugger;
      }
      return (this.visual.children);
    } else {
      return ([]);
    }
  }

  /**
   * @return The visual editor block that should be used to represent the given node.
   */
  iteratorGetEditorBlock(node: Node) {
    return (this._renderData.blockLanguage.getEditorBlock(node.qualifiedName));
  }

  locationAppend(loc: NodeLocation): NodeLocation {
    return (locationIncLastIndex(loc));
  }

  get lastNode() {
    const childNodes = this.childNodes;
    if (childNodes.length > 0) {
      return (childNodes[childNodes.length - 1]);
    } else {
      return (undefined);
    }
  }

  get lastNodeLocation() {
    const lastNode = this.lastNode;
    if (lastNode) {
      return (this.locationAppend(lastNode.location));
    } if (VisualBlockDescriptions.isEditorIterator(this.visual)) {
      return ([...this.node.location, [this.visual.childGroupName, 0]]);
    } else {
      return ([]);
    }
  }

  /**
   * The visual options passed to each drop marker of an iteration
   */
  get iteratorDropTargetVisual(): VisualBlockDescriptions.EditorDropTarget {
    return ({
      blockType: "dropTarget",
      emptyDropTarget: this.asBlockIterator(this.visual).emptyDropTarget
    });
  }
}

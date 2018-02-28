import { Component, Input, OnInit } from '@angular/core';

import { Node, NodeLocation, Tree, CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage, VisualBlockDescriptions } from '../../../shared/block';

/**
 * Allows editing of atomic values. These are cached inside this component
 * before beeing applied to the node.
 */
@Component({
  templateUrl: 'templates/block-render-input.html',
  selector: `editor-block-render-input`,
})
export class BlockRenderInputComponent {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorInput;

  private _editedValue: string;

  /**
   * True, if this block is currently beeing edited.
   */
  public currentlyEditing = false;

  /**
   * Initializes default values.
   */
  ngOnInit() {
    this._editedValue = this.currentValue;
  }

  /**
   * TODO: The dragStart event of the parenting block takes precedence
   *       over this dragStart. We need to find a way to reliably block
   *       the dragging operation on the parent.
   */
  onDragStart(evt: DragEvent) {
    console.log("Dragstart Input")
    evt.stopPropagation();
    evt.preventDefault();
    return (false);
  }

  /**
   * @return The value of the property in the tree.
   */
  get currentValue() {
    return (this.node.properties[this.visual.property]);
  }

  /**
   * The size the input field should have. As we are thankfuyll using a
   * monospaced font it is quite trivial to have input fields that always
   * match the length of the edited value exactly.
   */
  get inputSize() {
    return (Math.max(1, this.editedValue.length));
  }

  /**
   * 
   */
  set editedValue(value: string) {
    this._editedValue = value;
  }

  /**
   *
   */
  get editedValue() {
    return (this._editedValue);
  }

  /**
   * The user is finished with editing and wants to persist the change.
   */
  acceptInput() {
    this.currentlyEditing = false;
    this.setEditedProperty(this.editedValue);
  }

  /**
   * The user has decided he doesn't actually want to make a change.
   */
  cancelInput() {
    this.currentlyEditing = false;
    this._editedValue = this.currentValue;
  }

  /**
   * Sets the given value for the edited property on the actual node.
   * As the tree is immutable, this results in a new tree!
   */
  setEditedProperty(newValue: string) {
    if (newValue != this.currentValue) {
      this.codeResource.setProperty(this.node.location, this.visual.property, newValue);
    }
  }
}

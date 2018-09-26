import { Component, Input } from '@angular/core';

import { Node, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

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
  public _currentlyEditing = false;

  /**
   * Initializes default values.
   */
  ngOnInit() {
    this._editedValue = this.currentValue;
  }

  /**
   * We don't want to drag anything while it is currently beeing edited.
   */
  onDragStart(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    return (false);
  }

  /**
   * React to typical keyboard operations:
   * * <Enter> accepts the changes
   * * <ESC> cancels the changes
   */
  onInputKeyUp(evt: KeyboardEvent) {
    if (evt.key === "Enter") {
      this.acceptInput();
    } else if (evt.key === "Escape") {
      this.cancelInput();
    }
  }

  /**
   * @return The value of the property in the tree.
   */
  get currentValue() {
    return (this.node.properties[this.visual.property]);
  }

  /**
   * @return True, if the block is currently in edit mode
   */
  get currentlyEditing() {
    return (this._currentlyEditing);
  }

  set currentlyEditing(value: boolean) {
    this._currentlyEditing = value;
    if (this._currentlyEditing) {
      //this._renderer.invokeElementMethod(this.input, "focus", []);
    }
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

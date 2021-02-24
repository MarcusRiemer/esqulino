import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { Node } from "../../../shared/syntaxtree";
import { VisualBlockDescriptions } from "../../../shared/block";

import { RenderedCodeResourceService } from "./rendered-coderesource.service";

type VisualizedDatatype = "string" | "boolean" | "enum";

/**
 * Allows editing of atomic values. These are cached inside this component
 * before beeing applied to the node.
 */
@Component({
  templateUrl: "templates/block-render-input.html",
  selector: `editor-block-render-input`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockRenderInputComponent {
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorInput;

  /**
   * The value that may or may not be accepted as new value
   */
  public editedValue: string;

  public editedType: VisualizedDatatype = "string";

  /**
   * True, if this block is currently beeing edited.
   */
  private _currentlyEditing = false;

  constructor(private _renderData: RenderedCodeResourceService) {}

  /**
   * Initializes default values.
   */
  ngOnInit() {
    this.editedValue = this.currentValue;
    this.editedType = this.determineDatatype();
  }

  private determineDatatype(): VisualizedDatatype {
    // TODO: Remove this hack for the regex testbench
    if (this.visual.property === "wholeMatch") {
      return "boolean";
    }

    const langName = this.node.languageName;
    const g = this._renderData.validator?.getGrammarValidator(langName);

    // There should be a matching validator, but better not freak out if not ...
    if (!g) {
      return "string";
    }
    const nodeType = g.getType(this.node);
    const baseType = nodeType.getPropertyBaseType(this.visual.property);

    switch (baseType) {
      case "boolean":
      case "enum":
        return baseType;
      default:
        return "string";
    }
  }

  /**
   * We don't want to drag anything while it is currently beeing edited.
   */
  onDragStart(evt: DragEvent) {
    evt.stopPropagation();
    evt.preventDefault();
    return false;
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
   * Switches into editing mode (if permissible)
   */
  onActivateEditing(event: MouseEvent) {
    event.stopPropagation();
    if (!this._renderData.readOnly) {
      this.currentlyEditing = true;
    }
  }

  onEvent(evt: any) {
    debugger;
  }

  /**
   * @return True, if there is a non missing or blank value to display.
   */
  get hasValue() {
    const val = this.currentValue;
    return !(val === undefined || val === null || val === "");
  }

  /**
   * @return The value of the property in the tree.
   */
  get currentValue() {
    return this.node.properties[this.visual.property];
  }

  /**
   * @return A representation of the value that is suited for "normal" display.
   */
  get currentDisplayValue() {
    if (this.visual.cssClasses?.includes("explicit-spaces")) {
      return this.currentValue.replace(/ /g, "␣");
    } else {
      return this.currentValue;
    }
  }

  /**
   * @return True, if the block is currently in edit mode
   */
  get currentlyEditing() {
    return this._currentlyEditing;
  }

  set currentlyEditing(value: boolean) {
    this._currentlyEditing = value;

    if (value) {
      this.editedValue = this.currentValue;
    }
  }

  /**
   * The size the input field should have. As we are thankfuyll using a
   * monospaced font it is quite trivial to have input fields that always
   * match the length of the edited value exactly.
   */
  get inputSize() {
    const value = this.editedValue || "";
    return Math.max(1, value.length);
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
    this.editedValue = this.currentValue;
  }

  /**
   * Sets the given value for the edited property on the actual node.
   * As the tree is immutable, this results in a new tree!
   */
  setEditedProperty(newValue: string) {
    if (newValue != this.currentValue) {
      this._renderData.codeResource.setProperty(
        this.node.location,
        this.visual.property,
        newValue
      );
    }
  }
}

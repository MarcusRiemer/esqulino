import { Page } from '../page'
import { HiddenInputDescription } from '../page.description'
import { Widget, WidgetHost } from '../hierarchy'

import { StringParameter } from './parameters'

import {
  WidgetBase, WidgetDescription, UserInputWidget
} from './widget-base'

export { HiddenInputDescription }

/**
 * A <input type="hidden">-node. This is in a separate class
 * from the usual input because it is rendered server-side.
 */
export class HiddenInput extends UserInputWidget {
  private _outParamName: string;

  private _value: string;

  constructor(desc: HiddenInputDescription, parent?: WidgetHost) {
    super({
      type: "hidden",
      category: "widget",
      isEmpty: true,
      parameters: [
        new StringParameter({
          name: "name",
          getter: () => this._outParamName,
          setter: (v) => this._outParamName = v
        }),
        new StringParameter({
          name: "value",
          getter: () => this._value,
          setter: (v) => this._value = v
        })
      ]
    }, parent);
    this._outParamName = desc.outParamName || "";
    this._value = desc.value || "";
  }

  get value(): string {
    return (this._value);
  }

  set value(val: string) {
    this._value = val;
    this.fireModelChange();
  }

  get outParamName(): string {
    return (this._outParamName);
  }

  set outParamName(val: string) {
    this._outParamName = val;
    this.fireModelChange();
  }

  /**
   * This describes a hidden input field without any assigned
   * value.
   */
  static get emptyDescription(): HiddenInputDescription {
    return ({
      type: "hidden",
      outParamName: "",
      value: ""
    });
  }

  protected toModelImpl(): WidgetDescription {
    return ({
      type: "hidden",
      outParamName: this._outParamName,
      value: this._value
    } as HiddenInputDescription);
  }
}

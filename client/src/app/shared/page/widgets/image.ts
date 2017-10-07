import { ImageDescription } from '../page.description'
import { Widget, WidgetHost } from '../hierarchy'

import { WidgetBase, WidgetDescription } from './widget-base'

import { StringParameter } from './parameters'

export { ImageDescription }

/**
 * An image that should be shown as part of a page.
 */
export class Image extends WidgetBase {

  private _src: string;
  private _displayType: string;

  constructor(desc: ImageDescription, parent?: WidgetHost) {
    super({
      type: "image",
      category: "widget",
      isEmpty: true,
      parameters: [
        new StringParameter({
          name: "src",
          getter: () => this.src,
          setter: (v) => this.src = v
        }),
        new StringParameter({
          name: "displayType",
          getter: () => this.displayType,
          setter: (v) => this.displayType = v
        })
      ]
    }, parent);

    this._src = desc.src;
    this._displayType = desc.displayType;
  }

  static get emptyDescription(): ImageDescription {
    return ({
      type: "image",
      alt: "",
      src: "",
      displayType: "figure"
    });
  }

  get src() {
    return (this._src);
  }

  set src(val: string) {
    if (this._src != val) {
      this._src = val;
      this.fireModelChange();
    }
  }

  get displayType() {
    return (this._displayType);
  }

  set displayType(val: string) {
    if (this._displayType != val) {
      this._displayType = val;
      this.fireModelChange();
    }
  }

  protected toModelImpl(): WidgetDescription {
    return ({
      type: "image",
      displayType: this._displayType,
      src: this._src
    } as ImageDescription);
  }
}

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
  private _alt: string;

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
          name: "alt",
          getter: () => this.alt,
          setter: (v) => this.alt = v
        })
      ]
    }, parent);

    this._src = desc.src;
    this._alt = desc.alt;
  }

  static get emptyDescription(): ImageDescription {
    return ({
      type: "image",
      alt: "",
      src: ""
    });
  }

  get alt() {
    return (this._alt);
  }

  set alt(val: string) {
    if (this._alt != val) {
      this._alt = val;
      this.fireModelChange();
    }
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

  protected toModelImpl(): WidgetDescription {
    return ({
      type: "image",
      alt: this._alt,
      src: this._src
    } as ImageDescription);
  }
}

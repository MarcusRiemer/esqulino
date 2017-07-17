import {
  Page, RowDescription, ColumnDescription, WidgetDescription
} from '../page'

import { Column } from './column'
import {
  HostingWidget, WidgetHost, WidgetBase,
} from './widget-base'

export { RowDescription }

/**
 * Rows can host columns and nothing else.
 */
export class Row extends HostingWidget {
  private _columns: Column[];

  constructor(desc: RowDescription, parent?: WidgetHost) {
    super({ type: "row", category: "layout", isEmpty: false }, parent);

    // Create all referenced columns
    this._columns = desc.columns.map(columnDesc => new Column(columnDesc, this));
  }

  /**
   * A description for a row that is empty. This currently defaults to a row
   * with a column that spans the whole row.
   */
  static get emptyDescription(): RowDescription {
    return ({
      type: "row",
      columns: [{
        type: "column",
        widgets: [],
        width: 12
      }]
    });
  }

  /**
   * Rows only accept columns as children.
   */
  acceptsWidget(desc: WidgetDescription): boolean {
    return (desc.type === "column");
  }

  /**
   * @return All columns that are part of this row
   */
  get children() {
    return (this._columns);
  }

  protected toModelImpl(): RowDescription {
    return ({
      type: "row",
      columns: this._columns.map(c => c.toModel()) as ColumnDescription[]
    });
  }
}

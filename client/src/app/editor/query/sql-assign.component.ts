import {
  Component, Input, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core'

import { DragService, SqlDragEvent } from './drag.service'

import { ColumnDescription } from '../../shared/schema'
import {
  Query, SyntaxTree
} from '../../shared/query'

/**
 * A column that is actively attempting to insert something
 */
interface Assignment {
  expr?: SyntaxTree.Expression
  column: ColumnDescription
  index: number
}

/**
 * Editing SQL assignment components (UPDATE, INSERT)
 */
@Component({
  selector: 'sql-assign',
  templateUrl: 'templates/query-assign.html',
})
export class AssignComponent {
  @Input() query: Query;

  constructor(private _dragService: DragService) {

  }

  get assignments(): SyntaxTree.Assign {
    return (this.query.insert || this.query.update);
  }

  /**
   * @return True, if the given query is an INSERT query.
   */
  get isAssignQuery(): boolean {
    return !!(this.assignments);
  }

  onDragStartColumn(evt: DragEvent, col: Assignment) {
    this._dragService.startColumnDrag(this.assignments.tableName, col.column.name, "select", evt);
  }

  /**
   * @return All columns that have values set.
   */
  get allColumns(): Assignment[] {
    const allColumns = this.query.getTableSchema(this.assignments.tableName).columns;

    return (allColumns.map(v => {
      return ({
        column: v,
        index: v.index,
        expr: this.assignments.getValueForColumn(v.name)
      })
    }));
  }

  trackByColumnName(index: number, value: Assignment) {
    return (value.column.name);
  }

  onColumnUsageChanged(columnName: string) {
    const isActive = this.assignments.activeColumns.some(c => c.name == columnName);
    this.assignments.changeActivationState(columnName, !isActive);
  }
}

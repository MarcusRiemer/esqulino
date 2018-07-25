import { Component } from '@angular/core'

import { Observable } from 'rxjs'

import { TrashService } from './trash.service'

@Component({
  selector: `trash`,
  templateUrl: 'templates/trash.html',
})
export class TrashComponent {

  constructor(private _trashService: TrashService) {
  }

  /**
   * @return An observable that indicates whether the trash would be shown.
   */
  get isTrashShown(): Observable<boolean> {
    return (this._trashService.isTrashShown);
  }

  /**
   * Something is being dragged over the trash
   */
  onTrashDrag(event: DragEvent) {
    event.preventDefault();
  }

  /**
   * Something was being dropped on the trash
   */
  onTrashDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Tell the log
    const dragData = event.dataTransfer.getData("text/plain");
    console.log(`Trash Component Drop: "${dragData}"`);

    // Tell the listeners
    this._trashService._fireDrop(event.dataTransfer);
  }
}

import { Component } from '@angular/core'
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs'

import { TrashService } from './trash.service'
import { map } from 'rxjs/operators';

type AnimationState = "available" | "over" | "hidden";

@Component({
  selector: `trash`,
  templateUrl: 'templates/trash.html',
  animations: [
    trigger('animationState', [
      state('available', style({
        opacity: 0.5,
        transform: 'scale(1)'
      })),
      state('over', style({
        opacity: 1.0,
        transform: 'scale(1.5)'
      })),
      state('hidden', style({
        opacity: 0,
        transform: 'scale(0)',
        display: 'none',
      })),
      /* Hmmpf, surely there must be a way to state "all transitions except
         :enter and :leave"? The "* => *"-syntax takes those into account and
         then animates the initial display. */
      transition('available => over', animate('500ms ease-out')),
      transition('hidden => over', animate('500ms ease-out')),
      transition('hidden => available', animate('500ms ease-out')),
      transition('over => available', animate('500ms ease-out')),
      transition('available => hidden', animate('500ms ease-out')),
      transition('over => hidden', animate('500ms ease-out')),
    ])
  ]
})
export class TrashComponent {

  constructor(private _trashService: TrashService) {
  }

  /**
   * Communicates the current mouse over state
   */
  private _mouseOver = new BehaviorSubject(false);

  /**
   * Only regards the mouse over state if there is a drag going on.
   */
  readonly animationState = combineLatest(this._mouseOver, this._trashService.isTrashShown)
    .pipe(
      map(([mouseIn, trashShown]): AnimationState => {
        if (trashShown) {
          if (mouseIn) {
            return ("over");
          } else {
            return ("available");
          }
        } else {
          return ("hidden");
        }
      })
    );

  mouseEnter() {
    this._mouseOver.next(true);
  }

  mouseLeave() {
    this._mouseOver.next(false);
  }

  /**
   * @return An observable that indicates whether the trash would be shown.
   */
  readonly isTrashShown = this._trashService.isTrashShown;

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

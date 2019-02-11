import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { map, withLatestFrom, debounceTime } from 'rxjs/operators';

import { arrayEqual } from '../../../shared/util';
import { Node, CodeResource } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { BlockDropProperties } from './block-drop-properties';
import { calculateDropLocation, calculateDropTargetState } from './drop-utils';

const ANIMATION_DELAY = 1.0 / 60.0; // Assume 60 FPS

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-drop-target.html',
  selector: `editor-block-render-drop-target`,
  animations: [
    trigger('availability', [
      state('none', style({
        display: 'none',
      })),
      state('visible', style({
        backgroundColor: 'transparent',
      })),
      state('available', style({
        backgroundColor: 'green',
      })),
      state('self', style({
        backgroundColor: 'yellow',
      })),
    ]),
    trigger('dropTargetVisible', [
      transition(':enter', [
        style({
          "width": '0px',
          "transform": "scaleX(0)",
          "white-space": "nowrap"
        }),
        animate('0.5s ease', style({
          "width": '*',
          "transform": "scaleX(1)"
        })),
      ]),
      transition(':leave', [
        style({
          "white-space": "nowrap"
        }),
        animate('0.5s ease', style({
          "width": '0px',
          "transform": "scaleX(0)"
        })),
      ])
    ])
  ]
})
export class BlockRenderDropTargetComponent implements BlockDropProperties {
  @Input() public codeResource: CodeResource;
  @Input() public node: Node;
  @Input() public visual: VisualBlockDescriptions.EditorDropTarget;

  private _currentTarget = false;

  constructor(
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
  ) {
  }

  private readonly _latestDragData = this._dragService.currentDrag.pipe(
    withLatestFrom(this._dragService.isDragInProgress)
  );

  /**
   * If our location is targeted (and we are not embracing something) it
   * would be nice to give the user a visual hint where something would
   * be inserted.
   *
   * @return True, if there is an ongoing drag that would insert something
   *         at the location of this drop target.
   */
  readonly showDropTarget = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress) {
        if (this._currentTarget) {
          return (false);
        }
        else {
          // We would drop something in the location we are a placeholder.
          return (arrayEqual(currentDrag.dropLocation, this.dropLocation)
          );
        }
      } else {
        return (false);
      }
    }),
  );

  /**
   * True if either the drop target or the drop location should be shown.
   */
  readonly showAnything = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => inProgress && !currentDrag.isEmbraceDrop),
    debounceTime(ANIMATION_DELAY) // Don't trigger animations to hasty
  )

  /**
   * @return The location a drop should occur in. This depends on the configuration in the language model.
   */
  get dropLocation() {
    return (calculateDropLocation(this.node, this.visual.dropTarget));
  }

  /**
   * @return The current animation state
   */
  readonly currentAvailability = this._dragService.currentDrag
    .pipe(map(drag => calculateDropTargetState(drag, this)));

  /**
   * A mouse has entered, we possibly need to ensure that the drop target
   * does not vanish.
   */
  onMouseEnter(evt: MouseEvent) {
    this._currentTarget = true;
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, this.dropLocation, this.node, false);
    }
  }

  onMouseOut(evt: MouseEvent) {
    this._currentTarget = false;
    evt.stopPropagation();
  }
}

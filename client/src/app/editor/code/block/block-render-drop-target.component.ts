import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { map, withLatestFrom, debounceTime } from 'rxjs/operators';

import { arrayEqual } from '../../../shared/util';
import { Node, CodeResource, NodeLocation } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { DragService } from '../../drag.service';

import { calculateDropTargetState } from './drop-target-state';

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
      state('unavailable', style({
        backgroundColor: 'orange',
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
export class BlockRenderDropTargetComponent {
  /**
   * The code resource that is rendered here.
   */
  @Input() public codeResource: CodeResource;

  /**
   * If applicable: The node that has something dropped on to it.
   */
  @Input() public node?: Node;


  /**
   * The visualisation parameters for this block.
   */
  @Input() public visual: VisualBlockDescriptions.EditorDropTarget;

  /**
   * The location this drop target would insert something if something
   * would be dropped here.
   */
  @Input() public dropLocation: NodeLocation;

  /**
   * Disables any interaction with this block if true.
   */
  @Input() public readOnly = false;

  private _currentTarget = false;

  constructor(
    private _dragService: DragService
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
  readonly showDropPlaceholder = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (this.readOnly) {
        return (false);
      }
      else if (inProgress) {
        if (this._currentTarget) {
          return (false);
        }
        else {
          // We would drop something in the location we are a placeholder.
          return (arrayEqual(currentDrag.dropLocation, this.dropLocation));
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
   * @return The current animation state
   */
  readonly currentAvailability = this._dragService.currentDrag
    .pipe(
      map(drag => {
        if (this.readOnly) {
          return ("none");
        } else {
          const validator = this.codeResource.validationLanguagePeek.validator;
          const tree = this.codeResource.syntaxTreePeek;
          return (calculateDropTargetState(drag, this.dropLocation, this.visual, validator, tree));
        }
      })
    );

  /**
   * A mouse has entered, we possibly need to ensure that the drop target
   * does not vanish.
   */
  onMouseEnter(evt: MouseEvent) {
    this._currentTarget = true;
    if (!this.readOnly && this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, this.dropLocation, undefined, { allowExact: true });
    }
  }

  onMouseOut(evt: MouseEvent) {
    this._currentTarget = false;
    evt.stopPropagation();
  }
}

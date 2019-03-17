import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { map, withLatestFrom } from 'rxjs/operators';

import { arrayEqual } from '../../../shared/util';
import { Node, CodeResource, NodeLocation } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { DragService, CurrentDrag } from '../../drag.service';

import { targetState, DragTargetState, _isChildRequired, dropLocationHasChildren } from './drop-target-state';
import { Observable } from 'rxjs';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

const CSS_WHITE = "255, 255, 255";
const CSS_YELLOW = "255, 255, 0";
const CSS_GREEN = "0, 255, 0";
const CSS_RED = "255, 0, 0";
const CSS_BLACK = "0, 0, 0";
const CSS_ALPHA = "0.3";

/**
 * Renders a single and well known visual element of a node.
 */
@Component({
  templateUrl: 'templates/block-render-drop-target.html',
  selector: `editor-block-render-drop-target`,
  animations: [
    trigger('background-color', [
      state('unknown', style({
      })),
      state('optional', style({
        background: `
          repeating-linear-gradient(
            45deg,
            RGBA(${CSS_WHITE}, ${CSS_ALPHA}),
            RGBA(${CSS_WHITE}, ${CSS_ALPHA}) 10px,
            RGBA(${CSS_BLACK}, 0.2) 10px,
            RGBA(${CSS_BLACK}, 0.2) 20px
          )
        `,
        "border-radius": "500px",
        "border": "1px solid black",
      })),
      state('hole', style({
        background: `
          repeating-linear-gradient(
            45deg,
            RGBA(${CSS_YELLOW}, ${CSS_ALPHA}),
            RGBA(${CSS_YELLOW}, ${CSS_ALPHA}) 10px,
            RGBA(${CSS_BLACK}, 0.2) 10px,
            RGBA(${CSS_BLACK}, 0.2) 20px
          )
        `,
        "border-radius": "500px",
        "border": "1px solid black",
      })),
      state('validTarget', style({
        background: `
          repeating-linear-gradient(
            45deg,
            RGBA(${CSS_GREEN}, ${CSS_ALPHA}),
            RGBA(${CSS_GREEN}, ${CSS_ALPHA}) 10px,
            RGBA(${CSS_BLACK}, 0.2) 10px,
            RGBA(${CSS_BLACK}, 0.2) 20px
          )
        `,
        "border-radius": "500px",
        "border": "1px solid black",
      })),
      state('invalidTarget', style({
        background: `
          repeating-linear-gradient(
            45deg,
            RGBA(${CSS_RED}, ${CSS_ALPHA}),
            RGBA(${CSS_RED}, ${CSS_ALPHA}) 10px,
            RGBA(${CSS_BLACK}, 0.2) 10px,
            RGBA(${CSS_BLACK}, 0.2) 20px
          )
        `,
        "border-radius": "500px",
        "border": "1px solid black",
      })),
      state('targeted', style({
        "border": "1px dashed blue",
        "border-radius": "500px"
      })),
    ]),
    trigger('visible', [
      transition(':enter', [
        style({
          "width": '0px',
          "transform": "scaleX(0)",
          "white-space": "nowrap"
        }),
        animate('0.5s ease', style({
          "width": '*',
          "transform": "scaleX(1)",
        })),
      ]),
      transition(':leave', [
        style({
          "white-space": "nowrap",
        }),
        animate('0.5s ease', style({
          "width": '0px',
          "transform": "scaleX(0)",
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
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService
  ) {
  }

  /** @return The current validator of this code resource */
  private get _peekValidator() {
    return (this.codeResource.validationLanguagePeek.validator);
  }

  /** @return The current syntaxtree of this code resource */
  private get _peekTree() {
    return (this.codeResource.syntaxTreePeek);
  }

  /**
   * Tells whether a drag is in progress and what the actual drag data is.
   * It is important to have both things at hand because the UI should react
   * to ended drag events, so filtering out all "empty" drags is no option.
   */
  private readonly _latestDragData = this._dragService.currentDrag.pipe(
    withLatestFrom(this._dragService.isDragInProgress)
  );

  /** @return True, if this drop target is acting as a hole */
  private readonly _isHole = this._currentCodeResource.currentTree.pipe(
    map(tree => _isChildRequired(this._peekValidator, tree, this.dropLocation))
  );

  /** @return True, if the syntaxtree behind this drop target has any children */
  private readonly _hasChildren = this._currentCodeResource.currentTree.pipe(
    map(tree => dropLocationHasChildren(tree, this.dropLocation))
  );

  /** @return True, if this drop target is currently targeted by a drag */
  private readonly _isCurrentDropLocation = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress && currentDrag.smartDrops.length > 0) {
        return (currentDrag.smartDrops[0].operation === "insert"
          && arrayEqual(currentDrag.dropLocation, this.dropLocation));
      } else {
        return (false);
      }
    })
  );

  /**
   * Convenience method to calculate the targeting state of this drop target. Simply
   * calls the `targetState` function with all relevant parameters.
   *
   * @return The state that should be used for the current drag event.
   */
  private _targetState(drag: CurrentDrag): DragTargetState {
    return (targetState(drag, this.dropLocation, this._peekValidator, this._peekTree));
  }


  /**
   * True if either the drop target or the drop location should be shown.
   */
  readonly showAnything: Observable<boolean> = this._isCurrentDropLocation.pipe(
    withLatestFrom(this._isHole, this._hasChildren),
    map(([isCurrentDropLocation, isHole, hasChildren]) => {
      return (
        (this.visual.emptyDropTarget && !hasChildren)
        || isHole
        || isCurrentDropLocation // TODO: Forbid structurally insound drops
        //       General idea must be kept to show drop indicators
        || this._currentTarget
      );
    })
  )

  /**
   * @return The current targeting state of this drop target
   */
  readonly targetState: Observable<DragTargetState | "hole" | "optional"> = this._dragService.currentDrag
    .pipe(
      withLatestFrom(this._isHole, this._hasChildren),
      map(([drag, isHole, hasChildren]) => {
        if (this.readOnly) {
          return ("unknown");
        } else {
          const targetState = this._targetState(drag);
          if (targetState === "unknown") {
            if (isHole)
              return ("hole");
            else if (!hasChildren && this.visual.emptyDropTarget)
              return ("optional");
            else
              return (targetState);

          } else {
            return (targetState);
          }
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

  readonly displayText = this._isCurrentDropLocation.pipe(
    map(p => p ? "Hier" : "?")
  );
}

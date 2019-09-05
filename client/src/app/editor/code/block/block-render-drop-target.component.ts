import { Component, Input } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { locationIsOnPath } from '../../../shared/util';
import { Node, CodeResource, NodeLocation, ErrorCodes, ErrorMissingChild } from '../../../shared/syntaxtree';
import { VisualBlockDescriptions } from '../../../shared/block';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { DragService, CurrentDrag } from '../../drag.service';

import { targetState, DragTargetState, _isChildRequiredSchema, dropLocationHasChildren } from './drop-target-state';

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

  /**
   * Indicates whether the mouse is currently over exactly this target.
   */
  private _currentMouseTarget = new BehaviorSubject(false);

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
   * The latest validation result for the current resource
   */
  private readonly _latestValidation = this._currentCodeResource.currentResource.pipe(
    flatMap(c => c.validationResult),
  );

  /**
   * Tells whether a drag is in progress and what the actual drag data is.
   * It is important to have both things at hand because the UI should react
   * to ended drag events, so filtering out all "empty" drags is no option.
   */
  private readonly _latestDragData = combineLatest(
    this._dragService.currentDrag,
    this._dragService.isDragInProgress
  );

  /** @return True, if this drop target is acting as a hole */
  private readonly _isHole = this._currentCodeResource.currentTree.pipe(
    map(tree => _isChildRequiredSchema(this._peekValidator, tree, this.dropLocation))
  );

  /** @return True, if this drop target requires children (as per validation) */
  private readonly _parentRequiresChildren = combineLatest(this._latestValidation, this._currentCodeResource.currentTree).pipe(
    map(([v, t]) => {
      const parentNode = t.locateOrUndefined(this.dropLocation.slice(0, -1));
      if (!parentNode) {
        return (false);
      }

      const childGroupName = this.dropLocation[this.dropLocation.length - 1][0];
      return (v.getErrorsOn(parentNode).some(e =>
        e.code == ErrorCodes.MissingChild && (e.data as ErrorMissingChild).category === childGroupName
      ))
    })
  );

  /** @return True, if the syntaxtree behind this drop target has any children */
  private readonly _hasChildren = this._currentCodeResource.currentTree.pipe(
    map(tree => dropLocationHasChildren(tree, this.dropLocation))
  );

  /** @return True, if this drop target is currently a possible drag location */
  private readonly _isCurrentDropCandidate = this._latestDragData.pipe(
    map(([currentDrag, inProgress]) => {
      if (inProgress && currentDrag && currentDrag.smartDrops.length > 0) {
        currentDrag.smartDrops.some(op =>
          op.operation === "insert" && locationIsOnPath(currentDrag.dropLocation, this.dropLocation)
        );
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
   * @return The current targeting state of this drop target
   */
  readonly targetState: Observable<DragTargetState | "hole" | "optional"> = combineLatest(
    this._dragService.currentDrag,
    this._isHole,
    this._parentRequiresChildren,
    this._hasChildren
  ).pipe(
    map(([drag, isHole, requiresChildren, hasChildren]) => {
      if (this.readOnly) {
        return ("unknown");
      } else {
        const targetState = this._targetState(drag);
        if (targetState === "unknown") {
          if (isHole || requiresChildren)
            return ("hole");
          else if (!hasChildren && this.visual.emptyDropTarget)
            return ("optional");
          else
            return ("unknown");
        } else {
          return (targetState);
        }
      }
    })
  );

  /**
   * True if the mouse is currently over this drop target
   */
  readonly currentMouseTarget = this._currentMouseTarget.asObservable();

  /**
   * True if either the drop target or the drop location should be shown.
   */
  readonly showAnything: Observable<boolean> = combineLatest(
    this._isCurrentDropCandidate, this._isHole, this._parentRequiresChildren,
    this._hasChildren, this.currentMouseTarget
  ).pipe(
    map(([isCurrentDropLocation, isHole, requiresChildren, hasChildren, currentMouseTarget]) => {
      return (
        (this.visual.emptyDropTarget && !hasChildren)
        || isHole
        || requiresChildren
        || isCurrentDropLocation
        || currentMouseTarget
      );
    })
  )

  /**
   * A mouse has entered, we possibly need to ensure that the drop target
   * does not vanish.
   */
  onMouseEnter(evt: MouseEvent) {
    this._currentMouseTarget.next(true);
    if (!this.readOnly && this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOver(evt, this.dropLocation, undefined, { allowExact: true });
    }
  }

  onMouseOut(evt: MouseEvent) {
    this._currentMouseTarget.next(false);
    evt.stopPropagation();
  }

  readonly displayText = this._isCurrentDropCandidate.pipe(
    map(p => p ? "Hier" : "?")
  );
}

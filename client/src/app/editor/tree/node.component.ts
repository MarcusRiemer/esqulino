import { Observable } from 'rxjs';

import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { arrayEqual } from '../../shared/util'
import { Node, NodeLocation, Tree } from '../../shared/syntaxtree';

import { DragService } from './drag.service';
import { TreeService } from './tree.service'

// These states are available for animation
type DropTargetAnimationStates = "available" | "none" | "self";

const DEFAULT_ANIMATION = "400ms ease";

/**
 * Displays a node of a syntaxtree, currently in the most generic way possible.
 */
@Component({
  templateUrl: 'templates/node.html',
  selector: 'ast-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('dropTarget', [
      state('none', style({
        backgroundColor: 'white',
      })),
      state('available', style({
        backgroundColor: 'lime',
      })),
      state('self', style({
        backgroundColor: 'yellow',
      })),
      // Fade in and out
      transition('none <=> available', animate(DEFAULT_ANIMATION)),
      transition('none <=> self', animate(DEFAULT_ANIMATION)),

      // Transition between shown states
      transition('available => self', animate(DEFAULT_ANIMATION)),
      //transition('self => available', animate(DEFAULT_ANIMATION)),
    ]),
    trigger('dropPlaceholder', [
      state('available', style({
        transform: 'scale(1.0)',
        display: 'block',
        backgroundColor: 'lime',
      })),
      state('self', style({
        transform: 'scale(1.0)',
        display: 'block',
        backgroundColor: 'yellow',
      })),
      state('none', style({
        transform: 'scale(0.5)',
        display: 'none',
      })),
    ])
  ]
})
export class NodeComponent implements OnChanges {
  @Input() node: Node;

  @Input() allowDropBefore: boolean;

  // Immutable cache for properties
  private _properties: { key: string, value: string }[];

  // Immutable cache for children categories
  private _childrenCategories: { categoryName: string, nodes: Node[] }[];

  // The observables that determine the current animation state. As this
  // Observables will be subscribed to multiple times, the need to be cached.
  private _cached_dropTargetAnimationState: Observable<DropTargetAnimationStates>;
  private _cached_dropPlaceholderAnimationState: Observable<DropTargetAnimationStates>;

  constructor(
    private _dragService: DragService,
    private _cdRef: ChangeDetectorRef,
    private _treeService: TreeService
  ) { }

  /**
   * Sets up display friendly caches of properties and children categories.
   */
  ngOnChanges(changes: SimpleChanges) {
    // Read and cache all properties
    this._properties = Object.entries(this.node.properties).map(([key, value]) => {
      return ({ key: key, value: value });
    });

    // Read and cache all categories
    this._childrenCategories = Object.entries(this.node.children).map(([key, children]) => {
      return ({ categoryName: key, nodes: children });
    });
  }

  /**
   * TODO: Something might be wrong with animation state transitions, this helps
   * to debug them.
   */
  logAnimation(evt: any) {
    console.log(evt);
  }

  /**
   * Something has been dropped on this node.
   */
  onDrop(evt: DragEvent) {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.replaceNode(this.node.location, desc);
  }

  /**
   * The user has decided to edit a node.
   */
  onPropertyEdit(key: string, value: string) {
    console.log("blur!", key, value);
    if (this.node.properties[key] != value) {
      this._treeService.setProperty(this.node.location, key, value);
    }
  }

  /**
   * @return The state of the drop animation for targets
   */
  get dropTargetAnimationState(): Observable<DropTargetAnimationStates> {
    if (!this._cached_dropTargetAnimationState) {
      this._cached_dropTargetAnimationState = this._dragService.currentDragOverNode
        .merge(this._dragService.isDragInProgress)
        .map(v => {
          if (v instanceof Node && v === this.node) {
            return ("self");
          } else {
            return (this._dragService.peekIsDragInProgress ? "available" : "none");
          }
        })
        .distinctUntilChanged()
    }

    return (this._cached_dropTargetAnimationState);
  }

  /**
   * @return The state of the drop animation for placeholders
   */
  get dropPlaceholderAnimationState(): Observable<DropTargetAnimationStates> {
    if (!this._cached_dropPlaceholderAnimationState) {
      this._cached_dropPlaceholderAnimationState = this._dragService.currentDragOverPlaceholder
        .merge(this._dragService.isDragInProgress)
        .map(v => {
          if (arrayEqual(v as any, this.node.location)) {
            return ("self");
          } else {
            return (this._dragService.peekIsDragInProgress ? "available" : "none");
          }
        })
        .distinctUntilChanged()
    }

    return (this._cached_dropPlaceholderAnimationState);
  }

  /**
   * @return All properties with their values
   */
  get properties() {
    return (this._properties);
  }

  /**
   * @return All categories that have children with their children.
   */
  get childrenCategories() {
    return (this._childrenCategories);
  }

  /**
   * @return An observable for the state of the dragging progress
   */
  get isDragInProgress() {
    return (this._dragService.isDragInProgress);
  }
}

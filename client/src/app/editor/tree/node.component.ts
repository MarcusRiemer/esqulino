import { Observable } from 'rxjs';

import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node, Tree } from '../../shared/syntaxtree';

import { DragService } from './drag.service';
import { TreeService } from './tree.service'

// These states are available for animation
type NodeAnimationStates = "available" | "none" | "self";

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
        backgroundColor: 'white'
      })),
      state('available', style({
        backgroundColor: 'lime'
      })),
      state('self', style({
        backgroundColor: 'yellow'
      })),
      // Fade in
      transition('none => available', animate(DEFAULT_ANIMATION)),
      transition('none => self', animate(DEFAULT_ANIMATION)),

      // Transition
      transition('available => self', animate(DEFAULT_ANIMATION)),
      //transition('self => available', animate(DEFAULT_ANIMATION)),

      // Fade out
      transition('available => none', animate(DEFAULT_ANIMATION)),
      transition('self => none', animate(DEFAULT_ANIMATION)),
    ])
  ]
})
export class NodeComponent implements OnChanges {
  @Input() node: Node;

  // Immutable cache for properties
  private _properties: { key: string, value: string }[];

  // Immutable cache for children categories
  private _childrenCategories: { categoryName: string, nodes: Node[] }[];

  // The observable that determines the current animation state. As this
  // Observable will be subscribed to multiple
  private _cached_dropAnimationState: Observable<NodeAnimationStates>;

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
    console.log("droppednode", evt);
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
   * @return The state of the drop animation 
   */
  get dropAnimationState(): Observable<NodeAnimationStates> {
    if (!this._cached_dropAnimationState) {
      this._cached_dropAnimationState = this._dragService.currentDragOverNode
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

    return (this._cached_dropAnimationState);
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

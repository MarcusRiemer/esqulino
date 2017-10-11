import { Observable } from 'rxjs';

import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { arrayEqual } from '../../shared/util'
import { Node, NodeLocation, Tree } from '../../shared/syntaxtree';

import { DEFAULT_ANIMATION } from './node.animation'
import { DragService } from './drag.service';
import { TreeService } from './tree.service'

// These states are available for animation
type DropTargetAnimationStates = "available" | "none" | "self";

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
   * The user has started to drag exactly this node around.
   */
  onStartDrag(evt: DragEvent) {
    this._dragService.dragStart(evt,
      {
        draggedDescription: this.node.toModel(),
        origin: "tree"
      },
      {
        location: this.node.location,
        treeService: this._treeService
      }
    );
  }

  /**
   * Something has been dropped on this node. We should replace the node entirely.
   */
  onDropReplace() {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.replaceNode(this.node.location, desc);
  }

  /**
   * Something has been dropped on a placeholder before or after this node. This
   * "something" should be inserted to the tree.
   */
  onDropInsert() {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._treeService.insertNode(this.node.location, desc);
  }

  /**
   * The user has decided to edit a property value.
   */
  onPropertyEdit(key: string, value: string) {
    if (this.node.properties[key] != value) {
      this._treeService.setProperty(this.node.location, key, value);
    }
  }

  /**
   * The user has decided to rename a property.
   */
  onPropertyRename(key: string, newKey: string) {
    if (key != newKey) {
      try {
        this._treeService.renameProperty(this.node.location, key, newKey);
      } catch (e) {
        alert(e);
      }
    }
  }

  /**
   * The user has decided to add a property.
   */
  onPropertyAdd() {
    try {
      const newKey = prompt(`Name des neuen Wertes?`);
      this._treeService.addProperty(this.node.location, newKey);
    } catch (e) {
      alert(e);
    }
  }

  /**
   * The user has decided to add an empty childgroup.
   */
  onChildGroupAdd() {
    try {
      const newKey = prompt(`Name der neuen Gruppe?`);
      this._treeService.addChildGroup(this.node.location, newKey);
    } catch (e) {
      alert(e);
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

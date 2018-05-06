import {
  Component, Input, OnInit, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { arrayEqual } from '../../../shared/util'
import { Node, NodeLocation, Tree } from '../../../shared/syntaxtree';

import { DragService } from '../../drag.service';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

import { DROP_TARGET_ANIMATION } from './node.animation';

// These states are available for animation
type DropTargetAnimationStates = "available" | "none" | "self";

/**
 * Displays a node of a syntaxtree, currently in the most generic way possible.
 */
@Component({
  templateUrl: 'templates/node.html',
  selector: 'ast-node',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [DROP_TARGET_ANIMATION]
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
    private _currentCodeResource: CurrentCodeResourceService,
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
   * Something has been dropped on this node. We should replace the node entirely.
   */
  onDropReplace() {
    const desc = this._dragService.peekDragData.draggedDescription;
    this._currentCodeResource.peekResource.replaceNode(this.node.location, desc);
  }

  /**
   * The user has decided to edit a property value.
   */
  onPropertyEdit(key: string, value: string) {
    if (this.node.properties[key] != value) {
      this._currentCodeResource.peekResource.setProperty(this.node.location, key, value);
    }
  }

  /**
   * The user has decided to rename a property.
   */
  onPropertyRename(key: string, newKey: string) {
    if (key != newKey) {
      try {
        this._currentCodeResource.peekResource.renameProperty(this.node.location, key, newKey);
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
      this._currentCodeResource.peekResource.addProperty(this.node.location, newKey);
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
      this._currentCodeResource.peekResource.addChildGroup(this.node.location, newKey);
    } catch (e) {
      alert(e);
    }
  }

  /**
   * @return The state of the drop animation for targets
   */
  get dropTargetAnimationState(): Observable<DropTargetAnimationStates> {
    if (!this._cached_dropTargetAnimationState) {
      this._cached_dropTargetAnimationState = this._dragService.currentDrag
        .pipe(
          map(drag => {
            if (!drag) {
              // There is no drag operation
              return ("none" as DropTargetAnimationStates);
            }
            else if (drag.hoverNode && drag.hoverNode == this.node) {
              // There is a drag operation and it targets us
              return ("self" as DropTargetAnimationStates);
            } else {
              // There is a drag operation and it targets something else
              return ("available" as DropTargetAnimationStates);
            }
          }),
          distinctUntilChanged()
        )
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

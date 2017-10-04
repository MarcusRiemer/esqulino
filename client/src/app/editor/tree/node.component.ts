import { Observable } from 'rxjs';

import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { Node } from '../../shared/syntaxtree';

import { DragService } from './drag.service';

// These states are available for animation
type NodeAnimationStates = "available" | "none" | "self";

const DEFAULT_ANIMATION = "400ms ease";

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
      //transition('available => self', animate(DEFAULT_ANIMATION)),
      //transition('self => available', animate(DEFAULT_ANIMATION)),

      // Fade out
      //transition('available => none', animate(DEFAULT_ANIMATION)),
      //transition('self => none', animate(DEFAULT_ANIMATION)),
      transition('* => none', animate(DEFAULT_ANIMATION)),
    ])
  ]
})
export class NodeComponent implements OnInit {
  @Input() node: Node;

  // Immutable cache for properties
  private _properties: { key: string, value: string }[];

  // Immutable cache for children categories
  private _childrenCategories: { categoryName: string, nodes: Node[] }[];


  private _cached_dropAnimationState: Observable<NodeAnimationStates>;

  public _stateHistory: string[] = [];

  constructor(
    private _dragService: DragService,
    private _cdRef: ChangeDetectorRef
  ) { }

  /**
   * Sets up display friendly caches of properties and children categories.
   */
  ngOnInit() {
    console.log("ngOnInit for node");

    // Read and cache all properties
    this._properties = Object.entries(this.node.properties).map(([key, value]) => {
      return ({ key: key, value: value });
    });

    // Read and cache all categories
    this._childrenCategories = Object.entries(this.node.children).map(([key, children]) => {
      return ({ categoryName: key, nodes: children });
    });
  }

  logAnimation(evt: any) {
    console.log(evt);
  }

  /**
   * @return The state of the drop animation 
   */
  get dropAnimationState(): Observable<NodeAnimationStates> {
    // 
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
        .do(_ => this._cdRef.markForCheck())
        .do(v => this._stateHistory.push(v))
        .do(v => console.log(JSON.stringify(this.node.location), "=>", JSON.stringify(this._stateHistory)))
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

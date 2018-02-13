import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';

import { Subscription } from 'rxjs/Subscription'

import { CodeResource } from '../../shared/syntaxtree';

import { SIDEBAR_MODEL_TOKEN } from '../editor.token';

import { TreeSidebarFixedBlocksComponent } from './tree-sidebar-fixed-blocks.component'
import { TreeEditorService } from '../editor.service';

function resolvePortalComponentId(id: string) {
  switch (id) {
    case "fixedBlocks": return (TreeSidebarFixedBlocksComponent);
  }
}

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
  templateUrl: 'templates/sidebar.html',
  selector: "tree-sidebar"
})
export class TreeSidebarComponent implements OnInit, OnDestroy {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "tree" };

  private _portalInstances = [];

  private _subscriptions: Subscription[] = [];

  constructor(
    private _treeEditorService: TreeEditorService
  ) {

  }

  ngOnInit(): void {
    // Listen for changes of the active resource
    let outerRef = this._treeEditorService.currentResource.subscribe(res => {
      // And then on changes for the active block language
      let innerRef = res.languageModel.subscribe(languageModel => {

        const sidebars = languageModel.sidebars;
        if (sidebars && sidebars.length > 0) {
          this._portalInstances = sidebars.map(s => {
            return (new ComponentPortal(resolvePortalComponentId(s.portalComponentTypeId)));
          });
        }
      });

      this._subscriptions.push(innerRef);
    });

    this._subscriptions.push(outerRef);
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  get portalInstances() {
    return (this._portalInstances);
  }
}


import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';

import { Subscription } from 'rxjs'

import { CodeResource } from '../../shared/syntaxtree';
import { Sidebar } from '../../shared/block';

import { SIDEBAR_MODEL_TOKEN } from '../editor.token';

import { CodeSidebarFixedBlocksComponent } from './code-sidebar-fixed-blocks.component'
import { CurrentCodeResourceService } from '../current-coderesource.service';

import { DatabaseSchemaSidebarComponent } from './query/database-schema-sidebar.component'

function resolvePortalComponentId(id: string): any {
  switch (id) {
    case "fixedBlocks": return (CodeSidebarFixedBlocksComponent);
    case "databaseSchema": return (DatabaseSchemaSidebarComponent);
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
export class CodeSidebarComponent implements OnInit, OnDestroy {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "tree" };

  private _portalInstances = [];

  private _subscriptions: Subscription[] = [];

  constructor(
    private _currentCodeResource: CurrentCodeResourceService
  ) {

  }

  /**
   * Initializes the portals for all sidebars
   */
  ngOnInit(): void {
    // Listen for changes of the active resource
    let outerRef = this._currentCodeResource.currentResource.subscribe(res => {
      // And then on changes for the active block language
      let innerRef = res.blockLanguage.subscribe(languageModel => {
        // And then we are at the language model which knows the sidebars
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

  /**
   * Unsubscribes from all subscriptions
   */
  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }

  get portalInstances() {
    return (this._portalInstances);
  }
}


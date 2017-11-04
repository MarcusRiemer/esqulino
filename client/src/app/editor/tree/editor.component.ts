import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Tree, Node, NodeDescription, AvailableLanguages } from '../../shared/syntaxtree';

import { SidebarService } from '../sidebar.service';
import { ToolbarService } from '../toolbar.service';
import { ProjectService, Project } from '../project.service'

import { TreeSidebarComponent } from './tree.sidebar';
import { TreeEditorService } from './editor.service';
import { DragService } from './drag.service';

@Component({
  templateUrl: 'templates/tree-editor.html',
  providers: [TreeEditorService]
})
export class SyntaxTreeEditorComponent implements OnInit {
  @Input() rawNodeData: string = "";

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];


  constructor(
    private _sidebarService: SidebarService,
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _treeService: TreeEditorService,
    private _routeParams: ActivatedRoute,
    private _projectService: ProjectService
  ) {
  }

  ngOnInit(): void {
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    let subRef = this._routeParams.params.subscribe(params => {
      // Ensure the referenced resource exists
      const codeResourceId = params['resourceId'];
      if (!codeResourceId) {
        throw new Error(`Invalid code resource: "${codeResourceId}"`);
      }

      // Assign the resource
      const codeResource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);
      this._treeService.setLanguage(AvailableLanguages.All);
      this._treeService.codeResource = codeResource;
      this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, this._treeService);
    });
  }

  /**
   * Freeing all subscriptions
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }


  /**
   * When something draggable enters the editor area itself there is no
   * possibility anything is currently dragged over a node. So we inform the
   * drag service about that.
   */
  public onDragEnter(evt: DragEvent) {
    this._dragService.informDraggedOverNode(undefined);
  }

  /**
   * @return The drag service that is responsible for this editor.
   */
  get dragService() {
    return (this._dragService);
  }

  /**
   * @return The observable tree that is edited by this editor.
   */
  get currentTree() {
    return (this._treeService.currentTree);
  }
}

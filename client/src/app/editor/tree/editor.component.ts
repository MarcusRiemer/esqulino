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

  private _languages = AvailableLanguages;

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
      const codeResourceId = params['resourceId'];
      if (codeResourceId) {
        const codeResource = this._projectService.cachedProject.getCodeResourceById(codeResourceId);
        this._treeService.replaceTree(codeResource.syntaxTree);
      } else {
        this._treeService.replaceTree(new Tree(undefined));
      }

      this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, this._treeService);
      this._treeService.setLanguage(this.currentLanguage);
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
   * @return The tree that is edited by this editor
   */
  get peekTree(): Tree {
    return (this._treeService.peekTree);
  }

  /**
   * @return The observable tree that is edited by this editor.
   */
  get currentTree() {
    return (this._treeService.currentTree);
  }

  /**
   * @return The main language to assume the node uses.
   */
  get currentLanguage() {
    return (this._languages.All);
  }
}

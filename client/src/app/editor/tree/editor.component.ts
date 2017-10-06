import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Tree, Node, NodeDescription, AvailableLanguages } from '../../shared/syntaxtree';

import { SidebarService } from '../sidebar.service';
import { ToolbarService } from '../toolbar.service';

import { TreeSidebarComponent } from './tree.sidebar';
import { TreeService } from './tree.service';
import { DragService } from './drag.service';

const astDesc: NodeDescription = {
  language: "xml",
  name: "node",
  children: {
    "nodes": [
      {
        language: "xml",
        name: "node",
        children: {
          "attributes": [
            {
              language: "xml",
              name: "attribute",
              properties: {
                "key": "leaf",
                "value": "true",
              }
            }
          ]
        },
        properties: {
          "name": "duper",
        }
      }
    ],
    "attributes": [
      {
        language: "xml",
        name: "attribute",
        properties: {
          "key": "cool",
          "value": "very"
        }
      }
    ]
  },
  properties: {
    "name": "super"
  }
};

@Component({
  templateUrl: 'templates/tree-editor.html',
  providers: [TreeService]
})
export class SyntaxTreeEditorComponent implements OnInit {
  @Input() rawNodeData: string = "";

  private _languages = AvailableLanguages;

  constructor(
    private _sidebarService: SidebarService,
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _treeService: TreeService
  ) {
  }

  ngOnInit(): void {
    this._treeService.currentTree.subscribe(v => console.log("New Tree:", v));

    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    const constructItem = this._toolbarService.addButton('construct', 'Baum Erstellen', 'tree', 'r');
    constructItem.onClick.subscribe(() => this.loadRawNode());

    this.rawNodeData = JSON.stringify(astDesc, null, 2);
    this.loadRawNode();

    this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, this.tree);
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
   * Constructs a new tree from immediate JSON input the user has given.
   */
  private loadRawNode() {
    try {
      const desc = JSON.parse(this.rawNodeData);
      this._treeService.replaceTree(desc);
      this.rawNodeData = JSON.stringify(this.tree.toModel(), null, 2);
    }
    catch (err) {
      alert(err);
    }
  }

  /**
   * @return The drag service that is responsible for this editor.
   */
  get dragService() {
    return (this._dragService);
  }

  /**
   * @return The number of lines the raw input currently has.
   */
  get rawNodeDataLineNum() {
    return (this.rawNodeData.split("\n").length);
  }

  /**
   * @return The tree that is edited by this editor
   */
  get tree() {
    return (this._treeService.tree);
  }

  get currentTree() {
    return (this._treeService.currentTree);
  }

  /**
   * @return The main language to assume the node uses.
   */
  get currentLanguage() {
    return (this._languages.Xml);
  }
}

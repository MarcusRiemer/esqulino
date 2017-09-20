import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { Tree, Node, NodeDescription, AvailableLanguages } from '../../shared/syntaxtree'

import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'

import { TreeSidebarComponent } from './tree.sidebar'

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
  templateUrl: 'templates/tree-editor.html'
})
export class SyntaxTreeEditorComponent implements OnInit {
  @Input() rawNodeData: string = "";

  private _ast: Tree;

  private _languages = AvailableLanguages;

  constructor(
    private _sidebarService: SidebarService,
    private _toolbarService: ToolbarService
  ) {
  }

  ngOnInit(): void {
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    const constructItem = this._toolbarService.addButton('construct', 'Baum Erstellen', 'tree', 'r');
    constructItem.onClick.subscribe(() => this.loadRawNode());

    this.rawNodeData = JSON.stringify(astDesc, null, 2);
    this.loadRawNode();

    this._sidebarService.showSingleSidebar(TreeSidebarComponent.SIDEBAR_IDENTIFIER, this._ast);
  }

  private loadRawNode() {
    try {
      const desc = JSON.parse(this.rawNodeData);
      this._ast = new Tree(desc);
      this.rawNodeData = JSON.stringify(this._ast.toModel(), null, 2);
    }
    catch (err) {
      alert(err);
    }
  }

  get rawNodeDataLines() {
    return (this.rawNodeData.split("\n").length);
  }

  get ast() {
    return (this._ast);
  }

  get currentLanguage() {
    return (this._languages.Xml);
  }
}

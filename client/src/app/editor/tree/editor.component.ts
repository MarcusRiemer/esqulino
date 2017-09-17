import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { Node, NodeDescription, AvailableLanguages } from '../../shared/syntaxtree'

import { SidebarService } from '../sidebar.service'
import { ToolbarService } from '../toolbar.service'

@Component({
  templateUrl: 'templates/tree-editor.html'
})
export class SyntaxTreeEditorComponent implements OnInit {
  private _ast: Node;

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
                    "value": "true",
                  }
                }
              ]
            },
            properties: {
              "name": "duper"
            }
          }
        ],
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "cool",
            }
          }
        ]
      },
      properties: {
        "name": "super"
      }
    };

    this._ast = new Node(astDesc, undefined);
  }

  get ast() {
    return (this._ast);
  }

  get currentLanguage() {
    return (this._languages.Xml);
  }
}

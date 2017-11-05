import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { ToolbarService } from '../../toolbar.service';

import { TreeEditorService } from '../editor.service';
import { DragService } from '../drag.service';

/**
 * The "usual" editor folks will interact with. Displays all sorts
 * of nice and colourful blocks.
 */
@Component({
  templateUrl: 'templates/block-editor.html',
  providers: [TreeEditorService]
})
export class BlockEditorComponent implements OnInit {

  constructor(
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _treeService: TreeEditorService,
    private _router: Router,
    private _route: ActivatedRoute,
  ) {
  }

  ngOnInit(): void {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    // Swapping between editors
    const btnChange = this._toolbarService.addButton("goblock", "Raw Editor", "tree", "b");
    btnChange.onClick.subscribe(_ => {
      this._router.navigate(["../..", "raw", this._treeService.peekResource.id], { relativeTo: this._route });
    });
  }
}

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { ToolbarService } from '../../toolbar.service';

import { TreeEditorService } from '../editor.service';
import { DragService } from '../drag.service';

/**
 * A more or less internal editor that is intended only as a fallback if all
 * other editors fail somehow. It allows editing of each and every detail of a
 * syntaxtree without caring for correctness at all.
 */
@Component({
  templateUrl: 'templates/raw-tree-editor.html',
  providers: [TreeEditorService]
})
export class RawTreeEditorComponent implements OnInit {

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
    const btnChange = this._toolbarService.addButton("goblock", "Block Editor", "puzzle-piece", "b");
    btnChange.onClick.subscribe(_ => {
      this._router.navigate(["../..", "block", this._treeService.peekResource.id], { relativeTo: this._route });
    });
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

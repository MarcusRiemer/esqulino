import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { ToolbarService } from '../../toolbar.service';
import { DragService } from '../../drag.service';

import { CurrentCodeResourceService } from '../../current-coderesource.service';

/**
 * A more or less internal editor that is intended only as a fallback if all
 * other editors fail somehow. It allows editing of each and every detail of a
 * syntaxtree without caring for correctness at all.
 */
@Component({
  templateUrl: 'templates/raw-tree-editor.html',
})
export class RawTreeEditorComponent implements OnInit {

  constructor(
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
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
      this._router.navigate(["..", "block"], { relativeTo: this._route });
    });
  }

  /**
   * When something draggable enters the editor area itself there is no
   * possibility anything is currently dragged over a node. So we inform the
   * drag service about that.
   */
  public onDragEnter(_: DragEvent) {
    this._dragService.informDraggedOverEditor();
  }

  /**
   * @return The drag service that is responsible for this editor.
   */
  get dragService() {
    return (this._dragService);
  }

  /**
   * @return The always up-to-date resource to edit.
   */
  get currentResource() {
    return (this._currentCodeResource.currentResource);
  }
}

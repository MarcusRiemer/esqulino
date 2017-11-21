import { Observable } from 'rxjs/Observable'

import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { ToolbarService } from '../../toolbar.service';

import { TreeEditorService } from '../editor.service';
import { DragService } from '../drag.service';
import { LanguageService } from '../language.service';

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
    private _languageService: LanguageService,
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
      this._router.navigate(["..", "raw"], { relativeTo: this._route });
    });
  }

  /**
   * When something draggable enters the editor area itself there is no
   * possibility anything is currently dragged over a node. So we inform the
   * drag service about that.
   */
  public onDragEnter(evt: DragEvent) {
    this._dragService.informDraggedOverEditor();
  }

  /**
   * @return The tree that is currently edited.
   */
  get currentTree() {
    return (this._treeService.currentTree);
  }

  /**
   * @return The language model that is currently in use.
   */
  get currentLanguageModel() {
    return (Observable.of(this._languageService.getLanguageModel("dxml")));
  }
}

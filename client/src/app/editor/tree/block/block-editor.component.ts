import { Observable } from 'rxjs/Observable'

import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { ToolbarService } from '../../toolbar.service';

import { TreeEditorService } from '../editor.service';
import { DragService } from '../../drag.service';
import { CodeResourceService } from '../../coderesource.service';

/**
 * The "usual" editor folks will interact with. Displays all sorts
 * of nice and colourful blocks.
 */
@Component({
  templateUrl: 'templates/block-editor.html',
  providers: [TreeEditorService],
})
export class BlockEditorComponent implements OnInit, OnDestroy {

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];


  constructor(
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _treeService: TreeEditorService,
    private _codeResourceService: CodeResourceService,
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

    // Reacting to saving
    this._toolbarService.savingEnabled = true;
    let btnSave = this._toolbarService.saveItem;

    let subRef = btnSave.onClick.subscribe((res) => {
      btnSave.isInProgress = true;
      this._codeResourceService.updateCodeResource(this._treeService.peekResource)
        // Always delay visual feedback by 500ms
        .delay(500)
        .subscribe(res => btnSave.isInProgress = false);
    });
  }

  /**
   * @return The resource that is currently edited
   */
  get currentResource() {
    return (this._treeService.currentResource);
  }

  /**
   * Cleans up all acquired references
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
    this._dragService.informDraggedOverEditor();
  }
}

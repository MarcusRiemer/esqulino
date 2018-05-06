import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Component, Input, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router'

import { first } from 'rxjs/operators';

import { EditorComponentDescription } from '../../../shared/block/block-language.description';

import { EditorComponentsService } from '../editor-components.service';

import { ToolbarService } from '../../toolbar.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { DragService } from '../../drag.service';
import { CodeResourceService } from '../../coderesource.service';
import { CodeResource } from '../../../shared/syntaxtree';
import { BlockLanguage } from '../../../shared/block';

/**
 * The "usual" editor folks will interact with. Displays all sorts
 * of nice and colourful blocks.
 */
@Component({
  templateUrl: 'templates/block-editor.html',
})
export class BlockEditorComponent implements OnInit, OnDestroy {

  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  constructor(
    private _toolbarService: ToolbarService,
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _codeResourceService: CodeResourceService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _editorComponentsService: EditorComponentsService,
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

    // Deleting this code resource
    const btnDelete = this._toolbarService.addButton("delete", "Löschen", "trash", "w");
    btnDelete.onClick.subscribe(_ => {
      this._codeResourceService.deleteCodeResource(this.peekResource)
        .pipe(first())
        .subscribe(res => {
          this.peekProject.removedCodeResource(this.peekResource);
          this._router.navigate(["create"], { relativeTo: this._route.parent })
        });
    });

    // Reacting to saving
    this._toolbarService.savingEnabled = true;
    let btnSave = this._toolbarService.saveItem;

    let subRef = btnSave.onClick.subscribe((res) => {
      btnSave.isInProgress = true;
      this._codeResourceService.updateCodeResource(this.peekResource)
        .pipe(first())
        .subscribe(res => btnSave.isInProgress = false);
    });
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach(ref => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * @return A peek at the currently edited resource.
   */
  get peekResource() {
    return (this._currentCodeResource.peekResource);
  }

  /**
   * @return The resource that is currently edited
   */
  get currentResource() {
    return (this._currentCodeResource.currentResource);
  }

  /**
   * @return A peek at the project of the currently edited resource
   */
  get peekProject() {
    return (this.peekResource.project);
  }

  /**
   * @return The resolved portal for the given description
   */
  getEditorComponentPortal(desc: EditorComponentDescription) {
    return (this._editorComponentsService.createComponent(desc));
  }

  readonly editorComponents = this.currentResource
    .pipe(
      switchMap(codeResource => codeResource.blockLanguage),
      map((blockLanguage: BlockLanguage) => blockLanguage.editorComponents),
      map(components => components.map(c => this.getEditorComponentPortal(c)))
    );

  /**
   * When something draggable enters the editor area itself there is no
   * possibility anything is currently dragged over a node. So we inform the
   * drag service about that.
   */
  public onDragEnter(evt: DragEvent) {
    this._dragService.informDraggedOverEditor();
  }
}

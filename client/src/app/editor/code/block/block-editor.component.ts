import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ComponentPortal } from "@angular/cdk/portal";

import { Observable } from "rxjs";
import { map, switchMap, first, combineLatest } from "rxjs/operators";

import { EditorComponentDescription } from "../../../shared/block/block-language.description";
import { BlockLanguageDataService } from "../../../shared/serverdata";

import { EditorToolbarService } from "../../toolbar.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { DragService } from "../../drag.service";
import { CodeResourceService } from "../../coderesource.service";
import { EditorComponentsService } from "../editor-components.service";

import { BlockDebugOptionsService } from "../../block-debug-options.service";
import { ProjectService } from "../../project.service";

interface PlacedEditorComponent {
  portal: ComponentPortal<{}>;
  columnClasses: string[];
}

/**
 * The "usual" editor folks will interact with. Is configurable to display many different
 * components.
 */
@Component({
  templateUrl: "templates/block-editor.html",
})
export class BlockEditorComponent implements OnInit, OnDestroy {
  /**
   * Subscriptions that need to be released
   */
  private _subscriptionRefs: any[] = [];

  public readOnly = false;

  constructor(
    private _toolbarService: EditorToolbarService,
    private _dragService: DragService,
    private _currentCodeResource: CurrentCodeResourceService,
    private _projectService: ProjectService,
    private _codeResourceService: CodeResourceService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _editorComponentsService: EditorComponentsService,
    private _debugOptions: BlockDebugOptionsService,
    private _blockLanguageData: BlockLanguageDataService
  ) {}

  ngOnInit(): void {
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    // Deleting this code resource
    const btnDelete = this._toolbarService.addButton(
      "delete",
      "Löschen",
      "trash",
      "w"
    );
    btnDelete.onClick.subscribe((_) => {
      this._codeResourceService
        .deleteCodeResource(this.peekProject, this.peekResource)
        .pipe(first())
        .subscribe((_) => {
          this.peekProject.removedCodeResource(this.peekResource);
          this._router.navigate(["create"], { relativeTo: this._route.parent });
        });
    });

    // Reacting to saving
    this._toolbarService.savingEnabled = true;
    let btnSave = this._toolbarService.saveItem;

    btnSave.onClick.subscribe((_) => {
      btnSave.isInProgress = true;
      this._codeResourceService
        .updateCodeResource(this.peekProject, this.peekResource)
        .pipe(first())
        .subscribe((_) => (btnSave.isInProgress = false));
    });

    // Making a copy
    const btnClone = this._toolbarService.addButton(
      "clone",
      "Klonen",
      "files-o",
      "o"
    );
    btnClone.onClick.subscribe((_) => {
      this._codeResourceService
        .cloneCodeResource(this.peekProject, this.peekResource)
        .pipe(first())
        .subscribe((clone) => {
          this.peekProject.addCodeResource(clone);
          this._router.navigate([clone.id], { relativeTo: this._route.parent });
        });
    });
  }

  /**
   * Cleans up all acquired references
   */
  ngOnDestroy() {
    this._subscriptionRefs.forEach((ref) => ref.unsubscribe());
    this._subscriptionRefs = [];
  }

  /**
   * @return A peek at the currently edited resource.
   */
  get peekResource() {
    return this._currentCodeResource.peekResource;
  }

  /**
   * @return The resource that is currently edited
   */
  get currentResource() {
    return this._currentCodeResource.currentResource;
  }

  /**
   * @return A peek at the project of the currently edited resource
   */
  get peekProject() {
    return this._projectService.cachedProject;
  }

  /**
   * @return The resolved portal for the given description
   */
  getEditorComponentPortal(desc: EditorComponentDescription) {
    return this._editorComponentsService.createComponent(desc);
  }

  /**
   * These editor components should be shown
   */
  readonly editorComponentDescriptions = this.currentResource.pipe(
    switchMap((c) => c.blockLanguageId),
    switchMap((id) => this._blockLanguageData.getLocal(id, "request")),
    combineLatest(
      this._debugOptions.showDropDebug.value$,
      this._debugOptions.showLanguageSelector.value$
    ),
    map(([blockLanguage, showDropDebug, showLanguageSelector]) => {
      // Take all of the default block languages
      const toReturn = [...blockLanguage.editorComponents];

      // Possibly inject the debug component
      if (showDropDebug) {
        const blockEditorIndex = toReturn.findIndex(
          (c) => c.componentType === "block-root"
        );
        if (blockEditorIndex >= 0) {
          toReturn.splice(blockEditorIndex + 1, 0, {
            componentType: "drop-debug",
          });
        }
      }

      // Possibly inject the renaming component
      if (showLanguageSelector) {
        toReturn.splice(0, 0, { componentType: "code-resource-settings" });
      }

      return toReturn;
    })
  );

  /**
   * The visual components that should be displayed.
   */
  readonly editorComponents: Observable<
    PlacedEditorComponent[]
  > = this.editorComponentDescriptions.pipe(
    map((components): PlacedEditorComponent[] =>
      components.map((c) => {
        // Resolved component and sane defaults for components that are displayed
        return {
          portal: this.getEditorComponentPortal(c),
          columnClasses: c.columnClasses || ["col-12"],
        };
      })
    )
  );

  /**
   * When something draggable enters the editor area itself there is no
   * possibility anything is currently dragged over a node. So we inform the
   * drag service about that.
   */
  public onEditorDragEnter(_evt: MouseEvent) {
    if (this._dragService.peekIsDragInProgress) {
      this._dragService.informDraggedOverEditor();
    }
  }
}

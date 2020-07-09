import {
  Component,
  ViewChild,
  TemplateRef,
  AfterViewInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { ToolbarService } from "../../shared/toolbar.service";

import { EditBlockLanguageService } from "./edit-block-language.service";
import {
  DestroyBlockLanguageMutationGQL,
  SelectionListGrammarsGQL,
} from "../../../generated/graphql";
import {map} from "rxjs/operators";

@Component({
  templateUrl: "templates/edit-block-language.html",
  providers: [EditBlockLanguageService],
})
export class EditBlockLanguageComponent implements AfterViewInit {
  @ViewChild("toolbarButtons")
  toolbarButtons: TemplateRef<any>;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _deleteBlockLanguageGQL: DestroyBlockLanguageMutationGQL,
    private _current: EditBlockLanguageService,
    private _grammarSelection:SelectionListGrammarsGQL,
    private _toolbarService: ToolbarService
  ) {}

  /**
   * All grammars that may be selected for the edited block language.
   */
  readonly availableGrammars = this._grammarSelection.watch().valueChanges
    .pipe(map(response => response.data.grammars.nodes))

  /**
   * A readable version of the grammar that is beeing edited.
   */
  readonly prettyPrintedGrammar = this._current.baseGrammarPrettyPrinted;

  ngAfterViewInit() {
    this._toolbarService.addItem(this.toolbarButtons);
  }

  get baseGrammarId() {
    return this.editedSubject.grammarId;
  }

  set baseGrammarId(id: string) {
    this._current.doUpdate((bl) => {
      bl.grammarId = id;
    });
  }

  // The block language that is currently beeing edited.
  get editedSubject() {
    return this._current.editedSubject;
  }

  // All errors that occured during generation
  get generatorErrors() {
    return this._current.generatorErrors;
  }

  // The pretty printed version of the block language
  get prettyPrintedBlockLanguage() {
    return this._current.prettyPrintedBlockLanguage;
  }

  /**
   * The user wants to add a new root CSS class
   */
  onAddCssRootClass(className: string) {
    if (!className) {
      return;
    }

    this._current.doUpdate((bl) => {
      if (!bl.rootCssClasses) {
        bl.rootCssClasses = [];
      }

      // Ensure no class is added twice
      if (!new Set(bl.rootCssClasses).has(className)) {
        bl.rootCssClasses.push(className);
      }
    });
  }

  /**
   * The user wants to remove a certain root css clas
   */
  onRemoveCssRootClass(className: string) {
    this._current.doUpdate((bl) => {
      bl.rootCssClasses = bl.rootCssClasses.filter((c) => c !== className);
    });
  }

  /**
   * Reruns the block language generator.
   */
  onRegenerate() {
    this._current.regenerate();
  }

  /**
   * Saves the current state of the block language
   */
  onSave() {
    this._current.save();
  }

  /**
   * User has decided to delete.
   */
  async onDelete() {
    await this._deleteBlockLanguageGQL.mutate({id:this.editedSubject.id}).toPromise();
    this._router.navigate([".."], { relativeTo: this._activatedRoute });
  }

  /**
   * The data for the generator has been updated.
   */
  onGeneratorDataUpdate(json: any) {
    this._current.updateGeneratorData(json);
  }

  /**
   * Wrapper for checkbox style operations for CSS root classes
   */
  static RootCssClass = class {
    constructor(
      readonly name: string,
      private readonly _parent: EditBlockLanguageComponent
    ) {}

    get checked() {
      return this._parent.editedSubject?.rootCssClasses?.includes(this.name);
    }

    set checked(v: boolean) {
      if (v) {
        this._parent.onAddCssRootClass(this.name);
      } else {
        this._parent.onRemoveCssRootClass(this.name);
      }
    }
  };

  readonly availableCssRootClasses = [
    new EditBlockLanguageComponent.RootCssClass("activate-block-outline", this),
    new EditBlockLanguageComponent.RootCssClass("activate-keyword", this),
    new EditBlockLanguageComponent.RootCssClass("activate-comment", this),
  ];
}

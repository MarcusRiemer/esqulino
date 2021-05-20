import { Injectable } from "@angular/core";

import { BehaviorSubject, Observable, combineLatest } from "rxjs";
import { map, filter, tap, shareReplay, switchMap } from "rxjs/operators";

import { ResourceReferencesService } from "../shared/resource-references.service";
import {
  CodeResource,
  NodeLocation,
  SyntaxTree,
  ValidationResult,
} from "../shared/syntaxtree";

import { ProjectService } from "./project.service";

/**
 * This service represents a single code resource that is currently beeing
 * edited. It glues together the actual resource that is beeing edited and
 * enables components like the validator and the compiler to automatically
 * do their work.
 */
@Injectable()
export class CurrentCodeResourceService {
  /**
   * The resource that is currently edited.
   */
  private _codeResource = new BehaviorSubject<CodeResource>(undefined);

  private _executionLocation = new BehaviorSubject<NodeLocation>(undefined);

  constructor(
    private _projectService: ProjectService,
    private _resourceReferences: ResourceReferencesService
  ) {}

  /**
   * Allows to change the resource that is currently displayed.
   *
   * @remarks This is meant to be updated in conjunction with the URL.
   */
  _changeCurrentResource(resource: CodeResource) {
    console.log(`Set new resource: "${resource.name}" (${resource.id})`);
    this._codeResource.next(resource);
  }

  /**
   * Informs interested components about the current resource.
   */
  readonly currentResource: Observable<CodeResource> = this._codeResource;

  /**
   * Informs interested components about the tree behind the current resource
   */
  readonly currentTree: Observable<SyntaxTree> = this._codeResource.pipe(
    filter((c) => !!c),
    switchMap((c) => c.syntaxTree$)
  );

  /**
   * The block language that is configured on the resource.
   */
  readonly resourceBlockLanguageId: Observable<string> = this.currentResource.pipe(
    filter((c) => !!c),
    switchMap((c) => c.blockLanguageId$)
  );

  readonly blockLanguage$ = this.resourceBlockLanguageId.pipe(
    switchMap((id) => this._resourceReferences.getBlockLanguage(id)),
    shareReplay(1)
  );

  readonly blockLanguageGrammar$ = this.blockLanguage$.pipe(
    switchMap((b) =>
      this._resourceReferences.getGrammarDescription(b.grammarId, {
        onMissing: "throw",
      })
    ),
    shareReplay(1)
  );

  readonly validator$ = combineLatest([
    this.currentResource,
    this.blockLanguage$,
  ]).pipe(
    // Both arguments must be available to have a validator
    filter(([c, b]) => !!c && !!b),
    switchMap(([c, b]) =>
      this._resourceReferences.getValidator(c.runtimeLanguageId, b.grammarId)
    ),
    shareReplay(1)
  );

  /**
   * @return The latest validation result for this resource.
   */
  readonly validationResult = combineLatest([
    this.currentTree,
    this._projectService.activeProject,
    this.validator$,
  ]).pipe(
    map(([tree, project, validator]) => {
      if (tree) {
        return validator.validateFromRoot(
          tree,
          project.additionalValidationContext
        );
      } else {
        return ValidationResult.EMPTY;
      }
    }),
    tap((r) => {
      console.log("CurrentCodeResourceService: Validation result", r);
    })
  );

  /**
   *
   */
  readonly currentExecutionLocation$: Observable<NodeLocation> = this._executionLocation.asObservable();

  /**
   * The currently loaded resource
   */
  get peekResource() {
    return this._codeResource.value;
  }

  /**
   * The currently edited syntaxtree
   */
  get peekSyntaxtree() {
    return this.peekResource.syntaxTreePeek;
  }

  /**
   * Broadcasts a new execution location.
   */
  setCurrentExecutionLocation(loc?: NodeLocation) {
    this._executionLocation.next(loc);
  }
}

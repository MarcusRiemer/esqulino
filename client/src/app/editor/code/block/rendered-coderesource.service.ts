import { Injectable, OnDestroy } from '@angular/core'

import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, distinctUntilChanged, flatMap, map, shareReplay } from 'rxjs/operators';

import { CodeResource, Validator, ValidationResult, Tree } from '../../../shared';
import { BlockLanguage } from '../../../shared/block';
import { ResourceReferencesService, RequiredResource } from '../../../shared/resource-references.service'
import { GrammarDataService } from '../../../shared/serverdata';

import { ProjectService } from '../../project.service';

/**
 * This service is provided at the root component that is used to render a coderesource.
 *
 * - Shares all data in the rendertree that is required "globally" by all components.
 * - Ensures that all dependant data is available
 *
 * The observables (suffixed with `$`) should be used in templates: This ensures as little as
 * possible unneeded change detection runs as possible.
 */
@Injectable()
export class RenderedCodeResourceService implements OnDestroy {

  private readonly _codeResource = new BehaviorSubject<CodeResource>(undefined);

  private readonly _blockLanguage = new BehaviorSubject<BlockLanguage>(undefined);

  private readonly _readOnly = new BehaviorSubject<boolean>(undefined);

  private readonly _resourcesFetched = new BehaviorSubject(false);

  // The validator must be accessible on the fly, so it must be a BehaviorSubject. The data
  // that flows in is connected by the constructor.
  private readonly _validator = new BehaviorSubject<Validator>(undefined);

  /**
   * @return The validator that should be used based on the current block language.
   *
   * @remarks Must be defined in the constructor, because the implementation requires the
   *          ResourceReferencesService to retrieve validator.
   */
  readonly validator$: Observable<Validator>;

  readonly syntaxTree$: Observable<Tree> = this._codeResource.pipe(
    flatMap(c => c.syntaxTree)
  );

  // The validator must be accessible on the fly, so it must be a BehaviorSubject. The data
  // that flows in is connected by the constructor.
  private readonly _syntaxTree = new BehaviorSubject<Tree>(undefined);

  // All manual subscriptions that are part of this service
  private _subscriptions: Subscription[] = [];

  constructor(
    private _resourceReferences: ResourceReferencesService,
    private _grammarData: GrammarDataService,
    private _projectService: ProjectService,
  ) {
    // TODO: Remove this indirection step by using a proper guard that ensures
    //       everything is loaded exactly once for a certain page.
    const blockLanguageGrammar$ = this.blockLanguage$.pipe(
      flatMap(b => this._grammarData.getLocal(b.grammarId, "request")),
    )

    this.validator$ = combineLatest(blockLanguageGrammar$, this.codeResource$).pipe(
      map(([g, c]) => this._resourceReferences.getValidator(c.emittedLanguageIdPeek, g.id)),
    );

    const subValidator = this.validator$.subscribe(this._validator);
    const subTree = this.syntaxTree$.subscribe(this._syntaxTree);

    this._subscriptions = [subValidator, subTree];
  }

  ngOnDestroy() {
    // Better safe than sorry: Avoiding circular references
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }


  readonly codeResource$ = this._codeResource.pipe(
    filter(c => !!c),
    distinctUntilChanged()
  );

  readonly blockLanguage$ = this._blockLanguage.pipe(
    filter(c => !!c),
    distinctUntilChanged()
  );

  readonly readOnly$ = this._readOnly.pipe(
    // `false` is well ... falsy
    filter(c => typeof c === "undefined"),
    distinctUntilChanged()
  );

  /**
   * @return True, if everything is ready to be rendered
   */
  readonly dataAvailable$: Observable<boolean> = this._resourcesFetched.asObservable();

  private readonly _validationContext$ = this._projectService.activeProject.pipe(
    map(p => p.additionalValidationContext)
  );

  readonly validationResult$ = combineLatest(
    this.dataAvailable$,
    this.validator$,
    this.syntaxTree$,
    this._validationContext$
  ).pipe(
    filter(([available, ..._]) => available),
    distinctUntilChanged(),
    map(([_, v, t, vc]) => t ? v.validateFromRoot(t, vc) : ValidationResult.EMPTY),
    shareReplay(1)
  );

  get codeResource() {
    return this._codeResource.value;
  }

  get blockLanguage() {
    return this._blockLanguage.value;
  }

  get readOnly() {
    return this._readOnly.value;
  }

  get validator() {
    return this._validator.value;
  }

  get syntaxTree() {
    return this._syntaxTree.value;
  }

  _updateRenderData(
    codeResource: CodeResource,
    blockLanguage: BlockLanguage,
    readOnly: boolean,
  ) {
    const newBlockLang = blockLanguage || codeResource.blockLanguagePeek;
    const requiredResources: RequiredResource[] = [
      { type: "blockLanguage", id: newBlockLang.id },
      { type: "grammar", id: newBlockLang.grammarId },
    ];

    const fetchRequired = !this._resourceReferences.hasResources(requiredResources);

    console.log(`Preparing to render syntaxtree of code resource: `, codeResource);
    console.log(`Required resources:`, requiredResources);
    console.log(`Requires fetch:`, fetchRequired);

    // If required resources are missing: Immediately block any rendering and possibly resolve
    // it later.
    if (fetchRequired) {
      this._resourcesFetched.next(false);
      this._resourceReferences.ensureResources(requiredResources)
        .then(res => this._resourcesFetched.next(res))
    } else {
      this._resourcesFetched.next(true);
    }

    this._codeResource.next(codeResource);
    this._readOnly.next(readOnly);
    this._blockLanguage.next(newBlockLang);


  }
}
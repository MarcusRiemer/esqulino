import { Injectable } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Title } from '@angular/platform-browser'

import { BehaviorSubject } from 'rxjs'
import { switchMap, map, first, filter, flatMap } from 'rxjs/operators'

import { GrammarDataService, BlockLanguageDataService } from '../../shared/serverdata'
import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { generateBlockLanguage, validateGenerator } from '../../shared/block/generator/generator'
import { prettyPrintBlockLanguage } from '../../shared/block/prettyprint'
import { GeneratorError } from '../../shared/block/generator/error.description'
import { prettyPrintGrammar } from '../../shared/syntaxtree';
import { DEFAULT_GENERATOR } from '../../shared/block/generator/generator.description';

@Injectable()
export class EditBlockLanguageService {
  // The block language that is beeing edited.
  private _editedSubject = new BehaviorSubject<BlockLanguageDescription>(undefined);

  // All off the current errors
  public generatorErrors: GeneratorError[] = [];

  // The prettyprinted version of the block language
  public prettyPrintedBlockLanguage = "";

  constructor(
    private _serverData: BlockLanguageDataService,
    private _grammarData: GrammarDataService,
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
  ) {
    // Ensures that a block language that matches the URL is loaded.
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('blockLanguageId')),
        switchMap((id: string) => this._serverData.getSingle(id).pipe(first())),
      ).subscribe(blockLanguage => {
        this._editedSubject.next(blockLanguage);
      });

    // Update the title of the page according to the current language
    this._editedSubject
      .pipe(filter(bl => !!bl))
      .subscribe(blockLanguage => {
        this._title.setTitle(`BlockLang "${blockLanguage.name}" - Admin - BlattWerkzeug`)
        this.prettyPrintedBlockLanguage = prettyPrintBlockLanguage(this.editedSubject);
      });
  }

  /**
   * The grammar that is the basis for this block language.
   */
  readonly baseGrammar = this._editedSubject.pipe(
    flatMap(blockLang => this._grammarData.getSingle(blockLang.grammarId))
  )

  /**
   * A human readable version of that grammar.
   */
  readonly baseGrammarPrettyPrinted = this.baseGrammar.pipe(
    map(grammar => prettyPrintGrammar(grammar))
  );

  /**
   * @return The currently edited block language
   */
  get editedSubject(): BlockLanguageDescription {
    return (this._editedSubject.value);
  }

  /**
   * Allows to update the currently edited block language and broadcasts the
   * changes afterwards.
   *
   * @param change A callback function that is expected to change the block language.
   */
  doUpdate(change: (bl: BlockLanguageDescription) => BlockLanguageDescription | void) {
    // Give the caller a chance to change the root reference
    let changedValue = change(this._editedSubject.value);

    // No return value? Then assume that something was changed inside the reference
    if (!changedValue) {
      changedValue = this._editedSubject.value;
    }

    // That JSON-wrapping and unwrapping is a dirty hack to ensure that the
    // Angular change detector "sees" a new object.
    this._editedSubject.next(JSON.parse(JSON.stringify(changedValue)));
  }

  /**
   * Reruns the block language generator.
   */
  regenerate() {
    // Grab the instructions or assume default instructions
    const instructions = this.editedSubject.localGeneratorInstructions || DEFAULT_GENERATOR;

    // Ensure the instructions are valid
    // TODO: Do actual validation again
    this.generatorErrors = []; // await this._schemaValidator.validate("BlockLanguageGeneratorDocument", instructions);

    // And do something meaningful if they are
    if (this.generatorErrors.length === 0) {
      // Fetch the actual grammar that should be used
      this._grammarData
        .getSingle(this.editedSubject.grammarId, true)
        .pipe(first())
        .subscribe(g => {
          try {
            this.generatorErrors.push(...validateGenerator(instructions));
          } catch (e) {
            this.generatorErrors.push({
              type: "Unexpected",
              message: "Could not validate block language",
              exception: e
            });
          }

          if (this.generatorErrors.length === 0) {
            this.doUpdate(blockLanguage => {
              // Try to generate the block language itself. If this fails something is
              // seriously wrong and we should probably do something smart about it.
              try {
                return (generateBlockLanguage(blockLanguage, instructions, g));
              } catch (e) {
                // Pass on the error
                this.generatorErrors.push({
                  type: "Unexpected",
                  message: "Could not generate block language",
                  exception: e
                });
                // But don't change the language
                return (blockLanguage);
              }
            });
          }
        });
    }
  }

  /**
   * Saves the current state of the block language
   */
  save() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }

  /**
   * The data for the generator has been updated.
   */
  updateGeneratorData(json: any) {
    this.doUpdate(blockLanguage => {
      blockLanguage.localGeneratorInstructions = json;
    })
  }
}

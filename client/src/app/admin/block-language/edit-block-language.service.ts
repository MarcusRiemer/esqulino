import { Injectable } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Title } from '@angular/platform-browser'

import { BehaviorSubject } from 'rxjs'
import { switchMap, map, first, filter } from 'rxjs/operators'

import { JsonSchemaValidationService } from '../json-schema-validation.service'

import { ServerDataService } from '../../shared/server-data.service'
import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { generateBlockLanguage, validateGenerator } from '../../shared/block/generator/generator'
import { prettyPrintBlockLanguage } from '../../shared/block/prettyprint'
import { GeneratorError } from '../../shared/block/generator/error.description'

@Injectable()
export class EditBlockLanguageService {
  // The block language that is beeing edited.
  private _editedSubject = new BehaviorSubject<BlockLanguageDescription>(undefined);

  // All off the current errors
  public generatorErrors: GeneratorError[] = [];

  // The prettyprinted version of the block language
  public prettyPrintedBlockLanguage = "";

  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
    private _schemaValidator: JsonSchemaValidationService,
  ) {
    // Ensures that a block language that matches the URL is loaded.
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('blockLanguageId')),
        switchMap((id: string) => this._serverData.getBlockLanguage(id).pipe(first())),
    ).subscribe(blockLanguage => {
      this._editedSubject.next(blockLanguage);
    });

    this._editedSubject
      .pipe(filter(bl => !!bl))
      .subscribe(blockLanguage => {
        this._title.setTitle(`BlockLang "${blockLanguage.name}" - Admin - BlattWerkzeug`)
        this.doPrettyPrint();
      });
  }

  /**
   * @return The currently edited block language
   */
  get editedSubject(): Readonly<BlockLanguageDescription> {
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
  async regenerate() {
    // Grab the instructions or assume default instructions
    const instructions = this.editedSubject.localGeneratorInstructions || {};

    // Ensure the instructions are valid
    this.generatorErrors = await this._schemaValidator.validate("BlockLanguageGeneratorDocument", instructions);

    // And do something meaningful if they are
    if (this.generatorErrors.length === 0) {
      // Fetch the 
      this._serverData
        .getGrammarDescription(this.editedSubject.grammarId)
        .pipe(first())
        .subscribe(g => {
          this.generatorErrors.push(...validateGenerator(instructions, g));

          if (this.generatorErrors.length === 0) {
            this.doUpdate(blockLanguage => {
              // Try to generate the block language itself. If this fails something is
              // seriously wrong and we should probably do something smart about it.          
              try {
                return (generateBlockLanguage(blockLanguage, instructions, g));
              } catch (e) {
                this.generatorErrors.push({
                  type: "Unexpected",
                  message: "Could not generate block language",
                  exception: e
                });
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
  onSave() {
    this._serverData.updateBlockLanguage(this.editedSubject);
  }

  /**
   * The data for the generator has been updated.
   */
  onGeneratorDataUpdate(json: any) {
    this.doUpdate(blockLanguage => {
      blockLanguage.localGeneratorInstructions = json;
    })
  }

  private doPrettyPrint() {
    this.prettyPrintedBlockLanguage = prettyPrintBlockLanguage(this.editedSubject);
  }
}

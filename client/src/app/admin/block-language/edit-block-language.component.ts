import { Component, OnInit } from '@angular/core'
import { ActivatedRoute, ParamMap } from '@angular/router'
import { Title } from '@angular/platform-browser'

import { switchMap, map, first } from 'rxjs/operators'

import { ServerDataService } from '../../shared/server-data.service'

import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { generateBlockLanguage, validateGenerator } from '../../shared/block/generator/generator'
import { prettyPrintBlockLanguage } from '../../shared/block/prettyprint'
import { GeneratorError } from '../../shared/block/generator/error.description';

@Component({
  templateUrl: 'templates/edit-block-language.html'
})
export class EditBlockLanguageComponent implements OnInit {
  // The block language that is beeing edited.
  public editedSubject: BlockLanguageDescription;

  public generatorErrors: GeneratorError[] = [];

  // The prettyprinted version of the block language
  prettyPrintedBlockLanguage = "";

  constructor(
    private _serverData: ServerDataService,
    private _activatedRoute: ActivatedRoute,
    private _title: Title,
  ) {
  }

  readonly availableGrammars = this._serverData.listGrammars.value;

  /**
   * Ensures that a block language that matches the URL is loaded.
   */
  ngOnInit() {
    this._activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('blockLanguageId')),
        switchMap((id: string) => this._serverData.getBlockLanguage(id).pipe(first())),
    ).subscribe(blockLanguage => {
      this._title.setTitle(`BlockLang "${blockLanguage.name}" - Admin - BlattWerkzeug`)
      this.editedSubject = blockLanguage;
      this.doPrettyPrint();
    });
  }

  /**
   * Reruns the block language generator.
   */
  onRegenerate() {
    this._serverData
      // Fetch the grammar 
      .getGrammarDescription(this.editedSubject.grammarId)
      // That is never required to be updated
      .pipe(first())
      .subscribe(g => {
        // Grab the instructions or assume default instructions
        const instructions = this.editedSubject.localGeneratorInstructions || {};

        this.generatorErrors = validateGenerator(instructions, g);

        if (this.generatorErrors.length === 0) {
          // Try to generate the block language itself. If this fails something is
          // seriously wrong and we should probably do something smart about it.
          try {
            this.editedSubject = generateBlockLanguage(this.editedSubject, instructions, g);
          } catch (e) {
            this.generatorErrors.push({
              type: "Unexpected",
              message: "Could not generate block language",
              exception: e
            });
            return;
          }

          // Update the nicer, visual representation of the block language. If this fails
          // the user has no idea that the generation was actually succesfull because
          // this is the only feedback he gets.
          try {
            this.doPrettyPrint();
          } catch (e) {
            this.generatorErrors.push({
              type: "Unexpected",
              message: "Could not pretty print block language",
              exception: e
            });
            return;
          }
        }
      });
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
    try {
      this.editedSubject.localGeneratorInstructions = json;
      this.onRegenerate();
    } catch (e) {
      console.log("Regeneration failed", e);
    }
  }

  private doPrettyPrint() {
    this.prettyPrintedBlockLanguage = prettyPrintBlockLanguage(this.editedSubject);
  }
}

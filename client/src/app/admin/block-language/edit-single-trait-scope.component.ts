import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

import { first, map, tap } from "rxjs/operators";

import { GrammarDataService } from "../../shared/serverdata";
import { ScopeTraitAdd } from "../../shared/block/generator/traits.description";
import {
  FullNodeAttributeDescription,
  getFullQualifiedAttributes,
  getConcreteTypes,
} from "../../shared/syntaxtree/grammar-util";

import { EditBlockLanguageService } from "./edit-block-language.service";

/**
 * Complete path to a targeted attribute.
 */
interface TargetAttribute {
  grammar: string;
  type: string;
  attribute: string;
}

/**
 * Complete path to a targeted block.
 */
interface TargetBlock {
  grammar: string;
  type: string;
  index: number;
}

/**
 * Allows editing a single trait scope.
 */
@Component({
  templateUrl: "templates/edit-single-trait-scope.html",
  selector: "edit-single-trait-scope",
})
export class EditSingleTraitScopeComponent implements OnInit, OnChanges {
  constructor(
    private _editedBlockLanguageService: EditBlockLanguageService,
    private _grammarData: GrammarDataService
  ) {}

  /**
   * The scope to edit here.
   */
  @Input() scope: ScopeTraitAdd;

  // The form control for a trait name that could be added
  formControlTraitName = new FormControl();

  // The form control for an attribute that could be targeted
  formControlAttribute = new FormControl();

  // The form control for a block that could be added
  formControlBlock = new FormControl();

  // These attributes are currently targeted
  attributeTargetList: TargetAttribute[] = [];

  // These blocks are currently targeted
  blockTargetList: TargetBlock[] = [];

  // All attributes that could possibly occur
  allPossibleAttributes: FullNodeAttributeDescription[] = [];

  // All blocks that could possibly occur
  allPossibleBlocks: TargetBlock[] = [];

  /**
   * Used to get hold of the grammar that is used by this block language.
   */
  ngOnInit() {
    this._grammarData
      .getSingle(this._editedBlockLanguageService.editedSubject.grammarId)
      .pipe(first())
      .subscribe((g) => {
        this.allPossibleAttributes = getFullQualifiedAttributes(g);
        this.allPossibleBlocks = getConcreteTypes(g).map((b) => {
          return {
            grammar: b.languageName,
            type: b.typeName,
            index: 0,
          };
        });
      });
  }

  /**
   * Updates attributes that are too costly to be re-calculated on demand.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.scope) {
      this.updateAttributeTargetList();
      this.updateBlockTargetList();
    }
  }

  /**
   * Updates the list of attributes that are currently targeted.
   */
  private updateAttributeTargetList() {
    this.attributeTargetList = [];
    Object.entries(this.scope.attributes || {}).forEach(
      ([grammarName, types]) => {
        Object.entries(types || {}).forEach(([typeName, attributes]) => {
          (attributes || []).forEach((attributeName) => {
            this.attributeTargetList.push({
              grammar: grammarName,
              type: typeName,
              attribute: attributeName,
            });
          });
        });
      }
    );
  }

  private updateBlockTargetList() {
    this.blockTargetList = [];
    Object.entries(this.scope.blocks || {}).forEach(([grammarName, blocks]) => {
      Object.entries(blocks || {}).forEach(([blockName, indices]) => {
        (indices || []).forEach((index) => {
          this.blockTargetList.push({
            grammar: grammarName,
            type: blockName,
            index: index,
          });
        });
      });
    });
  }

  /**
   * All possible trait values for autocompletion
   */
  get autocompleteTrait() {
    const instructions = this._editedBlockLanguageService.editedSubject
      .localGeneratorInstructions;
    if (instructions && instructions.type === "manual") {
      return Object.keys(instructions.traits || {}).filter(
        (traitName) => this.scope.traits.indexOf(traitName) < 0
      );
    } else {
      return [];
    }
  }

  /**
   * The user has decided to remove a trait, it should not longer be applied by this scope.
   */
  removeTrait(traitName: string) {
    this._editedBlockLanguageService.doUpdate((_bl) => {
      const index = this.scope.traits.indexOf(traitName);
      this.scope.traits.splice(index, 1);
    });
  }

  /**
   * The user has decided to add a new trait that will be applied by this scope.
   */
  selectedTrait(event: MatAutocompleteSelectedEvent) {
    this._editedBlockLanguageService.doUpdate((_bl) => {
      this.scope.traits.push(event.option.value);
    });
  }

  readonly filteredAvailableAttributes = this.formControlAttribute.valueChanges.pipe(
    map((value) =>
      this.allPossibleAttributes.filter(
        (option) =>
          option.languageName.includes(value) ||
          option.typeName.includes(value) ||
          (option.name && option.name.includes(value))
      )
    )
  );

  /**
   * The user has decided to add a new attribute that this scope will be applied to.
   */
  selectedAttribute(event: MatAutocompleteSelectedEvent) {
    this._editedBlockLanguageService.doUpdate((_bl) => {
      const attr: FullNodeAttributeDescription = event.option.value;
      if (!this.scope.attributes) {
        this.scope.attributes = {};
      }
      if (!this.scope.attributes[attr.languageName]) {
        this.scope.attributes[attr.languageName] = {};
      }
      if (!this.scope.attributes[attr.languageName][attr.typeName]) {
        this.scope.attributes[attr.languageName][attr.typeName] = [];
      }
      if (
        this.scope.attributes[attr.languageName][attr.typeName].indexOf(
          attr.name
        ) < 0
      ) {
        this.scope.attributes[attr.languageName][attr.typeName].push(attr.name);
      }
    });
  }

  /**
   * The user has decided that a certain attribute should no longer be targeted.
   */
  removeTargetAttribute(a: TargetAttribute) {
    this._editedBlockLanguageService.doUpdate((_) => {
      const targetList = this.scope.attributes[a.grammar][a.type];
      const targetIndex = targetList.indexOf(a.attribute);
      targetList.splice(targetIndex, 1);
    });
  }

  removeTargetBlock(b: TargetBlock) {
    this._editedBlockLanguageService.doUpdate((_) => {
      const targetList = this.scope.blocks[b.grammar][b.type];
      const targetIndex = targetList.indexOf(b.index);
      targetList.splice(targetIndex, 1);
    });
  }

  readonly filteredAvailableBlocks = this.formControlBlock.valueChanges.pipe(
    map((value) =>
      this.allPossibleBlocks.filter(
        (option) =>
          option.grammar.includes(value) ||
          option.type.includes(value) ||
          option.index === value
      )
    ),
    tap(console.log)
  );

  /**
   * The user has decided to add a new attribute that this scope will be applied to.
   */
  selectedBlock(event: MatAutocompleteSelectedEvent) {
    this._editedBlockLanguageService.doUpdate((_bl) => {
      const block: TargetBlock = event.option.value;
      if (!this.scope.blocks) {
        this.scope.blocks = {};
      }

      if (!this.scope.blocks[block.grammar]) {
        this.scope.blocks[block.grammar] = {};
      }

      if (!this.scope.blocks[block.grammar][block.type]) {
        this.scope.blocks[block.grammar][block.type] = [];
      }

      if (
        this.scope.blocks[block.grammar][block.type].indexOf(block.index) < 0
      ) {
        this.scope.blocks[block.grammar][block.type].push(block.index);
      }
    });
  }
}

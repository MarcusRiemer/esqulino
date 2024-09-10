import { Component } from "@angular/core";

import { CurrentCodeResourceService } from "../current-coderesource.service";
import { ErrorCodes, ValidationError } from "src/app/shared";
import { Observable } from "rxjs";
import { map, reduce } from "rxjs/operators";
interface HumanValidationError extends ValidationError {
  humanError: string;
}

/**
 * Informs the user about possible errors in his trees,
 */
@Component({
  templateUrl: "templates/validation.html",
  styleUrls: ["templates/validation.css"],
})
export class ValidationComponent {
  constructor(private _currentCodeResource: CurrentCodeResourceService) {}

  readonly codeResource$ = this._currentCodeResource.currentResource;

  readonly result$ = this._currentCodeResource.validationResult;
  readonly errors$: Observable<Readonly<HumanValidationError[]>> =
    this.result$.pipe(
      map((result) =>
        result.errors.map((e) => {
          return { ...e, humanError: this.humanError(e.code) };
        })
      )
    );

  humanError(code: string): string {
    switch (code) {
      case ErrorCodes.Empty:
        return "Der AST existiert nicht";
      case ErrorCodes.UnspecifiedRoot:
        return "Der AST kann nicht evaluiert werden, da nicht klar ist welche Wurzel verwendet wird";
      case ErrorCodes.UnknownRoot:
        return "Der AST hat einen Wurzelknoten, der zu keinem der erlaubten Wurzelknoten passt";
      case ErrorCodes.UnknownRootLanguage:
        return "Der AST hat einen Wurzelknoten in einer unbekannten Sprache";
      case ErrorCodes.UnexpectedType:
        return "Es wurde explizit ein anderer Typ erwartet";
      case ErrorCodes.TransientNode:
        return 'Es wurde ein Knoten mit dem Typ "transient" gefunden';
      case ErrorCodes.MissingChild:
        return "Es wurde ein bestimmtes Kind erwartet, dass allerdings nicht existiert.";
      case ErrorCodes.SuperflousChild:
        return "A specific child was entirely unexpected";
      case ErrorCodes.InvalidMaxOccurences:
        return "Eins oder mehrere Kinder kommen zu oft vor (angesichts der erlaubten Beschränkungnen)";
      case ErrorCodes.InvalidMinOccurences:
        return "Eins oder mehrer Kinder kommen nicht oft genug vor (angesichts der erlaubten Beschränkungnen)";
      case ErrorCodes.MissingProperty:
        return "Eine Eigenschaft wurde erwartet. Diese existiert jedoch nicht.";
      case ErrorCodes.IllegalPropertyType:
        return "Eine Eigenschaft verletzt eine Beschränkung";
      case ErrorCodes.IllegalChildType:
        return "Ein Kind ist anwesend, aber der Typ wurde nicht erfragt";
      case ErrorCodes.SuperflousChildCategory:
        return "Ein Typ erwähnt eine Kind Kategorie, die nicht im Wurzelknoten vorhanden ist";
      case ErrorCodes.NoChoiceMatching:
        return "Es wurde keine Übereinstimmung zwischen Wurzelknoten und Auswahlmöglichkeit gefunden.";
      case ErrorCodes.NoChoiceNodeAvailable:
        return "Es sollte ein Wurzelknoten vorhanden sein.";
      case ErrorCodes.SuperflousChoiceNodeAvailable:
        return "Es wurden zu viele Wurzelknoten gefunden Es sollt nur genau einen Wurzelknoten geben.";
      case ErrorCodes.ParenthesesEmptyTypes:
        return "Eine Gruppe von Klammern haben keinen Typ und sind deshalb unentschlossen.";
      case ErrorCodes.InvalidResourceId:
        return "Der String sollte eine ID sein.";
      case "UNKNOWN_TABLE":
        return "Die Tabelle ist nicht bekannt.";
      case "UNKNOWN_COLUMN":
        return "Die Tabellenspalte ist nicht bekannt.";
      case "TABLE_NOT_IN_FROM":
        return "Die Tabelle ist nicht im FROM";
      case "DUPLICATE_TABLE_NAME":
        return "Es liegt eine Dopplung vom Tabellennamen vor";
      case "AGGREGATION_WITHOUT_GROUP_BY":
        return 'Ansammlung ohne ein "GROUP BY"';
      default:
        return "Kein Fehlercode bekannt";
    }
  }
}

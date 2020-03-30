import { Component } from "@angular/core";
import { GrammarDataService } from "../../shared/serverdata";

@Component({
  selector: "grammar-overview-selector",
  templateUrl: "./templates/overview-grammar.html",
})
export class OverviewGrammarComponent {
  constructor(private _serverData: GrammarDataService) {}

  public get availableGrammars() {
    return this._serverData.listCache;
  }

  public deleteGrammar(id: string) {
    this._serverData.deleteSingle(id);
  }
}

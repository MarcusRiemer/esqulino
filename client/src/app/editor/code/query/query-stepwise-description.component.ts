import { Component, Input } from "@angular/core";

import { SqlStepDescription } from "../../../shared/syntaxtree/sql/sql-steps";

@Component({
  templateUrl: "templates/query-stepwise-description.html",
  selector: "query-stepwise-description",
})
export class QueryStepwiseDescriptionComponent {
  @Input()
  step: SqlStepDescription;

  descText: string = "";

  ngOnInit(): void {
    this.createDescription();
  }

  ngOnChanges(model: any) {
    this.createDescription();
  }

  createDescription() {
    switch (this.step.description.type) {
      case "crossJoin":
        this.descText =
          "Anwendung des Cross Join.\nKarteischen Produkt der Tabellen " +
          this.step.description.tables[0] +
          " und " +
          this.step.description.tables[1] + ".";
        break;
      case "innerJoin":
        this.descText =
          "Anwendung des Inner Join.\nInnere Verknüpfung der Tabellen " +
          this.step.description.tables[0] +
          " und " +
          this.step.description.tables[1];
        break;
      case "outerJoin":
        this.descText =
          "Anwendung des Outer Join.\nAüßere Verknüpfung der Tabellen " +
          this.step.description.tables[0] +
          " und " +
          this.step.description.tables[1];
        break;
      case "on":
        this.descText =
          "Anwendung des ON-Filter.\nAuswertung der JOIN-Bedingung " +
          this.step.description.expressions +
          " für jede Zeile der Tabelle.";
        break;
      case "using":
        this.descText =
          "Anwendung des USING-Filter.\nAuswertung der JOIN-Bedingung " +
          this.step.description.expressions +
          " für jede Zeile der Tabelle.";
        break;
      case "where":
        this.descText =
          "Filterung nach der WHERE-Klausel. Auswahl der Zeilen, die das Kriterium\n";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + ", ";
        });
        this.descText = this.descText.slice(0, -2);
        this.descText += "\nerfüllen.";
        break;
      case "groupBy":
        this.descText =
          "Anwendung der Gruppierung.\nDazu werden die Zeilen der Tabelle entsprechend der Werte \n";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + ", ";
        });
        this.descText = this.descText.slice(0, -2);
        this.descText += "\nin Gruppen angeordnet.";
        break;
      case "select":
        this.descText =
          "Anwendung der SELECT-Auswahl. Dazu wird eine Tabelle mit den angegeben Spalten\n";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + ", ";
        });
        this.descText = this.descText.slice(0, -2);
        this.descText += "\nerstellt.";
        break;
      case "orderBy":
        this.descText =
          "Ordnen der Einträge entsprechend der Ausdrücke\n";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + ", ";
        });
        this.descText = this.descText.slice(0, -2);
        this.descText += "\naus der ORDER BY-Klausel.";
        break;
      default:
        this.descText = "TODO edit desc";
    }
  }
}

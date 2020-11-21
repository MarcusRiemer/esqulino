import { Component, Input } from "@angular/core";

import { SqlStepDescription } from "../../../shared/syntaxtree/sql/sql-steps";

@Component({
  templateUrl: "templates/query-stepwise-description.html",
  selector: "query-stepwise-description",
})
export class QueryStepwiseDescriptionComponent {
  @Input()
  step: SqlStepDescription;

  public descText: string = "";

  ngOnChanges() {
    this.createDescription();
  }

  createDescription() {
    switch (this.step.description.type) {
      case "from":
        this.descText =
          "Verarbeitung der FROM-Klausel. Dazu wird im ersten Schritt wird die Tabelle " +
          this.step.description.table +
          " mit allen Ihren Spalten gebidlet.";
        break;
      case "crossJoin":
        this.descText =
          "Anwendung des Cross Join. Hierbei wird das kartesische Produkt der Tabellen '" +
          this.step.description.tables[0] +
          "' und '" +
          this.step.description.tables[1] +
          "' gebildet.";
        break;
      case "innerJoin":
        this.descText =
          "Anwendung des Inner Join. Innere Verknüpfung der Tabellen '" +
          this.step.description.tables[0] +
          "' und '" +
          this.step.description.tables[1] +
          "'.";
        break;
      case "outerJoin":
        this.descText =
          "Anwendung des Outer Join. Aüßere Verknüpfung der Tabellen '" +
          this.step.description.tables[0] +
          "' und '" +
          this.step.description.tables[1] +
          "'.";
        break;
      case "on":
        this.descText =
          "Anwendung des ON-Filter. Auswertung der JOIN-Bedingung '" +
          this.step.description.expressions +
          "' für jede Zeile der Tabelle.";
        break;
      case "using":
        this.descText =
          "Anwendung des USING-Filter. Auswertung der JOIN-Bedingung '" +
          this.step.description.expressions +
          "' für jede Zeile der Tabelle.";
        break;
      case "where":
        this.descText =
          "Filterung nach der WHERE-Klausel. Auswahl der Zeilen, die ";
        /*this.descText +=
          this.step.description.expressions.length > 1
            ? "die Kriterien '"
            : "das Kriterium '";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + "', '";
        });
        this.descText = this.descText.slice(0, -3);*/
        this.descText += "das Kriterium " + this.step.description.expressions;
        this.descText += " erfüllen.";
        break;
      case "groupBy":
        this.descText =
          "Anwendung der Gruppierung. Dazu werden die Zeilen der Tabelle entsprechend der Werte '";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + "', '";
        });
        this.descText = this.descText.slice(0, -3);
        // ... zusammengefasst / aggregiert / gruppiert
        this.descText +=
          " in Gruppen angeordnet und im Folgenden als ein Datensatz (Zeile) in der Tabelle zusammengefast.";
        break;
      case "select":
        this.descText = "Anwendung der SELECT-Auswahl. ";
        if (
          this.step.description.expressions.length == 1 &&
          this.step.description.expressions[0] == "*"
        ) {
          this.descText +=
            "Durch die Angabe des Stern-Operators, werden alle Spalten der Tabelle für die Ausgabetabelle übernommen.";
        } else {
          this.descText += "Dazu wird eine Tabelle mit ";
          this.descText +=
            this.step.description.expressions.length > 1
              ? "den angegeben Spalten '"
              : "der angegeben Spalte '";
          this.step.description.expressions.forEach((exp) => {
            this.descText += exp + "', '";
          });
          this.descText = this.descText.slice(0, -3);
          this.descText += " erstellt.";
        }
        break;
      case "distinct":
        this.descText =
          "Anwendung des DISTINCT. Hierbei werden alle Duplikate, die sich aus den Spalten von ";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + "', '";
        });
        this.descText = this.descText.slice(0, -3);
        this.descText += " ergeben, eliminiert.";
        break;
      case "orderBy":
        this.descText = "Ordnen der Einträge entsprechend ";
        this.descText +=
          this.step.description.expressions.length > 1
            ? "der Ausdrücke '"
            : "des Ausdrucks '";
        this.step.description.expressions.forEach((exp) => {
          this.descText += exp + "', '";
        });
        this.descText = this.descText.slice(0, -3);
        this.descText += " aus der ORDER BY-Klausel.";
        break;
      default:
        this.descText = "TODO edit desc";
    }
  }
}

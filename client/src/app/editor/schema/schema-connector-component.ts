import { Component, Input } from "@angular/core";

@Component({
  selector: "schema-connectors",
  templateUrl: "templates/connectors.svg",
})
export class SchemaConnectorComponent {
  @Input() connectors: any;
}

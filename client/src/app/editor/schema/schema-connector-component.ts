import { Component, Input, OnInit } from "@angular/core";
import { Connector } from "../schema.service";

@Component({
  selector: "schema-connectors",
  templateUrl: "templates/connectors.svg",
})
export class SchemaConnectorComponent implements OnInit {
  /**
   * List of connector properties
   */
  @Input() connectors: Connector[];

  @Input() height: number;

  public viewBox: string;

  public transform: string;

  ngOnInit() {
    this.viewBox = "0.00 0.00 1605.00 " + this.height;
    this.transform = "translate(0 " + this.height + ")";
  }
}

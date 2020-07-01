import { Component, Input, OnInit } from '@angular/core';


@Component({
  selector: 'schema-connectors',
  templateUrl: 'templates/connectors.svg'
})
export class SchemaConnectorComponent {
	
	@Input() connectors : any;
	
	getPath(line: any): string {
		let path = "M" + line[0].x + "," + (line[0].y);
		
		for(var i = 1; i < line.length; i++){
			path = path + "L" + line[i].x + "," + (line[i].y);
		}
		
		return path;
	}	
}
import {Component} from 'angular2/core';
import {ProjectListComponent} from './project.component';
import {Project} from './project'

@Component({
    selector: 'sql-scratch',
    templateUrl: 'app/templates/index.html',
    directives: [ProjectListComponent]
})

export class SqlScratchComponent {
    title = 'SQL-Pad 2'
}

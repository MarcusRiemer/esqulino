import {Component} from 'angular2/core';
import {Project} from './project'

@Component({
    selector: 'project-list',
    templateUrl: 'app/templates/project-list.html'
})

export class ProjectListComponent {
    projects = [{"name":"abc"}, {"name":"def"}]

    doSomething() {
        console.log("I have done something");
    }
}

import {Component, OnInit} from 'angular2/core';
import {ProjectService} from './project.service'
import {Project} from './project'

@Component({
    selector: 'project-list',
    templateUrl: 'app/templates/project-list.html'
})
export class ProjectListComponent implements OnInit {
    public projects : Project[]

    
    constructor(private _projectService: ProjectService) { }

    ngOnInit() {
        this._projectService.getProjects().then(projects => this.projects = projects)
    }
    
    doSomething() {
        console.log("I have done something");
    }
}

@Component({
    selector: 'project-detail',
    templateUrl: 'app/templates/project-detail.html'
})
export class ProjectDetailComponent {

}

import {Component, OnInit}                 from '@angular/core'
import {ProjectCreationDescription}        from '../shared/project.description'

@Component({
    templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {
    public params : ProjectCreationDescription = {
        id : "",
        name : "",
        admin : {
            name : "",
            password : ""
        },
        dbType : "sqlite3"
    };
}

import {Component, OnInit}                 from '@angular/core'

import {ProjectCreationDescription}        from '../shared/project.description'
import {ServerApiService}                  from '../shared/serverapi.service'
import {CURRENT_API_VERSION}               from '../shared/resource.description'

@Component({
    templateUrl: 'templates/create-project.html'
})
export class CreateProjectComponent {
    public params : ProjectCreationDescription = {
        apiVersion : CURRENT_API_VERSION,
        id : "",
        name : "",
        admin : {
            name : "",
            password : ""
        },
        dbType : "sqlite3",
        basedOn : ""
    };

    createProject() {
        
    }
}

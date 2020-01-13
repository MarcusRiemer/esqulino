import { Component } from '@angular/core'

import { ProjectDataService } from '../shared/serverdata';

/**
 * Lists all publicly available projects
 */
@Component({
  selector: 'project-list',
  templateUrl: 'templates/project-list.html',
})
export class ProjectListComponent {
  constructor(
    private _serverData: ProjectDataService
  ) { }

  readonly projects = this._serverData.list;
}

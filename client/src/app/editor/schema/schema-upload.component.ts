import { Component } from '@angular/core';
import { Http } from '@angular/http'
import { ActivatedRoute } from '@angular/router';

import { ServerApiService } from '../../shared/'

import { ProjectService } from '../project.service';
import { ToolbarService } from '../toolbar.service';
import { SidebarService } from '../sidebar.service';

/**
 * Allows to replace the serverside database as a single blob.
 */
@Component({
  templateUrl: 'templates/schema-upload.html',
})
export class SchemaUploadComponent {

  constructor(
    private _projectService: ProjectService,
    private _toolbarService: ToolbarService,
    private _sidebarService: SidebarService,
    private _server: ServerApiService,
    private _http: Http,
    private _route: ActivatedRoute,
  ) {
    this._sidebarService.hideSidebar();

    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;
  }

  /**
   * The user has decided to send the selected blob to the
   * server.
   */
  async onFileSelected(evt: Event) {
    console.log(evt);
    const uploadInput = evt.srcElement as HTMLInputElement
    const uploadForm = uploadInput.form;

    const schemaName = this._route.snapshot.paramMap.get("schemaName");

    const url = this._server.uploadDatabase(this._projectService.cachedProject.id, schemaName)
    const data = new FormData(uploadForm);

    this._http.post(url, data)
      .subscribe(_ => console.log("Upload complete"));
  }
}

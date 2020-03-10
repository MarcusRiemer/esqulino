import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { ServerApiService } from '../../shared/'
import { TableDescription } from '../../shared/schema';

import { ProjectService } from '../project.service';
import { EditorToolbarService } from '../toolbar.service';
import { SidebarService } from '../sidebar.service';
import { SchemaService } from '../schema.service';

/**
 * Allows to replace the serverside database as a single blob.
 */
@Component({
  templateUrl: 'templates/schema-upload.html',
})
export class SchemaUploadComponent {

  constructor(
    private _projectService: ProjectService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService,
    private _schemaService: SchemaService,
    private _server: ServerApiService,
    private _http: HttpClient,
    private _route: ActivatedRoute,
    private _router: Router,
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

    // Actually sending the data
    this._http.post<{ schema: TableDescription[] }>(url, data)
      .subscribe(response => {
        // Inform everyone involved about the new scheme
        this._schemaService.onSchemaUpdated(response.schema);

        this._router.navigate([".."], { relativeTo: this._route })
      });
  }
}

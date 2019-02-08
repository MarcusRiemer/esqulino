import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { environment } from '../../environments/environment'

/**
 * Host-component for the front-page.
 */
@Component({
  templateUrl: 'templates/version.html',
})
export class VersionComponent implements OnInit {

  constructor(private _title: Title) { }

  ngOnInit() {
    this._title.setTitle("BlattWerkzeug");
  }

  readonly GIT_HASH = environment.version.hash;

  readonly BUILD_DATE = environment.version.date;

  onRaiseError() {
    throw new Error(`Deliberate error, caused by user!`);
  }
}
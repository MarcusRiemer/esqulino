import { AfterViewInit, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { map } from 'rxjs/operators';

import { NavItem } from './nav-interfaces';
import { Observable } from 'rxjs';

@Component({
  selector: 'nav-page-selector',
  templateUrl: './templates/nav-page.html'
})
export class NavSiteComponent implements OnInit {
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _route: ActivatedRoute
  ) { }

  // The actual locale that is currently in use
  readonly locale = this._localeId;

  ngOnInit() {}

  readonly navItemData: Observable<NavItem[]> = this._route.data.pipe(
    map(data => data.items)
  );
}
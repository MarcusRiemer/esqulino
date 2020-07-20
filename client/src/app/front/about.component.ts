import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

/**
 * The initial page a new user will see. Hosts a "best of" of landing-page
 * like content.
 */
@Component({
  templateUrl: "templates/about.html",
})
export class AboutComponent implements OnInit {
  constructor(private _title: Title) {}

  ngOnInit() {
    this._title.setTitle("BlattWerkzeug");
  }
}

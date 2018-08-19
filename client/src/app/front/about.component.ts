import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'


/**
 * Host-component for the front-page.
 */
@Component({
  templateUrl: 'templates/about.html',
})
export class AboutComponent implements OnInit {

  public videos = [
    {
      title: "SQL-Editor",
      stillImage: "20161126-QueryEditor.jpg",
      mp4: "20161126-QueryEditor.mp4",
      description: "Mit dem SQL-Editor lassen sich interaktiv Abfragen erstellen."
    },
    {
      title: "Seiten-Editor",
      stillImage: "20161126-PageEditor.jpg",
      mp4: "20161126-PageEditor.mp4",
      description: "Mit dem Seiten-Editor können HTML-Seiten bearbeitet werden."
    },
  ];

  constructor(private _title: Title) { }

  ngOnInit() {
    this._title.setTitle("BlattWerkzeug");
  }
}

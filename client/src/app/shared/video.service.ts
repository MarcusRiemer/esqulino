import { Injectable } from "@angular/core";

import { Observable, of } from "rxjs";

interface Video {
  id: string;
  title: string;
  stillImageUrl: string;
  mp4Url: string;
  description: string;
}

/**
 * For the moment there is no reason to grab the video information from
 * any dynamic third party service or server.
 */
const VIDEO_BASE_URL = "http://files.blattwerkzeug.de/videos/";

/**
 * Knows all educational videos that are available.
 */
@Injectable()
export class VideoService {
  private _videos: Video[] = [
    {
      id: "intro-sql-editor",
      title: "SQL-Editor",
      stillImageUrl: `${VIDEO_BASE_URL}/20161126-QueryEditor.jpg`,
      mp4Url: `${VIDEO_BASE_URL}/20161126-QueryEditor.mp4`,
      description:
        "Mit dem SQL-Editor lassen sich interaktiv Abfragen erstellen. Dieses Video zeigt, wie eine Abfrage zur Auflistung aller Kommentare zu einem bestimmten Blog-Beitrag erstellt wird.",
    },
    {
      id: "intro-page-editor",
      title: "Seiten-Editor",
      stillImageUrl: `${VIDEO_BASE_URL}/20161126-PageEditor.jpg`,
      mp4Url: `${VIDEO_BASE_URL}/20161126-PageEditor.mp4`,
      description:
        "Mit dem Seiten-Editor können HTML-Seiten bearbeitet werden. Dieses Video zeigt wie ein Administrationsbereich für Kommentare eines Blogs gestaltet wird.",
    },
  ];

  /**
   * @return All videos known to the system.
   */
  public get videos(): Observable<Video[]> {
    return of(this._videos);
  }
}

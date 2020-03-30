import { Component } from "@angular/core";

import { VideoService } from "../shared/video.service";

/**
 * Displays (more or less educational) videos.
 */
@Component({
  selector: "video-display",
  templateUrl: "templates/video-display.html",
})
export class VideoDisplayComponent {
  /**
   * Used only for dependency injection
   */
  public constructor(private _videoService: VideoService) {}

  /**
   * @return All available videos
   */
  public get videos() {
    return this._videoService.videos;
  }
}

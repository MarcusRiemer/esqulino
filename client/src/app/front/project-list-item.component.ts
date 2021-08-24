import { Component, Input, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import {
  CreateProjectCourseParticipationGQL,
  FrontpageListProjectsQuery,
} from "../../generated/graphql";
import { MultiLangString } from "../shared/multilingual-string.description";
import { CurrentLocaleService } from "../current-locale.service";

type projectNode = FrontpageListProjectsQuery["projects"]["nodes"][0];

/**
 * A single project list item entry.
 */
@Component({
  selector: "project-list-item",
  templateUrl: "templates/project-list-item.html",
})
export class ProjectListItemComponent {
  @Input() project: projectNode;

  /**
   * TODO: Make this configurable
   */
  useSobdomain = true;

  public constructor(
    @Inject(PLATFORM_ID) private _platformId: Object,
    private _router: Router,
    private _createProjectCourseParticipation: CreateProjectCourseParticipationGQL,
    private readonly _locale: CurrentLocaleService
  ) {}

  /**
   * The returned value will start of with '//' and thus be independent
   * from the protocol.
   *
   * @return The image URL of this project.
   */
  get imageUrl(): string {
    return `/api/project/${this.project.id}/image/${this.project.preview}`;
  }

  /**
   * @return True, if this item has an image
   */
  get hasImage(): boolean {
    return !!this.project?.preview;
  }

  async createCourseParticipation() {
    const localizedName: MultiLangString = {};
    //TODO: create own name
    localizedName[this._locale.localeId] = "Group 01";

    await this._createProjectCourseParticipation
      .mutate({
        basedOnProjectId: this.project.id,
        userIds: [],
        groupName: localizedName,
      })
      .toPromise()
      .then((e) => {
        this._router.navigate([
          "/",
          "editor",
          e.data.createProjectCourseParticipation.project.slug
            ? e.data.createProjectCourseParticipation.project.slug
            : e.data.createProjectCourseParticipation.project.id,
        ]);
      });
  }

  /**
   * @return The currently visited hostname
   */
  get projectServerHostname(): string {
    if (isPlatformBrowser(this._platformId)) {
      const currentHost = window.location.host;
      if (currentHost.startsWith("localhost")) {
        return currentHost;
      } else {
        return "blattzeug.de";
      }
    } else {
      return "blattzeug.de";
    }
  }

  /**
   * @return A URL that allows to view this page as a "normal" user.
   */
  get viewUrl(): string {
    if (this.useSobdomain) {
      // TODO: Find out whether it would be more or less trivially
      //       possible to support HTTPs
      return `http://${this.project.slug}.${this.projectServerHostname}`;
    } else {
      return `/view/${this.project.slug}/`;
    }
  }
}

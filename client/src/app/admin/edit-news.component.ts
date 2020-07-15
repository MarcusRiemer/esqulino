import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  LOCALE_ID,
  Inject,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { first, map } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";

import { NewsUpdateDescription } from "../shared/news.description";
import { ToolbarService } from "../shared";
import { PerformDataService } from "../shared/authorisation/perform-data.service";
import {
  CreateNewsGQL,
  UpdateNewsGQL,
  DestroyNewsGQL,
  AdminSingleNewsGQL,
} from "../../generated/graphql";

/**
 * Administrative UI to edit or create news.
 */
@Component({
  templateUrl: "./templates/edit-news.html",
})
export class AdminNewsEditComponent implements OnInit {
  @ViewChild("toolbarItems", { static: true })
  toolbarItems: TemplateRef<any>;

  constructor(
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private _toolbar: ToolbarService,
    private _performData: PerformDataService,
    private _singleNewsGQL: AdminSingleNewsGQL,
    private _createNewsGQL: CreateNewsGQL,
    private _updateNewsGQL: UpdateNewsGQL,
    private _destroyNewsGQL: DestroyNewsGQL,
    @Inject(LOCALE_ID) private readonly localeID: string
  ) {}

  // ID of the news being edited
  private readonly _newsId = this._activeRoute.snapshot.paramMap.get("newsId");

  // Current query parameters of the route
  private readonly _queryParams = this._activeRoute.snapshot.queryParams;

  readonly editors = [
    { name: "single", description: "Einfacher Bearbeitungsmodus" },
    { name: "translation", description: "Übersetzungsmodus" },
  ];

  readonly performUpdateData = this._performData.news.update(this._newsId);
  readonly performCreateData = this._performData.news.create();
  readonly performDeleteData = this._performData.news.delete(this._newsId);

  public newsData: NewsUpdateDescription;
  public readonly queryParamsLanguage =
    this._queryParams.language || this.localeID;
  public queryParamsMode = this._queryParams.mode || "single";

  public ngOnInit(): void {
    // Add these specific toolbar items to the global toolbar
    this._toolbar.addItem(this.toolbarItems);

    // Provide something to edit
    if (this.isCreatingNews) {
      // Create a new news to be edited
      this.newNews();
    } else {
      // Retrieve the news that should be edited
      this._singleNewsGQL
        .fetch({ id: this._newsId })
        .pipe(map((result) => result.data.singleNews))
        .subscribe(
          (news) => {
            this.newsData = news;
            if (this.newsData.publishedFrom) {
              this.newsData.publishedFrom = new Date(
                this.newsData.publishedFrom
              )
                .toISOString()
                .slice(0, 10);
            }
          },
          (err) => alert(err)
        );
    }
  }

  /**
   * Creates a new news which is ready to be edited.
   */
  public newNews(): void {
    this.newsData = {
      title: {},
      text: {},
      publishedFrom: null, // Field needs to be sent, even if empty
    };
  }

  /**
   *
   */
  get isCreatingNews(): boolean {
    return this._newsId == undefined;
  }

  get isPublished(): boolean {
    return (
      this.newsData.publishedFrom !== undefined &&
      this.newsData.publishedFrom !== null
    );
  }

  /**
   * Send our new news to the server.
   */
  onCreate(): void {
    this._createNewsGQL.mutate(this.newsData).subscribe(
      (_) => {
        this._router.navigate(["admin/news"]);
        this._snackBar.open("Created succesful", "", { duration: 3000 });
      },
      (err) => alert(`Error: ${JSON.stringify(err)}`)
    );
  }

  /**
   * Update the news on the server.
   *
   * @param option May be "redirect" to redirect the user
      this._serverService.deleteNews(this._newsId) back to the overview page
   */
  public onUpdate(option: "redirect" | "stay"): void {
    this._updateNewsGQL
      .mutate({ id: this._newsId, ...this.newsData })
      .subscribe(
        (_) => {
          if (option == "redirect") this._router.navigate(["admin/news"]);

          this._snackBar.open("Update succesful", "", { duration: 3000 });
        },
        (err) => alert(`Error: ${JSON.stringify(err)}`)
      );
  }

  /**
   * Delete the news on the server.
   */
  public onDelete(): void {
    let question = confirm("Ganze Nachricht löschen?");
    if (question) {
      this._destroyNewsGQL.mutate({ id: this._newsId }).subscribe(
        (_) => {
          this._router.navigate(["admin/news"]);
          this._snackBar.open("Deleted succesful", "", { duration: 3000 });
        },
        (err) => alert(`Error: ${JSON.stringify(err)}`)
      );
    }
  }
}

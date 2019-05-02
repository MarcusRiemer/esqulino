import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { first } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';


import { AdminNewsDescription } from './../shared/syntaxtree/news.description';
import { ServerDataService } from '../shared';


@Component({
  templateUrl: './templates/edit-news.html'
})
export class AdminNewsEditComponent implements OnInit {
  constructor(
    private _serverData: ServerDataService,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _serverService: ServerDataService,
    private _snackBar: MatSnackBar,
    @Inject(LOCALE_ID) private readonly localeID: string,
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get('newsId');
  private readonly queryParams = this._activeRoute.snapshot.queryParams;

  public newsData : AdminNewsDescription;
  public readonly queryParamsLanguage = this.queryParams.language || this.localeID;
  public readonly queryParamsMode = this.queryParams.mode || 'single';

  public ngOnInit(): void {
    if (this.isCreatingNews) {
      this.newsData = {
        id: '',
        title: {},
        text: {},
        published_from: undefined,
        created_at: '',
        updated_at: ''
      };
      
    } else {
      this._serverData.getAdminNewsSingle.getDescription(this._id).pipe(
        first()
      ).subscribe(news => this.newsData = news);
    }
  }

  public get isCreatingNews(): boolean {
    return this._id === undefined || this._id === null
  }

  public createNews(): void {
    this._serverService.createNews(this.newsData).subscribe(
      _ => { 
        this._router.navigate(['admin/news']); 
        this._snackBar.open('Created succesful', 'Undo', {
          duration: 3000
        });
       },
      err => alert('Please select a valid date')
    );
  }

  public updateData(): void {
    this._serverService.updateNews(this.newsData).subscribe(
      _ => { 
        this._router.navigate(['admin/news']); 
        this._snackBar.open('Updated succesful', 'Undo', {
          duration: 3000
        });
      },
      err => alert('Please select a valid date')
    );
  }

  public deleteNews(): void {
    let question = confirm('Ganze Nachricht löschen ?')
    if (question) {
      this._serverService.deleteNews(this._id).subscribe(
        _ => {
          this._router.navigate(['admin/news']);
          this._snackBar.open('Deleted succesful', 'Undo', {
            duration: 3000
          });
        },
        err => alert(`Can´t delete the news with the id: ${this._id}`)
      );

    }
  }
}
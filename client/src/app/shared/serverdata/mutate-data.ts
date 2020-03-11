import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Subject } from 'rxjs';
import { first } from 'rxjs/operators';

import { IdentifiableResourceDescription } from '../resource.description';
import { objectOmit } from '../util';

import { ResolveIndividualUrl } from './url-resolve';

export class MutateData<TSingle extends IdentifiableResourceDescription> {
  public constructor(
    // Deriving classes may need to make HTTP requests of their own
    protected _http: HttpClient,
    private _snackBar: MatSnackBar,
    private _idResolver: ResolveIndividualUrl,
    private _speakingName: string,
  ) {
  }


  private readonly _listInvalidated = new Subject<void>();

  readonly listInvalidated = this._listInvalidated.asObservable();

  /**
   * Updates an individual resource on the server. Uses the same
   * URL as the individual data access, but with HTTP PUT.
   */
  updateSingle(desc: TSingle, showErrorFeedback = true): Promise<TSingle> {
    const toReturn = new Promise<TSingle>((resolve, reject) => {

      const descWithoutId = objectOmit("id", desc);

      this._http.put<TSingle>(this._idResolver(desc.id), descWithoutId)
        .pipe(first())
        .subscribe(updatedDesc => {
          console.log(`Updated ${this._speakingName} with ID "${desc.id}"`);
          this._snackBar.open(`Updated ${this._speakingName} with ID "${desc.id}"`, "", { duration: 3000 });

          this._listInvalidated.next();

          resolve(updatedDesc);
        }, err => {
          console.warn(`Update failed: ${this._speakingName} with ID "${desc.id}"`);

          if (showErrorFeedback) {
            this._snackBar.open(`Could not update ${this._speakingName} with ID "${desc.id}"`, "OK 😞");
          } else {
            reject(err);
          }
        });
    });

    return (toReturn);
  }

  /**
   * Deletes a individual server on the server. Uses the same
   * URL as the individual data access, but with HTTP DELETE.
   *
   * @param id The ID of the resouce.
   */
  deleteSingle(id: string, showErrorFeedback = true): Promise<void> {
    const toReturn = new Promise<void>((resolve, reject) => {

      this._http.delete(this._idResolver(id))
        .pipe(first())
        .subscribe(_ => {
          console.log(`Deleted ${this._speakingName} with  "${id}"`);
          this._snackBar.open(`Deleted ${this._speakingName} with ID "${id}"`, "", { duration: 3000 });

          this._listInvalidated.next();

          resolve();
        }, err => {
          console.warn(`Delete failed: ${this._speakingName} with ID "${id}"`);
          if (showErrorFeedback) {
            this._snackBar.open(`Could not delete ${this._speakingName} with ID "${id}"`, "OK 😞");
          } else {
            reject(err);
          }
        });
    });

    return (toReturn);
  }
}
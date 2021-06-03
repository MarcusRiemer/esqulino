import { Injectable } from "@angular/core";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { MayPerformGQL } from "../../../generated/graphql";

import {
  MayPerformResponseDescription,
  MayPerformRequestDescription,
} from "./may-perform.description";

@Injectable()
export class MayPerformService {
  constructor(private _mayPerform: MayPerformGQL) {}

  /**
   * Sends a request to check for the authorization of ui element.
   */
  public mayPerform$(
    data: MayPerformRequestDescription
  ): Observable<MayPerformResponseDescription> {
    return (
      this._mayPerform
        // Don't watch for the result as this observable might be used
        // with `switchMap` which then leaks this subscription.
        //
        // "Do we have to unsubscribe when using switchMap operator in rxjs in Angular 2?"
        // -> https://stackoverflow.com/questions/44748878/
        .fetch({
          input: data,
        })
        .pipe(map((res) => res.data.mayPerform))
    );
  }
}

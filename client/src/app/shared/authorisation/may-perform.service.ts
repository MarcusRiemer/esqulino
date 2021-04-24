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
    return this._mayPerform
      .watch({
        input: data,
      })
      .valueChanges.pipe(map((res) => res.data.mayPerform));
  }
}

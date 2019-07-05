import { PerformDescription, MayPerformDescription } from './../may-perform.description';
import { Injectable } from "@angular/core";
import { Subject, Observable } from 'rxjs';
import { debounce, debounceTime } from 'rxjs/operators';

@Injectable()
export class PerformDataService {
  constructor() { }

  public performRequest = new Subject<Observable<any>>()

  public emitValue(request: Observable<any>): void {
    this.performRequest.next(request)
  }

  public readonly pipedRequest = this.performRequest.pipe(
    debounceTime(100)
  )
}
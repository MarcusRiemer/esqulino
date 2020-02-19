import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { of, Observable, BehaviorSubject, Observer } from "rxjs";

import { CachedRequest } from './request-cache';
import { first } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

describe(`Request Cache`, () => {
  it(`Retrieves the correct value`, () => {
    const c = new CachedRequest<number>(of(1));

    c.value.subscribe(r => expect(r).toBe(1));
    c.inProgress.subscribe(p => expect(p).toBe(false));
  });

  it(`Is properly informed about new values`, () => {
    const series = [1, 2, 3];
    const updateable = new BehaviorSubject(1);

    const c = new CachedRequest<number>(updateable);
    c.hasError.subscribe(err => expect(err).toBe(false));

    // Should be always the next value of the series when updated
    c.value.subscribe(r => { expect(r).toBe(series.shift()); });

    // No actual progress is ever visible, each value is calculated immediatly
    c.inProgress.subscribe(p => expect(p).toBe(false));

    updateable.next(2);
    updateable.next(3);
  });

  it(`Refresh recognizes changes in mutable state`, () => {
    let val = 1;
    const obs = Observable.create((obs: Observer<number>) => {
      obs.next(val);
      obs.complete();
    });

    const c = new CachedRequest<number>(obs);
    c.hasError.subscribe(err => expect(err).toBe(false));

    // Initial value is 1, subsequent values are ignored
    c.value.pipe(first()).subscribe(r => expect(r).toBe(1));

    // Value is updated with call of refresh
    c.value.subscribe(r => expect(r).toBe(val));

    val = 2;
    c.refresh();

    // Refreshed value is 2, subsequent values are ignored
    c.value.pipe(first()).subscribe(r => expect(r).toBe(2));
  });


  it(`Observable that does not complete`, () => {
    const obs = Observable.create((_: Observer<number>) => { });

    const c = new CachedRequest<number>(obs);
    c.hasError.subscribe(err => expect(err).toBe(false));

    c.inProgress.subscribe(p => expect(p).toBe(true));
    c.value.subscribe(v => fail(`No value should have been emitted, but got ${v}`));
  });

  it(`Observable that does eventually complete`, () => {
    let val = 0;
    const obs = Observable.create((obs: Observer<number>) => {
      if (val == 1) {
        obs.next(val);
        obs.complete();
      }
    });

    const c = new CachedRequest<number>(obs);
    c.hasError.subscribe(err => expect(err).toBe(false));

    // First "request": Observable didnt do anything at all, so the request
    // is in progress indefinitely
    c.inProgress.pipe(first()).subscribe(p => expect(p).toBe(true));
    const subs = c.value.subscribe(v => fail(`No value should have been emitted, but got ${v}`));

    // Invisible state change at the outside
    val = 1;

    // refresh to get to know the side effect, we now of course expect a value
    subs.unsubscribe();
    c.refresh();

    // Nothing in progress and relevant value
    c.inProgress.pipe(first()).subscribe(p => expect(p).toBe(false));
    c.value.pipe(first()).subscribe(v => expect(v).toBe(val));
  });

  it(`Observable that immediatly throws`, () => {
    const obs = Observable.create((obs: Observer<number>) => {
      obs.error("expected");
    });

    const c = new CachedRequest<number>(obs);

    c.value.subscribe(v => expect(v).toBe(undefined));
    c.inProgress.pipe(first()).subscribe(p => expect(p).toBe(true, "Progress"));
    c.hasError.subscribe(err => expect(err).toBe(true, "Error Reported"));
  });

  it(`Works for Angular HTTP requests`, async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    })
      .compileComponents();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const httpClient = TestBed.inject(HttpClient);

    const obs = httpClient.get<string>("/test");
    const c = new CachedRequest<string>(obs);

    let inProgress = await c.inProgress.pipe(first()).toPromise();
    expect(inProgress)
      .withContext("Answer not yet given")
      .toEqual(true);

    c.value.subscribe(response => expect(response).toEqual("response"));

    httpTestingController.expectOne("/test")
      .flush("response");

    inProgress = await c.inProgress.pipe(first()).toPromise();
    expect(inProgress)
      .withContext("Answer received")
      .toEqual(false);
  });
});
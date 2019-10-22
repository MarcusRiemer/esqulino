import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MatSnackBarModule, MatDialogModule } from '@angular/material';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { first, tap } from 'rxjs/operators';

import { UserService } from './user.service';
import { UserDescription } from './user.description';
import { ServerDataService } from '../serverdata/server-data.service';
import { ServerApiService } from '../serverdata/serverapi.service';

function mkUserResponse(displayName: string): UserDescription {
  return ({
    userId: "a",
    displayName: displayName,
    roles: ["user"],
    email: "hans@wurst.de."
  });
}

function mkGuestResponse() {
  return ({
    userId: UserService.GUEST_ID,
    displayName: "Guest",
    roles: ["guest"],
    email: null
  })
}

describe(`UserService`, () => {
  function instantiate(): UserService {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatDialogModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        ServerDataService,
        ServerApiService,
        MatSnackBar,
        UserService
      ],
      declarations: []
    });

    return (TestBed.get(UserService));
  }

  it(`default user data`, () => {
    const service = instantiate();

    service.userData$
      .pipe(first())
      .subscribe(_ => fail("No request made, therefore no user data should be provided"))
  });


  it('user data after guest response', () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const userData = mkGuestResponse();

    service.userData$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData));

    service.userDisplayName$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData.displayName))

    service.userId$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData.userId));

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(userData);
  })

  it('user data after proper user response', () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const userData = mkUserResponse("Tom");

    service.userDisplayName$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData.displayName))

    service.userData$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData));

    service.userId$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(userData.userId));

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(userData);
  })

  it('user data after logout', async () => {
    const service = instantiate();

    let numCalls = 0;

    // First call after simulated login
    service.userData$
      .pipe(
        first(),
        tap(_ => numCalls++)
      ).subscribe(_ => expect(numCalls).withContext("Live").toEqual(1));

    const userData = mkUserResponse("Tom");

    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(userData);

    // Second and third call after simulated logout
    service.userData$
      .pipe(
        tap(_ => numCalls++)
      ).subscribe(_ => expect(numCalls).withContext("Cache and Update").toBeGreaterThan(1));

    const logoutComplete = service.logout();

    httpTestingController.expectOne(serverApi.getSignOutUrl())
      .flush(mkGuestResponse());

    await logoutComplete;

    expect(numCalls)
      .withContext("Live call, Cache call, Update call (logged out)")
      .toEqual(3);
  })

  xit('userData on error', () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);

    let numCalls = 0;

    service.userData$
      .pipe(
        first(),
        tap(_ => numCalls++)
      )
      .subscribe(d => expect(d.displayName).toContain("Error"))

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush("", { statusText: "Unknown Error", status: 500 });

    expect(numCalls)
      .withContext("Server errors push a new user state, is this good?")
      .toEqual(1)
  })

  // fit('identities', () => {
  //   const service = instantiate();
  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);

  //   service.userDisplayName$
  //     .pipe(first())
  //     .subscribe(u => expect(u).toEqual(userData.displayName))

  //   service.userData$
  //     .pipe(first())
  //     .subscribe(u => expect(u).toEqual(userData));

  //   service.userId$
  //     .pipe(first())
  //     .subscribe(u => expect(u).toEqual(userData.userId));

  //   httpTestingController.expectOne(serverApi.getUserDataUrl())
  //     .flush(userData);

  // })

  // fit('isLoggedIn Observable', async () => {
  //   const service = instantiate();

  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);

  //   const isLoggedIn = await service.isLoggedIn$.pipe(first()).toPromise();

  //   httpTestingController.expectOne(serverApi.getUserDataUrl())
  // })


  // fit('userDisplayName Observable', async () => {
  //   const service = instantiate();

  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);

  //   service.userDisplayName$.pipe(first())
  //     .subscribe(v => expect(typeof v === 'string'))

  //   httpTestingController.expectOne(serverApi.getUserDataUrl())
  // })

  // fit('userDisplayName Observable', async () => {
  //   const service = instantiate();

  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);

  //   service.userDisplayName$.pipe(first())
  //     .subscribe(
  //       _ => fail("Request must fail"),
  //       (err: HttpErrorResponse) => expect(err.status).toEqual(404)
  //     )

  //     httpTestingController.expectOne(serverApi.getUserDataUrl())
  //       .flush("", { status: 404, statusText: "Not found" });

  // })
  // fit('userDisplayName Observable', async (done) => {
  //   const service = instantiate();

  //   service.userDisplayName$.pipe(first())


  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);


  //   httpTestingController.expectOne(serverApi.getUserDataUrl())
  //   return
  // })
})
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { first, tap } from 'rxjs/operators';

import { UserService } from './user.service';
import { UserDescription } from './user.description';
import { ServerProviderDescription } from './provider.description';

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

function mkIdentitiesResponse(): ServerProviderDescription {
  return ({
    providers: [
      {
        id: "121212121212121212",
        type: "github",
        confirmed: true,
        changes: { primary: null }
      }
    ],
    primary: "blattwerkzeug.de"
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

    service.isLoggedIn$
      .pipe(first())
      .subscribe(u => expect(u).toEqual(true));

    service.roles$
      .pipe(first())
      .subscribe(r => expect(r).toEqual(["user"]));

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(userData);

  })

  it('user data after logout', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);

    let numCalls = 0;

    // First call after simulated login
    service.userData$
      .pipe(
        first(),
        tap(_ => numCalls++)
      ).subscribe(_ => expect(numCalls).withContext("Live").toEqual(1));

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(mkUserResponse("Tom"));

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

  it('userData on error generic error', () => {
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
      .withContext("Server errors could push a new user state, is this good?")
      .toEqual(0)
  })

  it('Sign up and sign in', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const guest = mkGuestResponse();
    const user = mkUserResponse("Tom");
    const login = { email: "", username: "", password: "" };

    let callCounter = 0;

    service.userData$
      .pipe(tap(_ => callCounter++))
      .subscribe();

    const signUp = service.signUp$(login)
      .pipe(first())
      .toPromise()

    httpTestingController.expectOne(serverApi.getSignUpUrl())
      .flush(guest)

    const guestData = await signUp;

    expect(callCounter)
      .withContext("Single Subscription active")
      .toEqual(0)

    expect(guestData).toEqual(guest)

    const signIn = service.signIn$(login)
      .pipe(first())
      .toPromise();

    httpTestingController.expectOne(serverApi.getSignInUrl("identity"))
      .flush(user)

    const userData = await signIn;

    expect(userData).toEqual(user);
    expect(callCounter)
      .withContext("Update after sign in")
      .toEqual(1);
  })

  it('addEmail', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const identities = mkIdentitiesResponse();
    const addEmailData = { email: "", password: "" }

    let callCounter = 0;

    service.identities
      .pipe(tap(_ => callCounter++))
      .subscribe()

    expect(callCounter).toEqual(1)

    const addEmail = service.addEmail$(addEmailData)
      .pipe(first())
      .toPromise()

    httpTestingController.expectOne(serverApi.getSignUpUrl())
      .flush(identities)

    const response = await addEmail;

    expect(response).toEqual(identities)
    expect(callCounter).toEqual(2)
  })

  it('unexpectedLogout', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const user = mkUserResponse("Tom");

    let userDataCalls = 0
    let unexpectedCalls = 0;

    service.userData$
      .pipe(tap(_ => userDataCalls++))
      .subscribe()

    httpTestingController.expectOne(serverApi.getUserDataUrl())
      .flush(user);

    expect(userDataCalls)
      .withContext("First Subscription")
      .toEqual(1);

    service.unexpectedLogout$
      .pipe(tap(_ => unexpectedCalls++))
      .subscribe();

    const loggedOut = service.userData$
      .pipe(first())
      .toPromise()

    const userData = await loggedOut;

    service.onUnexpectedLogout(userData)

    expect(unexpectedCalls)
      .withContext("Event was triggerd")
      .toEqual(1);

    expect(userDataCalls)
      .withContext("Side Subscription")
      .toEqual(2);

    expect(userData)
      .toEqual(user)
  })
})
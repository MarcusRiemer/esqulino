import { ServerProviderDescription } from './provider.description';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MatSnackBarModule, MatDialogModule } from '@angular/material';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { first, tap, finalize } from 'rxjs/operators';

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

function mkIdentitiesResponse(): ServerProviderDescription {
  return ({
    providers: [
      { 
        id: "121212121212121212", 
        type: "github", 
        confirmed: true, 
        changes: { primary: null }}
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

  // it('userData empty', () => {
  //   const service = instantiate();
  //   const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
  //   const serverApi: ServerApiService = TestBed.get(ServerApiService);

  //   service.userDisplayName$
  //     .pipe(first())
  //     .subscribe(u => expect(u).toEqual(""))

  //   service.userId$
  //     .pipe(first())
  //     .subscribe(u => expect(u).toEqual(""));

  //   httpTestingController.expectOne(serverApi.getUserDataUrl())
  //     .flush({});
  // })

  it('identities', () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const identities = mkIdentitiesResponse();

    service.identities.value
      .pipe(first())
      .subscribe(u => expect(u).toEqual(identities))

    service.primaryEmail$
      .pipe(first())
      .subscribe(v => expect(v).toEqual(identities.primary))
    
    service.providers$
      .pipe(first())
      .subscribe(p => expect(p).toEqual(p))

    httpTestingController.expectOne(serverApi.getUserIdentitiesUrl())
      .flush(identities);

  })

  it('Need to be replaced by a meaningful name', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const guest = mkGuestResponse();
    const user = mkUserResponse("Tom");
    const login = { email: "", username: "", password: "" };

    let callCounter = 0;

    spyOn(window, "alert");

    service.userData$.subscribe(_ => callCounter++)

    const signUp = service.signUp$(login)
      .pipe(first())
      .toPromise()

    httpTestingController.expectOne(serverApi.getSignUpUrl())
      .flush(guest)

    const guestData = await signUp;

    expect(window.alert).toHaveBeenCalledWith("Please confirm your e-mail");
    expect(guestData).toEqual(guest)

    const signIn = service.signIn$(login)
      .pipe(first())
      .toPromise();

    httpTestingController.expectOne(serverApi.getSignInUrl("identity"))
      .flush(user)

    const userData = await signIn;

    expect(userData).toEqual(user);
    expect(callCounter).toEqual(2);
  })

  it('addEmail', async () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const identities = mkIdentitiesResponse();
    const addEmail = { email: "", password: "" }

    let callCounter = 0;

    service.identities.value
      .subscribe(_ => callCounter++);

    const addEmail$ = service.addEmail$(addEmail)
      .pipe(first())
      .toPromise();
    
    httpTestingController.expectOne(serverApi.getSignUpUrl())
      .flush(identities)

    const newIdentities = await addEmail$;

    expect(newIdentities).toEqual(identities)
    expect(callCounter).toEqual(1);
  })



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
import { ServerProviderDescription } from './provider.description';
import { MatSnackBar, MatDialogModule } from '@angular/material';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { first } from 'rxjs/operators';

import { UserService } from './user.service';
import { UserDescription } from './user.description';
import { ServerDataService } from '../serverdata/server-data.service';
import { ServerApiService } from '../serverdata/serverapi.service';

function mkUserResponse(displayName: string): UserDescription {
  return ({
    userId: "a",
    displayName: displayName,
    roles: ["guest"],
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


  it('userData', () => {
    const service = instantiate();
    const httpTestingController: HttpTestingController = TestBed.get(HttpTestingController);
    const serverApi: ServerApiService = TestBed.get(ServerApiService);
    const userData = mkUserResponse("Guest");

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
  //     .flush(undefined);
  // })

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
import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ServerApiService } from '../../shared';
import { generateUUIDv4 } from '../../shared/util-browser';
import { UserDescription } from '../../shared/auth/user.description';

const DEFAULT_EMPTY_USER: UserDescription = {
  userId: "28066939-7d53-40de-a89b-95bf37c982be",
  displayName: "Blattwerkzeug",
  roles: ["user"],
  email: "blattwerkzeug@gmail.com"
};

export const specSignInUser = (
  override?: Partial<UserDescription>
): UserDescription => {
  const httpTestingController = TestBed.inject(HttpTestingController);
  const serverApi = TestBed.inject(ServerApiService);

  const p = Object.assign({ userId: generateUUIDv4() }, DEFAULT_EMPTY_USER, override || {});

  httpTestingController.expectOne(serverApi.getUserDataUrl())
    .flush(p);

  return (p);
}

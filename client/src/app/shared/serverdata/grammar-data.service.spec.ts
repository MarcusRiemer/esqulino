import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { first } from "rxjs/operators";

import {
  provideGrammarList,
  buildGrammar,
  GrammarOrder,
} from "../../editor/spec-util";

import { ResourceReferencesService } from "../resource-references.service";
import { ResourceReferencesOnlineService } from "../resource-references-online.service";

import {
  ListGrammarDataService,
  MutateGrammarService,
} from "./grammar-data.service";
import { ServerApiService } from "./serverapi.service";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ServerTasksService } from "./server-tasks.service";

describe(`ListGrammarDataService`, () => {
  function instantiate() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatSnackBarModule],
      providers: [
        ServerApiService,
        ListGrammarDataService,
        MutateGrammarService,
        ServerTasksService,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
      ],
      declarations: [],
    });

    return {
      service: TestBed.inject(ListGrammarDataService),
    };
  }

  it(`Can be instantiated`, async () => {
    const fixture = instantiate();

    expect(fixture.service).toBeDefined();
  });

  it(`Listing empty dataset`, async () => {
    const fixture = instantiate();

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList([]);

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual([]);
    expect(totalCount).withContext("listTotalCount$").toEqual(0);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(0);
  });

  it(`Listing dataset with two items (default order)`, async () => {
    const fixture = instantiate();

    const expectedList = [buildGrammar(), buildGrammar()];

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList);

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual(expectedList);
    expect(totalCount)
      .withContext("listTotalCount$")
      .toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(expectedList.length);
  });

  it(`Listing dataset with two items (name descending)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar({ name: "B" }),
      buildGrammar({ name: "A" }),
    ];

    const order: GrammarOrder = {
      direction: "desc",
      field: "name",
    };

    fixture.service.setListOrdering(order.field, order.direction);

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { order });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual(expectedList);
    expect(totalCount)
      .withContext("listTotalCount$")
      .toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(expectedList.length);
  });

  it(`Listing dataset with two items (name ascending)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar({ name: "A" }),
      buildGrammar({ name: "B" }),
    ];

    const order: GrammarOrder = {
      direction: "asc",
      field: "name",
    };

    fixture.service.setListOrdering(order.field, order.direction);

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { order });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual(expectedList);
    expect(totalCount)
      .withContext("listTotalCount$")
      .toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(expectedList.length);
  });

  it(`Listing dataset with two items (slug descending)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar({ slug: "B" }),
      buildGrammar({ slug: "A" }),
    ];

    const order: GrammarOrder = {
      direction: "desc",
      field: "slug",
    };

    fixture.service.setListOrdering(order.field, order.direction);

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { order });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual(expectedList);
    expect(totalCount)
      .withContext("listTotalCount$")
      .toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(expectedList.length);
  });

  it(`Listing dataset while resetting the list order`, async () => {
    const fixture = instantiate();

    const expectedList = [];

    // Setting the ordering and then resetting it
    fixture.service.setListOrdering("name", "desc");
    fixture.service.setListOrdering("name", "");

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList);

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual([]);
    expect(totalCount).withContext("listTotalCount$").toEqual(0);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(0);
  });

  it(`Listing dataset with pagination`, async () => {
    const fixture = instantiate();

    const expectedList = [];
    const pagination = {
      limit: 5,
      page: 2,
    };

    fixture.service.setListPagination(pagination.limit, pagination.page);
    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { pagination });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount$
      .pipe(first())
      .toPromise();

    expect(list).withContext("Direct list comparision").toEqual([]);
    expect(totalCount).withContext("listTotalCount$").toEqual(0);
    expect(fixture.service.peekListTotalCount)
      .withContext("peekListTotalCount")
      .toEqual(0);
  });
});

describe(`MutateGrammarDataService`, () => {
  function instantiate() {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        NoopAnimationsModule,
      ],
      providers: [
        ServerApiService,
        ListGrammarDataService,
        MutateGrammarService,
        ServerTasksService,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
      ],
      declarations: [],
    });

    return {
      list: TestBed.inject(ListGrammarDataService),
      mutate: TestBed.inject(MutateGrammarService),
      httpTesting: TestBed.inject(HttpTestingController),
      serverApi: TestBed.inject(ServerApiService),
      serverTask: TestBed.inject(ServerTasksService),
    };
  }

  it(`can be instantiated`, async () => {
    const fixture = instantiate();

    expect(fixture.mutate).toBeDefined();
  });

  it(`makes a successful DELETE request`, async () => {
    const fixture = instantiate();

    let listInvalidatedCalls = 0;
    fixture.mutate.listInvalidated.subscribe((_) => ++listInvalidatedCalls);

    const done = fixture.mutate.deleteSingle("grammarId");
    fixture.httpTesting
      .expectOne({
        url: fixture.serverApi.individualGrammarUrl("grammarId"),
        method: "DELETE",
      })
      .flush("");

    await done;

    expect(listInvalidatedCalls).toEqual(1);
  });

  it(`makes a unsuccessful DELETE request`, async () => {
    const fixture = instantiate();

    let listInvalidatedCalls = 0;
    fixture.mutate.listInvalidated.subscribe((_) => ++listInvalidatedCalls);

    const done = fixture.mutate.deleteSingle("grammarId", false);
    fixture.httpTesting
      .expectOne({
        url: fixture.serverApi.individualGrammarUrl("grammarId"),
        method: "DELETE",
      })
      .flush("", { status: 400, statusText: "Nope" });

    try {
      await done;
      fail("Must throw");
    } catch {}

    expect(listInvalidatedCalls).toEqual(0);
  });

  it(`makes a POST request`, async () => {
    const fixture = instantiate();

    let listInvalidatedCalls = 0;
    fixture.mutate.listInvalidated.subscribe((_) => ++listInvalidatedCalls);

    const originalDescription = { id: "grammarId" } as any;

    const done = fixture.mutate.updateSingle(originalDescription);
    fixture.httpTesting
      .expectOne({
        url: fixture.serverApi.individualGrammarUrl("grammarId"),
        method: "PUT",
      })
      .flush("");

    await done;

    expect(listInvalidatedCalls).toEqual(1);
    expect(originalDescription)
      .withContext("Original description must not be mutated")
      .toEqual({ id: "grammarId" });
  });

  it(`makes a unsuccessful POST request`, async () => {
    const fixture = instantiate();

    let listInvalidatedCalls = 0;
    fixture.mutate.listInvalidated.subscribe((_) => ++listInvalidatedCalls);

    const originalDescription = { id: "grammarId" } as any;
    const done = fixture.mutate.updateSingle(originalDescription, false);
    fixture.httpTesting
      .expectOne({
        url: fixture.serverApi.individualGrammarUrl("grammarId"),
        method: "PUT",
      })
      .flush("", { status: 400, statusText: "Nope" });

    try {
      await done;
      fail("Must throw");
    } catch {}

    expect(listInvalidatedCalls).toEqual(0);
  });
});

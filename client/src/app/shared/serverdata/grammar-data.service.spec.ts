import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { first } from 'rxjs/operators';

import { provideGrammarList, buildGrammar, GrammarOrder } from '../../editor/spec-util';

import { ResourceReferencesService } from '../resource-references.service';
import { ResourceReferencesOnlineService } from '../resource-references-online.service';

import { ListGrammarDataService } from './grammar-data.service';
import { ServerApiService } from './serverapi.service';


describe(`ListGrammarDataService`, () => {
  function instantiate() {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        ServerApiService,
        ListGrammarDataService,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        }
      ],
      declarations: [
      ]
    });

    return ({
      service: TestBed.inject(ListGrammarDataService)
    });
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
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual([]);
    expect(totalCount).toEqual(0);
    expect(fixture.service.peekListTotalCount).toEqual(0);
  });

  it(`Listing dataset with two items (default order)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar(),
      buildGrammar(),
    ]

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList);

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual(expectedList);
    expect(totalCount).toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount).toEqual(expectedList.length);
  });

  it(`Listing dataset with two items (name ascending)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar({ name: "A" }),
      buildGrammar({ name: "B" }),
    ]

    const order: GrammarOrder = {
      direction: "asc",
      field: "name",
    }

    fixture.service.setListOrdering(order.field, order.direction);

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { order });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual(expectedList);
    expect(totalCount).toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount).toEqual(expectedList.length);
  });

  it(`Listing dataset with two items (slug descending)`, async () => {
    const fixture = instantiate();

    const expectedList = [
      buildGrammar({ slug: "B" }),
      buildGrammar({ slug: "A" }),
    ]

    const order: GrammarOrder = {
      direction: "desc",
      field: "slug",
    }

    fixture.service.setListOrdering(order.field, order.direction);

    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { order });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual(expectedList);
    expect(totalCount).toEqual(expectedList.length);
    expect(fixture.service.peekListTotalCount).toEqual(expectedList.length);
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
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual([]);
    expect(totalCount).toEqual(0);
    expect(fixture.service.peekListTotalCount).toEqual(0);
  });

  it(`Listing dataset with pagination`, async () => {
    const fixture = instantiate();

    const expectedList = [];
    const pagination = {
      limit: 5,
      page: 2
    }

    fixture.service.setListPagination(pagination.limit, pagination.page);
    const pending = fixture.service.list.pipe(first()).toPromise();
    provideGrammarList(expectedList, { pagination });

    const list = await pending;
    const totalCount = await fixture.service.listTotalCount.pipe(first()).toPromise();

    expect(list).toEqual([]);
    expect(totalCount).toEqual(0);
    expect(fixture.service.peekListTotalCount).toEqual(0);
  });
});
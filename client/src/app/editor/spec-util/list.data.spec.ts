import { TestBed } from "@angular/core/testing";
import { HttpTestingController } from "@angular/common/http/testing";

import { JsonApiListResponse } from "../../shared/serverdata/json-api-response";

export interface ListOrder<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

/**
 * Expects a request for the given list on the given base URL. If a ordered dataset
 * is requested, the `items` param must be already ordered accordingly.
 */
export function provideListResponse<T>(
  items: T[],
  reqUrl: string,
  options?: {
    order?: ListOrder<T>;
    pagination?: {
      limit: number;
      page: number;
    };
  }
) {
  const httpTestingController = TestBed.inject(HttpTestingController);

  const response: JsonApiListResponse<T> = {
    data: items,
    meta: {
      totalCount: items.length,
    },
  };

  if (options) {
    // If any options are given, there must be a query part to the URL
    reqUrl += "?";

    const order = options.order;
    if (order) {
      reqUrl += `orderDirection=${order.direction}&orderField=${String(
        order.field
      )}`;
    }

    const pagination = options.pagination;
    if (pagination) {
      const offset = pagination.limit * pagination.page;
      reqUrl += `limit=${pagination.limit}&offset=${offset}`;
    }
  }

  httpTestingController.expectOne(reqUrl).flush(response);
}

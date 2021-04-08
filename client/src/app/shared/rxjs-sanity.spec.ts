// This file should not exist. Its only a way to ensure that Marcus'
// understanding of RxJS is not subtly wrong

import * as rx from "rxjs";
import * as rxop from "rxjs/operators";

describe(`RxJS sanity tests`, () => {
  describe(`of() can be subscribed multiple times and is completed`, () => {
    it(`empty`, async () => {
      const source = rx.of();
      const twice = rx.concat(source, source);

      const result = await twice.pipe(rxop.toArray()).toPromise();
      expect(result).toEqual([]);
    });

    it(`single 1`, async () => {
      const source = rx.of(1);
      const twice = rx.concat(source, source);

      const result = await twice.pipe(rxop.toArray()).toPromise();
      expect(result).toEqual([1, 1]);
    });

    it(`1 2`, async () => {
      const source = rx.of(1, 2);
      const twice = rx.concat(source, source);

      const result = await twice.pipe(rxop.toArray()).toPromise();
      expect(result).toEqual([1, 2, 1, 2]);
    });

    it(`single null`, async () => {
      const source = rx.of(null);
      const twice = rx.concat(source, source);

      const result = await twice.pipe(rxop.toArray()).toPromise();
      expect(result).toEqual([null, null]);
    });
  });
});

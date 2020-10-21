import { stepwiseSqlQuery } from "./sql-steps";

describe(`SQL Steps`, () => {
  it(`Empty Tree`, () => {
    expect(stepwiseSqlQuery(undefined)).toEqual([]);
    expect(() => stepwiseSqlQuery(undefined)).toThrowError(/Empty Tree/);
  });
});

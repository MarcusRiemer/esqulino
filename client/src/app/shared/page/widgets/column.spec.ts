import { Column, ColumnDescription } from './column'

describe('Page Columns', () => {
  it('Serialization', () => {
    const m: ColumnDescription = {
      type: "column",
      width: 6,
      widgets: []
    }

    let c = new Column(m);
    expect(c.toModel()).toEqual(m);
  });

  it('CSS classes', () => {
    const m: ColumnDescription = {
      type: "column",
      width: 6,
      widgets: []
    }

    let c = new Column(m);
    expect(c.columnClasses).toEqual(["col-md-6"]);
  });
});

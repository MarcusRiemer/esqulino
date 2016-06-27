import {Column, ColumnDescription}  from './column'

describe('Page Columns', () => {
    it('CSS classes', () => {
        const m : ColumnDescription = {
            width : 6,
            widgets : []
        }

        let c = new Column(m);
        expect(c.columnClasses).toEqual(["col-md-6"]);
        expect(c.toModel()).toEqual(m);
    });
});

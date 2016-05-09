import {Schema}                  from '../schema'
import {Model, SyntaxTree}       from '../query'

import {QueryInsert}             from './insert'

let schema  = new Schema([
    {
        "name": "person",
        "columns": [
            {
                "index": 0,
                "name": "p1",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": true
            },
            {
                "index": 1,
                "name": "p2",
                "type": "TEXT",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            },
            {
                "index": 2,
                "name": "p3",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            }
        ]
    }
]);

describe('INSERT', () => {
    it('activating previously unused columns', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            insert : {
                columns : [0],
                table : "person",
                values : [
                    { constant : { type: "INTEGER", value : "0" } },
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        q.changeActivationState(2, true);

        expect(q.activeColumns.length).toEqual(2);
        expect(q.activeColumns[0]).toEqual(schema.getColumn("person", "p1"));
        expect(q.activeColumns[1]).toEqual(schema.getColumn("person", "p3"));

        expect(q.values.length).toEqual(2);
        expect(q.values[0].templateIdentifier).toEqual("constant");
        expect(q.values[1].templateIdentifier).toEqual("missing");
    });

    it('deactivating previously used columns', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            insert : {
                columns : [0],
                table : "person",
                values : [
                    { constant : { type: "INTEGER", value : "0" } },
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        q.changeActivationState(0, false);

        expect(q.activeColumns.length).toEqual(0);
        expect(q.values.length).toEqual(0);
    });

    it('Error: activating or deactivating in same state', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            insert : {
                columns : [0],
                table : "person",
                values : [
                    { constant : { type: "INTEGER", value : "0" } },
                ]
            }
        }

        const q = new QueryInsert(schema, m);

        expect( () => q.changeActivationState(0, true)).toThrowError();
        expect( () => q.changeActivationState(1, false)).toThrowError();
        expect( () => q.changeActivationState(2, false)).toThrowError();
    });
});

describe('Valid INSERT Queries', () => {    
    it('INSERT INTO person (p1,p2,p3) VALUES (0, "1", 2)', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            insert : {
                columns : [0,1,2],
                table : "person",
                values : [
                    { constant : { type: "INTEGER", value : "0" } },
                    { constant : { type: "TEXT", value : "1" } },
                    { constant : { type: "INTEGER", value : "2" } }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        expect(q.activeColumns).toEqual(schema.tables[0].columns);

        const v = q.values;
        expect(v[0].toModel()).toEqual(m.insert.values[0]);
        expect(v[1].toModel()).toEqual(m.insert.values[1]);
        expect(v[2].toModel()).toEqual(m.insert.values[2]);

        expect(q.toSqlString()).toEqual(`INSERT INTO person (p1, p2, p3)\nVALUES (0, "1", 2)`);
    });
});

import {Schema}                  from '../schema'

import {
    Model, SyntaxTree, CURRENT_API_VERSION
} from './base'
import {QueryInsert}             from './insert'

let schema  = new Schema([
    {
        "name": "person",
        "foreign_keys": [],
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
            name : "insert-spec",
            id : "insert-spec",
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { type: "INTEGER", value : "0" } },
                        column : "p1"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        q.changeActivationState("p3", true);

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
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { type: "INTEGER", value : "0" } },
                        column : "p1"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        q.changeActivationState("p1", false);

        expect(q.activeColumns.length).toEqual(0);
        expect(q.values.length).toEqual(0);
    });

    it('Error: activating or deactivating in same state', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { type: "INTEGER", value : "0" } },
                        column : "p1"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);

        expect( () => q.changeActivationState("p1", true)).toThrowError();
        expect( () => q.changeActivationState("p2", false)).toThrowError();
        expect( () => q.changeActivationState("p3", false)).toThrowError();
    });

    it('retrieving columns', () => {
        const m : Model.QueryDescription = {
            name : "insert-spec",
            id : "insert-spec",
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { type: "INTEGER", value : "0" } },
                        column : "p1"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        expect(q.getValueForColumn("p1")).toBeTruthy();
        expect(q.getValueForColumn("p2")).toBeFalsy();
    });

});

describe('Valid INSERT Queries', () => {    
    it('INSERT INTO person (p1,p2,p3) VALUES (0, "1", 2)', () => {
        const m : Model.QueryDescription = {
            name : "insert-1",
            id : "insert-1",
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { value : "0" } },
                        column : "p1"
                    },
                    {
                        expr : { constant : { value : "a" } },
                        column : "p2"
                    },
                    {
                        expr : { constant : { value : "2" } },
                        column : "p3"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        expect(q.activeColumns).toEqual(schema.tables[0].columns);

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(3);
        expect(leaves[0].toModel()).toEqual(m.insert.assignments[0].expr);
        expect(leaves[1].toModel()).toEqual(m.insert.assignments[1].expr);
        expect(leaves[2].toModel()).toEqual(m.insert.assignments[2].expr);

        expect(q.toModel()).toEqual(m, "Model mismatch");
        expect(q.toSqlString()).toEqual(`INSERT INTO person (p1, p2, p3)\nVALUES (0, 'a', 2)`);
    });

    it('INSERT INTO person (p1,p3) VALUES (1, 3)', () => {
        const m : Model.QueryDescription = {
            name : "insert-2",
            id : "insert-2",
            apiVersion : CURRENT_API_VERSION,
            insert : {
                table : "person",
                assignments : [
                    {
                        expr : { constant : { value : "1" } },
                        column : "p1"
                    },
                    {
                        expr : { constant : { value : "3" } },
                        column : "p3"
                    }
                ]
            }
        }

        const q = new QueryInsert(schema, m);
        expect(q.isValid).toBeTruthy("Not valid");

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(2);
        expect(leaves[0].toModel()).toEqual(m.insert.assignments[0].expr);
        expect(leaves[1].toModel()).toEqual(m.insert.assignments[1].expr);

        expect(q.toModel()).toEqual(m, "Model mismatch");
        expect(q.toSqlString()).toEqual(`INSERT INTO person (p1, p3)\nVALUES (1, 3)`);
    });
});

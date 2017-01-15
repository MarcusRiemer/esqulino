import {Schema}                  from '../schema'

import {
    Model, SyntaxTree, CURRENT_API_VERSION
} from './base'
import {QueryDelete}             from './delete'

let schema  = new Schema([
    {
        "name": "ereignis",
        "columns": [
            {
                "index": 0,
                "name": "ereignis_id",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": true
            },
            {
                "index": 1,
                "name": "bezeichnung",
                "type": "TEXT",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            },
            {
                "index": 2,
                "name": "beginn",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            },
            {
                "index": 3,
                "name": "ende",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            }
        ]
    },
    {
        "name": "person",
        "columns": [
            {
                "index": 0,
                "name": "personId",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": true
            },
            {
                "index": 1,
                "name": "name",
                "type": "TEXT",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            },
            {
                "index": 2,
                "name": "gebDat",
                "type": "INTEGER",
                "not_null": true,
                "dflt_value": null,
                "primary": false
            }
        ]
    }
]);

describe('Valid DELETE Queries', () => {
    it('DELETE FROM person', () => {
        const model : Model.QueryDescription = {
            name : 'delete-everything',
            id : 'del-1',
            apiVersion : CURRENT_API_VERSION,
            delete : { },
            from : {
                first : {
                    name : "person"
                }
            }
        }

        let q = new QueryDelete(schema, model);
        expect(q.getLeaves().length).toEqual(0);
        expect(q.toSqlString()).toEqual("DELETE\nFROM person");

        expect(q.toModel()).toEqual(model);
    });

    it(`DELETE FROM person WHERE person.name = 'Hans'`, () => {
        const model : Model.QueryDescription = {
            name : 'delete-everything',
            id : 'del-1',
            apiVersion : CURRENT_API_VERSION,
            delete : { },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    binary : {
                        lhs : {
                            singleColumn : {
                                table : "person",
                                column : "name"
                            }
                        },
                        operator : "=",
                        rhs : {
                            constant : {
                                value : "Hans"
                            }
                        },
                        simple : true
                    }
                }
            }
        }

        let q = new QueryDelete(schema, model);

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(2);
        
        expect(q.validate).toBeTruthy();
        expect(q.toSqlString()).toEqual(`DELETE\nFROM person\nWHERE person.name = 'Hans'`);

        expect(q.toModel()).toEqual(model);
    });
});


import {Schema}                  from '../schema'
import {CURRENT_API_VERSION}     from '../index'

import * as Model                from './description'
import * as SyntaxTree           from './syntaxtree'
import {Query}                   from './base'
import {ValidationErrors}        from './validation'

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

describe('UPDATE', () => {
    it('Single column', () => {
        const m : Model.QueryDescription = {
            name : "update-1",
            id : "update-1",
            apiVersion : CURRENT_API_VERSION,
            update : {
                table : "person",
                assignments : [
                    {
                        column : "p1",
                        expr : {
                            constant : {
                                value : "2"
                            }
                        }
                    }
                ]
            }
        }

        const q = new Query(schema, m);
        expect(q.toModel()).toEqual(m);
        expect(q.toSqlString()).toEqual("UPDATE person\nSET p1 = 2");

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(1);
        expect(leaves[0].toModel()).toEqual(m.update.assignments[0].expr);

    });

    it('Invalid: Missing Expression', () => {
        const m : Model.QueryDescription = {
            name : "update-1",
            id : "update-1",
            apiVersion : CURRENT_API_VERSION,
            update : {
                table : "person",
                assignments : [
                    {
                        column : "p1",
                        expr : {
                            missing : { }
                        }
                    }
                ]
            }
        }

        const q = new Query(schema, m);
        expect(q.toModel()).toEqual(m);
        expect(() => q.toSqlString()).toThrowError();
    });
});

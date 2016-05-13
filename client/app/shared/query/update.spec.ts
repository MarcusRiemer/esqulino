import {Schema}                  from '../schema'
import {Model, SyntaxTree}       from '../query'

import {QueryUpdate}             from './update'

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

describe('UPDATE', () => {
    it('Single column', () => {
        const m : Model.QueryDescription = {
            name : "update-1",
            id : "update-1",
            update : {
                table : "person",
                assignments : [
                    {
                        column : "p1",
                        expr : {
                            constant : {
                                type : "INTEGER",
                                value : "2"
                            }
                        }
                    }
                ]
            }
        }

        const q = new QueryUpdate(schema, m);
        expect(q.toModel()).toEqual(m);
        expect(q.toSqlString()).toEqual("UPDATE person\nSET p1 = 2");
    });

    it('Invalid: Missing Expression', () => {
        const m : Model.QueryDescription = {
            name : "update-1",
            id : "update-1",
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

        const q = new QueryUpdate(schema, m);
    });
});

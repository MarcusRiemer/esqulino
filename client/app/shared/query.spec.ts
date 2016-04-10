import './syntaxtree/common.spec'
import './syntaxtree/expression.spec'
import './syntaxtree/select.spec'
import './syntaxtree/delete.spec'
import './syntaxtree/from.spec'
import './syntaxtree/where.spec'

import {
    QuerySelect, QueryDelete, Model, SyntaxTree
} from './query'
import {Column, Table}                  from './table'

let schema : Table[] =
    [
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
                    "name": "person_id",
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
                    "name": "geb_dat",
                    "type": "INTEGER",
                    "not_null": true,
                    "dflt_value": null,
                    "primary": false
                }
            ]
        }
    ];

describe('SELECT Query', () => {
    it ('SELECT person.id, person.name FROM person JOIN ort o', () => {
        let model : Model.Query = {
            name : 'test-whole',
            id : 'id',
            select : {
                allData : false,
                columns : [
                    { expr : { singleColumn : {column : "id", table : "person" } } },
                    { expr : { singleColumn : {column : "name" , table : "person" } } }
                ]
            },

            from : {
                first : {
                    name : "person"
                },
                joins : [
                    {
                        table : {
                            name : "ort",
                            alias : "o"
                        },
                        cross : "cross"
                    }
                ]}

        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("test-whole");
        expect(q.id).toEqual("id");

        expect(q.select.numberOfColumns).toEqual(2);
        expect(q.from.numberOfJoins).toEqual(1);

        expect(q.toSqlString()).toEqual("SELECT person.id, person.name\nFROM person\n\tJOIN ort o");
    });
    
    it ('SELECT * FROM person WHERE 1', () => {
        const model : Model.Query = {
            name : 'where-simple',
            id : 'where-1',
            select : {
                allData : true,
                columns : []
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    constant : { type : "INTEGER", value : "1" }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-simple");
        expect(q.id).toEqual("where-1");

        expect(q.select.numberOfColumns).toEqual(0);
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1");
        expect(q.toModel()).toEqual(model);
    });

    it ('SELECT * FROM person WHERE 1 <= 2', () => {
        const model : Model.Query = {
            name : 'where-compare',
            id : 'where-2',
            select : {
                allData : true,
                columns : []
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    binary : {
                        lhs : { constant : { type : "INTEGER", value : "1" } },
                        rhs : { constant : { type : "INTEGER", value : "2" } },
                        operator : "<=",
                        simple : true
                    }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-compare");
        expect(q.id).toEqual("where-2");

        expect(q.select.numberOfColumns).toEqual(0);
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1 <= 2");
        expect(q.toModel()).toEqual(model);
    });

});

describe('DELETE Query', () => {
    it('DELETE FROM person', () => {
        const model : Model.Query = {
            name : 'delete-everything',
            id : 'del-1',
            delete : { },
            from : {
                first : {
                    name : "person"
                }
            }
        }

        let q = new QueryDelete(schema, model);
        expect(q.toModel()).toEqual(model);
        expect(q.toSqlString()).toEqual("DELETE\nFROM person");
    });

    it('DELETE FROM person WHERE person.name = "Hans"', () => {
        const model : Model.Query = {
            name : 'delete-everything',
            id : 'del-1',
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
                                type : "TEXT",
                                value : "Hans"
                            }
                        },
                        simple : true
                    }
                }
            }
        }

        let q = new QueryDelete(schema, model);
        expect(q.toModel()).toEqual(model);
        expect(q.toSqlString()).toEqual("DELETE\nFROM person\nWHERE person.name = \"Hans\"");
    });
});


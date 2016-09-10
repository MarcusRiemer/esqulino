import {Schema}                  from '../schema'

import {
    Model, SyntaxTree, CURRENT_API_VERSION
} from './base'
import {QuerySelect}             from './select'

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

describe('Valid SELECT Queries', () => {
    it ('SELECT person.personId, person.name FROM person JOIN ort o', () => {
        let model : Model.QueryDescription = {
            name : 'test-whole',
            id : 'id',
            apiVersion : CURRENT_API_VERSION,
            select : {
                columns : [
                    { expr : { singleColumn : {column : "personId", table : "person" } } },
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

        const q = new QuerySelect(schema, model);
        const s = q.select;

        expect(q.name).toEqual("test-whole");
        expect(q.id).toEqual("id");

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(2);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);
        expect(leaves[1].toModel()).toEqual(model.select.columns[1].expr);

        // SELECT
        expect(q.select.actualNumberOfColumns).toEqual(2);
        expect(q.select.columns.length).toEqual(2);

        const columns = q.select.actualColums;
        expect(columns.length).toEqual(2);
        expect(columns[0].fullName).toEqual("person.personId");
        expect(columns[1].fullName).toEqual("person.name");

        // Retrieval by name
        expect(s.getActualColumnByName("personId")).toEqual(s.actualColums[0]);
        expect(s.getActualColumnByName("name")).toEqual(s.actualColums[1]);

        // Retrieval of something that does not exist
        expect(() => s.getActualColumnByName("nonexistant")).toThrowError();

        // FROM
        expect(q.from.numberOfJoins).toEqual(1);

        expect(q.toSqlString()).toEqual("SELECT person.personId, person.name\nFROM person\n\tJOIN ort o");
        expect(q.toModel()).toEqual(model);
    });

    it ('SELECT * FROM person WHERE person.personId = :personId', () => {
        const model : Model.QueryDescription = {
            name : 'select-single-parameter',
            id : 'select-single-parameter',
            apiVersion : CURRENT_API_VERSION,
            singleRow : true,
            select : {
                columns : [{ expr : { star : { } } }]
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    binary : {
                        lhs : { singleColumn : { table : "person", column : "personId" } },
                        rhs : { parameter : { key : "personId" } },
                        operator : "=",
                        simple : true
                    }
                }
            }
        };

        const q = new QuerySelect(schema, model);
        const s = q.select;
        expect(q.singleRow).toEqual(true);

        // Leaves
        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(3);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);
        expect(leaves[1].toModel()).toEqual(model.where.first.binary.lhs);
        expect(leaves[2].toModel()).toEqual(model.where.first.binary.rhs);

        // Parameters
        expect(q.parameters.length).toEqual(1);
        expect(q.parameters[0].toModel()).toEqual(model.where.first.binary.rhs);
        expect(q.hasParameters).toEqual(true);

        // SELECT
        const columns = q.select.actualColums;
        expect(columns.length).toEqual(3);
        expect(columns[0].fullName).toEqual("person.personId");
        expect(columns[1].fullName).toEqual("person.name");
        expect(columns[2].fullName).toEqual("person.gebDat");

        // Retrieval by name
        expect(s.getActualColumnByName("personId")).toEqual(s.actualColums[0]);
        expect(s.getActualColumnByName("name")).toEqual(s.actualColums[1]);
        expect(s.getActualColumnByName("gebDat")).toEqual(s.actualColums[2]);

        // FROM
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE person.personId = :personId");
        expect(q.toModel()).toEqual(model);
    });


    it ('SELECT * FROM person WHERE 1', () => {
        const model : Model.QueryDescription = {
            name : 'where-simple',
            id : 'where-1',
            apiVersion : CURRENT_API_VERSION,
            select : {
                columns : [{ expr : { star : { } } }]
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    constant : { value : "1" }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-simple");
        expect(q.id).toEqual("where-1");

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(2);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);
        expect(leaves[1].toModel()).toEqual(model.where.first);

        // SELECT
        const columns = q.select.actualColums;
        expect(columns.length).toEqual(3);
        expect(columns[0].fullName).toEqual("person.personId");
        expect(columns[1].fullName).toEqual("person.name");
        expect(columns[2].fullName).toEqual("person.gebDat");

        // FROM
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1");
        expect(q.toModel()).toEqual(model);
    });

    it ('SELECT * FROM person WHERE 1 <= 2', () => {
        const model : Model.QueryDescription = {
            name : 'where-compare',
            id : 'where-2',
            apiVersion : CURRENT_API_VERSION,
            select : {
                columns : [{ expr : { star : { } } }]
            },
            from : {
                first : {
                    name : "person"
                }
            },
            where : {
                first : {
                    binary : {
                        lhs : { constant : { value : "1" } },
                        rhs : { constant : { value : "2" } },
                        operator : "<=",
                        simple : true
                    }
                }
            }
        };

        let q = new QuerySelect(schema, model);
        expect(q.name).toEqual("where-compare");
        expect(q.id).toEqual("where-2");

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(3);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);
        expect(leaves[1].toModel()).toEqual(model.where.first.binary.lhs);
        expect(leaves[2].toModel()).toEqual(model.where.first.binary.rhs);

        expect(q.select.actualNumberOfColumns).toEqual(3);
        expect(q.from.numberOfJoins).toEqual(0);

        expect(q.toSqlString()).toEqual("SELECT *\nFROM person\nWHERE 1 <= 2");
        expect(q.toModel()).toEqual(model);
    });

});

describe('Invalid SELECT Queries', () => {
    it ('Unknown column: SELECT person.nonexistant FROM person', () => {
        const model : Model.QueryDescription = {
            name : 'select-nonexistant-column',
            id : 'invalid-select-1',
            apiVersion : CURRENT_API_VERSION,
            select : {
                columns : [
                    { expr : { singleColumn : {column : "nonexistant", table : "person" } } },
                ]
            },
            from : {
                first : {
                    name : "person"
                }
            }
        };

        let q = new QuerySelect(schema, model);

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(1);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);


        expect(q.toModel()).toEqual(model);
        expect(q.validate().isValid).toBeFalsy();
    });

    it ('SingleRow restriction enabled: No WHERE', () => {
        const model : Model.QueryDescription = {
            name : 'select-single-row-no-restrict',
            id : 'invalid-select-2',
            apiVersion : CURRENT_API_VERSION,
            singleRow : true,
            select : {
                columns : [
                    { expr : { star : { } } },
                ]
            },
            from : {
                first : {
                    name : "person"
                }
            }
        };

        let q = new QuerySelect(schema, model);

        expect(q.validate().isValid).toBeFalsy();

    });

    it ('Duplicate column name: SELECT *, person.name FROM person', () => {
        const model : Model.QueryDescription = {
            name : 'select-duplicate-column',
            id : 'invalid-select-3',
            apiVersion : CURRENT_API_VERSION,
            select : {
                columns : [
                    { expr : { star : { } } },
                    { expr : { singleColumn : {column : "name", table : "person" } } },
                ]
            },
            from : {
                first : {
                    name : "person"
                }
            }
        };

        let q = new QuerySelect(schema, model);

        const leaves = q.getLeaves();
        expect(leaves.length).toEqual(2);
        expect(leaves[0].toModel()).toEqual(model.select.columns[0].expr);
        expect(leaves[1].toModel()).toEqual(model.select.columns[1].expr);

        expect(q.toModel()).toEqual(model);
        expect(q.validate().isValid).toBeFalsy();
    });
});

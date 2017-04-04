import {Schema}                                  from '../../schema'

import {ValidationResult}                        from '../validation'
import * as Model                                from '../description'
import * as SyntaxTree                           from '../syntaxtree'

describe('SELECT', () => {
    it('with only the *-Operator', () => {
        const model : Model.Select = {
            columns : [{
                expr : { star : { } }
            }]
        };

        const s = new SyntaxTree.Select(model, null);
        
        expect(s.toSqlString()).toEqual("SELECT *");
        expect(s.toModel()).toEqual(model);
    });
    
    it('with three simple columns', () => {
        const model : Model.Select = {
            columns : [
                { expr : { singleColumn : {column : "id", table : "person", alias : "p" } } },
                { expr : { singleColumn : {column : "name" , table : "person" } } },
                { expr : { singleColumn : {column : "alter" , table : "person" } }, as : "dasAlter" }
            ]
        };
        
        const s = new SyntaxTree.Select(model, null);

        // Grand picture
        expect(s.actualNumberOfColumns).toEqual(3);

        // Alias names
        expect(s.getAlias(0)).toBeUndefined();
        expect(s.getAlias(1)).toBeUndefined();
        expect(s.getAlias(2)).toEqual("dasAlter");

        // Details of those columns
        const col0 = <SyntaxTree.ColumnExpression> s.getColumn(0);
        expect(col0.tableQualifier).toEqual("p");
        expect(col0.columnName).toEqual("id");

        const col1 = <SyntaxTree.ColumnExpression> s.getColumn(1);
        expect(col1.tableQualifier).toEqual("person");
        expect(col1.columnName).toEqual("name");

        const col2 = <SyntaxTree.ColumnExpression> s.getColumn(2);
        expect(col2.tableQualifier).toEqual("person");
        expect(col2.columnName).toEqual("alter");

        // Retrieval by name
        expect(s.getActualColumnByName("id").expr).toEqual(col0);
        expect(s.getActualColumnByName("name").expr).toEqual(col1);
        expect(s.getActualColumnByName("dasAlter").expr).toEqual(col2);

        // Model and String serialization
        expect(s.toSqlString()).toBe('SELECT p.id, person.name, person.alter AS dasAlter');
        expect(s.toModel()).toEqual(model);
    });

    it('Invalid: Entirely empty', () => {
        const emptySchema = new Schema([]);
        
        const model : Model.Select = {
            columns : []
        };

        const s = new SyntaxTree.Select(model, null);
        expect(s.toModel()).toEqual(model);
        expect(s.validate(emptySchema).isValid).toBeFalsy();
    })

    it('adding a named column', () => {
        const model : Model.Select = {
            columns : [],
        };

        const resultModel : Model.Select = {
            columns : [
                {
                    expr : {
                        singleColumn : {column : "name" , table : "person" }
                    },
                    as : "pname"
                }
            ]
        }

        const s = new SyntaxTree.Select(model, null);
        s.appendColumn("person", "name", "pname");

        expect(s.actualNumberOfColumns).toEqual(1);
        expect(s.toModel()).toEqual(resultModel);
        expect(s.toSqlString()).toEqual("SELECT person.name AS pname");
    });

    it('adding a unnamed column', () => {
        const model : Model.Select = {
            columns : []
        };

        const resultModel : Model.Select = {
            columns : [
                {
                    expr : {
                        singleColumn : {column : "name" , table : "person" }
                    }
                }
            ]
        }

        const s = new SyntaxTree.Select(model, null);
        s.appendColumn("person", "name");

        expect(s.actualNumberOfColumns).toEqual(1);
        expect(s.toModel()).toEqual(resultModel);
        expect(s.toSqlString()).toEqual("SELECT person.name");
    });
});




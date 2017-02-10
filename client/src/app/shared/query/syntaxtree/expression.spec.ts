import {Schema}                                  from '../../schema'

import {Model}                                   from '../base'
import {ValidationErrors, ValidationResult}      from '../validation'

import * as SyntaxTree from './expression'

describe('DataType', () => {
    it('INTEGER', () => {
        expect(SyntaxTree.determineType("1")).toEqual(<Model.DataType>"INTEGER");
        expect(SyntaxTree.determineType("-1")).toEqual(<Model.DataType>"INTEGER");
        expect(SyntaxTree.determineType("100")).toEqual(<Model.DataType>"INTEGER");
    });

    it('REAL', () => {
        expect(SyntaxTree.determineType("1.")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType(".1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("1.1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-1.")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-.1")).toEqual(<Model.DataType>"REAL");
        expect(SyntaxTree.determineType("-1.1")).toEqual(<Model.DataType>"REAL");
    });
})

describe('MissingExpression', () => {
    it('Only case', () => {
        const model : Model.MissingExpression = {

        }

        const c = new SyntaxTree.MissingExpression(model, null);

        // Model and String serialization
        expect( () => { c.toSqlString() }).toThrow()
        expect(c.toModel().missing).toEqual(model);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"missing")

        expect(c.validate(new Schema([])).isValid).toBeFalsy();
    });
});

describe('ConstantExpression', () => {
    it('INTEGER', () => {
        const model : Model.ConstantExpression = {
            value : "0"
        }

        const c = new SyntaxTree.ConstantExpression(model, null);

        // Model and String serialization
        expect(c.toSqlString()).toEqual(model.value);
        expect(c.type).toEqual("INTEGER");
        expect(c.toModel().constant).toEqual(model);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"constant")

        // Negative values
        let newValue = "-2";
        c.value = newValue;
        expect(c.type).toEqual("INTEGER");
        expect(c.value).toEqual(newValue);

        // Explicitly positive values
        newValue = "+3";
        c.value = newValue;
        expect(c.type).toEqual("INTEGER");
        expect(c.value).toEqual(newValue)
    });

    it('TEXT', () => {
        const model : Model.ConstantExpression = {
            value : "abc"
        }

        const c = new SyntaxTree.ConstantExpression(model, null);

        // Model and String serialization
        expect(c.toSqlString()).toEqual(`'abc'`);
        expect(c.type).toEqual("TEXT");
        expect(c.toModel().constant).toEqual(model);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"constant")

        // Something that loosely resembles a floating point literal
        let newValue = "-0.0.0";
        c.value = newValue;
        expect(c.type).toEqual("TEXT");
        expect(c.value).toEqual(`'${newValue}'`);

        // Something that needs to be escaped
        newValue = "escape'me";
        c.value = newValue;
        expect(c.type).toEqual("TEXT");
        expect(c.value).toEqual(`'escape''me'`);
    });
});

describe('ParameterExpression', () => {
    it('Valid Key', () => {
        const model : Model.ParameterExpression = {
            key : "valid"
        }

        const c = new SyntaxTree.ParameterExpression(model, null);

        // Model and String serialization
        expect(c.toSqlString()).toEqual(`:${model.key}`);
        expect(c.toModel().parameter).toEqual(model);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"parameter")
    });

    it('Invalid Key: empty string', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:""}, null) ).toThrow();
    });

    it('Invalid Key: contains space', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"v a l"}, null) ).toThrow();
    });
    
    it('Invalid Key: Begins with a number', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"1valid"}, null) ).toThrow();
    });

    it('Invalid Key: Begins with an underscore', () => {
        expect(() => new SyntaxTree.ParameterExpression({key:"_valid"}, null) ).toThrow();
    });
});


describe('ColumnExpression', () => {
    it('with only a name', () => {
        const model = {
            column : "name"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual(model.column);
        expect(c.hasTableQualifier).toBeFalsy();
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"column")
        
        // Model and String serialization
        expect(c.toSqlString()).toEqual(model.column);
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name and table', () => {
        const model = {
            column : "name",
            table : "person"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("person");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"column")

        // Model and String serialization
        expect(c.toSqlString()).toEqual("person.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('with name, table and table alias', () => {
        const model = {
            column : "name",
            table : "person",
            alias : "p"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual("name");
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual("p");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"column")

        // Model and String serialization
        expect(c.toSqlString()).toEqual("p.name");
        expect(c.toModel().singleColumn).toEqual(model);
    });

    it('Invalid: With a table that does not exist', () => {
        const model : Model.SingleColumnExpression = {
            column : "noncolumn",
            table : "nontable",
            alias : "n"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual(model.column);
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual(model.alias);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"column")

        // Model and String serialization
        expect(c.toSqlString()).toEqual("n.noncolumn");
        expect(c.toModel().singleColumn).toEqual(model);

        // Validity
        const v = c.validate(new Schema([]));
        expect(v.isValid).toBeFalsy();
        expect(v.getError(0).errorMessage).toContain(model.table);
    });

    it('Invalid: With a column that does not exist', () => {
        const model : Model.SingleColumnExpression = {
            column : "noncolumn",
            table : "person",
            alias : "n"
        };
        
        let c = new SyntaxTree.ColumnExpression(model, null);

        expect(c.columnName).toEqual(model.column);
        expect(c.hasTableQualifier).toBeTruthy();
        expect(c.tableQualifier).toEqual(model.alias);
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"column")

        // Model and String serialization
        expect(c.toSqlString()).toEqual("n.noncolumn");
        expect(c.toModel().singleColumn).toEqual(model);

        // Validity
        const v = c.validate(new Schema([{
            name : "person",
            "foreign_keys": [],
            columns : []
        }]));
        expect(v.isValid).toBeFalsy();
        expect(v.getError(0).errorMessage).toContain(model.table);
        expect(v.getError(0).errorMessage).toContain(model.column);
    });
});

describe('StarExpression', () => {
    it('for all columns', () => {
        const model : Model.StarExpression = { };

        let c = new SyntaxTree.StarExpression(model, null);

        expect(c.toModel().star).toEqual(model);
        expect(c.toSqlString()).toEqual("*");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"star")
    });

    it('for a specific table', () => {
        const model : Model.StarExpression = {
            limitedTo : {
                name : "table"
            }
        };

        let c = new SyntaxTree.StarExpression(model, null);

        expect(c.toModel().star).toEqual(model);
        expect(c.toSqlString()).toEqual("table.*");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"star")
    });
    
    it('for a specific table with alias', () => {
        const model : Model.StarExpression = {
            limitedTo : {
                name : "table",
                alias : "t"
            }
        };

        let c = new SyntaxTree.StarExpression(model, null);

        expect(c.toModel().star).toEqual(model);
        expect(c.toSqlString()).toEqual("t.*");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"star")
    });

    it('Invalid: For an unknown table', () => {
        const model : Model.StarExpression = {
            limitedTo : {
                name : "table"
            }
        };

        let c = new SyntaxTree.StarExpression(model, null);

        expect(c.toModel().star).toEqual(model);
        expect(c.toSqlString()).toEqual("table.*");
        expect(c.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"star")

        // Validity
        const v = c.validate(new Schema([]));
        expect(v.isValid).toBeFalsy();
    });
});

describe('BinaryExpression', () => {
    it('testing two columns for inequality', () => {
        const model = {
            lhs : { singleColumn : { column : "name", table : "person" } },
            rhs : { singleColumn : { column : "name", table : "stadt" } },
            operator : <Model.Operator>"<>",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("<>");
        let lhs = <SyntaxTree.ColumnExpression> e.lhs;
        let rhs = <SyntaxTree.ColumnExpression> e.rhs;

        expect(lhs.columnName).toEqual("name");
        expect(lhs.tableQualifier).toEqual("person");

        expect(rhs.columnName).toEqual("name");
        expect(rhs.tableQualifier).toEqual("stadt");

        // Model and String serialization
        expect(e.toSqlString()).toEqual("person.name <> stadt.name");
        expect(e.toModel().binary).toEqual(model);
        expect(e.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"binary")
    });

    it('testing two integer constants for equality', () => {
        const strTypeInt = <Model.DataType>"INTEGER";
        
        const model = {
            lhs : { constant : { value : "0" } },
            rhs : { constant : { value : "1" } },
            operator : <Model.Operator>"=",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("=");
        let lhs = <SyntaxTree.ConstantExpression> e.lhs;
        let rhs = <SyntaxTree.ConstantExpression> e.rhs;

        expect(lhs.type).toEqual(<Model.DataType>"INTEGER");
        expect(lhs.value).toEqual("0");

        expect(rhs.type).toEqual(<Model.DataType>"INTEGER");
        expect(rhs.value).toEqual("1");
        
        // Model and String serialization
        expect(e.toSqlString()).toEqual("0 = 1");
        expect(e.toModel().binary).toEqual(model);
        expect(e.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"binary")
    });

    it('testing two string constants with the LIKE operator', () => {
        const strTypeStr = <Model.DataType>"TEXT";
        
        const model = {
            lhs : { constant : { value : "w a s d" } },
            rhs : { constant : { value : "%a%" } },
            operator : <Model.Operator>"LIKE",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);

        expect(e.operator).toEqual("LIKE");
        let lhs = <SyntaxTree.ConstantExpression> e.lhs;
        let rhs = <SyntaxTree.ConstantExpression> e.rhs;

        expect(lhs.type).toEqual(<Model.DataType>"TEXT");
        expect(lhs.value).toEqual("'w a s d'");

        expect(rhs.type).toEqual(<Model.DataType>"TEXT");
        expect(rhs.value).toEqual("'%a%'");
        
        // Model and String serialization, but not testing
        // serialization as there is no easy way to test it
        // against the original
        expect(e.toSqlString()).toEqual(`'w a s d' LIKE '%a%'`);
        expect(e.templateIdentifier).toEqual(<SyntaxTree.TemplateId>"binary")
    });

    it('replacing children', () => {
        const strTypeStr = <Model.DataType>"TEXT";
        
        const model = {
            lhs : { constant : { type : strTypeStr, value : "w a s d" } },
            rhs : { constant : { type : strTypeStr, value : "%a%" } },
            operator : <Model.Operator>"LIKE",
            simple : true
        };
        
        let e = new SyntaxTree.BinaryExpression(model, null);
        const lhs = <SyntaxTree.ConstantExpression> e.lhs;
        const rhs = <SyntaxTree.ConstantExpression> e.rhs;

        const newLhs = new SyntaxTree.MissingExpression({}, null);
        const newRhs = new SyntaxTree.MissingExpression({}, null);

        e.replaceChild(lhs, newLhs);
        expect(e.lhs).toBe(newLhs);
        e.replaceChild(rhs, newRhs);
        expect(e.rhs).toBe(newRhs);
    });
});

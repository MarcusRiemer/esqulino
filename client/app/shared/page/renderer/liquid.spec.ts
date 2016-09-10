import {LiquidRenderer}              from './liquid'

import {
    Paragraph, ParagraphDescription,
    Column, ColumnDescription,
    Row, RowDescription,
    WidgetBase, WidgetDescription
} from '../widgets/index'

describe('Page Renderer: Liquid', () => {
    
    it('Paragraph', () => {
        const m : ParagraphDescription = {
            text : "Hello world",
            type : "paragraph"
        }

        let p = new Paragraph(m);
        let r = new LiquidRenderer();

        expect(r.renderWidget(p)).toEqual(`<p>${m.text}</p>`);
    });
    
    it('Column', () => {
        const m : ColumnDescription = {
            type : "column",
            width : 6,
            widgets : []
        }

        let c = new Column(m);
        let r = new LiquidRenderer();

        expect(r.renderWidget(c)).toEqual(`<div class="col-md-6"></div>`);
    });

    it('Column with two paragraphs', () => {
        const mp1 : ParagraphDescription = {
            text : "1",
            type : "paragraph"
        };

        const mp2 : ParagraphDescription = {
            text : "2",
            type : "paragraph"
        };
        
        const m : ColumnDescription = {
            type : "column",
            width : 6,
            widgets : [mp1, mp2]
        }

        let c = new Column(m);
        let r = new LiquidRenderer();

        expect(r.renderWidget(c)).toEqual(`<div class="col-md-6"><p>1</p>\n<p>2</p></div>`);
    });

    it('Row', () => {
        const m : RowDescription = {
            type : "row",
            columns : []
        }

        let row = new Row(m);
        let r = new LiquidRenderer();

        expect(r.renderWidget(row)).toEqual(`<div class="row"></div>`);
    });

    it('Row with two columns', () => {
        const m : RowDescription = {
            type : "row",
            columns : [
                {
                    type : "column",
                    width : 3,
                    widgets : []
                },
                {
                    type : "column",
                    width : 7,
                    widgets : []
                }
            ]
        }

        let row = new Row(m);
        let r = new LiquidRenderer();

        expect(r.renderWidget(row)).toEqual(`<div class="row"><div class="col-md-3"></div>\n<div class="col-md-7"></div></div>`);
    });
});


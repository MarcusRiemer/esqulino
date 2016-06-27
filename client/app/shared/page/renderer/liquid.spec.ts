import {LiquidRenderer}              from './liquid'

import {
    Paragraph, ParagraphDescription,
    Column, ColumnDescription,
    Row, RowDescription,
    Widget, WidgetDescription
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
            width : 6,
            widgets : []
        }

        let c = new Column(m);
        let r = new LiquidRenderer();

        expect(r.renderColumn(c)).toEqual(`<div class="col-md-6"></div>`);
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
            width : 6,
            widgets : [mp1, mp2]
        }

        let c = new Column(m);
        let r = new LiquidRenderer();

        expect(r.renderColumn(c)).toEqual(`<div class="col-md-6"><p>1</p><p>2</p></div>`);
    });

    it('Row', () => {
        const m : RowDescription = {
            columns : []
        }

        let row = new Row(m);
        let r = new LiquidRenderer();

        expect(r.renderRow(row)).toEqual(`<div class="row"></div>`);
    });

    it('Row with two columns', () => {
        const m : RowDescription = {
            columns : [
                {
                    width : 3,
                    widgets : []
                },
                {
                    width : 7,
                    widgets : []
                }
            ]
        }

        let row = new Row(m);
        let r = new LiquidRenderer();

        expect(r.renderRow(row)).toEqual(`<div class="row"><div class="col-md-3"></div><div class="col-md-7"></div></div>`);
    });
});


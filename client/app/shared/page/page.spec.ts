import './widgets/action.spec'
import './widgets/button.spec'
import './widgets/column.spec'
import './widgets/embedded-html.spec'
import './widgets/heading.spec'
import './widgets/paragraph.spec'
import './widgets/input.spec'


import {
    Page, PageDescription, CURRENT_API_VERSION
} from './page'

import {
    Paragraph, ParagraphDescription,
    Column, ColumnDescription,
    Row, RowDescription,
    WidgetBase, WidgetDescription
} from './widgets/index'

const singleRowPage : PageDescription = {
    id : "testpage",
    name : "Serialization test",
    apiVersion : CURRENT_API_VERSION,
    widgets : [
        {
            type : "row",
            columns : [
                {
                    type : "column",
                    width : 1,
                    widgets : [
                            <ParagraphDescription>{
                                type : "paragraph",
                                text : "1.1"
                            },
                            <ParagraphDescription>{
                                type : "paragraph",
                                text : "1.1"
                            }
                    ]
                },
                {
                    type : "column",
                    width : 2,
                    widgets : [
                            <ParagraphDescription>{
                                type : "paragraph",
                                text : "2.1"
                            },
                            <ParagraphDescription>{
                                type : "paragraph",
                                text : "2.1"
                            }
                    ]
                }
            ]
        }
    ]
};

/**
 * Nasty casting function because we know better then the type
 * system that rows and columns always have children.
 */
function getRowChild(row : RowDescription, colIndex : number, widgetIndex : number) {
    return (row.columns[colIndex].widgets[widgetIndex])
}

describe('Page', () => {
    it('Serialization', () => {
        const m : PageDescription = singleRowPage;

        let p = new Page(m);
        expect(p.toModel()).toEqual(m);
    });

    it ('Allows access to widgets', () => {
        const m : PageDescription = singleRowPage;

        let p = new Page(m);
        const allWidgets = p.allWidgets;

        // We know better then the type-system that this must be a row
        const firstRow = (m.widgets[0] as RowDescription);

        expect(allWidgets[0].toModel()).toEqual(firstRow.columns[0].widgets[0]);
        expect(allWidgets[1].toModel()).toEqual(firstRow.columns[0].widgets[1]);
        expect(allWidgets[2].toModel()).toEqual(firstRow.columns[1].widgets[0]);
        expect(allWidgets[3].toModel()).toEqual(firstRow.columns[1].widgets[1]);
    });
})

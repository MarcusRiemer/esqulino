import './widgets/button.spec'
import './widgets/column.spec'
import './widgets/heading.spec'
import './widgets/paragraph.spec'
import './widgets/input.spec'

import {
    Page, PageDescription
} from './page'

import {
    Paragraph, ParagraphDescription,
    Column, ColumnDescription,
    Row, RowDescription,
    Widget, WidgetDescription
} from './widgets/index'

const singleRowPage : PageDescription = {
    id : "testpage",
    name : "Serialization test",
    rows : [
        {
            columns : [
                {
                    width : 4,
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
                    width : 4,
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
        expect(allWidgets[0].toModel()).toEqual(m.rows[0].columns[0].widgets[0]);
        expect(allWidgets[1].toModel()).toEqual(m.rows[0].columns[0].widgets[1]);
        expect(allWidgets[2].toModel()).toEqual(m.rows[0].columns[1].widgets[0]);
        expect(allWidgets[3].toModel()).toEqual(m.rows[0].columns[1].widgets[1]);
    });
})

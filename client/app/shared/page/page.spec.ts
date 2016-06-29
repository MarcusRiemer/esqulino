import './widgets/column.spec'
import './widgets/paragraph.spec'

import {
    Page, PageDescription
} from './page'

import {
    Paragraph, ParagraphDescription,
    Column, ColumnDescription,
    Row, RowDescription,
    Widget, WidgetDescription
} from './widgets/index'


describe('Page', () => {
    it('Serialization', () => {
        const m : PageDescription = {
            id : "testpage",
            name : "Serialization test",
            referencedQueries : [],
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
        }

        let p = new Page(m);
        expect(p.toModel()).toEqual(m);
    });
})

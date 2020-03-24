import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import {Apollo} from 'apollo-angular';
import gql from 'graphql-tag';

import { GrammarListDescription, GrammarListGraphQlResponse } from '../../shared/syntaxtree';
import { ListGrammarDataService, MutateGrammarService } from '../../shared/serverdata';
import {last} from "rxjs/operators";

@Component({
    selector: 'grammar-overview-selector',
    templateUrl: './templates/overview-grammar-graphql.html'
})

export class OverviewGrammarGraphQLComponent implements OnInit {
    response: GrammarListGraphQlResponse;
    availableGrammars: GrammarListDescription[];
    loading: boolean = true;
    error: any;
    resultsLength:number;
    // Angular Material UI to paginate
    @ViewChild(MatPaginator)
    _paginator: MatPaginator;

    // Angular Material UI to sort by different columns
    @ViewChild(MatSort)
    _sort: MatSort;

    constructor(
        private _list: ListGrammarDataService,
        private _mutate: MutateGrammarService,
        private apollo: Apollo
    ) { }

    ngOnInit() {
        this.apollo
            .watchQuery({
                query: gql`
           {
            grammars {
                id
                name
                slug
                programmingLanguageId
            }
          }
        `,
            })
            .valueChanges.subscribe(result => {
            this.response = result;
            this.availableGrammars =  this.response.data["grammars"];
            this.resultsLength = this.availableGrammars.length;
            this.loading = this.response.loading;
            this.error = this.response.errors;
        });
    }


    public deleteGrammar(id: string) {
        this._mutate.deleteSingle(id);
    }

    /**
     * User wants to see a refreshed dataset.
     */
    onRefresh() {
        this._list.listCache.refresh();
    }

    /**
     * User has requested a different chunk of data
     */
    onChangePagination() {
        this._list.setListPagination(this._paginator.pageSize, this._paginator.pageIndex);
    }

    /**
     * User has requested different sorting options
     */
    onChangeSort() {
        this._list.setListOrdering(this._sort.active as any, this._sort.direction);
    }




    displayedColumns : (keyof(GrammarListDescription) | "actions" )[] = ["name", "slug", "id","actions"];

}

import { Component, ViewChild, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { GrammarListDescription} from '../../shared/syntaxtree';
import { ListGrammarDataService, MutateGrammarService, GrammarListRequestQL } from '../../shared/serverdata';

import {first, map} from "rxjs/operators";
import {Observable} from "rxjs";

@Component({
    selector: 'grammar-overview-selector',
    templateUrl: './templates/overview-grammar-graphql.html'
})

export class OverviewGrammarGraphQLComponent implements OnInit {
    availableGrammars: Observable<GrammarListDescription[]>;
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
        private _query: GrammarListRequestQL
    ) { }

    ngOnInit() {
        this.availableGrammars = this._query.watch()
            .valueChanges.pipe(
                map(result => result.data.grammars)
        );
        this.availableGrammars.pipe(first()).subscribe( grammars => this.resultsLength = grammars.reduce((acc,_) => acc + 1, 0));
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

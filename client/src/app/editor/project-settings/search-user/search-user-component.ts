import { Component, EventEmitter, Input, Output } from "@angular/core";
import { isNetworkRequestInFlight } from "@apollo/client/core/networkStatus";
import { BehaviorSubject, Subscription, combineLatest, timer } from "rxjs";
import { debounce, distinctUntilChanged, filter, map } from "rxjs/operators";
import { FindUserByNameGQL } from "src/generated/graphql";

@Component({
  selector: "app-search-user",
  templateUrl: "./search-user-component.html",
  styleUrls: ["./search-user-component.scss"],
})
export class SearchUserComponent {
  @Input() memberId: string;

  @Output() memberIdChange = new EventEmitter<string>();

  private readonly _searchInput$ = new BehaviorSubject<string>("");
  readonly searchInput$ = this._searchInput$.asObservable().pipe(
    debounce(() => timer(500)),
    distinctUntilChanged()
  );

  private readonly _queryObject = this.getFilteredUsers.watch(
    { filterName: `%` },
    { notifyOnNetworkStatusChange: true, useInitialLoading: true }
  );

  readonly filteredUsersQuery$ = this._queryObject.valueChanges;

  readonly filterUsersLoading$ = this.filteredUsersQuery$.pipe(
    map((query) => {
      return isNetworkRequestInFlight(query.networkStatus);
    })
  );

  readonly filteredUsers$ = this.filteredUsersQuery$.pipe(
    filter((result) => !!result.data?.users),
    map((result) => {
      return result.data.users.nodes;
    })
  );

  readonly lastValidId$ = combineLatest([
    this.searchInput$,
    this.filteredUsers$,
  ]).pipe(
    map(([searchInput, users]) => {
      if (users.length === 1 && searchInput === users[0]["displayName"]) {
        return users[0]["id"];
      } else {
        return "";
      }
    })
  );

  readonly hasValidId$ = this.lastValidId$.pipe(map((id) => id !== ""));

  private _subscriptions: Subscription[] = [];

  constructor(private getFilteredUsers: FindUserByNameGQL) {
    this._subscriptions.push(
      // Required to ensure that the chosen member ID is emitted independently
      // from any template logic.
      this.lastValidId$.subscribe((id) => {
        this.memberId = id;
        this.memberIdChange.emit(this.memberId);
      })
    );
    this._subscriptions.push(
      // Proper loading indication only works when refetching an
      // existing query
      this._searchInput$.subscribe((input) => {
        this._queryObject.refetch({ filterName: `%${input}%` });
      })
    );
  }

  handleUserInput(input: string) {
    this._searchInput$.next(input);
  }

  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }
}

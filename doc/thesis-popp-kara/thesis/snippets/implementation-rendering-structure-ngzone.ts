...
constructor(private ngZone: NgZone) { }

ngOnInit() {
  this.ngZone.runOutsideAngular(() => this.draw());
}
...

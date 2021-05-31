import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { graphviz } from "d3-graphviz";
import { wasmFolder } from "@hpcc-js/wasm";
import { filter, switchMap } from "rxjs/operators";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { Subscription } from "rxjs";

@Component({
  templateUrl: "./exec-finite-state-machine.component.html",
  styleUrls: ["./exec-finite-state-machine.component.scss"],
})
export class ExecFiniteStateMachineComponent
  implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild("graphvizHost")
  private _graphvizHost: ElementRef;

  private _subscriptions: Subscription[] = [];

  private static _wasmFolderSet = false;

  constructor(
    private readonly currentCodeResource: CurrentCodeResourceService
  ) {}

  readonly currentProgram$ = this.currentCodeResource.currentResource.pipe(
    filter((c) => !!c),
    switchMap((c) => c.generatedCode$),
    filter((c) => !!c)
  );

  ngOnInit(): void {
    if (!ExecFiniteStateMachineComponent._wasmFolderSet) {
      wasmFolder("/hpcc-js/");
    }
  }

  ngAfterViewInit(): void {
    this.currentProgram$.subscribe((p) => {
      try {
        graphviz(this._graphvizHost.nativeElement).zoom(false).renderDot(p);
      } catch {}
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach((s) => s.unsubscribe());
    this._subscriptions = [];
  }
}

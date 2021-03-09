import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  CreateProgrammingLanguageProjectGQL,
  CreateProgrammingLanguageProjectInput,
} from "../../generated/graphql";

@Component({
  selector: "app-create-language",
  templateUrl: "./templates/create-language.html",
})
export class CreateLanguageComponent {
  creationInput = new FormGroup({
    projectName: new FormControl("", [
      Validators.required,
      Validators.minLength(2),
    ]),
    languageName: new FormControl("", [Validators.required]),
    description: new FormControl(""),
  });

  inProgress = false;

  constructor(private _serverEndpoint: CreateProgrammingLanguageProjectGQL) {}

  submit() {
    console.log(this.creationInput);
  }
}

export class Project {
    private id : string;
    private name : string;
    private description : string;

    constructor(json : any) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
    }
}

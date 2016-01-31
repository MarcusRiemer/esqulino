import {Table} from './table'

export class Project {
    public id : string;
    public name : string;
    public description : string;
    public schema : Table[];
    
    constructor(json : any) {
        this.id = json.id;
        this.name = json.name;
        this.description = json.description;
        this.schema = <Table[]> json.schema;
    }
}

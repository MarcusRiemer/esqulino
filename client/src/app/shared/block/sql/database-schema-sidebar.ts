import { Sidebar } from "../sidebar";

export class DatabaseSchemaSidebar implements Sidebar {
  get portalComponentTypeId() {
    return "databaseSchema";
  }
}

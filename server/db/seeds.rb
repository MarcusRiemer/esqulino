# coding: utf-8
ProjectSource.destroy_all
CodeResource.destroy_all
BlockLanguage.destroy_all
ProgrammingLanguage.destroy_all
Project.destroy_all

prog_sql = ProgrammingLanguage.create!(id: "sql", name: "SQL")
prog_regex = ProgrammingLanguage.create!(id: "regex", name: "Reguläre Ausdrücke")
prog_dxml = ProgrammingLanguage.create!(id: "dxml", name: "Dynamic XML")
prog_xml = ProgrammingLanguage.create!(id: "xml", name: "XML")

block_sql = BlockLanguage.create!(
  name: "SQL",
  family: "sql",
  model: {
    sidebarBlocks: [],
    editorBlocks: []
  }
)

proj_blog = Project.create!(
  name: "Blog",
  description: "Dein Blog, deine Regeln! Schreibe über Themen die dir am Herzen liegen und tausche dich in den Kommentaren mit deinen Lesern aus.",
  public: true,
  slug: "blog",
  preview: "a1986d62-0aec-4be4-a4db-cacd48f06453",
  index_page_id: "033f059a-ce96-405e-a415-de7575e05dae",
  active_database: "default"
)

proj_events = Project.create!(
  name: "Ereignisse",
  description: "Historische Ereignisse & Personen mit ihren jeweiligen zeitlichen Daten. Welcher Wissenschaftler hat eigentlich zu Zeiten der ersten olympischen Spiele gelebt?",
  public: true,
  slug: "events",
  preview: "preview.jpg",
  index_page_id: "f04bca19-cecd-4996-96a8-0749b4f25311",
  active_database: "default"
)

proj_cyoa = Project.create!(
  name: "Adventure",
  description: "Write an adventure story and make your friends face-to-face",
  public: true,
  slug: "cyoa",
  preview: "9a253ae0-8af1-4056-8984-50cb37b79c55",
  index_page_id: "352150eb-88bf-451b-821e-9fed8ce02cc2",
  active_database: "default"
)

proj_cyoa.project_sources.create!(
  url: "https://de.wikipedia.org/wiki/Spielbuch",
  title: "Wikipedia",
  display: "The sample story comes 1: 1 from the Wikipedia article to Spielbuch"
)


proj_test_sequence = Project.create!(
  name: "Test: Sequence DB",
  description: "Dieses Projekt wird für automatische Tests benutzt und hat keine inhaltliche  Bedeutung.",
  public: true,
  slug: "db-sequence",
  index_page_id: "159ba814-445d-4167-a483-e3fc0db85cae",
  active_database: "default"
)

proj_test_sequence.code_resources.create!(
  name: "select-test",
  ast:
    {
      "language": "sql",
     "name": "querySelect",
     "children":
       {
         "select":
          [
            {
              "language": "sql",
             "name": "select",
             "children":
               {
                 "columns":
                  [
                    {
                      "language": "sql",
                     "name": "columnName",
                     "properties":
                       {
                         "columnName": "id",
                        "refTableName": "foo"
                       }
                    }
                  ]
               }
            }
          ],
        "from":
          [
            {
              "language": "sql",
             "name": "from",
             "children":
               {
                 "tables":
                  [
                    {
                      "language": "sql",
                     "name": "tableIntroduction",
                     "properties":
                       {
                         "name": "foo"
                       }
                    }
                  ]
               }
            }
          ]
       }
    },
  block_language: block_sql,
  programming_language: prog_sql
)

puts "Created #{Project.count} projects"

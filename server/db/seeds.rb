ProjectStructure.destroy_all

ProjectStructure.create!([{
  name: "Blog",
  description: "Dein Blog, deine Regeln! Schreibe über Themen die dir am Herzen liegen
    und tausche dich in den Kommentaren mit deinen Lesern aus.",
  public: true,
  preview: "a1986d62-0aec-4be4-a4db-cacd48f06453",
  index_image_id: "033f059a-ce96-405e-a415-de7575e05dae",
  active_database: "default"
  },
  {
    name: "Ereignisse",
    description: "Historische Ereignisse & Personen mit ihren jeweiligen zeitlichen Daten.
      Welcher Wissenschaftler hat eigentlich zu Zeiten der ersten olympischen Spiele gelebt?",
    public: true,
    preview: "preview.jpg",
    index_image_id: "f04bca19-cecd-4996-96a8-0749b4f25311",
    active_database: "default"
  }])

  p "Created #{ProjectStructure.count} projects"

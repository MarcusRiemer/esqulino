FactoryBot.define do
  factory :block_language_generator do
    name { "Spec Block Language Creator" }
    model {
      ({
         "editorComponents": []
       })
    }
  end
end

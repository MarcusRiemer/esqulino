FactoryBot.define do
  factory :block_language_generator do
    name "Spec Block Language Creator"
    target_name "Generated Block Language"
    model ({
             "editorComponents": []
           })
  end
end

# frozen_string_literal: true

# Update the model of a single block language to include the
# "manual" type.
def migrate_single(b)
  if b.model && b.model['localGeneratorInstructions']
    b.model['localGeneratorInstructions']['type'] = 'manual'
    b.save!

    puts "Migrated: #{b.readable_identification}"
  else
    puts "Skipped : #{b.readable_identification}"
  end
end

namespace :temporary do
  desc "Schema for block language generators changed, adds \"type: 'manual'\" to all existing generators"
  task block_lang_generator_different_types: :environment do
    BlockLanguage.transaction do
      BlockLanguage.all.each { |b| migrate_single b }
    end
  end
end

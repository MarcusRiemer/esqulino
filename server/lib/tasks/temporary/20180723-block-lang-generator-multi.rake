def migrate_single(single_hash)
  if single_hash['type'] == 'single' then
    puts "Skip: Single"
    puts single_hash

    return
  end
  
  puts "Pre: Single"
  puts single_hash
  
  attributes = single_hash.clone
  single_hash.clear

  single_hash['type'] = 'single'
  block_instructions = attributes.delete("this")

  if block_instructions then
    single_hash['block'] = block_instructions
  end

  single_hash['attributes'] = attributes

  puts "Post: Single"
  puts single_hash
end

namespace :temporary do
  desc "Schema for block language generators changed, at least 'type'-attribute required"
  task block_lang_generator_multi: :environment do
    languages = BlockLanguage.all
    puts "Going to update #{languages.count} languages"

    ActiveRecord::Base.transaction do
      languages.each do |lang|
        local = lang.model.fetch('localGeneratorInstructions', {})
        if local then
          local.fetch('typeInstructions', {}).each do |grammarName,typesHash|
            typesHash.each do |typeName, scopesHash|
              if (scopesHash.fetch('type', nil) == 'multi') then
                puts "Multi: #{typeName}"
                scopesHash['blocks'].each do |single|
                  migrate_single single
                end
              else
                migrate_single(scopesHash)
              end
            end
          end
          lang.save!
        end
      end
    end

    puts " All done now!"
  end
end

namespace :blattwerkzeug do
  namespace :migrate do
    task grammar_verbose_typename: :environment do
      ActiveRecord::Base.transaction do
        affected = Grammar.all
                          .select { |g| g.model['root'].is_a? String }

        puts "Converting #{affected.count} grammars"

        affected.each do |g|
          # Use the technical name as language name
          g.model['root'] = { "languageName": g.technical_name, "typeName": g.model['root'] }

          # "namespace" the types
          oldTypes = g.model['types']
          g.model['types'] = {}
          g.model['types'][g.technical_name] = oldTypes

          byebug unless g.save

          print '.'
        end
      end
    end
  end
end

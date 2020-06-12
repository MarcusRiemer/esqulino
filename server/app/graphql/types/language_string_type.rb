module Types
  class Types::LanguageStringType < GraphQL::Schema::Object
    Types::BaseEnum::LanguageEnum.enum_values.each do |l|
      field l.to_sym, String,null:false
    end
  end
end

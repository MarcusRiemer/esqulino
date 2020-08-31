module Validators
  class Languages
    def self.validate!(args)
      if (Types::Base::BaseEnum::LanguageEnum.values.keys & args.keys).empty?
        raise GraphQL::ExecutionError, "Language Keys are missing for #{args}"
      elsif not (args.keys - Types::Base::BaseEnum::LanguageEnum.values.keys).empty?
        raise GraphQL::ExecutionError, "Unknown Language Keys provided in #{args}"
      end
    end
  end
end
module Validators
  class Languages
    def self.validate!(args)
      if (Types::Base::BaseEnum::LanguageEnum.values.keys & args.keys).empty?
        raise GraphQL::ExecutionError, "Language Keys are missing for #{args}"
      end
    end
  end
end
module Validators
  class Languages
    def self.validate!(args)
      # Empty results may happen and should be dealt with by the model
      if args.empty?
        nil
      elsif !(args.keys - Types::Base::BaseEnum::LanguageEnum.values.keys).empty?
        raise GraphQL::ExecutionError, "Unknown Language Keys provided in #{args}"
      end
    end
  end
end

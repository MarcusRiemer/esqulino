module Validators
  class Languages
    def self.validate!(args)
      # TODO: Use language Enum to validate all provided languages!
      unless args.kind_of?(Hash) && (args["de"].present? || args["en"].present?)
        raise GraphQL::ExecutionError, "Language Keys are missing for #{args}"
      end
    end
  end
end
module Validators
  class NodeDescription
    def self.validate!(ast)
      json_schema_validate('NodeDescription', ast)
    end
  end
end
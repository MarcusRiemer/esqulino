module Validators
  class NodeDescription
    include JsonSchemaHelper
    def self.validate!(ast)
      json_schema_validate('NodeDescription', ast)
    end
  end
end
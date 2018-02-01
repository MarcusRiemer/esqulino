require 'rails_helper'

require_dependency 'ide_service'

RSpec.describe "IDE Service" do
  context "One Shot" do
    it "emits SQL source code" do
      service = OneShotExecIdeService.new

      tree_desc = {
        "language" => "sql",
        "name" => "starOperator"
      }

      expect(service.emit_code(tree_desc, "sql")).to eq "*"
    end
  end
end

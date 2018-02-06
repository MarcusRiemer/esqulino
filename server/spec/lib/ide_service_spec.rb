require 'rails_helper'

require_dependency 'ide_service'

RSpec.describe "IDE Service" do
  context "OneShot" do
    it "emits SQL source code" do
      service = OneShotExecIdeService.new

      tree_desc = {
        "language" => "sql",
        "name" => "starOperator"
      }

      expect(service.emit_code(tree_desc, "sql")).to eq "*"
    end
  end

  context "initialization" do
    it "Creates a OneShot instance" do
      service = IdeService.instantiate(service_config: { "exec" => { "mode" => "one-shot" } })
      expect(service.class).to be OneShotExecIdeService
    end
  end
end

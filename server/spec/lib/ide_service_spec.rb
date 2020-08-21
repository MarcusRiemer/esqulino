require 'rails_helper'

require_dependency 'ide_service'

RSpec.describe "IDE Service" do

  # Retrieves the test configuration for the "exec" mode.
  def exec_configuration
    Rails.configuration.sqlino[:ide_service][:exec]
  end

  context "OneShot" do
    it "responds to ping" do
      service = OneShotExecIdeService.new(config: exec_configuration)
      expect(service.ping!).to be true
    end

    it "emits SQL source code" do
      service = OneShotExecIdeService.new(config: exec_configuration)

      tree_desc = {
        "language" => "sql",
        "name" => "starOperator"
      }

      expect(service.emit_code(tree_desc, "sql")).to eq "*"
    end

    it "emits generated block languages" do
      service = OneShotExecIdeService.new(config: exec_configuration)

      grammar = create(:grammar)
      block_language = create(:block_language, :auto_generated_blocks, grammar: grammar);

      expect(service.emit_generated_blocks(block_language).keys).to(
        contain_exactly("editor_blocks", "editor_components", "sidebars", "root_css_classes")
      )
    end

    it "skips block generation in case of missing instructions" do
      service = OneShotExecIdeService.new(config: exec_configuration)

      block_language = create(:block_language)

      expect(service.emit_generated_blocks(block_language)).to eq nil
    end

    it "throws errors on incorrect requests" do
      service = OneShotExecIdeService.new(config: exec_configuration)

      tree_desc = {
        "language" => "doesntExist",
        "name" => "false"
      }

      expect { service.emit_code(tree_desc, "doesntExist") }.to raise_exception EsqulinoError::IdeService
    end
  end

  context "Mock" do
    it "doesn't actually execute requests" do
      service = MockIdeService.new()

      req = { "type" => "ping" }

      expect(service.execute_request(req)).to eq req.to_json
    end
  end

  context "initialization" do
    it "creates a OneShot instance" do
      service = IdeService.instantiate(service_config: { :exec => { :mode => "one_shot" } })
      expect(service.class).to be OneShotExecIdeService
    end

    it "mocking has precedence" do
      service = IdeService.instantiate(service_config: { :mock => true, :exec => { :mode => "one_shot" } })
      expect(service.class).to be MockIdeService
    end

    it "mocking has precedence (unless forbidden)" do
      service = IdeService.instantiate(
        service_config: { :mock => true, :exec => { :mode => "one_shot" } },
        allow_mock: false
      )
      expect(service.class).to be OneShotExecIdeService
    end

    it "missing modes are an error" do
      expect { IdeService.instantiate(service_config: { }) }.to raise_exception EsqulinoError::IdeService
    end
  end
end

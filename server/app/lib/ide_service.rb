require 'open3'

class IdeServiceError < RuntimeError
end

# Common functionality for all IDE operations, no matter whether
# they are routed through the "exec" or the "systemd" supervisor.
class BaseIdeService
  # Emits the source code for the given tree in the given language.
  #
  # @param tree_description [Hash]
  #   The JSON-description of the syntaxtree to emit.
  #
  # @param language_id [string]
  #   The id of the language to use
  #
  # @return [string]
  #   The string representation of the syntaxtree. If the given tree
  #   is nil, the returned object is also nil.
  def emit_code(tree_description, language_id)
    if (tree_description)
      execute_request({
                        "type" => "emitTree",
                        "model" => tree_description,
                        "languageId" => language_id
                      })
    else
      nil
    end
  end

  # Checks whether the IDE-service is available
  def ping!
    execute_request({ "type" => "ping"}) == "pong"
  end

  # Communicates the given request to the IDE service.
  #
  # @param request [hash]
  #  A request object for the CLI, must at least specify the
  #  "type" property.
  # @return Depends on the type of the request
  def execute_request(request)
    ActiveSupport::Notifications.instrument('request.ide_service', request: request) do
      self.execute_request_impl(request)
    end
  end

  # Actual implementation of call to the IDE service. Needs to be
  # implemented by the deriving classes.
  #
  # @param request [hash]
  #  A request object for the CLI, must at least specify the
  #  "type" property.
  # @return Depends on the type of the request
  def execute_request_impl(request)
    raise "execute_request not implemented"
  end

  # Ensures the node runtime has something meaningful to start
  def assert_cli_program_exists!
    if not cli_program_exists?
      raise IdeServiceError, "Could not find compiled CLI at \"#{@program}\""
    end
  end
end

# This service starts a node program under the control of
# the server.
class ExecIdeService < BaseIdeService
  # Pulls the required paths from the Rails configuration
  def initialize(config: nil)
    @node_binary = config['node_binary']
    @program = config['program']
  end

  # The path to the cli program
  def cli_program_path
    @program
  end

  # Checks whether the given program actually exists
  def cli_program_exists?
    File.exist? cli_program_path
  end
end

# Re-executes the CLI service for every single request.
class OneShotExecIdeService < ExecIdeService
  # Executes the request in a service that is started
  # exclusively for this request.
  #
  # @param request [hash]
  #  A request object for the CLI, must at least specify the
  #  "type" property.
  # @return Depends on the type of the request
  def execute_request_impl(request)
    assert_cli_program_exists!
    
    stdout, stderr, res = Open3.capture3(@node_binary, @program, :stdin_data => request.to_json)

    # Lets hope the process exited fine and had no errors
    if res.exitstatus == 0 and stderr.blank? then
      # Response must be a JSON object
      begin
        JSON.parse stdout
      rescue JSON::ParserError
        raise IdeServiceError, "Bad JSON: \"#{stdout}\""
      end
    else
      # Nope, thats a defect
      raise IdeServiceError, stderr
    end
  end
end

# Answers most requests with a string representation of the
# request. This is obviously only meant for testing.
class MockIdeService < BaseIdeService
  def execute_request(request)
    request.to_json
  end

  # Mocking implementation can't fail
  def ping!
    true
  end

  # Mocking does not actually require an external program
  def cli_program_exists?
    true
  end
end

module IdeService
  def self.instance
    @@ide_service_instance ||= instantiate
  end

  # Creates the instance that is responsible for all requests to the ide service
  def self.instantiate(service_config: nil)
    service_config ||= Rails.configuration.sqlino.fetch("ide_service", Hash.new)

    # Mocking currently takes precedence about every other option. This is by
    # design to "override" the default configuration when running tests, but
    # its quite an ugly hack.
    if service_config["mock"]
      return MockIdeService.new
    # Exec mode?
    elsif exec_config = service_config["exec"] then
      # Which kind of exec mode?
      case exec_config_mode = exec_config["mode"]
      when "one-shot" then return OneShotExecIdeService.new(config: exec_config)
      else raise IdeServiceError, "Unkown IDE exec mode \"#{exec_config_mode}\""
      end
    # No known mode
    else raise IdeServiceError, "Unkown general IDE-service configuration"
    end
  end

  class LogSubscriber < ActiveSupport::LogSubscriber
    def initialize
      super
    end

    def request(event)
      head = color("  IDE Request (#{event.duration.round(1)}ms)", MAGENTA, true)
      payload = color(event.payload[:request].to_json, YELLOW, true)
      debug "#{head}  #{payload}"
    end
  end
end

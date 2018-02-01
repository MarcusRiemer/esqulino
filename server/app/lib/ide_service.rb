require 'open3'

class IdeServiceError < RuntimeError
end

# Common functionality for all IDE operations, no matter whether
# they are routed through the "exec" or the "systemd" supervisor.
class IdeService
  # Emits the source code for the given tree in the given language.
  #
  # @param tree_description [Hash]
  #   The JSON-description of the syntaxtree to emit.
  #
  # @param language_id [string]
  #   The id of the language to use
  def emit_code(tree_description, language_id)
    execute_request({
                      "type" => "emitTree",
                      "model" => tree_description,
                      "languageId" => language_id
                    })
  end

  # Executes the given request object with the backing server
  #
  # @param request [hash]
  #  A request object for the CLI, must at least specify the
  #  "type" property.
  # @return Depends on the type of the request
  def execute_request(request)
    raise "execute_request not implemented"
  end
end

# This service starts a node program under the control of
# the server.
class ExecIdeService < IdeService
  # Pulls the required paths from the Rails configuration
  def initialize()
    config = Rails.configuration.sqlino['ide_service']['exec']
    @node_binary = config['node_binary']
    @program = config['program']
  end
end

# Re-executes the CLI service for every  single request.
class OneShotExecIdeService < ExecIdeService
  # Executes the request in a service that is started
  # exclusively for this request.
  #
  # @param request [hash]
  #  A request object for the CLI, must at least specify the
  #  "type" property.
  # @return Depends on the type of the request
  def execute_request(request)
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

def initialise_IDE_service

end

module EsqulinoError
  # Thrown when something goes wrong because a code resource is being
  # referenced, usually occurs during deletion.
  class CodeResourceReferenced < Base
    # @param code_resource [CodeResource] The offending code resource
    def initialize(code_resource)
      @code_resource = code_resource
      readable_dependants = @code_resource
                            .immediate_dependants
                            .map { |i| i.readable_identification }
      super(
        "CodeResource #{code_resource.id} is referenced by: #{readable_dependants.join ', '}",
        400
      )
    end
  end
end

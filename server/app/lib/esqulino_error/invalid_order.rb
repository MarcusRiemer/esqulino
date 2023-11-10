module EsqulinoError
  # Somebody has requested an order that is not meaningful
  class InvalidOrder < Base
    # @param requested_attribute [string] The attribute to sort according to
    # @param requested_order [string]     The sorting direction
    def initialize(requested_attribute, requested_order)
      super(msg = 'Invalid sorting order requested', status = 400)
      @requested_attribute = requested_attribute
      @requested_order = requested_order
    end

    def json_data
      {
        'requestedAttribute' => @requested_attribute,
        'requestedOrder' => @requested_order
      }
    end
  end
end

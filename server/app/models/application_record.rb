class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # There are some key differences between the way Rails serializes
  # models and the expectations of the client (or to be more exact:
  # The corresponding JSON-schema specification).
  # 
  # * All keys must be in "camelCase" instead of "snake_case"
  # * The "created_at" and "updated_at" fields must be strings
  # * "Empty" values should be omitted
  #
  # This basic implementation does *not* remove any unnecessary attributes,
  # a deriving class will probably want to use "slice" to narrow down the
  # set of attributes.
  #
  # @return [Hash] All attributes of this model as the client expects it.
  def to_full_api_response
    # Build a hash of all properties that are currently set
    to_return = self.serializable_hash
                  .delete_if { |k,v| v.nil? }

    # Update the created_at and updated_at fields
    ["created_at", "updated_at"].each do |k|
      to_return[k] = to_return[k].to_s
    end

    # All keys should be in "camelCase"
    to_return.transform_keys! { |k| k.camelize(:lower) }
  end
end

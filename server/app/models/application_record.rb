class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  # There are some key differences between the way Rails serializes
  # models and the expectations of the client (or to be more exact:
  # The corresponding JSON-schema specification).
  #
  # * All keys must be in "camelCase" instead of "snake_case"
  # * The "created_at" and "updated_at" fields must be strings
  # * "Empty" values should possibly be omitted
  #
  # This basic implementation does *not* remove any unnecessary attributes,
  # a deriving class will probably want to use "slice" to narrow down the
  # set of attributes.
  #
  # @param compact [Boolean] True, if empty values should be omitted.
  #
  # @return [Hash] All attributes of this model as the client expects it.
  def to_json_api_response(compact: true)
    # Build a hash of all properties
    to_return = self.serializable_hash

    # Possibly remove empty values
    to_return = to_return.compact if compact

    # Update the created_at and updated_at fields
    ["created_at", "updated_at"].each do |k|
      to_return[k] = to_return[k].to_s
    end

    # All keys should be in "camelCase"
    to_return.transform_keys { |k| k.camelize(:lower) }
  end

  # Some models can show a "nice" identification string when prompted to
  # do so (they might have a name or a slug), but the id itself is always
  # fine as a baseline.
  #
  # @return [string] A human friendly representation of the ID
  def readable_identification
    self.id
  end
end

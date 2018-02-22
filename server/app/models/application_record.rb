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
  # TODO: Rename to json_response
  def to_json_api_response
    # Build a hash of all properties that are currently set
    to_return = self.serializable_hash
                  .compact
    # Update the created_at and updated_at fields
    ["created_at", "updated_at"].each do |k|
      to_return[k] = to_return[k].to_s
    end

    # All keys should be in "camelCase"
    to_return.transform_keys { |k| k.camelize(:lower) }
  end

  # This method is a more or less nasty hack to provide identifying
  # attributes for the SeedManager.
  #
  # Models in join-tables would require a composite primary key and Rails
  # does not support those. Unluckily we currently have a join model without
  # a singular PK already and sometimes need to identify it on the fly using
  # #find_by.
  def key_search_attributes
    if not self.class.primary_key.nil? then
      { self.class.primary_key => self.attributes[self.class.primary_key] }
    else
      content_column_names = self.class.content_columns.map &:name
      self.attributes.select { |k,v| not content_column_names.include? k }
    end
  end
end

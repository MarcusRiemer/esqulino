module SchemaTools
  # Describes a single column of a SQLite Table
  class SchemaColumn
    include ActiveModel::Serializers::JSON

    attr_accessor :index, :name, :type, :not_null, :dflt_value, :primary

    def attributes
      {
        'index' => nil, 'name' => nil, 'type' => nil,
        'not_null' => nil, 'dflt_value' => nil, 'primary' => nil
      }
    end

    def initialize(index, name, type, not_null, dflt_value, pk)
      @index = index
      @name = name
      @type = type
      @not_null = not_null == 1
      @dflt_value = dflt_value
      @primary = pk >= 1
    end

    # Serialises this column to JSON, according to the over-the-wire format
    # described in Typescript.
    def to_json(options)
      {
        :index => @index, :name => @name, :type => @type,
        :notNull => @not_null, :dfltValue => @dflt_value,
        :primary => @primary
      }.to_json(options)
    end
  end
end

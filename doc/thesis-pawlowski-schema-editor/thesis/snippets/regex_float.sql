CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type float' CHECK (#{schema_column.name} regexp '^[+-]?([0-9]*\.[0-9]+$|[0-9]+$)')
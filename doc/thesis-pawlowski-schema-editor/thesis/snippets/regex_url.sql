CONSTRAINT 'ERROR[Column(#{schema_column.name})]: Value is not of type url' CHECK (#{schema_column.name} regexp '^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$')
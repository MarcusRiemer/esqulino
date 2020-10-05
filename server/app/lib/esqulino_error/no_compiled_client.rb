module EsqulinoError
  # The server can't do anything if it can't serve a compiled version of
  # the client.
  class NoCompiledClient < Message
    # @param index_html_path [string] The path the index.html of the client
    #                                 should reside.
    def initialize(index_html_path)
      super(msg = "Could not find compiled version of the client")
      @index_html_path = index_html_path
    end

    def json_data()
      { "indexHtmlPath" => @index_html_path }
    end
  end
end

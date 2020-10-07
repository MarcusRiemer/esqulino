module EsqulinoError
  # Some errors are not strictly for the API and may be seen by
  # "normal" end users. These errors should inherit from this
  # message error to have a (somehow) nicer UI.
  class Message < Base
  end
end

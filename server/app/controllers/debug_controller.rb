# Various debugging utilities
class DebugController < ApplicationController
  def raise_error
    raise EsqulinoError.new("Deliberate error triggered by user")
  end
end

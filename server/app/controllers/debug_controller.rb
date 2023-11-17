# frozen_string_literal: true

# Various debugging utilities
class DebugController < ApplicationController
  def raise_error
    raise EsqulinoError::Base, 'Deliberate error triggered by user'
  end
end

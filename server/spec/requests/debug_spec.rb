# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DebugController, type: :request do
  it 'triggers deliberate errors' do
    get '/api/raise-error'

    expect(response).to have_http_status(500)
    expect(response.media_type).to eq('application/json')
  end
end

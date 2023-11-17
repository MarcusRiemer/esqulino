require 'rails_helper'

RSpec.describe LogEntry, type: :model do
  it 'creation of empty entry without user' do
    LogEntry.log!('test')

    expect(LogEntry.count).to eq 1

    res = LogEntry.first!

    expect(res.event_type).to eq 'test'
    expect(res.data).to eq({})
    expect(res.user).to be_nil
  end

  it 'creation of empty entry with user' do
    u = create(:user)

    LogEntry.log!('test', user: u)

    expect(LogEntry.count).to eq 1

    res = LogEntry.first!

    expect(res.event_type).to eq 'test'
    expect(res.data).to eq({})
    expect(res.user).to eq u
  end
end

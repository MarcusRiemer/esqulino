require 'rails_helper'

RSpec.describe "HashTools" do
  describe "union" do
    it "[]" do
      expect(HashTools.union()).to eq({})
    end

    it "[nil]" do
      expect(HashTools.union(nil)).to eq({})
    end

    it "[{a:1}]" do
      expect(HashTools.union({ a: 1 })).to eq({ a: 1 })
    end

    it "[{a:1}, nil]" do
      expect(HashTools.union({ a: 1 }, nil)).to eq({ a: 1 })
    end

    it "[nil, {a:1}]" do
      expect(HashTools.union(nil, { a: 1 }, nil)).to eq({ a: 1 })
    end

    it "[nil, {a:1}, nil]" do
      expect(HashTools.union(nil, { a: 1 }, nil)).to eq({ a: 1 })
    end

    it "[{a:1}, {b:1}]" do
      expect(HashTools.union({ a: 1 }, { b: 1 })).to eq({ a: 1, b: 1 })
    end

    it "[{a:1}, {a:1}]" do
      expect(HashTools.union({ a: 1 }, { a: 1 })).to eq({ a: 1 })
    end
  end
end

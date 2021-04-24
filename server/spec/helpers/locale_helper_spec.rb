require "rails_helper"

RSpec.describe LocaleHelper do
  describe "first_matching_text" do
    CASES = [
      [[], ["de", "en"], nil],
      [["de"], ["de", "en"], "de"],
      [["en"], ["de", "en"], "en"],
      [["fr"], ["de", "en"], "fr"],

      [["de"], [], "de"],
      [["de", "en"], [], "en"],
      [["de", "fr"], [], "de"],
      [["es", "fr"], [], "es"]

    ]

    CASES.each do |args|
      texts, locales, exp_result = args

      # ["de", "en"] to { "de" => "Text de", "en" => "Text en" }
      texts_h = texts.reduce({}) do |h, l|
        h.update(l => "Text " + l)
      end

      it "#{texts} with #{locales} => #{exp_result}" do
        expect(LocaleHelper.first_matching_text(texts_h, locales)).to eq(exp_result ? "Text " + exp_result : nil)
      end
    end
  end

end
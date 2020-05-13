require "rails_helper"

RSpec.describe PaginationHelper, type: :helper do
  describe "Grammar#pagination_response" do
    it "throws exception when using invalid order keys" do
      allow(helper).to receive(:list_params).and_return(order_field:"iWillNeverExistAsAnAttribute")
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"iWillNeverExistAsADirection")
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "works fine with a valid key" do
      allow(helper).to receive(:list_params).and_return(order_field:"name")
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"asc",order_field:"name")
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
  end
  describe "Project#pagination_response" do
    it "Project sort only by valid order keys" do
      allow(helper).to receive(:list_params).and_return(order_field:"iWillNeverExistAsAnAttribute")
      expect{helper.pagination_response(Project,Project.all,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"iWillNeverExistAsADirection")
      expect{helper.pagination_response(Project,Project.all,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "works fine with a valid key" do
      allow(helper).to receive(:list_params).and_return(order_field:"name")
      expect{helper.pagination_response(Project,Project.all,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"asc",order_field:"name")
      expect{helper.pagination_response(Project,Project.all,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
  end
  describe "BlockLanguage#pagination_response" do
    it "BlockLanguage sort only by valid order keys" do
      allow(helper).to receive(:list_params).and_return(order_field:"iWillNeverExistAsAnAttribute")
      expect{helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"iWillNeverExistAsADirection")
      expect{helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "works fine with a valid key" do
      allow(helper).to receive(:list_params).and_return(order_field:"name")
      expect{helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"asc",order_field:"name")
      expect{helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})}.not_to raise_error(EsqulinoError::InvalidOrder)
    end
  end
end
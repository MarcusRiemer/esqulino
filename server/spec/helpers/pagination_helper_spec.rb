require "rails_helper"

RSpec.describe PaginationHelper, type: :helper do
  describe "Grammar#pagination_response" do
    it "throws exception when using invalid order keys" do
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderField:"iWillNeverExistAsAnAttribute"}))
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"iWillNeverExistAsADirection"}))
      expect{helper.pagination_response(Grammar,Grammar.scope_list,options: {})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "works fine with valid keys" do
      FactoryBot.create(:grammar, name:"a" )
      FactoryBot.create(:grammar, name:"b" )
      FactoryBot.create(:grammar, name:"c" )
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"desc",orderField:"name"}))
      expect{
        response = helper.pagination_response(Grammar,Grammar.scope_list,options: {})
        expect(response[:data][0]['name']).to eq("c")
        expect(response[:data][1]['name']).to eq("b")
        expect(response[:data][2]['name']).to eq("a")
      }.not_to raise_error
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
      FactoryBot.create(:project, name:"a" )
      FactoryBot.create(:project, name:"b" )
      FactoryBot.create(:project, name:"c" )
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"desc",orderField:"name"}))
      expect{
        response = helper.pagination_response(Project,Project.all,options: {})
        expect(response[:data][0]['name']).to eq("c")
        expect(response[:data][1]['name']).to eq("b")
        expect(response[:data][2]['name']).to eq("a")
      }.not_to raise_error
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
      FactoryBot.create(:block_language, name:"a" )
      FactoryBot.create(:block_language, name:"b" )
      FactoryBot.create(:block_language, name:"c" )
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"desc",orderField:"name"}))
      expect{
        response = helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})
        expect(response[:data][0]['name']).to eq("c")
        expect(response[:data][1]['name']).to eq("b")
        expect(response[:data][2]['name']).to eq("a")
      }.not_to raise_error
    end
  end
  describe "News#pagination_response" do
    it "CamelCase attribute should be converted to underscore, so the model attribute fits" do
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderField:"createdAt"}))
      expect{helper.pagination_response(News,News.all,options:{full_api_response:true})}.not_to raise_error
    end
    it "throws exception when using invalid order field" do
      allow(helper).to receive(:list_params).and_return(order_field:"iWillNeverExistAsAnAttribute")
      expect{helper.pagination_response(News,News.all,options:{full_api_response:true})}.to raise_error(EsqulinoError::InvalidOrder)
    end
    it "throws exception when using invalid order directions" do
      allow(helper).to receive(:list_params).and_return(order_direction:"iWillNeverExistAsADirection")
      expect{helper.pagination_response(News,News.all,options:{full_api_response:true})}.to raise_error(EsqulinoError::InvalidOrder)
    end

    it "works fine with valid keys" do
      FactoryBot.create(:news, title:{'de': "a", 'en': "a"} )
      FactoryBot.create(:news, title:{'de': "b", 'en': "b"} )
      FactoryBot.create(:news, title:{'de': "c", 'en': "c"} )
      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"desc",orderField:"title"}))
      expect{
        response = helper.pagination_response(News,News.all,options: {})
        expect(response[:data][0]['title']['de']).to eq("c")
        expect(response[:data][1]['title']['de']).to eq("b")
        expect(response[:data][2]['title']['de']).to eq("a")
      }.not_to raise_error
    end
  end
  describe "pagination_response#permit()" do
    it "permit shouldn't accept keys in underscore, so orderDirection should stay default: asc" do
      FactoryBot.create(:block_language, name: "a")
      FactoryBot.create(:block_language, name: "b")
      FactoryBot.create(:block_language, name: "c")

      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({order_direction:"desc",order_field:"name"}))
      response = helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})

      expect(response[:data][0]['name']).to eq("a")
      expect(response[:data][1]['name']).to eq("b")
      expect(response[:data][2]['name']).to eq("c")
    end
    it "permit should accept keys in underscore, so orderDirection should be desc" do
      FactoryBot.create(:block_language, name: "a")
      FactoryBot.create(:block_language, name: "b")
      FactoryBot.create(:block_language, name: "c")

      allow(helper).to receive(:params).and_return(ActionController::Parameters.new({orderDirection:"desc",orderField:"name"}))
      response = helper.pagination_response(BlockLanguage,BlockLanguage.scope_list,options: {})

      expect(response[:data][0]['name']).to eq("c")
      expect(response[:data][1]['name']).to eq("b")
      expect(response[:data][2]['name']).to eq("a")
    end
    it "permit: should throw error when params is overrided with usual hash" do
      allow(helper).to receive(:params).and_return(orderField:"name")
      expect{helper.pagination_response(News,News.all,options: {})}.to raise_error(NoMethodError)
    end
  end
end
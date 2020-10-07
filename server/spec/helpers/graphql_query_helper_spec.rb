require "rails_helper"

RSpec.describe GraphqlQueryHelper, type: :helper do
  describe "query_insert_typename" do
    it "query with nodes" do
      query_in = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
            }
          }
        }
      GQL

      query_exp = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
              __typename
            }
            __typename
          }
        }
      GQL

      expect(query_exp).to eq(query_insert_typename query_in)
    end

    it "query existing typename" do
      query_in = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
              __typename
            }
          }
        }
      GQL

      query_exp = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
              __typename
            }
            __typename
          }
        }
      GQL

      expect(query_exp).to eq(query_insert_typename query_in)
    end

    it "query with nodes and nested relationships" do
      query_in = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
              codeResources {
                id
              }
            }
          }
        }
      GQL

      query_exp = <<~GQL
        query AdminEditBlockLanguage($id: ID!) {
          blockLanguages(input: {filter: {id: $id}}) {
            nodes {
              id
              name
              slug
              codeResources {
                id
                __typename
              }
              __typename
            }
            __typename
          }
        }
      GQL

      expect(query_exp).to eq(query_insert_typename query_in)
    end

    it "mutation" do
      query_in = <<~GQL
        mutation CreateNews(
            $title: LangJson!,
            $text: LangJson!,
            $publishedFrom: ISO8601DateTime!
        ) {
            createNews(input:{
                title:$title,
                text:$text,
                publishedFrom:$publishedFrom
            }) {
                news {
                    id
                    title
                }
                errors
            }
        }
      GQL

      query_exp = <<~GQL
        mutation CreateNews($title: LangJson!, $text: LangJson!, $publishedFrom: ISO8601DateTime!) {
          createNews(input: {title: $title, text: $text, publishedFrom: $publishedFrom}) {
            news {
              id
              title
              __typename
            }
            errors
            __typename
          }
        }
      GQL

      expect(query_exp).to eq(query_insert_typename query_in)
    end
  end
end

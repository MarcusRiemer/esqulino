# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180715141850) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "pgcrypto"

  create_table "block_language_generators", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "model", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "block_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "model"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.text "default_programming_language_id"
    t.uuid "grammar_id"
    t.uuid "block_language_generator_id"
    t.index ["block_language_generator_id"], name: "index_block_languages_on_block_language_generator_id"
    t.index ["default_programming_language_id"], name: "index_block_languages_on_default_programming_language_id"
    t.index ["grammar_id"], name: "index_block_languages_on_grammar_id"
    t.index ["slug"], name: "index_block_languages_on_slug", unique: true
  end

  create_table "code_resources", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "ast"
    t.uuid "project_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "block_language_id", null: false
    t.text "programming_language_id", null: false
    t.string "compiled"
    t.index ["block_language_id"], name: "index_code_resources_on_block_language_id"
    t.index ["programming_language_id"], name: "index_code_resources_on_programming_language_id"
    t.index ["project_id"], name: "index_code_resources_on_project_id"
  end

  create_table "grammars", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.jsonb "model", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "programming_language_id"
    t.index ["programming_language_id"], name: "index_grammars_on_programming_language_id"
  end

  create_table "programming_languages", id: :text, force: :cascade do |t|
    t.string "name", null: false
  end

  create_table "project_databases", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.uuid "project_id"
    t.jsonb "schema"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_databases_on_project_id"
  end

  create_table "project_sources", force: :cascade do |t|
    t.uuid "project_id", null: false
    t.string "url"
    t.string "title"
    t.text "display"
    t.boolean "read_only", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_project_sources_on_project_id"
  end

  create_table "project_uses_block_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "block_language_id"
    t.uuid "project_id"
    t.index ["block_language_id"], name: "index_project_uses_block_languages_on_block_language_id"
    t.index ["project_id", "block_language_id"], name: "block_languages_projects_unique", unique: true
    t.index ["project_id"], name: "index_project_uses_block_languages_on_project_id"
  end

  create_table "projects", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.boolean "public", default: true, null: false
    t.uuid "preview"
    t.uuid "index_page_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.string "api_version"
    t.uuid "default_database_id"
    t.index ["default_database_id"], name: "index_projects_on_default_database_id"
    t.index ["slug"], name: "index_projects_on_slug"
  end

  add_foreign_key "block_languages", "block_language_generators"
  add_foreign_key "block_languages", "grammars"
  add_foreign_key "block_languages", "programming_languages", column: "default_programming_language_id"
  add_foreign_key "code_resources", "block_languages"
  add_foreign_key "code_resources", "programming_languages"
  add_foreign_key "code_resources", "projects"
  add_foreign_key "grammars", "programming_languages"
  add_foreign_key "project_databases", "projects"
  add_foreign_key "project_sources", "projects"
  add_foreign_key "project_uses_block_languages", "block_languages"
  add_foreign_key "project_uses_block_languages", "projects"
  add_foreign_key "projects", "project_databases", column: "default_database_id"
end

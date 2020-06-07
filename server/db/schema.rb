# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_05_29_045910) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "hstore"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "block_languages", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.jsonb "model"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.text "default_programming_language_id"
    t.uuid "grammar_id"
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
    t.string "slug"
    t.jsonb "model"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "programming_language_id"
    t.uuid "generated_from_id"
    t.jsonb "types", default: {}
    t.jsonb "foreign_types", default: {}
    t.jsonb "root"
    t.index ["generated_from_id"], name: "index_grammars_on_generated_from_id"
    t.index ["programming_language_id"], name: "index_grammars_on_programming_language_id"
    t.index ["slug"], name: "index_grammars_on_slug", unique: true
  end

  create_table "identities", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "uid"
    t.string "provider"
    t.jsonb "provider_data"
    t.jsonb "own_data"
    t.string "type"
    t.uuid "user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_identities_on_user_id"
  end

  create_table "log_entries", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "event_type"
    t.datetime "created_at", null: false
    t.uuid "user_id"
    t.jsonb "data"
    t.index ["user_id"], name: "index_log_entries_on_user_id"
  end

  create_table "news", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.hstore "title"
    t.hstore "text"
    t.datetime "published_from"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.uuid "user_id"
    t.index ["user_id"], name: "index_news_on_user_id"
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
    t.string "name_single"
    t.text "description_single"
    t.boolean "public", default: false, null: false
    t.uuid "preview"
    t.uuid "index_page_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.uuid "default_database_id"
    t.uuid "user_id"
    t.hstore "name", default: {}, null: false
    t.hstore "description", default: {}, null: false
    t.index ["default_database_id"], name: "index_projects_on_default_database_id"
    t.index ["slug"], name: "index_projects_on_slug", unique: true
    t.index ["user_id"], name: "index_projects_on_user_id"
  end

  create_table "roles", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name"
    t.uuid "resource_id"
    t.string "resource_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id"
    t.index ["name"], name: "index_roles_on_name"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "display_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
  end

  create_table "users_roles", id: false, force: :cascade do |t|
    t.uuid "user_id"
    t.uuid "role_id"
    t.index ["user_id", "role_id"], name: "index_users_roles_on_user_id_and_role_id"
  end

  add_foreign_key "block_languages", "grammars"
  add_foreign_key "block_languages", "programming_languages", column: "default_programming_language_id"
  add_foreign_key "code_resources", "block_languages"
  add_foreign_key "code_resources", "programming_languages"
  add_foreign_key "code_resources", "projects"
  add_foreign_key "grammars", "code_resources", column: "generated_from_id"
  add_foreign_key "grammars", "programming_languages"
  add_foreign_key "identities", "users"
  add_foreign_key "log_entries", "users"
  add_foreign_key "news", "users"
  add_foreign_key "project_databases", "projects"
  add_foreign_key "project_sources", "projects"
  add_foreign_key "project_uses_block_languages", "block_languages"
  add_foreign_key "project_uses_block_languages", "projects"
  add_foreign_key "projects", "project_databases", column: "default_database_id"
  add_foreign_key "projects", "users"
  add_foreign_key "users_roles", "roles"
  add_foreign_key "users_roles", "users"
end

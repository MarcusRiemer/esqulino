require 'net/http'
require 'nokogiri'
require 'open-uri'
require 'csv'
require 'json'
require_relative 'fetch_list'

p fetch('https://pokeapi.co/api/v2/pokemon/')

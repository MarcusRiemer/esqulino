require 'test_helper'

class SimulateSqlTest < ActionDispatch::IntegrationTest
  test 'highlight_rows' do
    assert [0], SimulateSql::highlight_rows([[], [0],[1]], [[0]])
    assert [1], SimulateSql::highlight_rows([[], [0],[1]], [[1]])
    assert [ ], SimulateSql::highlight_rows([[], [0],[1]], [])
    assert [ ], SimulateSql::highlight_rows([[], [0],[1]], [[2]])
  end
end

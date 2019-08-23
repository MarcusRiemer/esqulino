get 'news/admin', controller: 'news', action: :index_admin
get 'news/admin/:id', controller: 'news', action: :show_admin

get 'news', controller: 'news', action: :index
get 'news/:id', controller: 'news', action: :index
post 'news', controller: 'news', action: :create
put 'news/:id', controller: 'news', action: :update
delete 'news/:id', controller: 'news', action: :delete

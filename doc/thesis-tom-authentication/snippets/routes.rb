scope 'news' do
	scope 'admin' do
		root via: [:get], controller: 'news', action: :index_admin
		get ':id', controller: 'news', action: :show_admin
	end

	root via: [:get], controller: 'news', action: :index
	root via: [:post], controller: 'news', action: :create
	get ':id', controller: 'news', action: :show
	put ':id', controller: 'news', action: :update
	delete ':id', controller: 'news', action: :destroy
end
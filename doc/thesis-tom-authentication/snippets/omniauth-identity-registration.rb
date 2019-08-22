def registration_phase
	attributes = (options[:fields] + [:password, :password_confirmation])
		.inject({}){|h,k| h[k] = request[k.to_s]; h}
	@identity = model.create(attributes)
	if @identity.persisted?
		env['PATH_INFO'] = callback_path
		callback_phase
	else
		if options[:on_failed_registration]
			self.env['omniauth.identity'] = @identity
			options[:on_failed_registration].call(self.env)
		else
			registration_form
		end
	end
end

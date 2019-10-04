def set_acces_token(user)
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: user[:id],
    display_name: user.display_name,
    roles: user.role_names
  })
end

def set_acces_token_with_invalid_user()
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: "invalid"
  })
end

def set_expired_acces_token()
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: "invalid"
  }, 0.seconds.from_now)
end
def set_access_token(user)
  cookies['ACCESS_TOKEN'] = JwtHelper.encode({
    user_id: user[:id],
    display_name: user.display_name,
    roles: user.role_names
  })
end

def set_access_token_with_invalid_user()
  cookies['ACCESS_TOKEN'] = JwtHelper.encode({
    user_id: "invalid"
  })
end

def set_expired_access_token()
  cookies['ACCESS_TOKEN'] = JwtHelper.encode({
    user_id: "irrelevant"
  }, 0.seconds.from_now)
end
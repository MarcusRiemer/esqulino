def set_jwt(user)
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: user[:id],
    display_name: user.display_name,
    roles: user.role_names
  })
end

def set_jwt_with_invalid_user()
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: "invalid"
  })
end

def set_expired_jwt()
  cookies['ACCES_TOKEN'] = JwtHelper.encode({
    user_id: "invalid"
  }, 0.seconds.from_now)
end
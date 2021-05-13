class users {

  user { "vagrant":
    groups => ["www-data"]
  }

}
class nodejs {

  package {
    [
      "nodejs",
      "nodejs-legacy",
      "npm"
    ]:
    ensure  => installed,
    require => Exec["update"]
  }

  exec { "n":
    command => "sudo npm config set strict-ssl false && sudo npm install n -g && sudo n stable",
    path    => ["/usr/bin"],
    require => Package["npm", "nodejs", "nodejs-legacy"]
  }

  exec { "eslint":
    command => "sudo npm config set strict-ssl false && sudo npm install -g eslint",
    path    => ["/usr/bin"],
    require => Exec["n"]
  }

}

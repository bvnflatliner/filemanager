class apache {

  package {
    [
      "apache2",
      "apache2-mpm-prefork",
      "ssl-cert",
      "ca-certificates",
      "libapache2-mod-php5",
    ]:
    ensure  => installed,
    require => Exec["update"],
  }

  service { "apache2":
    ensure  => running,
    require => Package["apache2"]
  }

  exec { "mod_rewrite":
    command => "sudo a2enmod rewrite",
    path    => ["/usr/bin", "/usr/sbin"],
    require => Package["apache2"]
  }

  file { "/etc/apache2/sites-available/000-default.conf":
    owner   => "root",
    group   => "root",
    mode    => "0644",
    source  => "puppet:///modules/apache/000-default.conf",
    require => [Package["apache2"], Exec["mod_rewrite"]],
    notify  => Service["apache2"]
  }

}


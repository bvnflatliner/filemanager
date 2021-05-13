
exec { "update":
  command => "apt-get update",
  path => "/usr/bin",
}

package { "language-pack-uk":
  ensure => installed,
  require => Exec["update"],
}

package { "lynx":
  ensure => installed,
  require => Exec["update"],
}

package { "mc":
  ensure => installed,
  require => Exec["update"],
}

package { "htop":
  ensure => installed,
  require => Exec["update"],
}

package { "git":
  ensure => installed,
  require => Exec["update"],
}

host { "filemanager.loc":
  ip => "192.168.1.250",
}

file { "/etc/hostname":
  ensure => present,
  owner => "root",
  group => "root",
  mode => 644,
  content => "dev\n"
}

include users, php, apache, nodejs
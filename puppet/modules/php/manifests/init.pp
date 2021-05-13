class php {

  package {
    [
      "imagemagick",
      "mcrypt",
      "recode",
      "php5",
      "php5-cli",
      "php5-dev",
      "php5-mysql",
      "php5-memcache",
      "php5-memcached",
      "php5-sqlite",
      "php5-mongo",
      "php5-redis",
      "php5-mcrypt",
      "php5-imagick",
      "php5-gd",
      "php5-recode",
      "php5-curl",
      "php5-mhash",
      "php5-xcache",
      "php5-ming",
      "php5-idn",
      "php-gettext",
      "php5-tidy",
      "php5-ps",
      "php5-pspell",
      "php5-imap",
      "php5-xdebug",
      "php5-xmlrpc",
      "php5-xsl"
    ]:
    ensure  => installed,
    require => Exec["update"]
  }

  file { "/etc/php5/apache2/php.ini":
    owner   => "root",
    group   => "root",
    mode    => "0644",
    source  => "puppet:///modules/php/php.ini",
    require => [Package["apache2"]],
    notify  => Service["apache2"]
  }

}

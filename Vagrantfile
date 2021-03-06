# -*- mode: ruby -*-
# vi: set ft=ruby :

# Install plugin vagrant-fsnotify.
# Some filesystems (e.g. ext4, HFS+) have a feature of event notification.
# Interested applications can subscribe and are notified when filesystem
# events happen (e.g. a file was created, modified or deleted).
# Applications can make use of this system to provide features such as
# auto-reload or live updates. For example, 'ng serve' watches to rebuild
# application when source files are modified.
# Unfortunately, Vagrant users have a hard time making use of these features
# when the application is running inside a virtual machine. When the file is
# modified on the host, the event is not propagated to the guest and the
# auto-reload never happens.
# Plugin vagrant-fsnotify proposes a solution: run a process listening for
# filesystem events on the host and, when a notification is received, access
# the virtual machine guest and touch the file in there (or touch followed by
# a rm in case of file removals), causing an event to be propagated on the
# guest filesystem.
required_plugins = %w( vagrant-fsnotify )
required_plugins.each do |plugin|
   system "vagrant plugin install #{plugin}" unless Vagrant.has_plugin? plugin
end

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = "ubuntu/trusty64"

  config.vm.boot_timeout = 420

  # Disable automatic box update checking. If you disable this, then
  # boxes will only be checked for updates when the user runs
  # `vagrant box outdated`. This is not recommended.
  config.vm.box_check_update = false

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  # config.vm.network "forwarded_port", guest: 80, host: 8080

  # Create a private network, which allows host-only access to the machine
  # using a specific IP.
  config.vm.network "private_network", ip: "192.168.1.250"

  # Create a public network, which generally matched to bridged network.
  # Bridged networks make the machine appear as another physical device on
  # your network.
  # config.vm.network "public_network"

  # Share an additional folder to the guest VM. The first argument is
  # the path on the host to the actual folder. The second argument is
  # the path on the guest to mount the folder. And the optional third
  # argument is a set of non-required options.
  # config.vm.synced_folder "../data", "/vagrant_data"
  config.vm.synced_folder ".", "/var/www/filemanager.loc", owner: "vagrant", group: "www-data", create: true, fsnotify: true

  # Provider-specific configuration so you can fine-tune various
  # backing providers for Vagrant. These expose provider-specific options.
  # Example for VirtualBox:
  #
  config.vm.provider "virtualbox" do |vb|
  #   # Display the VirtualBox GUI when booting the machine
    vb.gui = false
  #
  #   # Customize the amount of memory on the VM:
    vb.memory = "2048"
  end
  #
  # View the documentation for the provider you are using for more
  # information on available options.

  # Define a Vagrant Push strategy for pushing to Atlas. Other push strategies
  # such as FTP and Heroku are also available. See the documentation at
  # https://docs.vagrantup.com/v2/push/atlas.html for more information.
  # config.push.define "atlas" do |push|
  #   push.app = "YOUR_ATLAS_USERNAME/YOUR_APPLICATION_NAME"
  # end

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  # config.vm.provision "shell", inline: <<-SHELL
  #   sudo apt-get update
  #   sudo apt-get install -y apache2
  # SHELL

  config.vm.provision "puppet" do |puppet|
    puppet.manifests_path = 'puppet/manifests'
    puppet.module_path = 'puppet/modules'
    puppet.manifest_file = 'init.pp'
    puppet.facter = {
      "fqdn" => "filemanager.loc"
    }
  end

end

custom_vagrantfile = 'Vagrantfile.local'
load custom_vagrantfile if File.exist?(custom_vagrantfile)

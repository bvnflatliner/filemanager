# File Manager

React based file manager with fuelphp on the backend.

# Version and name

This application was developed as part for embedding to another big project and I did not named it and did not define certain version of it. Let it be 1.0.0.
I have to notice that I am not sure I will continue to develop and improove this, except fixing very critical errors possibly.

# Prerequisites

### Software requirements

- Git
- Oracle VirtualBox >= 5.1.26
- Vagrant >= 2.1.0
- Linux is preffered OS

### Accounts and registrations

- Github account (not neccesery if you don't want to contribute)

# Installation

### Getting the repository

	$ git clone git@github.com:bvnflatliner/filemanager.git

Possibly, you should add ssh key to your github account before.
How to do this look by the link: [Adding a new SSH key to your GitHub account](https://docs.github.com/en/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account)
Also you can download project as zip archive and unpuck it to working directory.

### Start VM

Go into the file manager project directory:

	$ cd filemanager

Start VM:

	$ vagrant up

It will build VM's environment for the first start, so it will take some time.
For correct work of development server reacting on source code change we need to install vagrant-fsnotify plugin:

	$ vagrant plugin install vagrant-fsnotify

To run this plugin add file 'Vagrantfile.local' into the project root directory with the next content:

```
Vagrant.configure(2) do |config|
  config.trigger.after :up do |trigger|
    trigger.run = {inline: "vagrant fsnotify"}
  end
end

```
Restart VM after that:

	$ vagrant halt
	$ vagrant up

Command 'vagrant reload' can not help in this case.

### Install React

Log in to VM:

	$ vagrant ssh

Note: it uses vagrant-fsnotify plugin holding the console for logs, so for logging in you need another console window.
I use *screen* utility to share several consoles in one terminal emulator window like XTerm.

Change dir to the project root directory:

	$ cd /var/www/filemanager.loc

...and now go to 'js' folder:

	$ cd js

Install React and another software required for the frontend (i. e. ant.design):

	$ npm install

# Using File Manager

### Start Dev Server

Start VM and log in, then go to the 'js' folder in the project root:

	$ cd /var/www/filemanager.loc/js

Start node server on localhost:3000:

	$ npm start

Before use it in your browser, you have to add '192.168.1.250 filemanager.loc' to you /etc/hosts file.
Then you can use this link to open File Manager in Development Mode:
[http://filemanager.loc:3000/](http://filemanager.loc:3000/)

### Stop Dev Server and VM

	CTRL+C
	CTRL+D
	$ vagrant halt

### Build for embedding

Start VM and log in, then go to the 'js' folder in the project root:

	$ cd /var/www/filemanager.loc/js

Build the static version of the application for embedding to your site:

	$ npm run build

After this you can try the example of the embedded version with this link:
[http://filemanager.loc/api/](http://filemanager.loc/api/)

You don't need to start node server, because Apache with FuelPHP used here.

# Software used on VM:

### Server and configuration

- Ubuntu Linux 14.04
- Puppet
- Apache
- Nodejs and npm

### Development

- Php 5.5.9
- FuelPHP 1.8.2
- React 16.12.0
- Ant.design 3.26.7
- Axios 0.19.2
- i18next 17.3.1
- lodash 4.17.15
- moment 2.24.0
- babel 10.0.2
and others (for full list look in package.json)

### Note for Windows users

I used Linux for develop this application and I can not guarantee full functionality of this configuration on other operation systems.
I know that some troubles with node_modules folder and symlinks exist in Windows OS, but I leave this problem for Windows lovers to solve it by them-selves.

# Localization

The application has ukrainian localization.

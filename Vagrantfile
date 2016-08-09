# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"

  # Create a forwarded port mapping which allows access to a specific port
  # within the machine from a port on the host machine. In the example below,
  # accessing "localhost:8080" will access port 80 on the guest machine.
  config.vm.network "forwarded_port", guest: 9292, host: 9292

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y ruby nodejs nodejs-legacy npm bundler git make sqlite3 libsqlite3-dev

    mkdir -p /srv/esqulino
    chown vagrant:vagrant /srv/esqulino
    cd /srv/esqulino

    su vagrant -c "git clone https://bitbucket.org/marcusriemer/esqulino.git ."
    su vagrant -c "gem install --user-install bundler sass"
    su vagrant -c "make install-deps dist"
  SHELL
end

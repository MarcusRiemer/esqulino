# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    # Every Vagrant development environment requires a box. You can search for
    # boxes at https://vagrantcloud.com/search.
    config.vm.box = "ubuntu/bionic64"

    # Create a forwarded port mapping which allows access to a specific port
    # within the machine from a port on the host machine. In the example below,
    # accessing "localhost:8080" will access port 80 on the guest machine.
    # NOTE: This will enable public access to the opened port
    config.vm.network "forwarded_port", guest: 9292, host: 9292

    # Share an additional folder to the guest VM. The first argument is
    # the path on the host to the actual folder. The second argument is
    # the path on the guest to mount the folder. And the optional third
    # argument is a set of non-required options.
    config.vm.synced_folder ".", "/esqulino", type: "rsync",
        rsync__exclude: [
            ".git/", "server/vendor/bundle/", "server/tmp/",
            "server/db/*.sqlite3", "server/db/*.sqlite3-journal",
            "server/.bundle", "server/log/", "client/node_modules/",
        ],
        rsync__verbose: true

    # Provider-specific configuration so you can fine-tune various
    # backing providers for Vagrant. These expose provider-specific options.
    config.vm.provider "virtualbox" do |vb|
        # Display the VirtualBox GUI when booting the machine
        # vb.gui = true

        # Customize the amount of memory on the VM:
        vb.memory = "2048"
    end

    # Configure cached packages to be shared between instances of the same base
    # box. More info on http://fgrehm.viewdocs.io/vagrant-cachier/usage
    if Vagrant.has_plugin?("vagrant-cachier")
        config.cache.scope = :box
        config.cache.enable :apt
    end

    # Enable provisioning with a shell script.
    config.vm.provision "shell", inline: <<-SHELL
        curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
    
        apt-get update

        apt-get install -y nodejs ruby ruby-dev \
            imagemagick libmagickcore-dev libmagickwand-dev \
            magic libmagic-dev graphviz \
            sqlite libsqlite3-dev \
            postgresql-10 libpq-dev

        gem install bundler

        sed -i -e 's/md5/trust/g' /etc/postgresql/10/main/pg_hba.conf
        service postgresql reload
        echo "CREATE ROLE esqulino SUPERUSER LOGIN PASSWORD 'esqulino'" \
            | sudo -u postgres psql -a -f -

        pushd /esqulino/server
            make install-deps
            make setup-database-schema load-live-data
        popd

        cat << EOF > /etc/systemd/system/blattwerkzeug-server.service
[Unit]
Description=BlattWerkzeug - Backend Server
After=network.target

Wants=postgresql

[Service]
Environment=TPUT_BIN="true"
User=vagrant
WorkingDirectory=/esqulino/server
ExecStart=/usr/bin/make run-dev

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable blattwerkzeug-server.service
    systemctl start blattwerkzeug-server

    SHELL
end

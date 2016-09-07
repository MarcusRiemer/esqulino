VM_FILENAME = esqulino.ova

VAGRANT_IN_FILES = $(shell find files -type f) Vagrantfile
VAGRANT_VM_FILES = $(addprefix .vagrant/machines/default/virtualbox/, action_set_name creator_uid id index_uuid private_key)

all : $(VM_FILENAME)

# Generating the .ova image from an already provisioned vagrant box
$(VM_FILENAME) : $(VAGRANT_VM_FILES) Makefile msg-pre-export
	rm -f $(VM_FILENAME)
	vboxmanage export esqulino --ovf20 --vsys 0 --product "esqulino" --producturl "https://bitbucket.org/marcusriemer/esqulino" --vendor "Marcus Riemer" --vendorurl "https://esqulino.marcusriemer.de/" --output "$@"

# Uploading the .ova image
publish-vm :
	scp $(VM_FILENAME) marcus@kleopatra.gurxite.de:/srv/htdocs/playground.marcusriemer.de/$(VM_FILENAME)
	touch publish-vm

##################################
# Shortcut targets
##################################
package : $(VM_FILENAME)

##################################
# Message targets
##################################
msg-pre-export :
	@tput setaf 2; echo "## VM     : Generating $(VM_FILENAME)"; tput sgr0

msg-pre-publish :
	@tput setaf 2; echo "## VM     : Publishing $(VM_FILENAME)"; tput sgr0

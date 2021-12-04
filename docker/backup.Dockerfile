FROM postgres
COPY ./backup.sh /
CMD ["/backup.sh"]

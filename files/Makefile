all : video-stills

VIDEO_FILES_MP4 = $(shell find videos/ -iname "*.mp4")
VIDEO_STILLS =  $(VIDEO_FILES_MP4:%.mp4=%.jpg)

publish-from-office:
	rsync videos theses -rvz esqulino@kleopatra-tunnel:/srv/htdocs/files.blattwerkzeug.de

##################################
# Video conversion for examples
##################################
video-stills : $(VIDEO_STILLS)

%.jpg : %.mp4
	ffmpeg -i $^ -vframes 1 $@

.PHONY : all video-stills publish-from-office

#!/bin/sh

output=analyze.log
#output=debug.log

node header.js >$output

for file in /mnt/share/txt/*.txt
#for file in *.txt
do
  node collect-marker.js "$file" utf8 >>$output
done

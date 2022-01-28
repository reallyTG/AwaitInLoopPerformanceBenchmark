#!/bin/bash

for i in {1..50}
do
  node copyDirScript.js
  rm -rf tstCpDir-cp
  sleep 2
done



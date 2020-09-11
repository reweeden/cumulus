#!/bin/sh

set +e

specName=$(echo "$2" | rev | cut -d'/' -f 1 | cut -d'.' -f 2 | rev)
outputPath="${1}/${specName}-running.txt"

TIMESTAMP=$(date "+%Y-%m-%dT%H:%M:%S")
echo "$TIMESTAMP ../node_modules/.bin/jasmine $2 STARTED"

../node_modules/.bin/jasmine --no-color "$2" > "$outputPath" 2>&1
result=$?

TIMESTAMP=$(date "+%Y-%m-%dT%H:%M:%S")
if [ "$result" -eq "0" ]; then
  echo "$TIMESTAMP ../node_modules/.bin/jasmine $2 PASSED"
  mv "$outputPath" "$1/${specName}-passed.txt"
else
  mv "$outputPath" "$1/${specName}-failed.txt"
  echo "$TIMESTAMP - FAILED -- Retrying ${specName}"
  ../node_modules/.bin/jasmine --reporter=defaultReporter --no-color "$2" > "$outputPath" 2>&1
  result=$?
  if [ "$result" -eq "0" ]; then
    echo "$TIMESTAMP ../node_modules/.bin/jasmine $2 PASSED ON RETRY"
  else
    echo "$TIMESTAMP ../node_modules/.bin/jasmine $2 FAILED"
  fi
fi

exit $result

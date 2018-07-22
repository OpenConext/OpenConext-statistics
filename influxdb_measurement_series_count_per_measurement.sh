#!/usr/bin/env bash

if [ "$#" -ne 1 ]
then
  echo "Usage: $0 <db_name>"
  exit 1
fi

db_name=$1

measurements_names=$(influx -database $db_name -execute 'SHOW MEASUREMENTS' | tail -n +4)
for n in $measurements_names; do
  number_of_series=$(influx -database $db_name -execute "SHOW SERIES FROM \"$n\"" | tail -n +3 | wc -l)
  echo "$n $number_of_series"
done
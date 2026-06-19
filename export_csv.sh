#!/bin/bash
mkdir -p /tmp/csv_export
psql -U admin -d EOMai -At -c "SELECT schemaname || '.' || tablename FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');" | while read -r tbl; do
  [ -z "$tbl" ] && continue
  fname=$(echo "$tbl" | tr '.' '_')
  echo "Exportando $tbl..."
  psql -U admin -d EOMai -c "\copy $tbl TO '/tmp/csv_export/${fname}.csv' WITH CSV HEADER"
done

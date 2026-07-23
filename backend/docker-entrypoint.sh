#!/bin/sh

set -e

echo "Starting backend entrypoint script..."

# Wait for the database to be reachable and push the schema
echo "Applying database migrations and pushing schema..."
max_retries=15
count=0

until npx prisma db push --accept-data-loss || [ $count -eq $max_retries ]; do
  echo "Database is not ready yet or migration failed. Retrying in 3 seconds... ($((count+1))/$max_retries)"
  sleep 3
  count=$((count+1))
done

if [ $count -eq $max_retries ]; do
  echo "Error: Database migration failed after $max_retries attempts. Exiting."
  exit 1
fi

echo "Database is ready and migrations are applied."

# Execute the main container command (defined by CMD)
exec "$@"

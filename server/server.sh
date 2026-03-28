echo "Starting server"
echo "curl http://localhost:8787/api/tasks to test"
node --env-file=../.env src/server.js 

# TinyURL

## How to setup
Start a Docker container running the latest version of Redis for the cache:

```docker run -d -p 6379:6379 --name redis redis:latest```

Start a Docker container running PostgreSQL 16 for the database:

```docker run --name postgres -e POSTGRES_USER=superuser -e POSTGRES_PASSWORD=9876543210 -e POSTGRES_DB=tinyurl -p 5432:5432 -d postgres:16```

Install all package dependencies:

```npm i```

Ensure the schema has been generated. Run the following command:

```npx prisma migrate dev```



## How to run
Run the server in dev mode:

```npm run dev```
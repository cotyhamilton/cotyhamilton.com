# 💦 Running Drizzle ORM in the Browser

We're putting the database right in the browser. I'm using the cr-sqlite wasm database from [vulcan labs](https://vlcn.io), but there are many other SQLite databases that can run in the browser where this method can be used.

## Drizzle Async SQLite Proxy

We need to use the [async sqlite proxy](https://orm.drizzle.team/docs/get-started-sqlite#http-proxy) to interact with our database. Using the proxy we can define how to interact with our database even though drizzle doesn't natively support it.

Here I define the database client, and export the database with the `getDatase` function. The `getDatabase` function isn't always necessary, but for my local-first app I need migrations, and I need migrations to run before the first connection. It also allows me to reuse the database without drizzle, such as for debugging since drizzle kit will not work in this environment.

```ts
// src/lib/db/client.ts

import initWasm, { type DB } from "@vlcn.io/crsqlite-wasm";
import wasmUrl from "@vlcn.io/crsqlite-wasm/crsqlite.wasm?url";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import { migrate } from "./migrator";
import * as schema from "./schema";

let connection: DB;
let creating = false;

/**
 * Creates the database by initializing the SQLite WebAssembly.
 * @returns {Promise<void>} A promise that resolves when the database is created.
 */
export const createDatabase = async () => {
  creating = true;
  // Determine the URL for the WebAssembly module based on the environment
  const url =
    process.env.NODE_ENV === "test"
      ? "https://esm.sh/@vlcn.io/crsqlite-wasm@0.16.0"
      : wasmUrl;
  // Initialize the SQLite WebAssembly
  const sqlite = await initWasm(() => url);
  // Open a connection to the database
  connection = await sqlite.open("test.db");

  try {
    // Run database migrations
    await migrate(db);
    console.log("Applied migrations");
    // Handle any errors that occur during migrations
  } catch (e: any) {
    console.error("Error during running migrations: " + e.message);
  }

  creating = false;
};

/**
 * Gets the existing database connection or creates a new one if it doesn't exist.
 * @returns {Promise<DB>} A promise that resolves with the database connection.
 */
export const getDatabase = async () => {
  if (!connection && !creating) {
    // If the connection doesn't exist and creation is not in progress, create the database
    await createDatabase();
  } else if (!connection && creating) {
    // If the connection doesn't exist but creation is in progress, wait for creation to complete
    while (creating) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  // Return the existing database connection
  return connection;
};

/**
 * A database proxy function to execute SQL queries.
 * @param {string} sql The SQL query to execute.
 * @param {Array<any>} params The parameters for the query.
 * @param {string} method The method for the query (get, run, values, all).
 * @returns {Promise<{rows: Array<any>}>} A promise that resolves with the result of the query.
 */
export const db = drizzle(
  async (sql, params, method) => {
    const sqlite = await getDatabase();
    // Prepare the SQL statement
    const stmt = await sqlite.prepare(sql);
    try {
      let rows = [];
      switch (method) {
        case "get":
          // Execute a query that expects a single row result
          rows = await stmt.bind(params).raw(true).get(null);
          break;
        case "run":
          // Execute a query that doesn't return any result
          await stmt.bind(params).raw(true).run(null);
          break;
        case "values":
        case "all":
        default:
          // Execute a query that returns multiple rows
          rows = await stmt.bind(params).raw(true).all(null);
          break;
      }
      // Finalize the statement to release resources
      stmt.finalize(null);
      // Return the result of the query
      return { rows: rows };
      // Handle any errors that occur during query execution
    } catch (e: any) {
      console.error("Error from sqlite proxy: ", e.message);
      // Finalize the statement to release resources
      stmt.finalize(null);
      // Return an empty result in case of error
      return { rows: [] };
    }
  },
  // Provide the database schema to the drizzle function
  { schema }
);
```

## Drizzle Migrations

By default, drizzle migrations use the file system to grab the sql migration files defined in the drizzle config and also uses the `node:crypto` module for hashing. This doesn't make sense for the browser environment, but fortunately drizzle's migration code is simple and easy to alter for our purpose. We're instead going to import the json files as modules which vite allows us (deno and other bundlers like vite will have similar functionality) and use the [Web Crypto Api](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) for hashing.

This is my drizzle config.

```ts
// drizzle.config.ts

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
} satisfies Config;
```

To create migration files run

```sh
yarn drizzle-kit generate:sqlite
```

This is the migrator, executed by the `createDatabase` function above and copied from [here](https://github.com/drizzle-team/drizzle-orm/blob/0da1cba84da08bc0407821c9ab55b3e780ff5e3f/drizzle-orm/src/sqlite-proxy/migrator.ts)

```ts
// src/lib/db/migrator.ts

import { sql } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import * as journal from "./migrations/meta/_journal.json";

/**
 * Configuration for the database kit.
 */
export interface KitConfig {
  out: string;
  schema: string;
}

/**
 * Configuration for migrations.
 */
export interface MigrationConfig {
  migrationsFolder: string;
  migrationsTable?: string;
}

/**
 * Metadata for a migration.
 */
export interface MigrationMeta {
  sql: string[];
  folderMillis: number;
  hash: string;
  bps: boolean;
}

/**
 * Result of a remote SQLite query.
 */
export interface SqliteRemoteResult<T = unknown> {
  rows?: T[];
}

/**
 * Database type for remote SQLite operations.
 */
export type SqliteRemoteDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>
> = BaseSQLiteDatabase<"async", SqliteRemoteResult, TSchema>;

/**
 * Hashes the given query using SHA-256.
 * @param query The SQL query to hash.
 * @returns A promise that resolves with the hashed query.
 */
export async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Reads migration files and returns an array of migration metadata.
 * @returns A promise that resolves with an array of migration metadata.
 */
export async function readMigrationFiles(): Promise<MigrationMeta[]> {
  const migrationQueries: MigrationMeta[] = [];

  for (const journalEntry of journal.entries) {
    try {
      // Import migration query from file
      const query = (await import(`./migrations/${journalEntry.tag}.sql?raw`))
        .default as string;

      // Split query into individual statements
      const result = query.split("--> statement-breakpoint").map((it) => {
        return it;
      });

      // Calculate hash of the query
      migrationQueries.push({
        sql: result,
        bps: journalEntry.breakpoints,
        folderMillis: journalEntry.when,
        hash: await hashQuery(query),
      });
    } catch {
      throw new Error(`Failed to import migration ${journalEntry.tag}`);
    }
  }

  return migrationQueries;
}

/**
 * Migrates the database based on provided migration queries.
 * @param db The SQLite remote database to migrate.
 * @returns A promise that resolves when the migration is complete.
 */
export async function migrate<TSchema extends Record<string, unknown>>(
  db: SqliteRemoteDatabase<TSchema>
): Promise<void> {
  const migrations = await readMigrationFiles();

  // Create migration table if it doesn't exist
  const migrationTableCreate = sql`
        CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
            id SERIAL PRIMARY KEY,
            hash text NOT NULL,
            created_at numeric
        )
    `;

  await db.run(migrationTableCreate);

  // Get information about the last migration from the database
  const dbMigrations = await db.values<[number, string, string]>(
    sql`SELECT id, hash, created_at FROM "__drizzle_migrations" ORDER BY created_at DESC LIMIT 1`
  );

  const lastDbMigration = dbMigrations[0] ?? undefined;

  // Begin transaction
  await db.run(sql`BEGIN`);
  try {
    for (const migration of migrations) {
      // Check if the migration should be applied based on the last migration time
      if (
        !lastDbMigration ||
        Number(lastDbMigration[2])! < migration.folderMillis
      ) {
        // Apply each SQL statement in the migration
        for (const stmt of migration.sql) {
          await db.run(sql.raw(stmt));
        }
        // Record the migration in the database
        await db.run(
          sql`INSERT INTO "__drizzle_migrations" ("hash", "created_at") VALUES(${migration.hash}, ${migration.folderMillis})`
        );
      }
    }
    // Commit transaction
    await db.run(sql`COMMIT`);
    // Handle errors and rollback transaction if necessary
  } catch (e) {
    await db.run(sql`ROLLBACK`);
    throw e;
  }
}
```

`_journal.json` tells the migrator the location of the migration files, which get dynamically imported in the `readMigrationFiles` function.

And that's it, now you can use drizzle like you would in a normal node project.

```ts
// src/lib/test.ts

import { db } from "$lib/db/client";
import { boxes, transactions } from "$lib/db/schema";
import { eq, sql } from "drizzle-orm";

export const getTransactionById = async (id: number) => {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .get();
};
```

## The Bug

Unfortunately the drizzle sqlite async proxy doesn't work with [drizzle queries](https://orm.drizzle.team/docs/rqb). There are issues and PRs open to fix this, you can follow the advice [here](https://github.com/drizzle-team/drizzle-orm/issues/873#issuecomment-1890754539) to patch it for your project.

```ts
// src/lib/test.ts

import { db } from "$lib/db/client";
import { transactions } from "$lib/db/schema";
import { desc, eq } from "drizzle-orm";

const getTransactions = async () => {
  return await db.query.transactions.findMany({
    with: { box: true },
    orderBy: [desc(transactions.date)],
  });
};
```

You can check out the project I'm using this in [https://github.com/cotyhamilton/budgety](https://github.com/cotyhamilton/budgety)

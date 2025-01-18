
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.21.1
 * Query Engine version: 69d742ee20b815d88e17e54db4a2a7a3b30324e3
 */
Prisma.prismaVersion = {
  client: "5.21.1",
  engine: "69d742ee20b815d88e17e54db4a2a7a3b30324e3"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.MessagesScalarFieldEnum = {
  id: 'id',
  message: 'message',
  userId: 'userId',
  attachment: 'attachment',
  at: 'at',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  threadId: 'threadId'
};

exports.Prisma.TableSchemaScalarFieldEnum = {
  id: 'id',
  schemaSlug: 'schemaSlug',
  schemaName: 'schemaName',
  rawSqlSchema: 'rawSqlSchema',
  zodValidationConfig: 'zodValidationConfig',
  validAt: 'validAt',
  expiredAt: 'expiredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ThreadsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  name: 'name'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  Messages: 'Messages',
  TableSchema: 'TableSchema',
  Threads: 'Threads',
  User: 'User'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/adaga/daga_lin/Sql-Copilot/src/gen/prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters",
      "metrics",
      "views",
      "prismaSchemaFolder",
      "omitApi"
    ],
    "sourceFilePath": "/Users/adaga/daga_lin/Sql-Copilot/prisma/schema/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null
  },
  "relativePath": "../../../prisma/schema",
  "clientVersion": "5.21.1",
  "engineVersion": "69d742ee20b815d88e17e54db4a2a7a3b30324e3",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "model Messages {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  message    String    @map(\"message\")\n  userId     String?   @map(\"user_id\") @db.Uuid\n  attachment String?   @map(\"attachment\")\n  at         DateTime? @map(\"at\")\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n\n  thread   Threads? @relation(fields: [threadId], references: [id])\n  threadId String?  @map(\"thread_id\") @db.Uuid\n\n  @@map(\"messages\")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../../src/gen/prisma\"\n  previewFeatures = [\"metrics\", \"prismaSchemaFolder\", \"omitApi\", \"views\", \"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel TableSchema {\n  id                  String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  schemaSlug          String    @map(\"schema_slug\")\n  schemaName          String    @map(\"schema_name\")\n  rawSqlSchema        String    @map(\"raw_sql_schema\")\n  zodValidationConfig Json      @map(\"zod_validation_config\")\n  validAt             DateTime  @map(\"valid_at\")\n  expiredAt           DateTime? @map(\"expired_at\")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([schemaName, validAt, expiredAt])\n  @@map(\"table_schemas\")\n}\n\nmodel Threads {\n  id        String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  title     String     @map(\"title\")\n  userId    String?    @map(\"user_id\") @db.Uuid\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @default(now()) @map(\"updated_at\")\n  messages  Messages[]\n\n  @@map(\"threads\")\n}\n\nmodel User {\n  id    String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  email String  @unique\n  name  String?\n}\n",
  "inlineSchemaHash": "c1a9eef67541d6caf7f57b10b7e9cdd706e3cd273d206f5368d4ee4bfe6d7fe1",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Messages\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"message\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"attachment\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"attachment\"},{\"name\":\"at\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"at\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"thread\",\"kind\":\"object\",\"type\":\"Threads\",\"relationName\":\"MessagesToThreads\"},{\"name\":\"threadId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"thread_id\"}],\"dbName\":\"messages\"},\"TableSchema\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"schemaSlug\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"schema_slug\"},{\"name\":\"schemaName\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"schema_name\"},{\"name\":\"rawSqlSchema\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"raw_sql_schema\"},{\"name\":\"zodValidationConfig\",\"kind\":\"scalar\",\"type\":\"Json\",\"dbName\":\"zod_validation_config\"},{\"name\":\"validAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"valid_at\"},{\"name\":\"expiredAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"expired_at\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":\"table_schemas\"},\"Threads\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"title\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"messages\",\"kind\":\"object\",\"type\":\"Messages\",\"relationName\":\"MessagesToThreads\"}],\"dbName\":\"threads\"},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)


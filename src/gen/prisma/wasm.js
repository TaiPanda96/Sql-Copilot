
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
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
 * Prisma Client JS version: 6.2.1
 * Query Engine version: 4123509d24aa4dede1e864b46351bf2790323b69
 */
Prisma.prismaVersion = {
  client: "6.2.1",
  engine: "4123509d24aa4dede1e864b46351bf2790323b69"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
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

exports.Prisma.FilesScalarFieldEnum = {
  id: 'id',
  url: 'url',
  name: 'name',
  userId: 'userId'
};

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

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Files: 'Files',
  Messages: 'Messages',
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
      "value": "/Users/taishanlin/Desktop/SQLBUILDER/sql-copilot/src/gen/prisma",
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
      "prismaSchemaFolder"
    ],
    "sourceFilePath": "/Users/taishanlin/Desktop/SQLBUILDER/sql-copilot/prisma/schema/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma/schema",
  "clientVersion": "6.2.1",
  "engineVersion": "4123509d24aa4dede1e864b46351bf2790323b69",
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
  "inlineSchema": "model Files {\n  id   String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  url  String  @map(\"url\")\n  name String? @map(\"name\")\n\n  // User Relationship\n  user   User?   @relation(fields: [userId], references: [id])\n  userId String? @map(\"user_id\") @db.Uuid\n\n  @@map(\"files\")\n}\n\nmodel Messages {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  message    String    @map(\"message\")\n  userId     String?   @map(\"user_id\") @db.Uuid\n  attachment String?   @map(\"attachment\")\n  at         DateTime? @map(\"at\")\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n\n  thread   Threads? @relation(fields: [threadId], references: [id])\n  threadId String?  @map(\"thread_id\") @db.Uuid\n\n  @@map(\"messages\")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../../src/gen/prisma\"\n  previewFeatures = [\"metrics\", \"prismaSchemaFolder\", \"views\", \"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Threads {\n  id        String     @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  title     String     @map(\"title\")\n  userId    String?    @map(\"user_id\") @db.Uuid\n  createdAt DateTime   @default(now())\n  updatedAt DateTime   @default(now()) @map(\"updated_at\")\n  messages  Messages[]\n\n  @@map(\"threads\")\n}\n\nmodel User {\n  id    String  @id @default(dbgenerated(\"gen_random_uuid()\")) @db.Uuid\n  email String  @unique\n  name  String?\n  files Files[]\n}\n",
  "inlineSchemaHash": "41f36abeda028d5908c03f938bf181846eb27f24142f8024a1f3f7138fdf26b5",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Files\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"url\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"url\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"name\"},{\"name\":\"user\",\"kind\":\"object\",\"type\":\"User\",\"relationName\":\"FilesToUser\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"}],\"dbName\":\"files\"},\"Messages\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"message\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"message\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"attachment\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"attachment\"},{\"name\":\"at\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"at\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"thread\",\"kind\":\"object\",\"type\":\"Threads\",\"relationName\":\"MessagesToThreads\"},{\"name\":\"threadId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"thread_id\"}],\"dbName\":\"messages\"},\"Threads\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"title\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"user_id\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"messages\",\"kind\":\"object\",\"type\":\"Messages\",\"relationName\":\"MessagesToThreads\"}],\"dbName\":\"threads\"},\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"files\",\"kind\":\"object\",\"type\":\"Files\",\"relationName\":\"FilesToUser\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
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


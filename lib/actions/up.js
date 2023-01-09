const _ = require("lodash");
const pEachSeries = require("p-each-series");
const { promisify } = require("util");
const fnArgs = require('fn-args');

const status = require("./status");
const config = require("../env/config");
const migrationsDir = require("../env/migrationsDir");
const hasCallback = require('../utils/has-callback');
const logger = require('../utils/logger')

module.exports = async (db, client) => {
  const statusItems = await status(db);
  const pendingItems = _.filter(statusItems, { appliedAt: "PENDING" });
  const migrated = [];
  const { changelogCollectionName, useFileHash } = await config.read();

  const migrateItem = async (item, index) => {
    try {
      const migration = await migrationsDir.loadMigration(item.fileName);
      const up = hasCallback(migration.up) ? promisify(migration.up) : migration.up;

      logger.info(`[migration:up] ${ index + 1 } of ${ pendingItems.length }`)
      logger.info(`[migration:up]>start ${ item.fileName }`)
      const started = Date.now()
      if (hasCallback(migration.up) && fnArgs(migration.up).length < 3) {
        // support old callback-based migrations prior to migrate-mongo 7.x.x
        await up(db);
      } else {
        await up(db, client);
      }
      logger.info(`[migration:down]>end ${ item.fileName }:${ Date.now() - started } ms`)
    } catch (err) {
      const error = new Error(
        `Could not migrate up ${item.fileName}: ${err.message}`
      );
      error.stack = err.stack;
      error.migrated = migrated;
      throw error;
    }

    const changelogCollection = db.collection(changelogCollectionName);

    const { fileName, fileHash } = item;
    const appliedAt = new Date();

    try {
      await changelogCollection.insertOne(useFileHash === true ? { fileName, fileHash, appliedAt } : { fileName, appliedAt });
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
    migrated.push(item.fileName);
  };

  await pEachSeries(pendingItems, migrateItem);
  return migrated;
};

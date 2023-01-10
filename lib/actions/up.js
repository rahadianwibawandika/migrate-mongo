const _ = require("lodash");
const pEachSeries = require("p-each-series");
const fnArgs = require("fn-args");
const { promisify } = require("util");
const status = require("./status");

const configFile = require("../env/configFile");
const migrationsDir = require("../env/migrationsDir");
const LogFactory = require('../utils/logger')

module.exports = async db => {
  const statusItems = await status(db);
  const pendingItems = _.filter(statusItems, { appliedAt: "PENDING" });
  const migrated = [];
  const logger = await LogFactory()

  const migrateItem = async (item, index) => {
    try {
      const migration = await migrationsDir.loadMigration(item.fileName);
      const args = fnArgs(migration.up);
      const up = args.length > 1 ? promisify(migration.up) : migration.up;
      logger.info('[migrate-mongo:up]>Start', item.fileName, '|', `${ index + 1 } of ${ pendingItems.length }`)
      const started = Date.now()
      await up(db);
      logger.info('[migrate-mongo:up]>End', item.fileName, Date.now() - started, 'ms')
    } catch (err) {
      const error = new Error(
        `Could not migrate up ${item.fileName}: ${err.message}`
      );
      error.migrated = migrated;
      throw error;
    }

    const config = await configFile.read();
    const collectionName = config.changelogCollectionName;
    const collection = db.collection(collectionName);

    const { fileName } = item;
    const appliedAt = new Date();

    try {
      await collection.insertOne({ fileName, appliedAt });
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
    migrated.push(item.fileName);
  };

  await pEachSeries(pendingItems, migrateItem);
  return migrated;
};

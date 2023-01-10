const _ = require("lodash");
const fnArgs = require("fn-args");
const { promisify } = require("util");
const status = require("./status");
const configFile = require("../env/configFile");
const migrationsDir = require("../env/migrationsDir");
const LogFactory = require('../utils/logger')

module.exports = async db => {
  const downgraded = [];
  const statusItems = await status(db);
  const appliedItems = statusItems.filter(item => item.appliedAt !== "PENDING");
  const lastAppliedItem = _.last(appliedItems);
  const logger = await LogFactory()

  if (lastAppliedItem) {
    try {
      const migration = await migrationsDir.loadMigration(lastAppliedItem.fileName);
      const args = fnArgs(migration.down);
      const down = args.length > 1 ? promisify(migration.down) : migration.down;
      logger.info('[migrate-mongo:down]>Start', lastAppliedItem.fileName)
      const started = Date.now()
      await down(db);
      logger.info('[migrate-mongo:down]>End', lastAppliedItem.fileName, Date.now() - started, 'ms')
    } catch (err) {
      throw new Error(
        `Could not migrate down ${lastAppliedItem.fileName}: ${err.message}`
      );
    }
    const config = await configFile.read();
    const collectionName = config.changelogCollectionName;
    const collection = db.collection(collectionName);
    try {
      await collection.deleteOne({ fileName: lastAppliedItem.fileName });
      downgraded.push(lastAppliedItem.fileName);
    } catch (err) {
      throw new Error(`Could not update changelog: ${err.message}`);
    }
  }

  return downgraded;
};

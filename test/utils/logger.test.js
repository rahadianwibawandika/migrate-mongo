const { expect } = require("chai");
const sinon = require("sinon");
const path = require("path");
const proxyquire = require("proxyquire");

describe("Logger - Verbose Enabled", () => {
  let LogFactory
  let configFile
  let consoleLog
  let consoleTime
  let consoleTimeLog
  let consoleTimeEnd

  function mockConsole() {
    consoleLog = console.log
    consoleTime = console.time
    console.timeLog = console.timeLog
    console.timeEnd = console.timeEnd

    console.log = sinon.stub()
    console.time = sinon.stub()
    console.timeLog = sinon.stub()
    console.timeEnd = sinon.stub()
  }

  function cleanupConsole() {
    console.log = consoleLog
    console.time = consoleTime
    console.timeEnd = consoleTimeEnd
    console.timeLog = consoleTimeLog
  }

  function mockConfigFile() {
    return {
      shouldNotExist: sinon.stub().returns(Promise.resolve()),
      read: sinon.stub().returns({
        changelogCollectionName: "changelog",
        verbose: true
      })
    };
  }

  function loadLoggerWithInjection() {
    return proxyquire("../../lib/utils/logger", {
      "../env/configFile": configFile,
    });
  }

  beforeEach(() => {
    // mockConsole()
    configFile = mockConfigFile();
    LogFactory = loadLoggerWithInjection()
  });

  afterEach(() => {
    cleanupConsole()
  })

  it("should call console.log", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.info('something')
    expect(console.log.called).to.be.eq(true)
    expect(console.log.calledWith('something')).to.be.eq(true)
  });

  it("should call console.time", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.time('something')
    expect(console.time.called).to.be.eq(true)
    expect(console.time.calledWith('something')).to.be.eq(true)
  });

  it("should call console.timeLog", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.timeLog('something')
    expect(console.timeLog.called).to.be.eq(true)
    expect(console.timeLog.calledWith('something')).to.be.eq(true)
  });

  it("should call console.timeEnd", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.timeEnd('something')
    expect(console.timeEnd.called).to.be.eq(true)
    expect(console.timeEnd.calledWith('something')).to.be.eq(true)
  });
});

describe("Logger - Verbose Disabled", () => {
  let LogFactory
  let configFile
  let consoleLog
  let consoleTime
  let consoleTimeLog
  let consoleTimeEnd

  function mockConsole() {
    consoleLog = console.log
    consoleTime = console.time
    console.timeLog = console.timeLog
    console.timeEnd = console.timeEnd

    console.log = sinon.stub()
    console.time = sinon.stub()
    console.timeLog = sinon.stub()
    console.timeEnd = sinon.stub()
  }

  function cleanupConsole() {
    console.log = consoleLog
    console.time = consoleTime
    console.timeEnd = consoleTimeEnd
    console.timeLog = consoleTimeLog
  }

  function mockConfigFile() {
    return {
      shouldNotExist: sinon.stub().returns(Promise.resolve()),
      read: sinon.stub().returns({
        changelogCollectionName: "changelog",
      })
    };
  }

  function loadLoggerWithInjection() {
    return proxyquire("../../lib/utils/logger", {
      "../env/configFile": configFile,
    });
  }

  beforeEach(() => {
    // mockConsole()
    configFile = mockConfigFile();
    LogFactory = loadLoggerWithInjection()
  });

  afterEach(() => {
    cleanupConsole()
  })

  it("should not call console.log", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.info('something')
    expect(console.log.called).to.be.eq(false)
    expect(console.log.calledWith('something')).to.be.eq(false)
  });

  it("should not call console.time", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.time('something')
    expect(console.time.called).to.be.eq(false)
    expect(console.time.calledWith('something')).to.be.eq(false)
  });

  it("should not call console.timeLog", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.timeLog('something')
    expect(console.timeLog.called).to.be.eq(false)
    expect(console.timeLog.calledWith('something')).to.be.eq(false)
  });

  it("should not call console.timeEnd", async () => {
    mockConsole()
    const logger = await LogFactory()
    logger.timeEnd('something')
    expect(console.timeEnd.called).to.be.eq(false)
    expect(console.timeEnd.calledWith('something')).to.be.eq(false)
  });
});

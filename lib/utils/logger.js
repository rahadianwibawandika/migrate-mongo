const config = require("../env/config");
const { verbose } = config.read()
const isVerbose = verbose === true
const mock = () => {}

module.exports = {
    info: isVerbose ? console.log : mock,
    time: isVerbose ? console.time : mock,
    timeEnd: isVerbose ? console.timeEnd : mock,
    timeLog: isVerbose ? console.timeLog : mock, 
}
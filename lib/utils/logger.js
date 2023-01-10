const config = require("../env/configFile");
const mock = () => {}

module.exports = async () => {
    const { verbose } = await config.read()
    const isVerbose = verbose === true
    return {
        info: isVerbose ? console.log : mock,
        time: isVerbose ? console.time : mock,
        timeEnd: isVerbose ? console.timeEnd : mock,
        timeLog: isVerbose ? console.timeLog : mock, 
    }
}
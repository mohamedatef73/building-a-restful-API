/*
* create and export configuration variables
*
*/

// configuration for all the enviromments
var enviromments = {}

// staging (default) enviroments
enviromments.staging ={ 
    'httpPort' : 3000,
    'httpsPort' : 3001,
    'envName' : 'staging'
}

// production enviroments
enviromments.production= {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production'
}

// determine which enviroments was passed as a command-line argument
var currentEnviroment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''

//check that the current enviroment is one of the enviroments above , if not, default to staging
var environmentToExport = typeof(enviromments[currentEnviroment]) == 'object' ? enviromments [currentEnviroment] : enviromments.staging

// exports the module
module.exports = environmentToExport



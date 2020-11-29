/*
* library for storing and editing data
*
*/

// dependencies
var fs = require('fs')
var path = require('path')
var helpers = require('./helpers')

// container for the module (to be exported)
var lib = {}

//base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data')

//write data to a file
lib.create = function (dir, file, data, callback) {
    //open the file for writing 
    fs.open(lib.baseDir+'/'+dir+'/'+file+'.json','wx',function(err, fileDescription) {
        if (!err && fileDescription) {
            //convert data to string
            var stringData = JSON.stringify(data)

            //write to file and close it
            fs.writeFile(fileDescription, stringData, function (err) {
                if (!err) {
                    fs.close(fileDescription, function (err) {
                        if (!err) {
                            callback(false)


                        } else {
                            callback('error closing new file')
                        }
                    })
                } else {
                    callback('error writing to new file')

                }
            })
        } else {
            callback('could not create new file , it may already exist')
        }
    })
}


// read data from a file
lib.read = function (dir, file, callback) {
    fs.readFile(lib.baseDir+'/'+dir+'/'+file+'.json','utf8',function (err, data) {
       if(!err && data){
           var parsedData = helpers.parseJsonToObject(data)
           callback(false,parsedData)
       }else{
        callback(err, data)
       }
    })
}

// update the data inside a file
lib.update = function (dir, file, data, callback) {
    //open the file for writing
    fs.open(lib.baseDir+'/'+dir+'/'+file+'.json','r+',function (err, fileDescription) {
        if (!err && fileDescription) {
            var stringData = JSON.stringify(data)

            // truncate the file
            fs.truncate(fileDescription, function (err) {
                if (!err) {
                    if (!err) {
                        //write to the file and close it
                        fs.writeFile(fileDescription, stringData, function (err) {
                            if (!err) {
                                fs.close(fileDescription, function (err) {
                                    if (!err) {
                                        callback(false)
                                    } else {
                                        callback('error closing the file')
                                    }
                                })

                            } else {
                                callback('error writing to existing file')
                            }
                        })
                    }


                } else {
                    callback('error truncating file')
                }
            })

        } else {
            callback('could not open the file for updating, it may not exist yet')
        }
    })
}


// deleting the file
lib.delete = function(dir,file,callback){
    //unlink the file
    fs.unlink(lib.baseDir+'/'+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false)
        }else{
            callback('error')
        }
    }) 
}
//write the module
module.exports = lib
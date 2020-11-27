/*
*request handlers
*
*/

//dependecies

var _data = require('./data')
var helpers = require('./helpers')


//define the handlers
var handlers = {}

//users
handlers.users = function (data, callback) {
    var acceptableMethods = ['post', 'get', 'put', 'delete']
    if (acceptableMethods.indexOf(data.method) > -1) {
        handlers._users[data.method](data, callback)
    } else {
        callback(405)
    }
}

// container fro the users submethods
handlers._users = {}

//users - post

//required data: firstname, lastname, phone, password, tosagreement
//optional data : noe 
handlers._users.post = function (data, callback) {
    //check that all required fields are filled out
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length > 11 ? data.payload.phone.trim() : false
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false
    var tosagreement = typeof (data.payload.tosagreement) == 'boolean' && data.payload.tosagreement == true ? true : false

    if (firstName && lastName && phone && password && tosagreement) {
        //make sure that the user dosen't already exist
        _data.read('users', phone, function (err, data) {
            if (err) {

                var hashedPassword = helpers.hash(password)
                // create the user object

                if (hashedPassword) {

                    var userObject = {
                        'firstName': firstName,
                        'lastName': lastName,
                        "hashedPassword": hashedPassword,
                        'phone': phone,
                        'tosAgreement': tosagreement
                    }

                    // store the user

                    _data.create('users', phone, userObject, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { "Error": "could not create the new user\'s password" })

                        }
                    })
                }

            }
            else {
                callback(400, { 'Error': 'A user with that phone number already exists' })
            }

        })
    }


}

//users - get
// requires data: phone
//optionaldata: none
// @TODO only let an authenticated user acces thier object and don't let them access anoyone else's

handlers._users.get = function (data, callback) {
    // check that the phone number is valid

    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.trim() : false
    if (!phone) {
        // lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                //remove the hashed password fromthe user object before returning it to the require
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(404)
            }

        })
    } else {
        callback(400, { 'Error': "messing required field" })
    }
}

//users - put
// required data : none
// optional data: firstname, lastname , password( at least one must be specified)
//@TODO only let an authenticated user update thier own object. don't let them updat anyone else's

handlers._users.put = function (data, callback) {
    // check for the required field
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length == 11 ? data.payload.trim() : false
    // check for the optional fields
    var firstName = typeof (data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false
    var lastName = typeof (data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false
    var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

    // error if the phone is invalid
    if (phone) {
        // error if nothing is ent to update
        if (firstName || lastName || password) {
            //lookup the user
            _data.read('users', phone, function (err, userData) {
                if (!err && userData) {
                    //update the fields necessary
                    if (firstName) {
                        userData.firstName = firstName
                    }
                    if (lastName) {
                        userData.lastName = lastName
                    }
                    if (password) {
                        userData.hashedPassword = helpers.hash(password)
                    }

                    // store the new update
                    _data.update('users', phone, userData, function (err) {
                        if (!err) {
                            callback(200)
                        } else {
                            console.log(err)
                            callback(500, { 'error': 'could not update the user!' })
                        }
                    })

                } else {
                    callback(400, { 'error happened': 'the speciecied user does not exist!' })
                }
            })
        }

    } else {
        callback(400, { 'error': 'missing required field' })
    }
}

//users - delete
// required field : phone
// @TODO only let an authenticated user delete thier object, dont let them delete anyone else's
// @TODO cleanup (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {
    // check that the phone number is valid
    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.phone.trim() : false
    if (phone) {
        //lookup the user
        _data.read('users', phone, function (err, data) {
            if (!err && data) {
                _data.delete('users', phone, function (err) {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, { 'error': 'could not delete the specfied user' })
                    }
                })
            } else {
                callback(400, { 'error': 'could not find the specfied user' })
            }
        })

    } else {
        callback(400, { 'error': 'missing required field' })
    }
}



// define the handlers
var handlers = {}

// ping handler
handlers.ping = function (data, callback) {

    //callback a http status code, and payload object
    callback(200)

}

//not found handler
handlers.notfound = function (data, callback) {
    callback(404)

}



module.exports = handlers
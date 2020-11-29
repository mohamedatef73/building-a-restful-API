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
    var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 11 ? data.payload.phone.trim() : false
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

                    _data.create('users', firstName, userObject, function (err) {
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
    } else {
        callback(400, { "errrrror": "missing data" })
    }


}

//users - get
// requires data: phone
//optionaldata: none
handlers._users.get = function (data, callback) {
    // check that the phone number is valid

    var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.trim() : false
    if (phone) {

        // get the token from the headers
        var token = typeof (data.headers.token) == 'string' ? data.headers.token : false

        // verify that the given token is valid for the phone number
        handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
            if (tokenIsValid) {
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
                callback(403, { "error": "missing required token is header, or token is valid" })
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
            // get the token from the headers
            var token = typeof (data.headers.token) == 'string' ? data.headers.token : false

            // verify that the given token is valid for the phone number
            handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
                if (tokenIsValid) {
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

                } else {
                    callback(403, { "error": "missing required token in header, or token is valid" })

                }
            })
        }
    }
}


        //users - delete
        // required field : phone
        handlers._users.delete = function (data, callback) {
            // check that the phone number is valid
            var phone = typeof (data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 11 ? data.queryStringObject.phone.trim() : false
            if (phone) {
                // get the token from the headers
                var token = typeof (data.headers.token) == 'string' ? data.headers.token : false

                // verify that the given token is valid for the phone number
                handlers.tokens.verifyToken(token, phone, function (tokenIsValid) {
                    if (tokenIsValid) {
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
                        callback(403, { "error": "missing required token in header, or token is valid" })

                    }
                })
            } else {
                callback(400, { 'error': 'missing required field' })
            }
        }

        //tokens
        handlers.tokens = function (data, callback) {
            var acceptableMethods = ['post', 'get', 'put', 'delete']
            if (acceptableMethods.indexOf(data.method) > -1) {
                handlers._tokens[data.method](data, callback)
            } else {
                callback(405)
            }
        }

        // container for all the tokens methods

        handlers._tokens = {}

        //tokens - post
        //required data : phone , password
        //optional data:none
        handlers._tokens.post = function (data, callback) {

            var phone = typeof (data.payload.phone) == 'string' && data.payload.phone.trim().length >= 11 ? data.payload.phone.trim() : false
            var password = typeof (data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false

            if (phone && password) {
                //lookup the user who matches that phone number
                _data.read('users', phone, function (err, userData) {
                    if (err && userData) {
                        //hash the sent password, and compare it to the password stored in the user object
                        var hashedPassword = helpers.hash(password)
                        if (hashedPassword == userData.hashedPassword) {
                            // if valid, create a new token with random name, set expiration date 1 hour
                            var tokenId = helpers.createRandomString(5)
                            // var expires = Date.now() + 1000 * 60 * 60
                            var tokenObject = {
                                'phone': phone,
                                'id': tokenId,
                                // 'expires' : expires
                            }

                            // store the token
                            _data.create('tokens', tokenId, tokenObject, function (err) {
                                if (!err) {
                                    callback(200, tokenObject)
                                } else {
                                    callback(500, { 'error': 'could not create the new token' })
                                }
                            })
                        } else {
                            callback(400, { 'error': 'password did not match the user stored path' })
                        }
                    } else {
                        callback(400, { 'error': 'could not find the specified user' })
                    }
                })
            } else {
                callback(600, { 'error': 'missing required fields' })
            }
        }

        //tokens - get
        // required data : id
        // optional data : none
        handlers._tokens.get = function (data, callback) {
            var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
            if (id) {
                // lookup the token
                _data.read('tokens', id, function (err, tokenData) {
                    if (!err && tokenData) {
                        callback(200, tokenData)
                    } else {
                        callback(404)
                    }

                })
            } else {
                callback(400, { 'Error': "messing required field" })
            }
        }



        // tokens - put
        handlers._tokens.put = function (data, callback) {
            var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
            var extend = typeof (data.queryStringObject.extend) == 'boolean' && data.queryStringObject.extend == true ? true : false
            if (id && extend) {
                // lookup the token 
                _data.read('tokens', id, function (err, tokenData) {
                    if (!err && tokenData) {
                        // check to make sure the token isn't already expired
                        if (tokenData.expires > Date.now()) {
                            // set the expiration an hour from now
                            tokenData.expires = Date.now() + 1000 * 60 * 60
                            // store the new updates
                            _data.update('tokens', id, tokenData, function (err) {
                                if (!err) {
                                    callback(200)
                                } else {
                                    callback(500, { "error": "could not update the tokens" })
                                }
                            })

                        } else {
                            callback(400, { "error": "the token has already expired, and cannot be extended!" })
                        }

                    } else {
                        callback(400, { "error": "specified token dose not exist!" })
                    }
                })

            } else {
                callback(400, { "error": "missing required fields(s) or fields(s) are invalid" })
            }

        }

        //tokens - delete
        // check that the id is valid
        handlers._tokens.delete = function (data, callback) {
            var id = typeof (data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false
            if (id) {
                //lookup the user
                _data.read('users', id, function (err, data) {
                    if (!err && data) {
                        _data.delete('tokens', id, function (err) {
                            if (!err) {
                                callback(200)
                            } else {
                                callback(500, { 'error': 'could not delete the specfied token' })
                            }
                        })
                    } else {
                        callback(400, { 'error': 'could not find the specfied token' })
                    }
                })

            } else {
                callback(400, { 'error': 'missing required field' })
            }
        }

        // verify if agiven token id is currently valid for given user
        handlers.tokens.verifyToken = function (id, phone, callback) {
            // lookup the token 
            _data.read('token', id, function (err, tokenData) {
                if (!err && tokenData) {
                    // check that the token is for the given user and has not expired
                    if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                        callback(true)
                    } else {
                        callback(false)
                    }
                } else {
                    callback(false)
                }
            })
        }


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
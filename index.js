/*
* Primary file for the API
*/
// Dependencies

var http = require('http');
var url = require('url');

var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
var server = http.createServer(function(req, res){

    //get the url and parse it
    var parsedUrl = url.parse(req.url,true)

    //get the path
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/,'')

    // get the query string as an object
    var queryStringObject = parsedUrl.query;

    // get th ehttp method
    var method = req.method.toLowerCase()

    // get the headers as an object
    var headers = req.headers

    // get the payloads 
    var decoder = new StringDecoder('utf-8')
    var buffer= ''
    req.on('data', function(data){
        buffer += decoder.write(data)
    })

    req.on('end', function(){
        buffer += decoder.end()

        //choose the handler this request should go to , if one is not foumd use the notfound handler
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notfound

        // construct the data object to send to the handler
        var data ={
            'trimmedPath' : trimmedPath,
            'querStringIbject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : buffer
        }

       // router the request specified to handler
       chosenHandler(data,function(statusCode,payload){
           // use the status code called back by the handler , or default to 200
           statusCode = typeof(statusCode) == 'number' ? statusCode : 200
           
           // use the payload called back the handler, or default to empty object

           payload = typeof(payload) == 'object' ? payload : {}

           // convert the payload to a string
           var payloadString = JSON.stringify(payload)

           // return the response
           res.setHeader('Content-type','application/json')
           res.writeHead(statusCode)
           res.end(payloadString)

        //log the request path
        console.log('returning this response: ',statusCode,payloadString)


       })

    })
})

// Start the server, and have it listen on port 3000
server.listen(3000,function(){
    console.log('the server is listening on port 3000 now')
})

// define the handlers
var handlers = {}

// sample handler
handlers.sample= function(data,callback){

    //callback a http status code, and payload object
    callback(406,{'name' : 'sample handler'})

}

//not found handler
handlers.notfound = function(data,callback){
    callback(404)

}

//define a request handler
var router = {
    'sample' : handlers.sample
}
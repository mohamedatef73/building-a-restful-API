/*
* Primary file for the API
*/
// Dependencies

var http = require('http');
var url = require('url');
var config = require('./config')
var StringDecoder = require('string_decoder').StringDecoder;
var https = require('https')
var fs = require('fs')

// Instantiate the https server
var httpServer = http.createServer(function(req, res){
    unifiedServer(req,res)

})


// Start the http server
httpServer.listen(config.httpPort,function(){
    console.log("the server is listening on port  "+config.httpPort)
})

// Instantiate the https server
var httpsServerOption = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert' : fs.readFileSync('./https/cert.pe')
}

var httpsServer = https.createServer(httpsServerOption,function(req,res){
    unifiedServer(req,res)
})

// start the https server
httpsServer.listen(config.httpsPort,function(){
    console.log("the server is listening on port "+config.httpsPort)
})

// all the server logic for both the http and https server
var unifiedServer = function(req,res){
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
    

}

// define the handlers
var handlers = {}

// ping handler
handlers.ping= function(data,callback){

    //callback a http status code, and payload object
    callback(200)

}

//not found handler
handlers.notfound = function(data,callback){
    callback(404)

}

//define a request handler
var router = {
    'ping' : handlers.ping
}
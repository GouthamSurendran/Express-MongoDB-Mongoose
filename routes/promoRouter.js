const express = require('express')
const bodyParser = require('body-parser')

const promoRouter = express.Router()

promoRouter.use(bodyParser.json())

promoRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-type', 'text/plain')
    next()  //When next() is called , the next get/put etc. for '/promoes' will be checked and the modified req and res are passed onto it.
})
.get((req, res, next) => {
    res.end('Will send all the promos to you! ')
})
.post((req,res,next) => {
    res.end('Will add the promo: '+ req.body.name + ' with details: ' + req.body.description)
})
.put((req,res,next) => {
    res.statusCode = 403
    res.end('PUT Operation not supported on /promos')
})
.delete((req, res, next) => {
    res.end('Deleting all the promos ')
})

promoRouter.route('/:promoId')
.all((req, res, next) => {
    res.statusCode = 200
    res.setHeader('Content-type', 'text/plain')
    next()  
})
.get((req, res, next) => {
    res.end('Will send the details of the promo: '+ req.params.promoId + ' to you!')
})
.post((req,res,next) => {
    res.statusCode = 403
    res.end('POST Operation not supported on /promos/'+ req.params.promoId)
})
.put((req,res,next) => {
    res.write('Updating the promo: ' + req.params.promoId + '\n')
    res.end('Will update the promo: '+ req.body.name + ' with details: ' + req.body.description)
})
.delete((req, res, next) => {
    res.end('Deleting promo: '+req.params.promoId)
})

module.exports = promoRouter
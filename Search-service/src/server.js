const express=require('express');
const mongoose=require('mongoose');
const helmet=require('helmet');
const Redis=require('ioredis');
const cors=require('cors');
const errorHandler=require('./middleware/errorHandler');
const logger = require('./utils/logger');
const searchRoutes=require('./routes/searchRoutes');
const { connectToRabbitMq, consumeEvent } = require('./utils/rabbitmq');
const {handlePostCreated,handledPostDeleted }= require('./eventHandler/searchEventHandler');
const app=express();
const PORT=process.env.PORT;
app.use(cors());
app.use(helmet());

mongoose.connect(process.env.MONGOODB_URL)
.then(()=>logger.info("Connected to MONGOODB"))
.catch((e)=>logger.error("error while connecting to MONGO DB",e))


app.use((req,res,next)=>{
    logger.info(`request method :${req.method} received from: ${req.url}`)
    logger.info(`request body:${req.body}`)
    next()
})

const redisClient=new Redis(process.env.REDIS_URL)

app.use('/api/search',(req,res)=>{
    req.redisClient=redisClient
}
,searchRoutes)


app.use(errorHandler)
async function startServer(){

    await connectToRabbitMq()

    await consumeEvent("post.created",handlePostCreated)
    await consumeEvent("post.deleted",handledPostDeleted)
    app.listen(PORT,()=>{
        logger.info(`Server is running in port: ${PORT}`)
    })
}

startServer()

app.use(errorHandler);

process.on("unhandledRejection",(reason,promise)=>{
    logger.info(`unhandled rejection at ${promise} and reason ${reason}`)
})
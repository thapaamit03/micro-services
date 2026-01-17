const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const Redis=require('ioredis')
const helmet=require('helmet');
const logger=require('./utils/logger')
const errorHandler=require('./middleware/errorHandler')
const {rateLimit}=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const postRoutes=require('./routes/postRoutes.js');
const { connectToRabbitMq } = require('./utils/rabbitmq.js');

const app=express();
const PORT=process.env.PORT;

mongoose.connect(process.env.MONGOO_URL)
.then(()=>logger.info("Connected to mongoDB"))
.catch((e)=>logger.error("error connecting to database",e))

app.use(helmet());
app.use(cors());
app.use(express.json());


app.use((req,res,next)=>{
    logger.info(`Received ${req.method} from ${req.url}`)
    logger.info(`request body ${req.body}`)

    next();

})

const redisClient=new Redis(process.env.REDIS_URL);


//ip based rate limiting

const sensitiveEndPointLimiter=rateLimit({
    windowMs:16*10*1024,
    max:50,
    standardHeaders:true,
    legacyHeaders:false,
    handler:((req,res)=>{
         logger.warn(`sensitive enpoint rate limit exceed for ${req.ip} `)
         res.status(429).json({
            message:"Too many request",
            success:false
         })
       
    }),
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args)
    })
})

app.use('/api/posts',sensitiveEndPointLimiter);

//routes=>pass redisclient to request 
app.use('/api/posts',(req,res,next)=>{
    req.redisClient=redisClient
    next()
},postRoutes)



app.use(errorHandler)

async function startServer(){
    
    try {
        await connectToRabbitMq();
        app.listen(PORT,()=>{
        logger.info(`Post-service is running in ${PORT}`)
    })
    } catch (error) {
        logger.info('Failed to connect to server',error)
    }
}

startServer();

process.on( "unhandledRejection",(reason,promise)=>{
        logger.error("Unhandled rejection at",promise,"reason",reason)
}
)




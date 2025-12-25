const mongoose=require('mongoose');
const express=require('express');
const cors=require('cors');
const logger = require('../utils/logger');
const helmet=require('helmet');
const {RateLimiterRedis}=require('rate-limiter-flexible')
const Redis=require('ioredis');
const {rateLimit}=require('express-rate-limit')
const {RedisStore}=require('rate-limit-redis')
const userRoutes=require('../routes/userRoutes');
const errorHandler = require('../Middleware/errorHandler');
const app=express()

const PORT=process.env.PORT;
//connect to mongodb
mongoose
.connect(process.env.MONGOO_URL)
.then(()=>logger.info("Connected to mongodb"))
.catch((e)=>logger.error("Cannot connect to db",e))

const redisClient=new Redis(process.env.REDIS_URL);



//middleware
app.use(express.json());
app.use(helmet());
app.use(cors());

app.use((req,res,next)=>{
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request body ${req.body} `);
    next();
})


//DDOS protection and rate limiting

const rateLimiter=new RateLimiterRedis({
    storeClient:redisClient,
    keyPrefix:"middleware",
    points:10,  //number of request
    duration:1  //time 1 sec
});

app.use((req,res,next)=>{
    rateLimiter.consume(req.ip)     //return promise
    .then(()=>next())
    .catch(()=>{
        logger.warn( `Rate limit exceed for IP:${req.ip}`);
        res.status(429).json({
            success:false,
            message:"Too many request"
        })
    })
})

//Ip based rate limiting for sensitive endpoint

const sensitiveEndPointLimiter=rateLimit({
    windowMs:15* 60*1000,
    max:50,
    standardHeaders:true,   //response header 
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`sensitive endpoint rate limit exceeded for ip:${req.ip}`)
         res.status(429).json({
            success:false,
            message:"Too many request"
        })
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args)
    }),
})

app.use('/api/auth/register',sensitiveEndPointLimiter);

app.use('/api/auth',userRoutes);

app.use(errorHandler);

app.listen(PORT,()=>{
    logger.info(`user service running on port ${PORT}`)
})



//unhandled promise rejection

process.on('unhandledRejection',(reason,promise)=>{
    logger.error('unhandled rejection at',promise ,"reason:",reason);
})

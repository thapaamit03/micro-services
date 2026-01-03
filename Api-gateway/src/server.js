const express=require('express');
const cors=require('cors');
const Redis=require('ioredis')
const helmet=require('helmet');
const {rateLimit}=require('express-rate-limit');
const {RedisStore}=require('rate-limit-redis');
const logger = require('./utils/logger');
const proxy=require('express-http-proxy');
const errorHandler = require('./middleware/errorHandler');
const validateToken = require('./middleware/authMiddleware');
const app=express();

const PORT=process.env.PORT;
console.log(PORT);


const redisClient=new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

//rate limiting 

const rateLimiteOptions=rateLimit({
    windowMs:1000*15*60,
    max:100,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`rate limit exceed fro ip :${req.ip}`)
        res.status(429).json({message:"too many request",success:false})
    },
    store:new RedisStore({
        sendCommand:(...args)=>redisClient.call(...args)
    })
})


app.use(rateLimiteOptions);

app.use((req,res,next)=>{
        logger.info(`Received ${req.method} request to ${req.url}`)
        logger.info(`request body ${req.body}`)
        next()
})


const proxyOptions={
    proxyReqPathResolver:(req)=>{
        return req.originalUrl.replace(/^\/v1/,"/api")  //replace v1 prefix with api
    },
    proxyErrorHandler:(err,res,next)=>{
        logger.error("proxy error",err.message);
         console.error("PROXY ERROR FULL:", err);
        res.status(500).json({message:"internal server error",success:false})
    }
}

//setting up proxy for our user service 
app.use('/v1/auth',proxy(process.env.USER_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        proxyReqOpts.headers["Content-Type"]="application/json"
        return proxyReqOpts;
    },
    
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response received from  user service ${proxyRes.statusCode}`)
        return proxyResData;
    }
}));

//setting up proxy for post service


app.use("/v1/posts", (req, res, next) => {
         logger.info(`Received ${req.method} request to ${req.url}`)
        logger.info(`request body ${req.body}`)
    next();
});

app.use('/v1/posts',validateToken,
    proxy(process.env.POST_SERVICE_URL,{
        ...proxyOptions,
    proxyReqOptDecorator:(proxyReqOpts,srcReq)=>{
        console.log(srcReq);
        
        proxyReqOpts.headers["x-user-id"]=srcReq.user.userId

        return proxyReqOpts;
    },
      proxyReqBodyDecorator: (bodyContent, srcReq) => {
        return JSON.stringify(bodyContent || {});
    },
    userResDecorator:(proxyRes,proxyResData,userReq,userRes)=>{
        logger.info(`Response from post-service: ${proxyRes.statusCode}`)

        return proxyResData;
    }
    
}))


app.use(errorHandler);


app.listen(PORT,()=>{
    logger.info(`Api gateway is running on :${PORT}`);
    logger.info(`User service  is running on : ${process.env.USER_SERVICE_URL}`)
     logger.info(`Post service  is running on : ${process.env.POST_SERVICE_URL}`)
    logger.info(`Redis url : ${process.env.REDIS_URL}`)

})
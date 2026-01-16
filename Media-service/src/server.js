const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const mongoose=require('mongoose');
const logger = require('./utils/logger');
const errorHandler=require('./middleware/errorHandler');
const mediaRoutes=require('./routes/mediaRoutes')
const {rateLimit}=require('express-rate-limit');
const { connectToRabbitMq, consumeEvent } = require('./utils/rabbitmq');
const handledPostDeleted = require('./controller/mediaEventHandler');
const app=express();
const PORT=process.env.PORT;
app.use(express.json());
app.use(cors());
app.use(helmet());

mongoose.connect(process.env.MONGOODB_URL)
.then(()=>logger.info("Database connected successfully"))
.catch((e)=>logger.error("error while connecting to db",e.message))



app.use((req,res,next)=>{

    logger.info(`Request url :${req.url} and method:${req.method}`);
    next();
})

const sensitiveEndPointLimiter=rateLimit({
    windowMs:1024*1024*15,
    max:20,
    standardHeaders:true,
    legacyHeaders:false,
    handler:(req,res)=>{
        logger.warn(`sensitive endpoint rate limit exceed for id:${req.ip}`)
        res.status(429).json({
            message:"too many request",
            success:false
        })
    }
}
)
app.use('/api/media',sensitiveEndPointLimiter,mediaRoutes);

app.use(errorHandler);

async function startServer() {
    
    try {
        await connectToRabbitMq();

        //consume all events and post.deleted is routing key
        await consumeEvent('post.deleted',handledPostDeleted)


        app.listen(PORT,()=>{
    
        logger.info(`Media service is running in port:${PORT}`)
    }
    )
    } catch (error) {
        logger.error('failed to connect to server',error)
    }
}
startServer();


process.on("unhandledRejection",(reason,promise)=>{
    logger.info( 'unhandled rejection at',promise,'reason',reason)
})  
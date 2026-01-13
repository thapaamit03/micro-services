const express=require('express');
const mongoose=require('mongoose')
const cors=require('cors');
const helmet=require('helmet');
const { consumeEvent } = require('./utils/rabbitmq');
const logger = require('./utils/logger');
const { handlePostCreated, handlePostDeleted } = require('./controller/eventHandler');

const notificationRoutes=require('./routes/notificationRoutes');
const errorHandler = require('./middleware/errorHandler');
const app=express();
const PORT=process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(express.json())

mongoose.connect(process.env.MOGOODB_URL)
.then(()=>logger.info("database connected successfully"))
.catch((e)=>logger.error("error while connecting to mongodb"))


app.use('/api/notification',notificationRoutes)
 app.use(errorHandler);
async function startServer() {

    await consumeEvent("post.created",handlePostCreated)

    await consumeEvent("post.deleted",handlePostDeleted)

    app.listen(PORT,()=>{

        logger.info(`Notification service is running in port:${PORT}`)
    })
}

startServer()
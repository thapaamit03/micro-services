const amqp=require('amqplib');
const logger = require('./logger');

let channel=null;
let connection=null;
const EXCHANGE_NAME="facebook_event"

async function connectToRabbitMq(){

    try {
        connection=await amqp.connect(process.env.RABBITMQ_URL);
        channel=await connection.createChannel()
    
        await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false})
    
        logger.info("connected to rabbitmq")
    } catch (error) {
        logger.error("error while connecting to rabbitmq",error)
    }
}

async function consumeEvent(routingKey,callback){

   try {
     if(!channel){
         await connectToRabbitMq()
     }
 
     const q=await channel.assertQueue("",{exclusive:true})
 
     await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey);
 
     channel.consume(q.queue,(msg)=>{
         if(msg!==null){
         const content=JSON.parse(msg.content.toString())
         callback(content);
         channel.ack(msg);
         }
     })
 
     logger.info(`subbscribed to event: ${routingKey}`)
   } catch (error) {
    logger.error("error while connecting to rabbitmq",error)
   }
}

module.exports={connectToRabbitMq,consumeEvent}
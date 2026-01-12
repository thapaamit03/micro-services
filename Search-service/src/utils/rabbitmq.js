const amq=require('amqplib');
const logger = require('./logger');


let channel=null;
let connection=null;

const EXCHANGE_NAME="facebook_event";

const connectToRabbitMq=async()=>{

   try {
     connection=await amq.connect(process.env.RABBITMQ_URL);
 
     channel=await connection.createChannel();
 
     await channel.assertExchange(EXCHANGE_NAME,'topic',{durable:false})
 
     logger.info("connected to rabbitmq")
 
     return channel;
   } catch (error) {
    logger.error("error while connecting to rabbitmq",error)
   }
}
const consumeEvent=async(routingKey,callback)=>{

    if(!channel){
        await connectToRabbitMq();
    }

    const q=await channel.assertQueue("",{exclusive:true})

   await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey)

   channel.consume(q.queue,(msg)=>{

    if(msg!==null){
        const content=JSON.parse(msg.content.toString());
        callback(content);
        channel.ack(msg)
    }
   })
    logger.info(`subscribed to event: ${routingKey}`)

}

module.exports={connectToRabbitMq,consumeEvent}
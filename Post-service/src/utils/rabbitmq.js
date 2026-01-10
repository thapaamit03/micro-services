const ampq=require('amqplib');
const logger=require('./logger');

let connection=null;
let channel=null;

const EXCHANGE_NAME="facebook_event";

async function connectToRabbitMq(){

   try {
     connection=await ampq.connect(process.env.RABBITMQ_URL);
     channel=await connection.createChannel();
 
     await channel.assertExchange(EXCHANGE_NAME,"topic",{durable:false});
     logger.info("Connected to rabbit mq");
     return channel;
   } catch (error) {
    logger.error("error while connecting to rabbit mq",error);
   }

}

async function publishEvent(routingKey,message){
    if(!channel){
        await connectToRabbitMq();
    }

    channel.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message))
    );
    logger.info(`event published: ${routingKey}`)
}

module.exports={connectToRabbitMq,publishEvent};
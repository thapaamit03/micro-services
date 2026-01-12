const ampq=require('amqplib');
const logger = require('./logger');


let connection=null;
let channel=null;
const  EXCHANGE_NAME="facebook_event";

async function connectToRabbitMq(){
try {
    
        connection=await ampq.connect(process.env.RABBITMQ_URL);
        channel=await connection.createChannel();
    
        await channel.assertExchange(EXCHANGE_NAME,'topic',{durable:false})
        logger.info(`connected to rabbitmq`)
    
} catch (error) {
    logger.error('errro while connecting to rabbit mq')
}
}

async function publishEvent(routingKey,message){

    if(!channel){
        await connectToRabbitMq();
    }

    channel.pubish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message))
    );
    logger.info(`event published :${routingKey}`)
}

async function consumeEvent(routingKey,callback) {
    if(!channel){
        await connectToRabbitMq();
    }
    //create anonymous queue and exclusive is used to delete queue when connection is closes
    const q=await channel.assertQueue("",{exclusive:true});

    //links queue to the exchange and only matching routing key are routed here
    await channel.bindQueue(q.queue,EXCHANGE_NAME,routingKey)

    //start listening for messages from queue
    channel.consume(q.queue,(msg)=>{
        if(msg!==null){
            //converts messages from buffer to JSON
            const content=JSON.parse(msg.content.toString());

            //passes data to provided callback
            callback(content);

            //tells rabbitmq the message is processed successflly
            channel.ack(msg)
    }
})
    logger.info(`subscribed to event:${routingKey}`)
}

module.exports={connectToRabbitMq,consumeEvent}
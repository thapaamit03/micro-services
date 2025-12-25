const Winstion=require('winston');



const logger=Winstion.createLogger({
    level:process.env.NODE_ENV === "production" ?"info" :"debug",
    format:Winstion.format.combine(
        Winstion.format.timestamp(),
        Winstion.format.splat(),    //message interpolation
        Winstion.format.errors({stack:true}),
        Winstion.format.json()  //return logger in json format
    ),
    defaultMeta:{service:"user-service"},
    transports:[
        new Winstion.transports.Console({
            format:Winstion.format.combine(
                Winstion.format.colorize(),
                Winstion.format.simple()
            )
        }),
        new Winstion.transports.File({filename:'error.log',level:'error'}),
        new Winstion.transports.File({filename:'combined.log'})
    ]
}

)

module.exports=logger;
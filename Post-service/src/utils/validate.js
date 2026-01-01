const joi=require('joi')

const validateSchema=(data)=>{
    const schema=joi.object({
        content:joi.string().min(5).max(500).required()
    })

    return schema.validate(data)
}

module.exports=validateSchema
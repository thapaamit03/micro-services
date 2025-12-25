const Joi=require('joi');


const validateRegistration=async(data)=>{           
        const schema=Joi.object({
            userName:Joi.string().min(3).max(30).required(),
            email:Joi.string().required(),
            password:Joi.string().min(5).required()
        })

        return schema.validate(data)
};


module.exports=validateRegistration;
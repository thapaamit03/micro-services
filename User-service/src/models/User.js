const mongoose=require('mongoose');
const argon2=require('argon2')
const userSchema=mongoose.Schema({
    userName:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true

    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})




userSchema.pre('save',async function (next) {
    if(this.isModified('password')){
        try {
            this.password= await argon2.hash(this.password);
        } catch (error) {
            return next(error)
        }
    }
})
userSchema.methods.comparePassword=async function (userPassword) { //arrow function dont have their own this

        try {
        return argon2.verify(this.password,userPassword); 

        } catch (error) {
            throw error
        }
    }

userSchema.index({userName:'text'})     //index based on username


const User=mongoose.model('user',userSchema);

module.exports=User;

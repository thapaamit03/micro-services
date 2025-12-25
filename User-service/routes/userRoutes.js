const { userRegistration } = require('../controller/userController');

const router=require('express').Router();


router.post('/register',userRegistration)


module.exports=router
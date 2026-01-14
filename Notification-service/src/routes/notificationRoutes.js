const getNotification = require('../controller/NotificationContoller');
const validateUser = require('../middleware/authMiddleware');

const router=require('express').Router();


router.get('/fetch',validateUser,getNotification);


module.exports=router;
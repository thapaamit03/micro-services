const { createPost } = require('../controller/postController');
const authenticateUser = require('../middleware/authMiddleware');

const router=require('express').Router();

//middleware->this will tell if the user is authenticate or not
router.use(authenticateUser);
router.post('/create-post',createPost)

module.exports=router
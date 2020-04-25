var express = require('express');
var router = express.Router();
var {check, validationResult}= require('express-validator');
var User= require('./model/user');
var passport= require('passport');
var LocalStartegy= require('passport-local').Strategy;

var Post= require('./model/post');
var Category= require('./model/category');
var Comment= require('./model/comment');



////////////////////////////////////////////////////////////

/*
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){next(); return;}
    console.log('You are not logged in');
    res.redirect('/dashboard/login');
}
*/
 

router.use(express.static(__dirname + '/public'));



router.param('post', function(req, res, next, post){
    req.params.post={
        id:3,
        title: 'My Post',
        description: 'AliT Post'
    }
    next();
})

var user_name;

router.use(function(req,res,next){
    console.log('Middleware in dashboard before get');
    next();
});



//router.use('/:post/:id/:type', function(req,res,){res.send(req.params);});

/////////////////////////////////



passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
   
  passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });

passport.use('local-login', new LocalStartegy(
    { 
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done){
        User.findOne({email: email}, function(err, user){
            if(err){return done(err);}
            if(!user){
                console.log('username wrong!');
                return done(null, false,{});
            }
            if(! User.validPassword(password, user.password)){
                console.log('password wrong!');
                return done(null, false,{});

            }
            return done(null, user);


        });
        


    }
));


//////////////////////////////////////////////


router.get('/login', function(req,res){
    res.render('login.pug',{title: 'Login'});
    console.log('get Adress:-dashboard-login');
})

router.post('/login', 
    [
        check('email').isEmail().withMessage('Your email is not Right!'),
        // password must be at least 5 chars long
        check('password')
            .isLength({ min: 5 }).withMessage('Password must be at least 5 chars long')
            .matches(/\d/).withMessage('Password must contain a number'),
    
    ], 
    
    (req, res, next) => {
        var email = req.body.email;
        var password = req.body.password;

        
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('login.pug', {
                    title:'Login Failed',
                    errors: errors.array(),
                    email: email
                    
                });
                //console.log(errors.array());
                return;
            }
            next();
            
    
        
    },
    passport.authenticate('local-login', {failureRedirect:'/dashboard/login'} ),

    (req, res) => {

        var email= req.body.email;
        var password= req.body.password;
        var edit;
        var remove;
        

        User.findOne({email:email}, function(err,user){
            if(err) throw err;
            if (!user) {
                console.log('not found');
                res.render('login.pug', {
                    title:'Login failed',
                    errors: [{msg:'User not found'}],
                    
                });
                return;
            }
            console.log('email matched');

            if(User.validPassword(password, user.password)){
                console.log('password matched');
                if (remove) {
                    console.log('removed');
                    user.remove(function(err){if(err) throw err;});
                    return;
                }
                
                if (edit) {
                    console.log('edited');
                    user.name= 'Asghar Farhadi';
                    user.password= 'Asghar';
                    user.save(function(err){if(err) throw err;});
                    return; 
                    
                }

                console.log('login success');
                user_name= user.name;
                res.redirect('/dashboard');
                return;
                

            }
            res.render('login.pug', {
                title:'Login failed',
                errors: [{msg:'Password is not match'}],
                
            });

            
        })

        
            
            //return res.json(user);
    }
)

router.get('/register', function(req,res){
    res.render('register.pug',{title: 'Register'})
})

router.post('/register', 
    [
        check('name').isLength({ min: 3 }).withMessage('Name must be at least 3 chars long'),
        // email must be an email
        check('email').isEmail().withMessage('Your email is not Right!'),
        // password must be at least 5 chars long
        check('password')
            .isLength({ min: 5 }).withMessage('Password must be at least 5 chars long')
            .matches(/\d/).withMessage('Password must contain a number'),
        check('password_confirm').custom((value, { req }) => {
            if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
            }
            
            // Indicates the success of this synchronous custom validator
            return true;
        }),
        check('email').custom(value => {
            return User.findUserByEmail(value).then(user => {
              if (user) {
                //return Promise.reject('E-mail already in use');
                throw new Error('E-mail already in use');
              }
            });
          })
    
     ], 
     (req, res) => {
        var name  = req.body.name;
        var email = req.body.email;

        
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('register.pug', {
                    title:'Register Uncomplete',
                    errors: errors.array(),
                    name:name,
                    email: email
                    
                });
                //console.log(errors.array());
                return;
            }
            var user1 = new User({
                name: req.body.name,
                email: req.body.email,
                password: User.generateHash(req.body.password),
                
            });
            
            user1.save(function(err){
                if(err) throw err;
                console.log('success Create');
                res.redirect('/dashboard/login'); 
            })
            
            user={
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                password_confirm: req.body.password_confirm} 
    
        
            
            //return res.json(user);
    });
    


router.use(
    (req,res, next)=>{
        if(req.isAuthenticated()){next(); return;}
        console.log('You are not logged in');
        res.redirect('/dashboard/login');
    }
)
////////////////////////////// Main

router.get('/profile' ,function(req,res){
    res.render('Dashboard.pug',{title: 'Profile', name: user_name});
    
});


router.get('/cpanel', function(req,res){
    res.render('dashboard.pug',{title: 'Dashboard'});
});

router.get('/', function(req,res){
    Post.find({}).select({title:1, slug:1, description:1}).exec(function(err,posts){
        if (err) throw err;
        res.render('dashboard/index.pug',{title: 'dashboard',posts:posts});
    })
    
});

router.post('/logout', function(req,res){
    req.logout();
    console.log('Logged out');
    res.redirect('/');

});

/////////////////////////////////////////      Posts

    router.get('/post/create' ,function(req,res){
        
        Category.find({}).select("name").exec(function(err, cats){
            res.render('Dashboard/form/create_post.pug',{
                title: 'Create Post',
                name: user_name,
                categorys: cats});
        })
        
        
    });

    router.post('/post/create' ,
        [
            check('title').notEmpty().withMessage('the title field is requierd!'),
            check('description').notEmpty().withMessage('the description field is requierd!'),
            check('category').notEmpty().withMessage('the category field is requierd!'),
            
        
        ], 
        (req, res) => {
            var title=req.body.title;
            var description=req.body.description;
            var category=req.body.category;
            //res.json(req.body);
 
        
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                Category.find({}).select("name").exec(function(err, cats){
                    res.render('dashboard/form/create_post.pug',{
                        title:'Post Creation Uncomplete',
                        errors: errors.array(),
                        categorys: cats});
                });
                
                
                //console.log(errors.array());
                return;
            }
            var post1 = new Post({
                 title: title,
                 slug: title,
                 description: description,
                 category_id: category
                
            });
            
            post1.save(function(err){
                if(err) throw err;
                console.log('success Create Post');
                res.redirect('/dashboard'); 
            })
            
             
    
        
            
            //return res.json(user);
    });

    router.delete('/post/:id/delete', (req,res)=>{
        Post.findByIdAndRemove(req.params.id, (err, post)=>{
            if (err) throw err;
            res.redirect('/dashboard'); 
        })
    });

    router.get('/post/:id/edit', (req,res)=>{
        Post.findById(req.params.id, (err, post)=>{
            if (err) throw err;
            Category.find({}).select("name").exec(function(err, cats){
                if (err) throw err;
                res.render('dashboard/form/edit_post.pug',{
                    title:post.title,
                    post: post,
                    categorys: cats});
            });
        })
    });


    router.put('/post/:id' ,
    [
        check('title').notEmpty().withMessage('the title field is requierd!'),
        check('description').notEmpty().withMessage('the description field is requierd!'),
        check('category').notEmpty().withMessage('the category field is requierd!'),
    ],   
     (req, res) => {
        var title=req.body.title;
        var description=req.body.description;
        var category=req.body.category;
        //res.json(req.body);
 
        
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.redirect('dashboard/post/'+req.params.id)+ '/edit';
                return;
            }

            Post.findByIdAndUpdate(req.params.id,{
                title: title,
                description: description,
                category_id: category

            },(err,post)=>{
                if(err) throw err;
                res.redirect('/dashboard')

            } )
            
    });


////////////////////////////////      Categorys

router.get('/category' ,function(req,res){
        
        Category.find({}).select("name").exec(function(err, cats){
            if (err) throw err;
            res.render('dashboard/category.pug',{
                title: 'Category Page',
                name: user_name,
                categorys: cats});
        })
        
        
    });

router.get('/category/create' ,function(req,res){
    
    res.render('dashboard/form/create_category.pug',{title: 'Create Category'});
    
});

router.post('/category/create' ,
        [
            check('name').notEmpty().withMessage('the name field is requierd!'),
            check('slug').notEmpty().withMessage('the slug field is requierd!')
        ], 
        (req, res) => {
            var name=req.body.name;
            var slug=req.body.slug;
           
 
        
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.render('dashboard/form/create_category.pug',{
                    title:'Category Creation Uncomplete',
                    errors: errors.array()
                });
                
                
                //console.log(errors.array());
                return;
            }
            var cat1 = new Category({
                 name: name,
                 slug: slug, 
                
            });
            
            cat1.save(function(err){
                if(err) throw err;
                console.log('success Create Category');
                res.redirect('/dashboard/category'); 
            })
            
             
    
        
            
            //return res.json(user);
    });
   
router.delete('/category/:id/delete', (req,res)=>{
    Category.findByIdAndRemove(req.params.id, (err, post)=>{
        if (err) throw err;
        res.redirect('/dashboard/category'); 
    })
});

router.get('/category/:id/edit', (req,res)=>{
    Category.findById(req.params.id, (err, category)=>{
        if (err) throw err;
        res.render('dashboard/form/edit_category.pug',{
            title:'Edit Category',
            category: category
            });
    });
});

router.put('/category/:id' ,
[
    check('name').notEmpty().withMessage('the name field is requierd!'),
    check('slug').notEmpty().withMessage('the slug field is requierd!')
], 
(req, res) => {
    var name=req.body.name;
    var slug=req.body.slug;
   


// Finds the validation errors in this request and wraps them in an object with handy functions
const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('dashboard/form/edit_category.pug',{
            title:'Category Edit Uncomplete',
            errors: errors.array()
        });
        
        
        //console.log(errors.array());
        return;
    }

        Category.findByIdAndUpdate(req.params.id,{
            name: name,
            slug: slug,

        },(err,category)=>{
            if(err) throw err;
            res.redirect('/dashboard/category')

        } )
        
});

////////////////////////////////      Comments
router.get('/comment' ,function(req,res){
    
    Comment.find({}).select('comment approved').exec(
        (err,comments) => {
            res.render('dashboard/comment.pug',{
                title: 'Comment Page',
                comments: comments});
        } 
    )
    
});


router.delete('/comment/:id/delete', (req,res)=>{
    Comment.findByIdAndRemove(req.params.id, (err, comment)=>{
        if (err) throw err;
        res.redirect('/dashboard/comment'); 
    })
});

router.get('/comment/:id/approved', 
    (req,res)=>{
        Comment.findByIdAndUpdate(req.params.id, {approved: true}, 
            (err)=>{
                if (err) throw err;
                res.redirect('/dashboard/comment');
            }
        );        
    }
);




module.exports= router;
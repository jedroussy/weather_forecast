var express = require('express');
var app = express();
var parser = require('body-parser');
var mongoose= require('mongoose');
var passport= require('passport');
var cookieParser= require('cookie-parser');
var session= require('express-session');
var methodOverride = require('method-override');
var {check, validationResult}= require('express-validator');

mongoose.connect('mongodb://localhost/NodeCourse', 
    {   useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true, },
    (err, res) => {if (err) throw err; console.log('Database online');}
);

// body parser
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      var method = req.body._method
      delete req.body._method
      return method
    }
  }))

app.use(cookieParser());
app.use(session({
   secret : 'roocketir',
   resave : false,
   saveUninitialized : true
}));

app.use(passport.initialize());
app.use(passport.session());

// In this example, the formParam value is going to get morphed into form body format useful for printing.

app.use(express.static(__dirname + '/public'));

// Route


var dashboard = require('./dashboard');
var Post= require('./model/post');
var Category= require('./model/category');
var Comment= require('./model/comment');
app.use('/dashboard' , dashboard);





//method-override


app.get('/' , function (req ,res) {
  Post.find({}).sort({created_at: 1}).exec(
    (err,posts)=>{
        if (err) throw err;
        res.render('index.pug', {
            title:"Website Title",
            posts: posts
        });

    }
  );
});
app.get('/article/:slug' , function (req ,res) {
    Post.find({slug: req.params.slug}, (err,post)=>{
        if (err) throw err;
        var post= post[0];
        Comment.find({post_id: post._id}).where('approved').equals(true).exec(
            (err, comments)=>{
                if(err) throw err;
                res.render('single.pug', {
                    title:post.title,
                    post: post,
                    comments:comments
                });
            }
        )
        

    });
      
    
  });

app.post('/comment',
[
    check('commenter').notEmpty().withMessage('the commenter field is requierd!'),
    check('comment').notEmpty().withMessage('the comment field is requierd!'),
    check('post_id').notEmpty().withMessage('the post field is requierd!'),
], 
(req, res) => {
    var commenter=req.body.commenter;
    var comment=req.body.comment;
    var post_id=req.body.post_id;
    //res.json(req.body);


// Finds the validation errors in this request and wraps them in an object with handy functions
const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.redirect(req.get('referer'));
        return;
    }
    var commnet1 = new Comment({
        comment : comment,
        commenter : commenter,
        post_id : post_id,
        approved: false
        
    });
    
    commnet1.save(function(err){
        if(err) throw err;
        console.log('success Create Comment');
        res.redirect(req.get('referer'));
    })

    //return res.json(user);
});

app.get('/cookie' , function (req ,res) {
    res.cookie(
        'name','12345',
        {
            expires:new Date(Date.now() + 99999999),
            httpOnly: true
        }
    );
    res.json(req.cookies);
 });

 app.get('/session' , function (req ,res) {
    req.session.name= 'Ali';
    req.session.family= 'Torabi';
    res.json(req.session);
 });

app.listen(3000, function () {
   console.log('express is running on port 3000');
});
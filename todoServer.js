const express = require('express');
const fs = require('fs');

const app = express();
const session = require('express-session');


app.set('view engine', 'ejs');
app.set('views', __dirname + '/todoViews');
app.use(session({
    secret:'eowaitb',
    resave:false,
    saveUninitialized: false

}));


app.get('/logout', function(req, res){
    req.session.destroy(function(err, session){
        if(err) res.send(err);
        else{
            console.log('session is destroying');
            res.redirect('/login');
        }
    })
})

app.get('/',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('index',{username:req.session.username});
});

//app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.post('/todo',function(req,res){
    if(!req.session.username){
        res.status(401).send('login required');
        return;
    }
    const todoContent = req.body;
    readALLTodos(todoContent,writeTodo,res);
    
//     fs.readFile('./treasure.txt',"utf-8",(err,data)=>{
//         if(err){
//             console.log(err);
//             return ;
//         }
//         if(data.length==0){
//             data = "[]";
//         }
//         try{
//             data = JSON.parse(data);
//             data.push(req.body);

//             fs.writeFile("./treasure.txt",JSON.stringify(data),(err)=>{
//                 if(err){
//                     console.log(err);
//                     return;
//                 }
//                 else{
//                     res.status(200).json("todo saved successfully");
//                 }
//             })
//         }
//         catch{
//             res.status(500).json({message:'Internal sever erro'});
//             return;
//         }
        
        
//     })
})

app.get('/about',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('about',{username:req.session.username});
})

app.get('/contact',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('contact',{username:req.session.username});
})
app.get('/todo-data',function(req,res){
    if(!req.session.username){
        res.status(401).send("login is required");
        return;
    }
    //res.sendFile(__dirname+"/todoViews/todo.html");
    fs.readFile('./treasure.txt',"utf-8",(err,data)=>{
        if(err){
            res.status(500).json(err);
            return;
        }
        res.status(200).json(data);

    })
})


app.get('/todo',function(req,res){
    if(!req.session.username){
        res.redirect('/login');
        return;
    }
    res.render('todo',{username:req.session.username});
})
app.get('/public/script.js',function(req,res){
   //res.writeHead({'content-Type': 'application/javascript'})
   res.sendFile(__dirname+'/public/script.js')
    
}) 

app.post('/remove-data',function(req,res){
    if(!req.session.username){
        res.status(401).send("login required");
        return;
    }
    fs.readFile('./treasure.txt',"utf-8",function(err,data){
        if(err){
            res.status(500).json("internal error");
            return;
        }
        if(data.length===0)
        {
            res.status(500).json("the file is empty");
            return;
        }
        const todo = req.body;
        //console.log(todo)
        data = JSON.parse(data);
        let updated_data = [];
        //let removedTodo ;
        for(let i =0;i<data.length;i++){
            if(data[i].todoContent!=todo.todoContent)
                updated_data.push(data[i]);
            
        }
        //console.log(todo.a)
        
        fs.writeFile("./treasure.txt",JSON.stringify(updated_data),(err)=>{
            if(err){
                res.status(500).json("Internal error");
                return;
            }
            res.status(200).json(JSON.stringify(updated_data));
        })
    })
})
app.post('/update-status',function(req,res){
    
    fs.readFile('./treasure.txt','utf-8',(err,data)=>{
        if(err){
            res.status(500).json("Internal server error");
            return ;
        }
        const todo = req.body;
        console.log(todo);
        data = JSON.parse(data);
        let updated_data=[];
        for(let i=0;i<data.length;i++){
            if(data[i].todoContent===todo.todoContent){
                updated_data.push({
                    todoContent:data[i].todoContent,
                    priority:data[i].priority,
                    status:"accepted"
                })
            }
            else{
                updated_data.push(data[i]);
            }
        }
        fs.writeFile('./treasure.txt',JSON.stringify(updated_data),(err)=>{
            if(err){
                res.status(500).json("Internal server error");
                return ;
            }
            res.status(200).send(JSON.stringify(updated_data));
        })

    })

})

app.get('/login', function(req, res){
    res.sendFile(__dirname+'/public/login.html');
});

app.post('/submit', function(req, res){
    const user = req.body.user;
    const password = req.body.password;
    console.log(user);
    fs.readFile('./userBase/users.js', 'utf-8', function(err,data) {
        if(err) return res.status(500).send(err);
        if(!data)  {res.status(401).send("invalid password or username");return;}
        data = JSON.parse(data);
        console.log(user);
        if(!(user in data) || data[user].password!==password){
            res.status(401).send("invalid password or username");
            return;
        }
        req.session.username=user;
        req.session.password=password;
        res.status(200).send("success");

    })


})
app.get('/signup', function(req, res){
    res.sendFile(__dirname+'/public/signup.html');
});

app.post('/register', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    
    
    fs.readFile('./userBase/users.js',"utf-8",function(err,data){
        if(err) res.status(500).send(err);
        if(!data)
          data = "{}";
          data = JSON.parse(data);
        if(username  in data){
            res.status(409).send("choose another username");
            return;
        }
        for(let user in data){
           // console.log();
            if(data[user].email===email){
                res.status(409).send("choose another email");
                return;
            }
        }
        
        data[username] ={
            username,
            password,
            email
        }

        fs.writeFile('./userBase/users.js',JSON.stringify(data),function(err){
            if(err)
            res.status(500).send("internal error");
            else
              res.status(200).send("success");
        })
    });
    
});

app.listen(3000,()=>{
    console.log('listening at the port 3000');
})

function readALLTodos (todo,callback,res) {

    fs.readFile("./treasure.txt", "utf-8", function (err, data) {
    
    
    if (err) {
    
    callback(err,data,res);
    
    return;
    
    }
    if(!todo){
        res.status(200).json(JSON.stringify(data));
        return ;
    }

    
    if (data.length==0) {data = "[]"; 
    
    }
    
    try {
    
    data = JSON.parse(data); 
    data.push(todo);
    callback(null, data,res); } catch (err) { callback(err,data,res);
    }
    })
}

function writeTodo(err,data,res){
    if(err){
        res.status(500).json({message:"Internal server error"});
        return ;
    }
    fs.writeFile('./treasure.txt',JSON.stringify(data),(err)=>{
        if(err){
            res.status(500).json({message:"Internal server error"});
            return;
        }
        res.status(200).json("success");
    })

}


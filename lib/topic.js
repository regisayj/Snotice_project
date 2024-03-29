
var db = require('./db');
var template = require('./template.js');
var url = require('url');
const qs = require('querystring');
const express = require('express');
const session = require('express-session');

var app = express();

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  cookie:{
  httpOnly: true,
  secure: false,
  maxage: 1000 * 60 * 30
  }
})); 

exports.home= function(request, response){
db.query('Select * from topic',function(error,topics){

    var title = 'Welcome';
    var description = 'Hello, Node.js';
    var list = template.list(topics);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      `<a href="/create">create</a>
      <a href="/signup">signup</a>
      <a href="/login">login</a>`
      );
    response.writeHead(200);
    response.end(html);

  });
}

exports.page = function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    //詳細ページ
    db.query('Select * from topic',function(error,topics){
        if(error){
          throw error;
        }
        db.query(`Select * FROM topic LEFT JOIN author ON topic.author_id=author.id where topic.id = ?`,[queryData.id], function(error2, topic){
          if(error2){
            throw error2;
          }
          console.log(topic);
          var title = topic[0].title
          var description = topic[0].description
          var created = topic[0].created
          var profile = topic[0].profile
          var list = template.list(topics);
          var html = template.HTML(title, list,
            `
            <h2>${title}</h2>
            ${description}
            <p>作成日：${created}</p>
            <p>by ${topic[0].name}</p>
            <p>${profile}</p>
            `,
            `<a href="/create">create</a>
            <a href="/update?id=${queryData.id}">update</a>
            <form action="delete_process" method="post">
              <input type="hidden" name="id" value="${queryData.id}">
              <input type="submit" value="delete">
            </form>`
            );
          response.writeHead(200);
          response.end(html);
        })
      });
}

exports.create = function(request, response){

    db.query('Select * from topic',function(error,topics){
        db.query('Select * from author', function(error2, authors){
        var title = 'Create';
        var list = template.list(topics);
        var html = template.HTML(title, list,
          `
          <form action="/create_process" method="post">
            <p>
            <input type="text" name="title" placeholder="title">
            </p>

            <p>
              <textarea name="description" placeholder="description"></textarea>
            </p>

            <p>
              <input type="password" name="password" placeholder="password"></textarea>
            </p>

            <p>
              ${template.authorSelect(authors)}
            </p>
            <p>
              <input type="submit">
            </p>
          </form>`,
          `<a href="/create">create</a>
           <a href="/signup">signup</a>
           <a href="/login">login</a>`
                    
          );
        response.writeHead(200);
        response.end(html);
        });
      });
}

exports.create_process = function(request, response){

    var body = '';
      request.on('data', function(data){
          body = body + data;
      });

      request.on('end', function(){
          var post = qs.parse(body);
          db.query(`INSERT INTO topic(title, description, password, created, author_id)
           VALUES(?, ?, ?, NOW(), ?)`,
           [post.title, post.description, post.password, post.author],

           function(error, result){
              if(error){
                throw error;                
              }
              
              response.writeHead(302, {Location: `/?id=${result.insertId}`});
              response.end();
           })
      });

}

exports.update = function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    db.query('Select * from topic',function(error,topics){

        if(error){
          throw error;
        }

        db.query(`Select * FROM topic where id = ?`,[queryData.id], function(error2, topic){

        if(error){
          throw error2;
        }

        db.query('Select * from author', function(error2, authors){

          var list = template.list(topics);
          var html = template.HTML(topic[0].title, list,
            `<form action="/update_process" method="post">
                <input type="hidden" name="id" value="${topic[0].id}">
                <p>
                <input type="text" name="title" placeholder="title" value="${topic[0].title}">
                </p>
                <p>
                <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                </p>
                <p>
                <input type="password" name="password" placeholder="password"></textarea>
                </p>
                <p>
                ${template.authorSelect(authors, topic[0].author_id)}
                </p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
          );
          response.writeHead(200);
          response.end(html);

        });
          
        });
      });

}

exports.update_process = function(request,response){

    var body = '';
    var _url = request.url;
    var queryData = url.parse(_url, true).query;

    request.on('data', function(data){
        body = body + data;
    });
    request.on('end', function(){
        var post = qs.parse(body);

        db.query('Select * from topic where id = ?'[post.id],function(error,topics){

          console.log(post.id);
          console.log("topics:"+topics);

        //  if(topics[0].password == post.password){

        db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?',
        [post.title, post.description, post.author, post.id], function(error, result){
          response.writeHead(302, {Location: `/?id=${post.id}`});
          response.end();
        })


      //}
    
    
    
    })
    });
  

}

exports.delete_process = function(request, response){
    var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          db.query('DELETE FROM topic WHERE id = ?',[post.id],function(error, result){
            if(error){
              throw error;
            }
            response.writeHead(302, {Location: `/`});
            response.end();
          });
      });
}

exports.signup = function(request, response){

  db.query('Select * from topic',function(error,topics){
      db.query('Select * from author', function(error2, authors){
      var title = 'Create';
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `
        <form action="/signup_process" method="post">
          <p>
             ID : <input type="text" name="id">
          </p>
          <p>
             Password : <input type="password" name="password"></textarea>
          </p>
          <p>
             Name : <input type="name" name="name"></textarea>
          </p>
          <p>
             Email : <input type="email" name="email"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>`,
        `<a href="/create">create</a>
           <a href="/signup">signup</a>
           <a href="/login">login</a>`,
        );
      response.writeHead(200);
      response.end(html);
      });
    });
}

exports.signup_process = function(request, response){

  var body = '';
    request.on('data', function(data){
        body = body + data;
    });

    request.on('end', function(){
        var post = qs.parse(body);
        db.query(`INSERT INTO user(id, password, name, email)
         VALUES(?, ?, ?, ?)`,
         [post.id, post.password, post.name, post.email],
         function(error, result){
            if(error){
              throw error;                
            }
            response.writeHead(302, {Location: `/`});
            response.end();
         })
    });

}

exports.login = function(request, response){

  db.query('Select * from topic',function(error,topics){
      db.query('Select * from author', function(error2, authors){
      var title = 'Create';
      var list = template.list(topics);
      var html = template.HTML(title, list,
        `
        
        <form action="/login_process" method="post">
          <p>
             ID : <input type="text" name="id">
          </p>
          <p>
             Password : <input type="password" name="password"></textarea>
          </p>
          <p>
            <input type="submit">
          </p>
        </form>
        `,
        `<a href="/create">create</a>
           <a href="/signup">signup</a>
           <a href="/login">login</a>`,
        );
      response.writeHead(200);
      response.end(html);
      });
    });
}

exports.login_process = function(request, response){

  var body = '';
  
    request.on('data', function(data){
        body = body + data;
    });

    request.on('end', function(){
        var post = qs.parse(body);
        db.query('Select * from topic',function(error,topics){
          db.query(`SELECT * from user where id = ? and password = ?`,
            [post.id, post.password],function(error, result){

              console.log(post.id);
              console.log(post.password);

          if(post.id == result[0].id && post.password == result[0].password){

            var title = result[0].name;
            var description = 'Welcome!';
            var list = template.list(topics);
            var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>
             <a href="/logout">logout</a>`,
            );
            response.writeHead(200);
            response.end(html);

              console.log("login success");

            }

         })
        
    });
  })
}

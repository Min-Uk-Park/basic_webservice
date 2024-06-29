const express = require('express');
const mysql = require('mysql');
const path = require('path');
const static = require('serve-static');

const dbconfig = require('./config/dbconfig.json');

// Database Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: dbconfig.host,
  user: dbconfig.user,
  password: dbconfig.password,
  database: dbconfig.database,
  debug: false,
});

const app = express();
app.use('/public', static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// login page 생성
app.post('/process/login', (req, res) => {
  console.log('/process/login 호출됨.');

  const paramId = req.body.id;
  const paramPassword = req.body.password;

  console.log('로그인 요청 : ' + paramId + ', ' + paramPassword);

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release();
      }
      console.log('데이터베이스 연결 시 에러 발생.');
      res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
      res.write('<h1>서버 연결 실패</h1>');
      res.end();
      return;
    }

    console.log('데이터베이스 연결 성공');

    const exec = conn.query(
      'select `id`, `name` from users where id = ? and password = ?',
      [paramId, paramPassword],
      (err, rows) => {
        conn.release();
        console.log('실행 대상 SQL : ' + exec.sql);
        //error의 경우
        if (err) {
          console.log('SQL 실행 시 에러 발생.');
          conn.release();
          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h1>아이디가 조회되지 않습니다.</h1>');
          res.end();
          return;
        }
        // 성공의 경우 조회가 된 경우
        if (rows.length > 0) {
          console.log(
            '[아이디 : %s, 이름 : %s]가 조회됨',
            rows[0].id,
            rows[0].name
          );
          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h1>로그인 성공</h1>');
          res.write('<div><p>사용자 아이디 : ' + rows[0].id + '</p></div>');
          res.write('<div><p>사용자 이름 : ' + rows[0].name + '</p></div>');
          res.write('<br><br><a href="/login.html">다시 로그인하기</a>');
          res.end();
        }
      }
    );
  });
});

// sign up page 생성
app.post('/process/adduser', (req, res) => {
  console.log('/process/adduser 호출됨.' + req);

  const paramId = req.body.id;
  const paramPassword = req.body.password;
  const paramName = req.body.name;
  const paramAge = req.body.age;

  pool.getConnection((err, conn) => {
    if (err) {
      if (conn) {
        conn.release();
      }
      console.log('데이터베이스 연결 시 에러 발생.');

      res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
      res.write('<h1>서버 연결 실패</h1>');
      res.end();

      return;
    }

    console.log('success to connect to database');

    const exec = conn.query(
      'insert into users (id, name, age, password) values (?, ?, ?, ?)',
      [paramId, paramName, paramAge, paramPassword],
      (err, result) => {
        conn.release();
        console.log('실행 대상 SQL : ' + exec.sql);

        if (err) {
          console.log('SQL 실행 시 에러 발생.');
          console.dir(err);
          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h1>SQL 실행 실패</h1>');
          res.end();
          return;
        }

        if (result) {
          console.log('inserted 성공');

          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h2>사용자 추가 성공</h2>');
          res.end();
        } else {
          res.writeHead('200', { 'Content-Type': 'text/html;charset=utf8' });
          res.write('<h1>사용자 추가 실패</h1>');
          res.end();
        }
      }
    );
  });
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});

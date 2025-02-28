

// npm install express sqlite3 body-parser
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const path = require('path');

const app = express();
const port = 3000;
const dbPath = path.join(__dirname, 'database.db'); 
// server.js 가 있는 현재 경로의 'database.db' 경로

// SQLite DB 연결
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error('SQLite 연결 실패:', err.message);
        return; // db 연결 실패 시, 더이상 처리 없음.
    } 
    console.log(`SQLite 연결 성공: ${dbPath}`); 
});

// 테이블 생성 (없는 경우)
db.run(`CREATE TABLE IF NOT EXISTS numbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    value INTEGER NOT NULL
)`);

// 미들웨어 설정
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// 정적 파일 제공 (.../index.html)
app.use(express.static(__dirname));

// 루트 경로에서 index.html 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 숫자 입력을 받아 DB에 저장하는 API ( POST 'insert' ) 
app.post('/insert', (req, res) => {
    const inputNumber = parseInt(req.body.number, 10);

    if (isNaN(inputNumber)) { // 숫자가 아닌 경우
        return res.status(400).send('유효한 숫자를 입력하세요.');
    }

    const query = 'INSERT INTO numbers (value) VALUES (?)';
    db.run(query, [inputNumber], function (err) {
        if (err) {
            console.error('DB 저장 오류:', err.message);
            return res.status(500).send('데이터 저장 실패');
        }
        res.send(`데이터 저장 완료! (ID: ${this.lastID})`); 
    });
});

// DB에서 가장 큰 값을 가져와 출력하는 API ( GET `max` ) 
app.get('/max', (req, res) => {
    const query = 'SELECT MAX(value) AS max_value FROM numbers';
    db.get(query, (err, row) => {
        if (err) {
            console.error('DB 조회 오류:', err.message);
            return res.status(500).send('데이터 조회 실패');
        }
        res.send(`${row.max_value}`);
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버 실행 중: http://localhost:${port}`);
});

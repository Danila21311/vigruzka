const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 4000;


if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
if (!fs.existsSync('views')) fs.mkdirSync('views');
if (!fs.existsSync('public')) fs.mkdirSync('public');


const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, 'public')))

const readTemplate = (name) => fs.readFileSync(path.join(__dirname, 'views', name), 'utf8');

app.get('/', (req, res) => {
    res.send(readTemplate('index.html'));
});

app.post('/upload', upload.single('filedata'), (req, res) => {
    res.redirect('/list');
});

app.get('/list', (req, res) => {
    fs.readdir('uploads/', (err, files) => {
        if (err) return res.status(500).send('Ошибка чтения директории');

        let fileList = '';
        files.forEach(file => {
            const fileUrl = `/uploads/${encodeURIComponent(file)}`;
            fileList += `
                <div class="file-item">
                    <strong>${file}</strong>
                    <a href="${fileUrl}" download class="download-link">Скачать</a>
                </div>`;
        });

        const template = readTemplate('list.html');
        const result = template
            .replace('{{fileCount}}', files.length)
            .replace('{{fileList}}', fileList);

        res.send(result);
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
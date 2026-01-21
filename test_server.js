import express from 'express';
const app = express();
const PORT = 5000;

app.get('/', (req, res) => res.send('Test Server Running'));

app.listen(PORT, () => {
    console.log(`TEST SERVER running on ${PORT}`);
}).on('error', (err) => {
    console.error("FAILED TO LISTEN:", err);
});

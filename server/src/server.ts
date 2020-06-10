import express from 'express';

const app = express();

app.get('/usuario', (request, response) => {
    response.json([
        'Natan',
    ])
});

app.listen(3333);

console.log("###################")
console.log("#### SERVER ON ####")
console.log("###################")
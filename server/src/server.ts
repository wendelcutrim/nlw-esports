import express from 'express';
import * as dotenv from 'dotenv';

dotenv.config()
const app = express();
const port = process.env.PORT || 3333;

const data = [{id: 1, nome: "Wendel"}]

app.get('/ads', (req, res) => {
    return res.json(data)
});


app.listen(port, () => console.log(`The server is running at port ${port}`));
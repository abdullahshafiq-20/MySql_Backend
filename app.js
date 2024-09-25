import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import route from "./routes/routes.js"

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




app.get('/', (req, res) => {
    res.send('Server is up and running!');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
app.use('/api', route);

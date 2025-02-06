import express from 'express';
import { router } from './routes/index.js';

const app = express();
const port = 9000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/auth', router);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());

app.get(
  '/currencies',
  async function (req: Request, res: Response<Record<string, number>>) {
    res.json({
      usd: 3 + Math.random(),
    });
  },
);

app.listen(3001);

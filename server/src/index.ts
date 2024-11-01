import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import os from "os";
import fs from "fs";
import path from "path";

let tempDir: string;
async function init() {
    tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'my-app-'));
}

init();

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json());

app.get("/todos", async (req: Request, res: Response) => {
  const user = req.query.user;
  const todos = await readTodos(user as string);
  res.json(todos);
});

app.post("/todos", async (req: Request, res: Response) => {
    const list = req.body;
    console.log(list);
    await writeTodos(req.query.user as string, JSON.stringify(list));
    res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

type Database = {
    [key: string]: string;
};

const database: Database = {};

async function writeTodos(user: string, data: any) {
    try {
      console.log('writing:', data);
      const userTodods = path.join(tempDir, user + '-todos.json');
      await fs.promises.writeFile(userTodods, data);
      console.log('Data written to:', userTodods);
    } catch (err) {
      console.error('Error writing to temp file:', err);
      throw err;
    }
}

async function readTodos(user: string) {
    try {
      const userTodods = path.join(tempDir, user + '-todos.json');
      if (!fs.existsSync(userTodods)) {
        return [];
      }
      const data = await fs.promises.readFile(userTodods, 'utf8');
      console.log('Data read:', data);
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading data:', err);
      throw err;
    }
}
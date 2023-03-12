import cors from "cors";
import express from "express";
import expressWs from "express-ws";

const port = 8000;
const app = express();
expressWs(app);
app.use(cors());

app.listen(port, () => {
  console.log(`We are live on`, port);
});
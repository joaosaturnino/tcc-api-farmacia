require("dotenv").config();
const express = require("express");
const cors = require("cors");

const router = require("./src/routes/routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

// tornando as pastas public acessivel para imagens
app.use("/public", express.static("public"));

const porta = process.env.PORT || 3333;
// const port = 3333; // Porta padrão para o servidor

app.listen(porta, () => {
  console.log(`Servidor iniciado na porta ${"192.168.56.1"}`);
});

app.get("/", (request, response) => {
  response.send("Hello World");
});

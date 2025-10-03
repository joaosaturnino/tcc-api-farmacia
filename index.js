require("dotenv").config();
const express = require("express");
const cors = require('cors'); 
const path = require('path');

// O ideal é que o seu arquivo de rotas principal controle todas as rotas.
// A rota get("/") foi removida daqui e deve ser colocada no seu arquivo de rotas se necessária.
const router = require("./src/routes/routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(router);

// tornando a pasta public acessível para imagens
app.use("/public", express.static("public"));

// Libera o acesso público à pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const porta = process.env.PORT || 3334;

app.listen(porta, () => {
  // CORREÇÃO: A mensagem agora exibe a variável "porta" corretamente.
  // Isso mostrará "Servidor iniciado na porta 3334" no console.
  console.log(`Servidor iniciado na porta ${porta}`);
});

// A ROTA ABAIXO FOI REMOVIDA
// Motivo 1: Estava depois do app.listen(), o que não é ideal.
// Motivo 2: Todas as rotas devem ser centralizadas no seu arquivo "router".
/*
app.get("/", (request, response) => {
  response.send("Hello World");
});
*/
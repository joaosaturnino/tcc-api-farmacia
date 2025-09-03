// routes-guilherme.js
const express = require("express");
const router = express.Router();

const AvaliacaoController = require("../controllers/avaliacao");
const LaboratorioController = require("../controllers/laboratorio");

// Routes para avaliacao
router.get("/avaliacao", AvaliacaoController.listarAvaliacao); // Listar avaliacao
router.post("/avaliacao", AvaliacaoController.cadastrarAvaliacao); // Cadastrar avaliacao
router.patch("/avaliacao/:ava_id", AvaliacaoController.editarAvaliacao); // Editar avaliacao
router.delete("/avaliacao/:ava_id", AvaliacaoController.apagarAvaliacao); // Apagar avaliacao

// Routes para laboratorio
router.get("/laboratorio", LaboratorioController.listarLaboratorio); // Listar laboratorio
router.post("/laboratorio", LaboratorioController.cadastrarLaboratorio); // Cadastrar laboratorio
router.patch("/laboratorio/:lab_id", LaboratorioController.editarLaboratorio); // Editar laboratorio
router.delete("/laboratorio/:lab_id", LaboratorioController.apagarLaboratorio); // Apagar laboratorio

module.exports = router;

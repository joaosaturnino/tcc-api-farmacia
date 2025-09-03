const express = require("express");
const router = express.Router();

// Importando os controllers

const FarmaceuticasController = require("../controllers/farmaceuticas");
const FuncionariosController = require("../controllers/funcionarios");

// Routes para farmaceuticas
router.get("/farmaceutica", FarmaceuticasController.listarFarmaceutica); // Listar farmaceuticas
router.post("/farmaceutica", FarmaceuticasController.cadastrarFarmaceutica); // Cadastrar farmaceuticas
router.patch(
  "/farmaceutica/:forma_id",
  FarmaceuticasController.editarFarmaceutica
); // Editar farmaceuticas
router.delete("/farmaceutica/:forma_id", FarmaceuticasController.apagarFarmaceutica); // Apagar farmaceuticas

// Routes para funcionarios
router.get("/funcionario", FuncionariosController.listarFuncionario); // Listar funcionarios
router.post("/funcionario", FuncionariosController.cadastrarFuncionario); // Cadastrar funcionarios
router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionario); // Editar funcionarios
router.delete("/funcionario/:func_id", FuncionariosController.apagarFuncionario); // Apagar funcionarios

module.exports = router;

const express = require("express");
const router = express.Router();

const UsuarioController = require("../controllers/usuarios");

// Routes para usuario
router.get("/usuarios", UsuarioController.listarUsuario); // Listar usuarios
router.post("/usuarios", UsuarioController.cadastrarUsuario); // Cadastrar usuarios
router.patch("/usuarios/:usu_id", UsuarioController.editarUsuario); // Editar usuarios
router.delete("/usuarios/:usu_id", UsuarioController.apagarUsuario); // Apagar usuarios

module.exports = router;

const express = require("express");
const router = express.Router();

// Importação do Helper de Upload
const uploadImage = require("../middleware/uploadHelper");

// ==================================================================
// IMPORTAÇÃO DOS CONTROLLERS
// ==================================================================
const CidadesController = require("../controllers/cidades");
const FarmaciasController = require("../controllers/farmacias");
const FavoritosController = require("../controllers/favoritos");
const UsuariosController = require("../controllers/usuarios");
const AvaliacaoController = require("../controllers/avaliacao");
const MedicamentosController = require("../controllers/medicamentos");
const MedPrecoController = require("../controllers/medpreco");
const PromocoesController = require("../controllers/promocoes");
const TiposProdutoController = require("../controllers/tipoproduto");
const FormaFarmaceuticaController = require("../controllers/farmaceuticas");
const LaboratorioController = require("../controllers/laboratorio");
const FuncionariosController = require("../controllers/funcionarios");
const ListarUnicoController = require("../controllers/listagem");
const ListarParametroController = require("../controllers/parametros");
const LoginFarmController = require("../controllers/loginFarm");
const CategoriaController = require('../controllers/categoria');

// ==================================================================
// CONFIGURAÇÃO DO UPLOAD DE ARQUIVOS
// ==================================================================
// Instâncias configuradas para pastas específicas
const uploadLogo = uploadImage('logos');
const uploadMedicamento = uploadImage('medicamentos');


// ==================================================================
// DEFINIÇÃO DAS ROTAS
// ==================================================================

// --------------------------------------------------
// ROTAS DE USUÁRIOS (Corrigidas e Priorizadas)
// --------------------------------------------------

// 1. Rotas Específicas (Login e Redefinição SEM ID na URL)
// Importante: /redefinir deve vir antes de /:usu_id para não ser confundido com um ID
router.post("/usuarios/login", UsuariosController.loginUsuario);
router.put('/usuarios/redefinir', UsuariosController.redefinirSenha); 

// 2. Rotas Gerais (Listar todos e Cadastrar)
router.get("/usuarios", UsuariosController.listarUsuario);
router.post("/usuarios", UsuariosController.cadastrarUsuario);

// 3. Rotas com ID (Devem vir por último neste grupo)
router.get('/usuarios/:usu_id', UsuariosController.listarUsuarioPorId); // Rota usada pelo App para pegar dados
router.put('/usuarios/:usu_id', UsuariosController.editarUsuario);      // Rota usada pelo App para editar perfil
router.delete("/usuarios/:usu_id", UsuariosController.apagarUsuario);


// --------------------------------------------------
// CIDADES
// --------------------------------------------------
router.get("/cidades", CidadesController.listarCidade);
router.get("/ufs", CidadesController.listarUfs);
router.post("/cidades", CidadesController.cadastrarCidade);
router.patch("/cidades/:cidade_id", CidadesController.editarCidade);
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade);
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade);
router.get("/cidade", ListarParametroController.listarCidadeParametro);
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade);

// --------------------------------------------------
// FARMÁCIAS
// --------------------------------------------------
router.get('/farmacias', FarmaciasController.listarFarmacias); 
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);
router.post("/farmacias", uploadLogo.single('farm_logo'), FarmaciasController.cadastrarFarmacias);
router.put("/farmacias/:farm_id", uploadLogo.single('farm_logo'), FarmaciasController.editarFarmacias); 
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
router.put('/farmacias/:farm_id/senha', FarmaciasController.alterarSenha);
router.post("/farmacias/verificar-email", FarmaciasController.verificarEmail);
router.post("/farmacias/redefinir-senha-por-email", FarmaciasController.redefinirSenhaPorEmail);
router.get('/farmacias/:farm_id/medicamentos', FarmaciasController.listarMedicamentosPorFarmacia);

// --------------------------------------------------
// MEDICAMENTOS
// --------------------------------------------------
router.get("/medicamentos", MedicamentosController.listarMedicamentos);
router.get('/medicamentos/todos', MedicamentosController.listarTodosMedicamentosPaginado);
router.post("/medicamentos", uploadMedicamento.single('med_imagem'), MedicamentosController.cadastrarMedicamentos);
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);
router.put("/medicamentos/:med_id", uploadMedicamento.single('med_imagem'), MedicamentosController.editarMedicamentos); 
router.delete("/medicamentos/:med_id", MedicamentosController.apagarMedicamentos);
router.get('/medicamentos/tipo/:tipo_id', CategoriaController.listarCategoria);
router.get('/medicamentos/:med_id/farmacias', MedicamentosController.listarFarmaciasPorMedicamento);
router.get('/paginado', MedicamentosController.listarTodosMedicamentosBusca);

// --------------------------------------------------
// PREÇOS E PROMOÇÕES
// --------------------------------------------------
router.get("/medpreco", MedPrecoController.listarMedPreco);
router.post("/medpreco", MedPrecoController.cadastrarMedPreco);
router.patch("/medpreco/:medpreco_id", MedPrecoController.editarMedPreco);
router.delete("/medpreco/:medpreco_id", MedPrecoController.apagarMedPreco);
router.get("/medpreco/:medpreco_id", ListarUnicoController.listarUnicoMedPreco);

router.get("/promocoes", PromocoesController.listarPromocoesPorFarmacia);
router.post("/promocoes", PromocoesController.cadastrarPromocoes);
router.patch("/promocoes/:promo_id", PromocoesController.editarPromocoes);
router.delete("/promocoes/:promo_id", PromocoesController.apagarPromocoes);
router.get("/promocoes/:promo_id", ListarUnicoController.listarUnicaPromocao);
router.get("/promocao/promocoes", ListarUnicoController.listarLimitePromocao);

// --------------------------------------------------
// CADASTROS AUXILIARES (Tipos, Formas, Laboratórios)
// --------------------------------------------------
router.get("/tipoproduto", TiposProdutoController.listarTipoProduto);
router.post("/tipoproduto", TiposProdutoController.cadastrarTipoProduto);
router.patch("/tipoproduto/:tipo_id", TiposProdutoController.editarTipoProduto);
router.delete("/tipoproduto/:tipo_id", TiposProdutoController.apagarTipoProduto);
router.get("/tipoproduto/:tipo_id", ListarUnicoController.listarUnicoTipoProduto);

router.get("/farmaceutica", FormaFarmaceuticaController.listarFarmaceutica);
router.post("/farmaceutica", FormaFarmaceuticaController.cadastrarFarmaceutica);
router.patch("/farmaceutica/:forma_id", FormaFarmaceuticaController.editarFarmaceutica);
router.delete("/farmaceutica/:forma_id", FormaFarmaceuticaController.apagarFarmaceutica);
router.get("/farmaceutica/:forma_id", ListarUnicoController.listarUnicaFormaFarmaceutica);

router.get("/laboratorios", LaboratorioController.listarLaboratorio);
router.post('/laboratorios', uploadLogo.single('lab_logo'), LaboratorioController.cadastrarLaboratorio);
router.put('/laboratorios/:lab_id', uploadLogo.single('lab_logo'), LaboratorioController.editarLaboratorio);
router.delete("/laboratorios/:lab_id", LaboratorioController.apagarLaboratorio);
router.get('/laboratorios/:lab_id', LaboratorioController.listarUmLaboratorio);
router.get("/todoslab", LaboratorioController.listarLaboratorioTodos);

// --------------------------------------------------
// FUNCIONÁRIOS
// --------------------------------------------------
router.get("/funcionario", FuncionariosController.listarFuncionarios);
router.post("/funcionario", FuncionariosController.cadastrarFuncionarios);
router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionarios);
router.delete("/funcionario/:func_id", FuncionariosController.apagarFuncionarios);
router.get("/funcionario/:func_id", FuncionariosController.listarFuncionarioPorId);

// --------------------------------------------------
// AVALIAÇÕES E FAVORITOS
// --------------------------------------------------
router.get("/avaliacao", AvaliacaoController.listarAvaliacao);
router.post("/avaliacao", AvaliacaoController.cadastrarAvaliacao);
router.patch("/avaliacao/:ava_id", AvaliacaoController.editarAvaliacao);
router.delete("/avaliacao/:ava_id", AvaliacaoController.apagarAvaliacao);
router.get("/avaliacao/:ava_id", ListarUnicoController.listarUnicaAvaliacao);

router.get("/favoritos", FavoritosController.listarFavoritos);
router.post("/favoritos", FavoritosController.cadastrarFavoritos);
router.delete("/favoritos/:fav_id", FavoritosController.apagarFavoritos);
router.get('/favoritos/:farm_id/favoritos', FavoritosController.listarFavoritosPorFarmacia);
router.get('/favoritos/usuario/:usuario_id', FavoritosController.listarFavoritosPorUsuario);

// --------------------------------------------------
// OUTROS LOGINS (Farmácia e Funcionário)
// --------------------------------------------------
router.post("/loginfarm", LoginFarmController.loginFarm);
router.post("/loginfunc", LoginFarmController.loginFunc);

module.exports = router;
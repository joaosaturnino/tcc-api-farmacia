const express = require("express");
const router = express.Router();

// CORREÇÃO: Importar o helper de upload centralizado em vez de configurar o multer aqui.
const uploadImage = require("../middleware/uploadHelper");

// Importando todos os controllers
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
const ListarInnerController = require("../controllers/innerjoin");
const LoginFarmController = require("../controllers/loginFarm");

// ==================================================================
// CONFIGURAÇÃO DO UPLOAD DE ARQUIVOS
// ==================================================================

// CORREÇÃO: As configurações duplicadas do multer foram removidas.
// Agora, criamos instâncias de middleware de upload de forma dinâmica,
// chamando a função do helper com a pasta de destino desejada.

// Middleware configurado para a pasta 'logos' (para farmácias e laboratórios)
const uploadLogo = uploadImage('logos');

// Middleware configurado para a pasta 'medicamentos'
const uploadMedicamento = uploadImage('medicamentos');


// ==================================================================
// DEFINIÇÃO DAS ROTAS
// ==================================================================

// Routes para cidades
router.get("/cidades", CidadesController.listarCidade);
router.get("/ufs", CidadesController.listarUfs);
router.post("/cidades", CidadesController.cadastrarCidade);
router.patch("/cidades/:cidade_id", CidadesController.editarCidade);
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade);
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade);
router.get("/cidade", ListarParametroController.listarCidadeParametro);
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade);

// ### ROTAS DE FARMÁCIAS CORRIGIDAS ###
router.get('/farmacias', FarmaciasController.listarFarmacias); 
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);
router.post("/farmacias", uploadLogo.single('farm_logo'), FarmaciasController.cadastrarFarmacias);
router.put("/farmacias/:farm_id", uploadLogo.single('farm_logo'), FarmaciasController.editarFarmacias); 
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
router.post("/farmacias/verificar-email", FarmaciasController.verificarEmail);
router.post("/farmacias/redefinir-senha-por-email", FarmaciasController.redefinirSenhaPorEmail);
router.get('/farmacias/:farm_id/medicamentos', FarmaciasController.listarMedicamentosPorFarmacia);

// Routes para medicamentos
router.get("/medicamentos", MedicamentosController.listarMedicamentos);
router.get('/medicamentos/todos', MedicamentosController.listarTodosMedicamentosPaginado);
router.post("/medicamentos", uploadMedicamento.single('med_imagem'), MedicamentosController.cadastrarMedicamentos);
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);
router.put("/medicamentos/:med_id", uploadMedicamento.single('med_imagem'), MedicamentosController.editarMedicamentos); 
router.delete("/medicamentos/:med_id", MedicamentosController.apagarMedicamentos);

// Routes para precos medicamentos
router.get("/medpreco", MedPrecoController.listarMedPreco);
router.post("/medpreco", MedPrecoController.cadastrarMedPreco);
router.patch("/medpreco/:medpreco_id", MedPrecoController.editarMedPreco);
router.delete("/medpreco/:medpreco_id", MedPrecoController.apagarMedPreco);
router.get("/medpreco/:medpreco_id", ListarUnicoController.listarUnicoMedPreco);

// Routes para promoções
router.get("/promocoes", PromocoesController.listarPromocoes);
router.post("/promocoes", PromocoesController.cadastrarPromocoes);
router.patch("/promocoes/:promo_id", PromocoesController.editarPromocoes);
router.delete("/promocoes/:promo_id", PromocoesController.apagarPromocoes);
router.get("/promocoes/:promo_id", ListarUnicoController.listarUnicaPromocao);
router.get("/promocao/promocoes", ListarUnicoController.listarLimitePromocao);

// Routes para tipos de produtos
router.get("/tipoproduto", TiposProdutoController.listarTipoProduto);
router.post("/tipoproduto", TiposProdutoController.cadastrarTipoProduto);
router.patch("/tipoproduto/:tipo_id", TiposProdutoController.editarTipoProduto);
router.delete("/tipoproduto/:tipo_id", TiposProdutoController.apagarTipoProduto);
router.get("/tipoproduto/:tipo_id", ListarUnicoController.listarUnicoTipoProduto);

// Routes para formas farmacêuticas
router.get("/farmaceutica", FormaFarmaceuticaController.listarFarmaceutica);
router.post("/farmaceutica", FormaFarmaceuticaController.cadastrarFarmaceutica);
router.patch("/farmaceutica/:forma_id", FormaFarmaceuticaController.editarFarmaceutica);
router.delete("/farmaceutica/:forma_id", FormaFarmaceuticaController.apagarFarmaceutica);
router.get("/farmaceutica/:forma_id", ListarUnicoController.listarUnicaFormaFarmaceutica);

// Routes para laboratórios
router.get("/laboratorios", LaboratorioController.listarLaboratorio);
router.post('/laboratorios', uploadLogo.single('lab_logo'), LaboratorioController.cadastrarLaboratorio);
router.put('/laboratorios/:lab_id', uploadLogo.single('lab_logo'), LaboratorioController.editarLaboratorio);
router.delete("/laboratorios/:lab_id", LaboratorioController.apagarLaboratorio);
router.get("/laboratorios/", LaboratorioController.listarMedicamentosLab);
router.get('/laboratorios/:lab_id', LaboratorioController.listarUmLaboratorio);

// Routes para funcionários
router.get("/funcionario", FuncionariosController.listarFuncionarios);
router.post("/funcionario", FuncionariosController.cadastrarFuncionarios);
router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionarios);
router.delete("/funcionario/:func_id", FuncionariosController.apagarFuncionarios);
router.get("/funcionario/:func_id", FuncionariosController.listarFuncionarioPorId);

// Routes para usuários
router.get("/usuarios", UsuariosController.listarUsuario);
router.post("/usuarios", UsuariosController.cadastrarUsuario);
router.put("/usuarios/:usu_id", UsuariosController.editarUsuario);
router.delete("/usuarios/:usu_id", UsuariosController.apagarUsuario);
router.get("/usuarios/:usu_id", ListarUnicoController.listarUnicoUsuario);
router.post("/usuarios/login", UsuariosController.loginUsuario);
router.get('/usuarios/:usu_id', UsuariosController.listarUsuarioPorId);

// Routes para avaliações
router.get("/avaliacao", AvaliacaoController.listarAvaliacao);
router.post("/avaliacao", AvaliacaoController.cadastrarAvaliacao);
router.patch("/avaliacao/:ava_id", AvaliacaoController.editarAvaliacao);
router.delete("/avaliacao/:ava_id", AvaliacaoController.apagarAvaliacao);
router.get("/avaliacao/:ava_id", ListarUnicoController.listarUnicaAvaliacao);

// Routes para favoritos
router.get("/favoritos", FavoritosController.listarFavoritos);
router.post("/favoritos", FavoritosController.cadastrarFavoritos);
router.delete("/favoritos/:fav_id", FavoritosController.apagarFavoritos);
//router.get("/favoritos/:fav_id", FavoritosController.listarFavoritosComLaboratorio);
router.get('/favoritos/:farm_id/favoritos', FavoritosController.listarFavoritosPorFarmacia);
router.get('/favoritos/usuario/:usuario_id', FavoritosController.listarFavoritosPorUsuario);
router.get('/favoritos/usuario/:usuario_id', FavoritosController.listarFavoritosPorUsuario);

// Rota de Login
router.post("/loginfarm", LoginFarmController.loginFarm);
router.post("/loginfunc", LoginFarmController.loginFunc);
router.get('/medicamentos/:med_id/farmacias', MedicamentosController.listarFarmaciasPorMedicamento);

module.exports = router;
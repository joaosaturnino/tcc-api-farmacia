const express = require("express");
const router = express.Router();

// Importação do Helper de Upload (Middleware para fotos)
const uploadImage = require("../middleware/uploadHelper");

// ==================================================================
// IMPORTAÇÃO DOS CONTROLLERS
// ==================================================================
// Os controllers contêm a lógica de negócio (o que acontece quando a rota é acessada)
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
// CONFIGURAÇÃO DO UPLOAD DE ARQUIVOS (MULTER)
// ==================================================================
// Define onde as imagens serão salvas.
// uploadLogo -> salva em /public/logos
// uploadMedicamento -> salva em /public/medicamentos
const uploadLogo = uploadImage('logos');
const uploadMedicamento = uploadImage('medicamentos');


// ==================================================================
// DEFINIÇÃO DAS ROTAS
// ==================================================================

// --------------------------------------------------
// 1. USUÁRIOS
// --------------------------------------------------
// OBS: Rotas estáticas (sem :id) devem vir antes das dinâmicas.

// Autenticação e Segurança
router.post("/usuarios/login", UsuariosController.loginUsuario);
router.put('/usuarios/redefinir', UsuariosController.redefinirSenha); 

// CRUD Básico
router.get("/usuarios", UsuariosController.listarUsuario); // Listar todos
router.post("/usuarios", UsuariosController.cadastrarUsuario); // Criar novo

// Operações com ID (Dinâmicas)
router.get('/usuarios/:usu_id', UsuariosController.listarUsuarioPorId); // Detalhes
router.put('/usuarios/:usu_id', UsuariosController.editarUsuario);      // Atualizar
router.delete("/usuarios/:usu_id", UsuariosController.apagarUsuario);   // Deletar


// --------------------------------------------------
// 2. CIDADES
// --------------------------------------------------
router.get("/cidades", CidadesController.listarCidade);
router.get("/ufs", CidadesController.listarUfs); // Rota específica antes de :cidade_id
router.post("/cidades", CidadesController.cadastrarCidade);

// Rotas Específicas de Busca
router.get("/cidade", ListarParametroController.listarCidadeParametro);
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade);

// Rotas com ID
router.patch("/cidades/:cidade_id", CidadesController.editarCidade); // Patch atualiza parcialmente
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade);
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade);


// --------------------------------------------------
// 3. FARMÁCIAS
// --------------------------------------------------
router.get('/farmacias', FarmaciasController.listarFarmacias); 

// Rotas de recuperação de conta (Devem vir antes de /:farm_id)
router.post("/farmacias/verificar-email", FarmaciasController.verificarEmail);
router.post("/farmacias/redefinir-senha-por-email", FarmaciasController.redefinirSenhaPorEmail);

// Cadastro com Upload de Imagem (farm_logo)
router.post("/farmacias", uploadLogo.single('farm_logo'), FarmaciasController.cadastrarFarmacias);

// Operações com ID
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);
router.put("/farmacias/:farm_id", uploadLogo.single('farm_logo'), FarmaciasController.editarFarmacias); 
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
router.put('/farmacias/:farm_id/senha', FarmaciasController.alterarSenha); // Rota aninhada

// Rota Relacional (Medicamentos DE UMA Farmácia)
router.get('/farmacias/:farm_id/medicamentos', FarmaciasController.listarMedicamentosPorFarmacia);


// --------------------------------------------------
// 4. MEDICAMENTOS
// --------------------------------------------------
// ATENÇÃO: A ordem aqui é crítica. /todos e /tipo/:id devem vir antes de /:med_id

router.get("/medicamentos", MedicamentosController.listarMedicamentos);

// Rotas Específicas de Listagem
router.get('/medicamentos/todos', MedicamentosController.listarTodosMedicamentosPaginado);
router.get('/paginado', MedicamentosController.listarTodosMedicamentosBusca); // Rota na raiz (cuidado com conflitos futuros)
router.get('/medicamentos/tipo/:tipo_id', CategoriaController.listarCategoria);

// Cadastro com Upload (med_imagem)
router.post("/medicamentos", uploadMedicamento.single('med_imagem'), MedicamentosController.cadastrarMedicamentos);

// Operações com ID
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);
router.put("/medicamentos/:med_id", uploadMedicamento.single('med_imagem'), MedicamentosController.editarMedicamentos); 
router.delete("/medicamentos/:med_id", MedicamentosController.apagarMedicamentos);

// Rota Relacional (Farmácias QUE TEM um Medicamento)
router.get('/medicamentos/:med_id/farmacias', MedicamentosController.listarFarmaciasPorMedicamento);


// --------------------------------------------------
// 5. PREÇOS E PROMOÇÕES
// --------------------------------------------------
// Tabela de Preços
router.get("/medpreco", MedPrecoController.listarMedPreco);
router.post("/medpreco", MedPrecoController.cadastrarMedPreco);
router.patch("/medpreco/:medpreco_id", MedPrecoController.editarMedPreco);
router.delete("/medpreco/:medpreco_id", MedPrecoController.apagarMedPreco);
router.get("/medpreco/:medpreco_id", ListarUnicoController.listarUnicoMedPreco);

// Promoções
router.get("/promocoes", PromocoesController.listarPromocoesPorFarmacia);
router.post("/promocoes", PromocoesController.cadastrarPromocoes);
router.get("/promocao/promocoes", ListarUnicoController.listarLimitePromocao); // Específica

router.patch("/promocoes/:promo_id", PromocoesController.editarPromocoes);
router.delete("/promocoes/:promo_id", PromocoesController.apagarPromocoes);
router.get("/promocoes/:promo_id", ListarUnicoController.listarUnicaPromocao);


// --------------------------------------------------
// 6. CADASTROS AUXILIARES
// --------------------------------------------------

// Tipos de Produto
router.get("/tipoproduto", TiposProdutoController.listarTipoProduto);
router.post("/tipoproduto", TiposProdutoController.cadastrarTipoProduto);
router.patch("/tipoproduto/:tipo_id", TiposProdutoController.editarTipoProduto);
router.delete("/tipoproduto/:tipo_id", TiposProdutoController.apagarTipoProduto);
router.get("/tipoproduto/:tipo_id", ListarUnicoController.listarUnicoTipoProduto);

// Formas Farmacêuticas
router.get("/farmaceutica", FormaFarmaceuticaController.listarFarmaceutica);
router.post("/farmaceutica", FormaFarmaceuticaController.cadastrarFarmaceutica);
router.patch("/farmaceutica/:forma_id", FormaFarmaceuticaController.editarFarmaceutica);
router.delete("/farmaceutica/:forma_id", FormaFarmaceuticaController.apagarFarmaceutica);
router.get("/farmaceutica/:forma_id", ListarUnicoController.listarUnicaFormaFarmaceutica);

// Laboratórios
router.get("/laboratorios", LaboratorioController.listarLaboratorio);
router.get("/todoslab", LaboratorioController.listarLaboratorioTodos); // Listagem alternativa
router.post('/laboratorios', uploadLogo.single('lab_logo'), LaboratorioController.cadastrarLaboratorio);
router.put('/laboratorios/:lab_id', uploadLogo.single('lab_logo'), LaboratorioController.editarLaboratorio);
router.delete("/laboratorios/:lab_id", LaboratorioController.apagarLaboratorio);
router.get('/laboratorios/:lab_id', LaboratorioController.listarUmLaboratorio);


// --------------------------------------------------
// 7. FUNCIONÁRIOS
// --------------------------------------------------
router.get("/funcionario", FuncionariosController.listarFuncionarios);
router.post("/funcionario", FuncionariosController.cadastrarFuncionarios);
router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionarios);
router.delete("/funcionario/:func_id", FuncionariosController.apagarFuncionarios);
router.get("/funcionario/:func_id", FuncionariosController.listarFuncionarioPorId);


// --------------------------------------------------
// 8. AVALIAÇÕES E FAVORITOS
// --------------------------------------------------
// Avaliações
router.get("/avaliacao", AvaliacaoController.listarAvaliacao);
router.post("/avaliacao", AvaliacaoController.cadastrarAvaliacao);
router.patch("/avaliacao/:ava_id", AvaliacaoController.editarAvaliacao);
router.delete("/avaliacao/:ava_id", AvaliacaoController.apagarAvaliacao);
router.get("/avaliacao/:ava_id", ListarUnicoController.listarUnicaAvaliacao);

// Favoritos
router.get("/favoritos", FavoritosController.listarFavoritos);
router.post("/favoritos", FavoritosController.cadastrarFavoritos);
router.delete("/favoritos/:fav_id", FavoritosController.apagarFavoritos);
// Rotas de listagem específica
router.get('/favoritos/:farm_id/favoritos', FavoritosController.listarFavoritosPorFarmacia);
router.get('/favoritos/usuario/:usuario_id', FavoritosController.listarFavoritosPorUsuario);


// --------------------------------------------------
// 9. ROTAS EXTRAS E LOGINS
// --------------------------------------------------

// Logins Administrativos
router.post("/loginfarm", LoginFarmController.loginFarm);
router.post("/loginfunc", LoginFarmController.loginFunc);
module.exports = router;
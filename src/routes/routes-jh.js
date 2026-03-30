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
const reservaController = require('../controllers/reservas');
const ComunidadeController = require("../controllers/comunidade");
const AlertasController = require("../controllers/alertas"); // <--- IMPORTADO AGORA

// ==================================================================
// CONFIGURAÇÃO DO UPLOAD (MULTER)
// ==================================================================
const uploadLogo = uploadImage('logos');
const uploadMedicamento = uploadImage('medicamentos');

// ==================================================================
// DEFINIÇÃO DAS ROTAS
// ==================================================================

/// --------------------------------------------------
// 1. USUÁRIOS
// --------------------------------------------------
router.post("/usuarios/login", UsuariosController.loginUsuario);
router.put('/usuarios/redefinir', UsuariosController.redefinirSenha); 
router.get("/usuarios", UsuariosController.listarUsuario); 
router.post("/usuarios", UsuariosController.cadastrarUsuario); 
router.get('/usuarios/:usu_id', UsuariosController.listarUsuarioPorId); 
router.put('/usuarios/:usu_id', UsuariosController.editarUsuario);      
router.delete("/usuarios/:usu_id", UsuariosController.apagarUsuario);


// --------------------------------------------------
// 2. CIDADES
// --------------------------------------------------
router.get("/cidades", CidadesController.listarCidade);
router.get("/ufs", CidadesController.listarUfs); 
router.post("/cidades", CidadesController.cadastrarCidade);
router.get("/cidade", ListarParametroController.listarCidadeParametro);
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade);
router.patch("/cidades/:cidade_id", CidadesController.editarCidade); 
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade);
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade);


/// --------------------------------------------------
// 3. FARMÁCIAS
// --------------------------------------------------
router.get('/farmacias', FarmaciasController.listarFarmacias); 
router.post("/farmacias/verificar-email", FarmaciasController.verificarEmail);
router.post("/farmacias/redefinir-senha-por-email", FarmaciasController.redefinirSenhaPorEmail);
router.post("/farmacias", uploadLogo.single('farm_logo'), FarmaciasController.cadastrarFarmacias);
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);
router.put("/farmacias/:farm_id", uploadLogo.single('farm_logo'), FarmaciasController.editarFarmacias); 
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
router.put('/farmacias/:farm_id/senha', FarmaciasController.alterarSenha); 
router.get('/farmacias/:farm_id/medicamentos', FarmaciasController.listarMedicamentosPorFarmacia);


// --------------------------------------------------
// 4. MEDICAMENTOS
// --------------------------------------------------
router.get("/medicamentos", MedicamentosController.listarMedicamentos);
router.get('/medicamentos/todos', MedicamentosController.listarTodosMedicamentosPaginado);
router.get('/paginado', MedicamentosController.listarTodosMedicamentosBusca); 
router.get('/medicamentos/tipo/:tipo_id', CategoriaController.listarCategoria);
router.post("/medicamentos", uploadMedicamento.single('med_imagem'), MedicamentosController.cadastrarMedicamentos);
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);
router.put("/medicamentos/:med_id", uploadMedicamento.single('med_imagem'), MedicamentosController.editarMedicamentos); 
router.delete("/medicamentos/:med_id", MedicamentosController.apagarMedicamentos);
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

// --------------------------------------------------
// 10. RESERVAS (Adicionando as rotas que faltavam)
// --------------------------------------------------
// Prefixo '/reservas' adicionado para bater com seu Frontend

// Criar nova reserva
router.post('/reservas', reservaController.createReserva);

// Histórico do Usuário
router.get('/reservas/usuario/:id', reservaController.getReservasByUsuario);

// Painel da Farmácia (Esta é a rota que estava dando erro 404)
router.get('/reservas/farmacia/:id', reservaController.getReservasByFarmacia);

// Rota para Atualizar Status
router.put('/reservas/:id/status', reservaController.updateStatusReserva);

router.delete('/reservas/:id', reservaController.ocultarReserva); // CORRETO: Nome novo da função // Agora aponta para a nova função // <--- ADICIONE ISSO

// --- 11. COMUNIDADE ---
// Note que adicionei ?usuario_id na listagem, mas isso é tratado no controller via query params
router.get("/comunidade", ComunidadeController.listarPosts); 
router.post("/comunidade", ComunidadeController.criarPost);
router.delete("/comunidade/:id", ComunidadeController.excluirPost); // Rota de Excluir Post
router.post("/comunidade/:id/like", ComunidadeController.toggleLike); // Agora é Toggle

// Comentários
router.get("/comunidade/:postId/comentarios", ComunidadeController.listarComentarios);
router.post("/comunidade/comentarios", ComunidadeController.criarComentario);
router.delete("/comunidade/comentarios/:id", ComunidadeController.excluirComentario); // Rota de Excluir Comentário

/// --- ROTAS DE ALERTAS E NOTIFICAÇÕES ---
router.post('/alertas', AlertasController.criarAlerta);
router.get('/notificacoes/:usuario_id', AlertasController.listarNotificacoes);
router.put('/notificacoes/:id/lida', AlertasController.marcarLida);
module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require('multer');

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
// CONFIGURAÇÃO DO MULTER (UPLOAD DE ARQUIVOS)
// ==================================================================

// 1. Configuração para LOGOS (farmácias e laboratórios) - CONFIGURAÇÃO ÚNICA E CORRIGIDA
const storageLogos = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/logos/'); // Salva logos nesta pasta
    },
    filename: (req, file, cb) => {
        // Garante que o nome do arquivo seja único e inclui a extensão original
        const extension = file.originalname.split('.').pop();
        cb(null, `${Date.now()}-${file.fieldname}.${extension}`);
    }
});
// Variável de upload unificada para Farmácias e Laboratórios
const uploadLogo = multer({ storage: storageLogos });

// 2. Configuração para IMAGENS DE MEDICAMENTOS
const storageMedicamentos = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/medicamentos/'); // Salva imagens de medicamentos nesta pasta
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        cb(null, `${Date.now()}-${file.fieldname}.${extension}`);
    }
});
const uploadMedicamento = multer({ storage: storageMedicamentos });


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
// OBS: Utilizamos 'uploadLogo' para farmácias, pois a configuração 'storageLogos' foi criada para este fim.
router.get('/farmacias', FarmaciasController.listarFarmacias); 
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);
// Rota de POST (Cadastro): usa uploadLogo.single('farm_logo')
router.post("/farmacias", uploadLogo.single('farm_logo'), FarmaciasController.cadastrarFarmacias);
// Rota de PUT (Edição): usa uploadLogo.single('farm_logo')
router.put("/farmacias/:farm_id", uploadLogo.single('farm_logo'), FarmaciasController.editarFarmacias); 
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
// Novas rotas para redefinição de senha
router.post("/farmacias/verificar-email", FarmaciasController.verificarEmail);
router.post("/farmacias/redefinir-senha-por-email", FarmaciasController.redefinirSenhaPorEmail);
// ### FIM: ROTAS DE FARMÁCIAS CORRIGIDAS ###

// Routes para medicamentos
router.get("/medicamentos", MedicamentosController.listarMedicamentos);
router.get('/medicamentos/todos', MedicamentosController.listarTodosMedicamentosPaginado);
// Rota de POST (Cadastro): usa uploadMedicamento.single('med_imagem')
router.post("/medicamentos", uploadMedicamento.single('med_imagem'), MedicamentosController.cadastrarMedicamentos);
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);
// Rota de PUT (Edição): usa uploadMedicamento.single('med_imagem')
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
// Utiliza 'uploadLogo'
router.get("/laboratorios", LaboratorioController.listarLaboratorio);
router.post('/laboratorios', uploadLogo.single('lab_logo'), LaboratorioController.cadastrarLaboratorio);
router.put('/laboratorios/:lab_id', uploadLogo.single('lab_logo'), LaboratorioController.editarLaboratorio);
router.delete("/laboratorios/:lab_id", LaboratorioController.apagarLaboratorio);
router.get("/laboratorio/:lab_id", ListarUnicoController.listarUnicoLaboratorio);

// Routes para funcionários
router.get("/funcionario", FuncionariosController.listarFuncionarios);
router.post("/funcionario", FuncionariosController.cadastrarFuncionarios);
router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionarios);
router.delete("/funcionario/:func_id", FuncionariosController.apagarFuncionarios);
router.get("/funcionario/:func_id", FuncionariosController.listarFuncionarioPorId);

// Routes para usuários
router.get("/usuarios", UsuariosController.listarUsuario);
router.post("/usuarios", UsuariosController.cadastrarUsuario);
router.patch("/usuarios/:usu_id", UsuariosController.editarUsuario);
router.delete("/usuarios/:usu_id", UsuariosController.apagarUsuario);
router.get("/usuarios/:usu_id", ListarUnicoController.listarUnicoUsuario);

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
router.get("/favoritos/:fav_id", FavoritosController.listarFavoritosComLaboratorio);
router.get('/favoritos/:farm_id/favoritos', FavoritosController.listarFavoritosPorFarmacia);

// Rota de Login
router.post("/loginfarm", LoginFarmController.loginFarm);
router.post("/loginfunc", LoginFarmController.loginFunc);

module.exports = router;
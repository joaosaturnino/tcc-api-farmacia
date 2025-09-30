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

// 1. Configuração do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // O diretório onde as imagens serão salvas (crie esta pasta no seu projeto back-end)
        cb(null, 'uploads/logos/');
    },
    filename: (req, file, cb) => {
        // Define um nome de arquivo único para evitar conflitos
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const uploadImage = require('../middleware/uploadHelper');

// middleware configurado
//const upload = uploadImage('teste');

const ListarUnicoController = require("../controllers/listagem");
const ListarParametroController = require("../controllers/parametros");
const ListarInnerController = require("../controllers/innerjoin");
const LoginFarmController = require("../controllers/loginFarm");
const ListarFuncionarioPorId = require("../controllers/funcionarios");

// Routes para cidades
router.get("/cidades", CidadesController.listarCidade);
router.get("/ufs", CidadesController.listarUfs);
router.post("/cidades", CidadesController.cadastrarCidade);
router.patch("/cidades/:cidade_id", CidadesController.editarCidade);
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade);
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade);
router.get("/cidade", ListarParametroController.listarCidadeParametro);
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade);

// Routes para farmácias
//router.get("/farmacias", FarmaciasController.listarFarmacias);
router.post("/farmacias", upload.any(), FarmaciasController.cadastrarFarmacias);
router.put("/farmacias/:farm_id", FarmaciasController.editarFarmacias);
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias);
//router.get("/farmacias/:farm_id", ListarUnicoController.listarUnicaFarmacia);
router.get('/farmacias/:farm_id', FarmaciasController.listarFarmaciaPorId);


// Routes para medicamentos
// GET /medicamentos -> Lista todos os medicamentos de uma farmácia (via query string)
router.get("/medicamentos", MedicamentosController.listarMedicamentos);

// POST /medicamentos -> Cadastra um novo medicamento
router.post("/medicamentos", MedicamentosController.cadastrarMedicamentos);

// GET /medicamentos/:med_id -> Busca um medicamento específico de uma farmácia
router.get("/medicamentos/:med_id", MedicamentosController.listarMedicamentoPorId);

// PUT /medicamentos/:med_id -> Atualiza um medicamento específico
router.put("/medicamentos/:med_id", MedicamentosController.editarMedicamentos);

// DELETE /medicamentos/:med_id -> Apaga um medicamento específico
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
router.post('/laboratorios', upload.single('lab_logo'), LaboratorioController.cadastrarLaboratorio);
//router.post("/laboratorios", LaboratorioController.cadastrarLaboratorio);
router.put('/laboratorios/:lab_id', upload.single('lab_logo'), LaboratorioController.editarLaboratorio);
//router.patch("/laboratorio/:lab_id", LaboratorioController.editarLaboratorio);
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
// router.get("/favoritos/:fav_id", ListarUnicoController.listarUnicoFavorito);
router.get("/favoritos/:fav_id", FavoritosController.listarFavoritosComLaboratorio);
router.get('/favoritos/:farm_id/favoritos', FavoritosController.listarFavoritosPorFarmacia);

router.post("/loginfarm", LoginFarmController.login);

module.exports = router;
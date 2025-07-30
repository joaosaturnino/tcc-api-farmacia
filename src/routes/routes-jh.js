const express = require("express");
const router = express.Router();

// Importando os controllers

const CidadesController = require("../controllers/cidades");

const FarmaciasController = require("../controllers/farmacias");



const MedicamentosController = require("../controllers/medicamentos");
const MedPrecoController = require("../controllers/medpreco");
const PromocoesController = require("../controllers/promocoes");
const TiposProdutoController = require("../controllers/tipoproduto");

const ListarUnicoController = require("../controllers/listagem");
const ListarParametroController = require("../controllers/parametros");
const ListarInnerController = require("../controllers/innerjoin"); // Importando o controller de listagem unicas
// Routes para cidades
router.get("/cidades", CidadesController.listarCidade); // Listar cidades
router.get("/ufs", CidadesController.listarUfs); // Listar ufs
router.post("/cidades", CidadesController.cadastrarCidade); // Cadastrar cidades
router.patch("/cidades/:cidade_id", CidadesController.editarCidade); // Editar cidades
router.delete("/cidades/:cidade_id", CidadesController.apagarCidade); // Apagar cidades
//router.get('/cidades/:cidade_id', CidadesController.listarUnicaCidade); // listar unica cidade
router.get("/cidades/:cidade_id", ListarUnicoController.listarUnicaCidade); // listar unica cidade
router.get("/cidade", ListarParametroController.listarCidadeParametro); // Listar cidades com parâmetros de pesquisa
router.get("/cidade/cidadelimit", ListarUnicoController.listarLimiteCidade); // Listar cidades com limite de pesquisa

// Routes para farmácias
router.get("/farmacias", FarmaciasController.listarFarmacias); // Listar farmácias
// router.post("/farmacias", FarmaciasController.cadastrarFarmacias); // Cadastrar farmácias
router.patch("/farmacias/:farm_id", FarmaciasController.editarFarmacias); // Editar farmácias
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias); // Apagar farmácias
//router.get('/farmacias/:farm_id', FarmaciasController.listarUnicaFarmacia); // listar unica farmacia
router.get("/farmacias/:farm_id", ListarUnicoController.listarUnicaFarmacia); // listar unica farmacia

// Routes para medicamentos
router.get("/medicamentos", MedicamentosController.listarMedicamentos); // Listar medicamentos
// Cadastrar medicamentos
router.patch(
  "/medicamentos/:med_id",
  MedicamentosController.editarMedicamentos
); // Editar medicamentos
router.delete(
  "/medicamentos/:med_id",
  MedicamentosController.apagarMedicamentos
); // Apagar medicamentos
//router.get('/medicamentos/:med_id', MedicamentosController.listarUnicoMedicamento); // listar unico medicamento
router.get(
  "/medicamentos/:med_id",
  ListarUnicoController.listarUnicoMedicamento
); // listar unico medicamento
router.get(
  "/medicamento",
  ListarParametroController.listarMedicamentosParametros
); // Listar medicamentos com parâmetros de pesquisa
router.get("/medicamento/inner", ListarInnerController.listarMedicamentoInner); // Listar medicamentos com inner join
//

// Routes para precos medicamentos
router.get("/medpreco", MedPrecoController.listarMedPreco); // Listar precos medicamentos
router.post("/medpreco", MedPrecoController.cadastrarMedPreco); // Cadastrar precos medicamentos
router.patch("/medpreco/:medpreco_id", MedPrecoController.editarMedPreco); // Editar precos medicamentos
router.delete("/medpreco/:medpreco_id", MedPrecoController.apagarMedPreco); // Apagar precos medicamentos
//router.get('/medpreco/:medpreco_id', MedPrecoController.listarUnicoMedPreco); // listar unico preco medicamento
router.get("/medpreco/:medpreco_id", ListarUnicoController.listarUnicoMedPreco); // listar unico preço medicamento

// Routes para promoções
router.get("/promocoes", PromocoesController.listarPromocoes); // Listar promoções
router.post("/promocoes", PromocoesController.cadastrarPromocoes); // Cadastrar promoções
router.patch("/promocoes/:promo_id", PromocoesController.editarPromocoes); // Editar promoções
router.delete("/promocoes/:promo_id", PromocoesController.apagarPromocoes); // Apagar promoções
//router.get('/promocoes/:promo_id', PromocoesController.listarUnicaPromocao); // listar unica promocao
router.get("/promocoes/:promo_id", ListarUnicoController.listarUnicaPromocao); // listar unica promoção
router.get("/promocao/promocoes", ListarUnicoController.listarLimitePromocao);

// Routes para tipos de produtos
router.get("/tipoproduto", TiposProdutoController.listarTipoProduto); // Listar tipos de produtos
router.post("/tipoproduto", TiposProdutoController.cadastrarTipoProduto); // Cadastrar tipos de produtos
router.patch("/tipoproduto/:tipo_id", TiposProdutoController.editarTipoProduto); // Editar tipos de produtos
router.delete(
  "/tipoproduto/:tipo_id",
  TiposProdutoController.apagarTipoProduto
); // Apagar tipos de produtos
//router.get('/tipoproduto/:tipo_id', TiposProdutoController.listarUnicoTipoProduto); // listar unico tipo produto
router.get(
  "/tipoproduto/:tipo_id",
  ListarUnicoController.listarUnicoTipoProduto
); // listar unico tipo de produto

module.exports = router;

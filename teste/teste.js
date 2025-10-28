const express = require("express");
const router = express.Router();

// Importando os controllers
// const AvaliacaoController = require("../controllers/avaliacao");
const CidadesController = require("../controllers/cidades");
// const FarmaceuticasController = require("../controllers/farmaceuticas");
const FarmaciasController = require("../controllers/farmacias");
// const FuncionariosController = require("../controllers/funcionarios");
// const LaboratorioController = require("../controllers/laboratorio");
const MedicamentosController = require("../controllers/medicamentos");
const MedPrecoController = require("../controllers/medpreco");
const PromocoesController = require("../controllers/promocoes");
const TiposProdutoController = require("../controllers/tipoproduto");
// const UsuarioController = require("../controllers/usuarios");
const ListarUnicoController = require("../controllers/listagem");
const ListarParametroController = require("../controllers/parametros");
const ListarInnerController = require("../controllers/innerjoin"); // Importando o controller de listagem unicas

// // Routes para avaliacao
// router.get("/avaliacao", AvaliacaoController.listarAvaliacao); // Listar avaliacao
// router.post("/avaliacao", AvaliacaoController.cadastrarAvaliacao); // Cadastrar avaliacao
// router.patch("/avaliacao/:ava_id", AvaliacaoController.editarAvaliacao); // Editar avaliacao
// router.delete("/avaliacao/:ava_id", AvaliacaoController.apagarAvaliacao); // Apagar avaliacao
// // router.get('/avaliacao/:ava_id', AvaliacaoController.listarUnicaAvaliacao); // Listar unica avaliacao
// router.get("/avaliacao/:ava_id", ListarUnicoController.listarUnicaAvaliacao); // listar unica avaliacao

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

// // Routes para farmaceuticas
// router.get("/farmaceutica", FarmaceuticasController.listarFarmaceutica); // Listar farmaceuticas
// router.post("/farmaceutica", FarmaceuticasController.cadastrarFarmaceutica); // Cadastrar farmaceuticas
// router.patch(
//   "/farmaceutica/:forma_id",
//   FarmaceuticasController.editarFarmaceutica
// ); // Editar farmaceuticas
// router.delete(
//   "/farmaceutica/:forma_id",
//   FarmaceuticasController.apagarFarmaceutica
// ); // Apagar farmaceuticas
// //router.get('/farmaceutica/:forma_id', FarmaceuticasController.listarUnicaForma); // listar unica forma farmaceutica
// router.get("/farmaceutica/:forma_id", ListarUnicoController.listarUnicaForma); // listar unica forma farmaceutica
// router.get("/farmaceuticas", ListarParametroController.listarFormasParametros); // Listar farmaceuticas com parâmetros de pesquisa

// Routes para farmácias
router.get("/farmacias", FarmaciasController.listarFarmacias); // Listar farmácias
router.post("/farmacias", FarmaciasController.cadastrarFarmacias); // Cadastrar farmácias
router.patch("/farmacias/:farm_id", FarmaciasController.editarFarmacias); // Editar farmácias
router.delete("/farmacias/:farm_id", FarmaciasController.apagarFarmacias); // Apagar farmácias
//router.get('/farmacias/:farm_id', FarmaciasController.listarUnicaFarmacia); // listar unica farmacia
router.get("/farmacias/:farm_id", ListarUnicoController.listarUnicaFarmacia); // listar unica farmacia

// // Routes para funcionarios
// router.get("/funcionario", FuncionariosController.listarFuncionario); // Listar funcionarios
// router.post("/funcionario", FuncionariosController.cadastrarFuncionario); // Cadastrar funcionarios
// router.patch("/funcionario/:func_id", FuncionariosController.editarFuncionario); // Editar funcionarios
// router.delete(
//   "/funcionario/:func_id",
//   FuncionariosController.apagarFuncionario
// ); // Apagar funcionarios
// //router.get('/funcionario/:func_id', FuncionariosController.listarUnicoFuncionario); // listar unico funcionario
// router.get(
//   "/funcionario/:func_id",
//   ListarUnicoController.listarUnicoFuncionario
// ); // listar unico funcionario

// // Routes para laboratorio
// router.get("/laboratorio", LaboratorioController.listarLaboratorio); // Listar laboratorio
// router.post("/laboratorio", LaboratorioController.cadastrarLaboratorio); // Cadastrar laboratorio
// router.patch("/laboratorio/:lab_id", LaboratorioController.editarLaboratorio); // Editar laboratorio
// router.delete("/laboratorio/:lab_id", LaboratorioController.apagarLaboratorio); // Apagar laboratorio
// //router.get('/laboratorio/:lab_id', LaboratorioController.listarUnicoLaboratorio); // listar unico laboratorio
// router.get(
//   "/laboratorio/:lab_id",
//   ListarUnicoController.listarUnicoLaboratorio
// ); // listar unico laboratorio

// Routes para medicamentos
router.get('/medicamentos', MedicamentosController.listarMedicamentos); // Listar medicamentos
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

// // Routes para usuario
// router.get("/usuarios", UsuarioController.listarUsuario); // Listar usuarios
// router.post("/usuarios", UsuarioController.cadastrarUsuario); // Cadastrar usuarios
// router.patch("/usuarios/:usu_id", UsuarioController.editarUsuario); // Editar usuarios
// router.delete("/usuarios/:usu_id", UsuarioController.apagarUsuario); // Apagar usuarios
// //router.get('/usuarios/:usu_id', UsuarioController.listarUnicoUsuario); // listar unico usuario
// router.get("/usuarios/:usu_id", ListarUnicoController.listarUnicoUsuario); // listar unico usuario
// router.post("/usuarios/login", UsuarioController.login); // login usuario



// async listarLaboratorio(request, response) {
//     try {
//       const sql = 'SELECT lab_id, lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo FROM laboratorios;';
//       const [rows] = await db.query(sql);

//       const dadosComUrl = rows.map(laboratorio => ({
//         ...laboratorio,
//         lab_logo_url: gerarUrl(laboratorio.lab_logo, 'logos', 'default-logo.png')
//       }));

//       return response.status(200).json({
//         sucesso: true,
//         mensagem: 'Lista de laboratórios',
//         itens: dadosComUrl.length,
//         dados: dadosComUrl
//       });
//     } catch (error) {
//       return handleServerError(response, error);
//     }
//   },
module.exports = router;

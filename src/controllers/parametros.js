const db = require('../dataBase/connection');
const { json, response } = require('express');

// Controller para gerenciar medicamentos
// Este módulo contém funções para listar, cadastrar, editar e apagar medicamentos no banco de dados
module.exports = {

  async listarMedicamentosParametros(request, response) {
    try {
      const { med_nome } = request.body;
      const medPesq = med_nome ? `%${med_nome}%` : `%%`;
      // instrução sql para listar medicamentos
      const sql = 'SELECT med_id, med_nome, med_dosagem, med_quantidade, forma_id descricao, lab_id, med_img, tipo_id FROM medicamento WHERE med_nome like ?;';

      const values = [medPesq];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      const medicamentos = await db.query(sql, values);
      const nItens = medicamentos[0].length;

      // chamada para montar a url da imagem
      //const resultado = medicamentos[0].map(geraUrl);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos',
        itens: rows.length,
        dados: rows, //medicamentos[0], // , medicamentos, //, resultado
        nItens
      });
      // retorna erro caso ocorra
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Listar Cidades
  async listarCidadeParametro(request, response) {
    try {

    // Parâmetros passados via corpo de requisição
      const { uf_sigla, nome_cidade  } = request.body;
      // Instrução SQL para listar cidades
      const cidPesq = nome_cidade ? `%${nome_cidade}%` : `%%`;
      const sql = `SELECT
                  cidade_id, nome_cidade, uf_sigla
                  FROM cidade
                  WHERE uf_sigla = ? AND nome_cidade like ?;`;
      
      
      const values = [uf_sigla, cidPesq];
      // Executa a consulta no banco de dados
      const cidades = await db.query(sql, values);
      // Verifica se há registros retornados
      const nItens = cidades[0].length;

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de cidades',
        dados: cidades[0],
        nItens
      });
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  async listarFormasParametros(request, response) {
    try {
      const { forma_nome } = request.body;
      const formaPesq = forma_nome ? `%${forma_nome}%` : `%%`;
      // instrução sql para listar medicamentos
      const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica WHERE forma_nome like ?;';

      const values = [formaPesq];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      const formas = await db.query(sql, values);
      const nItens = formas[0].length;

      // chamada para montar a url da imagem
      //const resultado = medicamentos[0].map(geraUrl);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos',
        itens: rows.length,
        dados: rows, //medicamentos[0], // , medicamentos, //, resultado
        nItens
      });
      // retorna erro caso ocorra
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  
}

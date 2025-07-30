const db = require('../dataBase/connection');
const { json, response } = require('express');

// Controller para gerenciar avaliações
// Este módulo contém funções para listar, cadastrar, editar e apagar avaliações no banco de dados
module.exports = {

  // Listar farmácias
  async listarFarmacias(request, response) {
    try {
      // instrução sql para listar farmácias
      const sql = 'SELECT farm_id, farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id FROM farmacia;';
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql)
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de farmacias',
        itens: rows.length,
        dados: rows
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

  // Cadastrar farmácias ok
  async cadastrarFarmacias(request, response) {
    try {
      // parametros passados via corpo de requisição
      const { farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id} = request.body;
      // instrução sql para inserção
      const sql = 'INSERT INTO farmacia (farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id];
      // executa a instrução de inserção no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro inserido
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmacia cadastrada com sucesso.',
        itens: rows.length,
        dados: rows
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Editar farmácias ok
  async editarFarmacias(request, response) {
    try {
      // parametros passados via corpo de requisição
      const { farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id} = request.body;
      // parametros passados via url
      const { farm_id } = request.params;
      // instrução sql para edição
      const sql = 'UPDATE farmacia SET farm_nome = ?, farm_endereco = ?, farm_telefone = ?, farm_email = ?, farm_senha = ?, cnpj = ?, farm_logo = ?, func_id = ?, cid_id = ? WHERE farm_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id, farm_id];
      // executa a instrução de edição no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro editado
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmacia editada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Apagar farmácias não funciona contem erro de chave estrangeira
  async apagarFarmacias(request, response) {
    try {
      // parametros passados via url
      const { farm_id } = request.params;
      // instrução sql para apagar farmácias
      const sql = 'DELETE FROM farmacia WHERE farm_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [farm_id];
      // executa a instrução de apagar no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro apagado
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmacia apagada com sucesso.',
        itens: rows.length,
        dados: rows
      })
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // listar uma farmacia espesifica
  async listarUnicaFarmacia(request, response) {
    try {
      // parametros passados via url
      const { farm_id } = request.params;
      // instrução sql para listar farnacias
      const sql = 'SELECT farm_id, farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id FROM farmacia WHERE farm_id = ?;';
      // definição de array com parametros que receberão os valores do front-end
      const values = [farm_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // verifica se ha registros retornados
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmacia encontrada',
        itens: rows.length,
        dados: rows
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
  
};


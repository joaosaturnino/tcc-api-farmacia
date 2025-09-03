const db = require('../dataBase/connection');
const { json, response } = require('express');

// Controller para gerenciar avaliações
// Este módulo contém funções para listar, cadastrar, editar e apagar avaliações no banco de dados
module.exports = {

  // Listar funcionarios
  async listarFuncionario(request, response) {
    try {
      // instrução sql para listar funcionarios
      const sql = 'SELECT func_id, farm_id FROM funcionarios;';
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de funcionarios',
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

  // Cadastrar funcionarios ok
  async cadastrarFuncionario(request, response) {
    try {
      // parametros passados via corpo de requisição
      const {cargo, farm_id} = request.body;
      // instrução sql para inserção
      const sql = 'INSERT INTO funcionarios (cargo, farm_id) VALUES (?, ?);';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [cargo, farm_id];
      // executa a instrução de inserção no banco de dados
      const [rows] = await db.query(sql, values)
      // exibe o id do registro inserido
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionario cadastrado com sucesso.',
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

  // Editar funcionarios ok
  async editarFuncionario(request, response) {
    try {
      // parametros passados via corpo de requisição
      const {cargo, farm_id} = request.body;
      // parametros passados via url
      const {func_id} = request.params;
      // instrução sql para edição
      const sql = 'UPDATE funcionarios SET cargo = ?, farm_id = ? WHERE func_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [cargo, farm_id, func_id];
      // executa a instrução de edição no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro editado
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionario editado com sucesso.',
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

  // Apagar funcionarios ok
  async apagarFuncionario(request, response) {
    try {
      // parametros passados via url
      const {func_id} = request.params;
      // instrução sql para apagar
      const sql = 'DELETE FROM funcionarios WHERE func_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [func_id];
      // executa a instrução de apagar no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro apagado
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionario apagado com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      // retorna erro caso ocorra
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // // listar funcionario especifico
  // async listarUnicoFuncionario(request, response) {
  //   try {
  //     // parametros passados via url
  //     const {func_id} = request.params;
  //     // instrução sql para listar funcionario especifico
  //     const sql = 'SELECT func_id, cargo, usu_id FROM funcionarios WHERE func_id = ?;';
  //     // definição de array com paramentros que receberão os valores do front-end
  //     const values = [func_id];
  //     // executa a instrução de listagem no banco de dados
  //     const [rows] = await db.query(sql, values);
  //     // exibe o resultado da consulta
  //     return response.status(200).json({
  //       sucesso: true,
  //       mensagem: 'Funcionario encontrado.',
  //       itens: rows.length,
  //       dados: rows
  //     });
  //     // retorna erro caso ocorra
  //   } catch (error) {
  //     return response.status(500).json({
  //       sucesso: false,
  //       mensagem: 'Erro na requisição.',
  //       dados: error.mensage
  //     });
  //   }
  // }
}

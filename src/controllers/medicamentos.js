const db = require("../dataBase/connection");
const { json, response } = require("express");


// Controller para gerenciar medicamentos
// Este módulo contém funções para listar, cadastrar, editar e apagar medicamentos no banco de dados
module.exports = {
  //Listar todos os medicamentos
  async listarMedicamentos(request, response) {
    try {
      // Instrução SQL básica para listar todos os medicamentos
      const sql = `
        SELECT 
          med_id, med_nome, med_dosagem, med_quantidade, 
          forma_id, descricao, lab_id, med_img, tipo_id 
        FROM medicamento;
      `;

      // Executa a consulta no banco de dados
      const [medicamentos] = await db.query(sql);

      // Retorna os medicamentos encontrados
      return response.status(200).json({
        sucesso: true,
        mensagem: "Lista de medicamentos",
        dados: medicamentos,
        nItens: medicamentos.length,
      });
    } catch (error) {
      // Retorna erro caso ocorra
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.message,
      });
    }
  },

  // Cadastrar medicamentos
  async cadastrarMedicamentos(request, response) {
    try {
      // parametros passados via corpo de requisição
      const {
        med_nome,
        med_dosagem,
        med_quantidade,
        forma_id,
        descricao,
        lab_id,
        tipo_id,
      } = request.body;
      // instrução sql para inserção
      const sql =
        "INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, forma_id, descricao, lab_id, tipo_id) VALUES (?, ?, ?, ?, ?, ?, ?);";
      // definição de array com paramentros que receberão os valores do front-end
      const values = [
        med_nome,
        med_dosagem,
        med_quantidade,
        forma_id,
        descricao,
        lab_id,
        tipo_id,
      ];
      // executa a instrução de inserção no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o id do registro inserido
      return response.status(201).json({
        sucesso: true,
        mensagem: "Medicamento cadastrado com sucesso.",
        itens: rows.length,
        dados: rows,
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.mensage,
      });
    }
  },

  // Editar medicamentos
  async editarMedicamentos(request, response) {
    try {
      // parametros passados via corpo de requisição
      const {
        med_nome,
        med_dosagem,
        med_quantidade,
        forma_id,
        descricao,
        lab_id,
        med_img,
        tipo_id,
      } = request.body;
      // parametros passados via url
      const { med_id } = request.params;
      // instrução sql para edição
      const sql =
        "UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, forma_id = ?, descricao = ?, lab_id = ?, med_img = ?, tipo_id = ? WHERE med_id = ?;";
      // definição de array com paramentros que receberão os valores do front-end
      const values = [
        med_nome,
        med_dosagem,
        med_quantidade,
        forma_id,
        descricao,
        lab_id,
        med_img,
        tipo_id,
        med_id,
      ];
      // executa a instrução de edição no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: "Medicamento editado com sucesso.",
        itens: rows.length,
        dados: rows,
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.mensage,
      });
    }
  },

  // Apagar medicamentos
  async apagarMedicamentos(request, response) {
    try {
      // parametros passados via url
      const { med_id } = request.params;
      // instrução sql para apagar medicamento
      const sql = "DELETE FROM medicamento WHERE med_id = ?;";
      // definição de array com paramentros que receberão os valores do front-end
      const values = [med_id];
      // executa a instrução de apagar no banco de dados
      const [rows] = await db.query(sql, values);

      if (rows.affectedRows === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: "Medicamento ${med_id} não encontrado.",
          dados: null,
        });
      }

      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: "Medicamento apagado com sucesso.",
        itens: rows.length,
        dados: rows,
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: "Erro na requisição.",
        dados: error.mensage,
      });
    }
  },
};

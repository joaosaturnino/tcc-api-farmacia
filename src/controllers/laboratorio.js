const db = require('../dataBase/connection');

module.exports = {
  async listarLaboratorio(request, response) {
    try {
      const sql = 'SELECT lab_id, lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo FROM laboratorios;';
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de laboratórios',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async cadastrarLaboratorio(request, response) {
    try {
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo } = request.body;
      const sql = 'INSERT INTO laboratorios (lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
      const values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório cadastrado com sucesso.',
        dados: { lab_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarLaboratorio(request, response) {
    try {
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo } = request.body;
      const { lab_id } = request.params;
      const sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_logo = ?, lab_ativo = ? WHERE lab_id = ?;';
      const values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo, lab_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório editado com sucesso.',
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async apagarLaboratorio(request, response) {
    try {
      const { lab_id } = request.params;
      const sql = 'DELETE FROM laboratorios WHERE lab_id = ?;';
      const values = [lab_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório apagado com sucesso.',
        dados: rows
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};
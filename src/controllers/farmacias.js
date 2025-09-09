const db = require('../dataBase/connection');

module.exports = {
  async listarFarmacias(request, response) {
    try {
      const sql = `SELECT farm_id, farm_nome, farm_endereco, farm_telefone, 
                  farm_email, cnpj, farm_logo, cid_id FROM farmacia;`;
      const [rows] = await db.query(sql);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de farmácias',
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

  async cadastrarFarmacias(request, response) {
    try {
      const { farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, cid_id } = request.body;
      const sql = `INSERT INTO farmacia (farm_nome, farm_endereco, farm_telefone, 
                  farm_email, farm_senha, cnpj, farm_logo, cid_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, cid_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia cadastrada com sucesso.',
        dados: { farm_id: rows.insertId }
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async editarFarmacias(request, response) {
    try {
      const { farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, cid_id } = request.body;
      const { farm_id } = request.params;
      const sql = `UPDATE farmacia SET farm_nome = ?, farm_endereco = ?, farm_telefone = ?, 
                  farm_email = ?, farm_senha = ?, cnpj = ?, farm_logo = ?, cid_id = ? 
                  WHERE farm_id = ?;`;
      const values = [farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, cid_id, farm_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia editada com sucesso.',
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

  async apagarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = 'DELETE FROM farmacia WHERE farm_id = ?;';
      const values = [farm_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia apagada com sucesso.',
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
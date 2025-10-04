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

  async listarMedicamentosLab(request, response) {
    try {
      const { lab_id } = request.query;
      if (!lab_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro lab_id é obrigatório.' });
      }
      const sql = `SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_cod_barras, m.forma_id, m.med_descricao, l.lab_nome, m.med_imagem, m.tipo_id, m.med_data_cadastro, m.med_data_atualizacao, m.med_ativo, mp.medp_preco, mp.farmacia_id FROM medicamento m INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id INNER JOIN laboratorios l ON m.lab_id = l.lab_id WHERE l.lab_id = ?;`;
      const values = [farmacia_id];
      const [rows] = await db.query(sql, values);
      return response.status(200).json({ sucesso: true, mensagem: 'Lista de medicamentos recuperada com sucesso.', itens: rows.length, dados: rows });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // CORRIGIDO
  async cadastrarLaboratorio(request, response) {
    try {
      // Os campos de texto agora são preenchidos pelo multer no request.body
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo } = request.body;

      // O nome do arquivo (se enviado) vem do request.file, injetado pelo multer
      const lab_logo = request.file ? request.file.filename : null;

      const lab_data_cadastro = new Date();
      const lab_data_atualizacao = new Date();

      const sql = 'INSERT INTO laboratorios (lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
      const values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo];
      
      const [rows] = await db.query(sql, values);
      
      // Alterado para status 201 (Created), que é mais apropriado para criação
      return response.status(201).json({
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

  // CORRIGIDO
  async editarLaboratorio(request, response) {
    try {
      // Coleta os campos do formulário e o ID da rota
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo } = request.body;
      const { lab_id } = request.params;
      const lab_data_atualizacao = new Date();

      // Verifica se um novo arquivo foi enviado
      const lab_logo = request.file ? request.file.filename : null;

      // Monta a query dinamicamente para atualizar o logo apenas se um novo foi enviado
      let sql;
      let values;

      if (lab_logo) {
        // Se há um novo logo, atualiza a coluna lab_logo
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_logo = ?, lab_ativo = ?, lab_data_atualizacao = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo, lab_data_atualizacao, lab_id];
      } else {
        // Se não há novo logo, não altera a coluna lab_logo
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_ativo = ?, lab_data_atualizacao = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo, lab_data_atualizacao, lab_id];
      }

      const [rows] = await db.query(sql, values);

      return response.status(200).json({
        sucesso: true,
        mensagem: `Laboratório com ID ${lab_id} editado com sucesso.`,
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
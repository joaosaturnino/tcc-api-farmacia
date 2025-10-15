const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl'); 

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Erro na requisição.',
    dados: error.message
  });
};

module.exports = {
  async listarLaboratorio(request, response) {
    try {
      const sql = 'SELECT lab_id, lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_data_cadastro, lab_data_atualizacao, lab_ativo FROM laboratorios;';
      const [rows] = await db.query(sql);

      const dadosComUrl = rows.map(laboratorio => ({
        ...laboratorio,
        lab_logo_url: gerarUrl(laboratorio.lab_logo, 'logos', 'default-logo.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de laboratórios',
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async listarUmLaboratorio(request, response) {
    try {
      const { lab_id } = request.params;
      const sql = 'SELECT * FROM laboratorios WHERE lab_id = ?;';
      const values = [lab_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Laboratório não encontrado.',
        });
      }

      const laboratorio = rows[0];
      const dadosComUrl = {
        ...laboratorio,
        lab_logo_url: gerarUrl(laboratorio.lab_logo, 'logos', 'default-logo.png')
      };

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Dados do laboratório.',
        dados: dadosComUrl
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async listarMedicamentosLab(request, response) {
    try {
      const { lab_id } = request.query;
      if (!lab_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro lab_id é obrigatório.' });
      }
      // CORREÇÃO: Trocado 'm.med_imagem' por 'mp.medp_imagem' para buscar a imagem da tabela correta ('medpreco').
      const sql = `
        SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_cod_barras, 
               m.forma_id, m.med_descricao, l.lab_nome, mp.medp_imagem, m.tipo_id, 
               m.med_data_cadastro, m.med_data_atualizacao, m.med_ativo, mp.medp_preco, 
               mp.farmacia_id 
        FROM medicamento m 
        INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id 
        INNER JOIN laboratorios l ON m.lab_id = l.lab_id 
        WHERE l.lab_id = ?;
      `;
      const values = [lab_id]; 
      const [rows] = await db.query(sql, values);

      const dadosComUrl = rows.map(medicamento => ({
        ...medicamento,
        // CORREÇÃO: Usando a coluna correta 'medp_imagem' para gerar a URL.
        med_imagem_url: gerarUrl(medicamento.medp_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({ sucesso: true, mensagem: 'Lista de medicamentos recuperada com sucesso.', itens: dadosComUrl.length, dados: dadosComUrl });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async cadastrarLaboratorio(request, response) {
    try {
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo } = request.body;
      const lab_logo = request.file ? request.file.filename : null;
      
      const sql = 'INSERT INTO laboratorios (lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo) VALUES (?, ?, ?, ?, ?, ?, ?);';
      const values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo];
      const [rows] = await db.query(sql, values);
      return response.status(201).json({
        sucesso: true,
        mensagem: 'Laboratório cadastrado com sucesso.',
        dados: { lab_id: rows.insertId }
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async editarLaboratorio(request, response) {
    try {
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo } = request.body;
      const { lab_id } = request.params;
      const lab_logo = request.file ? request.file.filename : null;

      let sql;
      let values;
      if (lab_logo) {
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_logo = ?, lab_ativo = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo, lab_id];
      } else {
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_ativo = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo, lab_id];
      }
      const [rows] = await db.query(sql, values);
      return response.status(200).json({
        sucesso: true,
        mensagem: `Laboratório com ID ${lab_id} editado com sucesso.`,
        dados: rows
      });
    } catch (error) {
      return handleServerError(response, error);
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
      return handleServerError(response, error);
    }
  }
};
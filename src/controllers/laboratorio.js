const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl'); 

// Helper para erros
const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Erro na requisição.',
    dados: error.message
  });
};

module.exports = {
  // ==================================================================
  // LISTAR LABORATÓRIOS (Com opção de limite aleatório)
  // ==================================================================
  async listarLaboratorio(request, response) {
    try {
      const { qtde } = request.query;

      // Se tiver quantidade, busca aleatoriamente (para destaques na home)
      if (qtde) { 
        const sqlQtde = `SELECT lab_id, lab_nome, lab_cnpj, lab_endereco, lab_telefone, 
                        lab_email, lab_logo FROM laboratorios ORDER BY RAND() LIMIT ?;`;
        
        const [rowsQtde] = await db.query(sqlQtde, [parseInt(qtde)]);
        
        const laboratoriosComQtde = rowsQtde.map(laboratorio => ({
          ...laboratorio,
          lab_logo_url: gerarUrl(laboratorio.lab_logo, 'logos', 'default-logo.png')
        }));

        return response.status(200).json({
          sucesso: true,
          mensagem: `Lista de laboratórios (limitada a ${qtde})`,
          itens: rowsQtde.length,
          dados: laboratoriosComQtde
        });
      }
      
      // Se NÃO tiver quantidade, busca todos
      const sql = 'SELECT lab_id, lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo FROM laboratorios;';
      const [rows] = await db.query(sql); // CORREÇÃO: 'rows' agora é definido aqui

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

  // ==================================================================
  // LISTAR TODOS (Rota explícita, se necessária)
  // ==================================================================
  async listarLaboratorioTodos(request, response) {
    try {
      const sql = 'SELECT * FROM laboratorios;';
      const [rows] = await db.query(sql);

      const dadosComUrl = rows.map(laboratorio => ({
        ...laboratorio,
        lab_logo_url: gerarUrl(laboratorio.lab_logo, 'logos', 'default-logo.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de todos os laboratórios',
        itens: dadosComUrl.length,
        dados: dadosComUrl
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // DETALHES DE UM LABORATÓRIO
  // ==================================================================
  async listarUmLaboratorio(request, response) {
    try {
      const { lab_id } = request.params;
      const sql = 'SELECT * FROM laboratorios WHERE lab_id = ?;';
      const [rows] = await db.query(sql, [lab_id]);

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

  // ==================================================================
  // LISTAR MEDICAMENTOS DE UM LABORATÓRIO
  // ==================================================================
  async listarMedicamentosLab(request, response) {
    try {
      const { lab_id } = request.query;
      if (!lab_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro lab_id é obrigatório.' });
      }
      
      // CORREÇÃO: Usando med.med_imagem (imagem do produto) para consistência
      const sql = `
        SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_cod_barras, 
               m.forma_id, m.med_descricao, l.lab_nome, 
               m.med_imagem, -- Imagem do medicamento
               m.tipo_id, m.med_ativo, 
               mp.medp_preco, mp.farmacia_id 
        FROM medicamento m 
        -- INNER JOIN com medpreco para trazer apenas remédios que estão sendo vendidos
        INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id 
        INNER JOIN laboratorios l ON m.lab_id = l.lab_id 
        WHERE l.lab_id = ?;
      `;
      
      const [rows] = await db.query(sql, [lab_id]);

      const dadosComUrl = rows.map(medicamento => ({
        ...medicamento,
        // Gera URL completa
        med_imagem_url: gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({ 
          sucesso: true, 
          mensagem: 'Lista de medicamentos do laboratório.', 
          itens: dadosComUrl.length, 
          dados: dadosComUrl 
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // CADASTRAR LABORATÓRIO
  // ==================================================================
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

  // ==================================================================
  // EDITAR LABORATÓRIO
  // ==================================================================
  async editarLaboratorio(request, response) {
    try {
      const { lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo } = request.body;
      const { lab_id } = request.params;
      
      // Lógica para manter a logo antiga se não enviar nova
      let lab_logo = null;
      if (request.file) {
          lab_logo = request.file.filename;
      }

      let sql;
      let values;

      if (lab_logo) {
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_logo = ?, lab_ativo = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_logo, lab_ativo, lab_id];
      } else {
        sql = 'UPDATE laboratorios SET lab_nome = ?, lab_cnpj = ?, lab_endereco = ?, lab_telefone = ?, lab_email = ?, lab_ativo = ? WHERE lab_id = ?;';
        values = [lab_nome, lab_cnpj, lab_endereco, lab_telefone, lab_email, lab_ativo, lab_id];
      }
      
      const [result] = await db.query(sql, values);
      
      if (result.affectedRows === 0) {
          return response.status(404).json({ sucesso: false, mensagem: "Laboratório não encontrado." });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório editado com sucesso.'
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // ==================================================================
  // APAGAR LABORATÓRIO
  // ==================================================================
  async apagarLaboratorio(request, response) {
    try {
      const { lab_id } = request.params;
      const sql = 'DELETE FROM laboratorios WHERE lab_id = ?;';
      
      const [result] = await db.query(sql, [lab_id]);
      
      if (result.affectedRows === 0) {
          return response.status(404).json({ sucesso: false, mensagem: "Laboratório não encontrado." });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório apagado com sucesso.'
      });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return response.status(400).json({ sucesso: false, mensagem: "Não é possível apagar este laboratório pois ele possui medicamentos vinculados." });
      }
      return handleServerError(response, error);
    }
  }
};
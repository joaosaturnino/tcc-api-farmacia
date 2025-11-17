// medicamentos.js

const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
  });
};

module.exports = {
  // Rota do ADMIN (sem alteração)
  async listarMedicamentos(request, response) {
    // ... (seu código de listarMedicamentos está correto)
    try {
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }
      
      const sql = `
        SELECT 
          m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, 
          m.med_cod_barras, m.med_descricao, l.lab_nome, 
          m.med_imagem, 
          m.med_data_cadastro, 
          m.med_data_atualizacao, m.med_ativo, mp.medp_preco, mp.farmacia_id,
          tp.nome_tipo as tipo_nome,
          f.forma_nome as forma_nome,
          m.tipo_id,
          m.forma_id,
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim
        FROM medicamento m 
        INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id 
        INNER JOIN laboratorios l ON m.lab_id = l.lab_id
        LEFT JOIN tipo_produto tp ON m.tipo_id = tp.tipo_id
        LEFT JOIN forma_farmaceutica f ON m.forma_id = f.forma_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
        WHERE mp.farmacia_id = ?;
      `;
      const values = [farmacia_id];
      const [rows] = await db.query(sql, values);
      const dados = rows.map(medicamento => ({
        ...medicamento,
        med_imagem: gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));
      return response.status(200).json({ sucesso: true, mensagem: 'Lista de medicamentos recuperada com sucesso.', itens: dados.length, dados: dados });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // Rota PÚBLICA (Home, Laboratorio, "Todas")
  async listarTodosMedicamentosPaginado(request, response) {
    try {
      const { page = 1, limit = 12, search = '', lab = '', sort = '' } = request.query;
      const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
      
      let queryParams = [];
      const whereClauses = ['m.med_ativo = true'];
      if (search) {
        whereClauses.push(`(m.med_nome LIKE ? OR l.lab_nome LIKE ? OR f.farm_nome LIKE ?)`);
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      if (lab) {
        whereClauses.push(`m.lab_id = ?`);
        queryParams.push(parseInt(lab, 10));
      }
      const whereStatement = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      const countSql = `
        SELECT COUNT(*) as total 
        FROM medpreco mp
        INNER JOIN medicamento m ON mp.medicamento_id = m.med_id
        INNER JOIN farmacia f ON mp.farmacia_id = f.farm_id
        LEFT JOIN laboratorios l ON m.lab_id = l.lab_id
        ${whereStatement};
      `;
      const [[{ total: totalItens }]] = await db.query(countSql, queryParams);
      const totalPaginas = Math.ceil(totalItens / limit);

      let orderByStatement = 'ORDER BY m.med_nome ASC';
      if (sort === 'preco_asc') {
        orderByStatement = 'ORDER BY mp.medp_preco ASC';
      } else if (sort === 'preco_desc') {
        orderByStatement = 'ORDER BY mp.medp_preco DESC';
      }

      // --- CORREÇÃO AQUI ---
      const dataSql = `
        SELECT 
          m.med_id, m.med_nome, m.med_dosagem, 
          m.med_imagem, 
          m.med_descricao,
          m.med_quantidade,
          l.lab_nome,
          f.farm_nome,
          f.farm_id,
          mp.medp_preco,
          mp.medp_id,
          tp.nome_tipo as tipo_nome,
          ff.forma_nome as forma_nome,
          
          -- Adicionados os campos de data da promoção
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim

        FROM medpreco mp
        INNER JOIN medicamento m ON mp.medicamento_id = m.med_id
        INNER JOIN farmacia f ON mp.farmacia_id = f.farm_id
        LEFT JOIN laboratorios l ON m.lab_id = l.lab_id
        LEFT JOIN tipo_produto tp ON m.tipo_id = tp.tipo_id
        LEFT JOIN forma_farmaceutica ff ON m.forma_id = ff.forma_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
        ${whereStatement}
        ${orderByStatement}
        LIMIT ?
        OFFSET ?;
      `;
      // --------------------
      
      const finalQueryParams = [...queryParams, parseInt(limit, 10), offset];
      const [rows] = await db.query(dataSql, finalQueryParams);

      const dados = rows.map(medicamento => ({
        ...medicamento,
        medp_preco: parseFloat(medicamento.medp_preco || 0),
        promo_desconto: parseFloat(medicamento.promo_desconto || 0), 
        med_imagem: gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ofertas recuperadas com sucesso.`,
        dados: dados,
        paginacao: {
          paginaAtual: parseInt(page, 10),
          totalItens: totalItens,
          totalPaginas: totalPaginas,
        },
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // Rota ADMIN (sem alteração)
  async listarMedicamentoPorId(request, response) {
    // ... (seu código está correto)
    try {
      const { med_id } = request.params;
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }
      
      const sql = `
        SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_cod_barras, 
               m.forma_id, m.lab_id, m.tipo_id, m.med_descricao, m.med_ativo,
               m.med_imagem, 
               mp.medp_preco, mp.farmacia_id,
               p.promo_desconto,
               p.promo_inicio,
               p.promo_fim
        FROM medicamento m
        INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
        WHERE m.med_id = ? AND mp.farmacia_id = ?;
      `;
      const values = [med_id, farmacia_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'Medicamento não encontrado ou não pertence a esta farmácia.' });
      }
      
      const medicamento = rows[0];
      medicamento.med_imagem = gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png');

      return response.status(200).json({ sucesso: true, mensagem: 'Dados do medicamento recuperados com sucesso.', dados: medicamento });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  // Rota PÚBLICA (Tela Produto - Lista de Farmácias) (sem alteração)
  async listarFarmaciasPorMedicamento(request, response) {
    // ... (seu código está correto)
    try {
      const { med_id } = request.params;
      
      const sql = `
        SELECT
          f.farm_id, f.farm_nome, f.farm_endereco,
          mp.medp_preco as preco,
          m.med_imagem as imagem,
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim
        FROM medpreco mp
        INNER JOIN farmacia f ON mp.farmacia_id = f.farm_id
        INNER JOIN medicamento m ON mp.medicamento_id = m.med_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
        WHERE mp.medicamento_id = ? AND m.med_ativo = true
        ORDER BY mp.medp_preco ASC;
      `;
      const [rows] = await db.query(sql, [med_id]);
      
      const dados = rows.map(farmacia => ({
          ...farmacia,
          imagem: gerarUrl(farmacia.imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de farmácias para o medicamento, ordenada por preço.',
        dados: dados
      });

    } catch (error) {
      return handleServerError(response, error);
    }
  },
  
  // Rota PÚBLICA (Tela Pesquisa)
  async listarTodosMedicamentosBusca(request, response) {
    try {
      const page = parseInt(request.query.page || '1', 10);
      const limit = parseInt(request.query.limit || '10', 10);
      const search = request.query.search || '';
      const offset = (page - 1) * limit;
      const searchTerm = `%${search}%`;
      
      let countSql = `
        SELECT COUNT(*) as total
        FROM medpreco mp
        INNER JOIN medicamento m ON mp.medicamento_id = m.med_id
        LEFT JOIN laboratorios l ON m.lab_id = l.lab_id
        LEFT JOIN tipo_produto t ON m.tipo_id = t.tipo_id
      `;

      // --- CORREÇÃO AQUI ---
      let dataSql = `
        SELECT 
          m.med_id, m.med_nome, m.med_descricao, 
          m.med_imagem, 
          m.med_ativo,
          m.med_dosagem,
          m.med_quantidade,
          l.lab_nome,
          t.nome_tipo as categoria,
          mp.medp_preco,
          f.farm_nome,
          f.farm_id,
          mp.medp_id as oferta_id,
          ff.forma_nome,
          
          -- Adicionados os campos de data da promoção
          p.promo_desconto,
          p.promo_inicio,
          p.promo_fim

        FROM medpreco mp
        INNER JOIN medicamento m ON mp.medicamento_id = m.med_id
        INNER JOIN farmacia f ON mp.farmacia_id = f.farm_id
        LEFT JOIN laboratorios l ON m.lab_id = l.lab_id
        LEFT JOIN tipo_produto t ON m.tipo_id = t.tipo_id
        LEFT JOIN forma_farmaceutica ff ON m.forma_id = ff.forma_id
        LEFT JOIN promocao p ON mp.medicamento_id = p.medicamento_id 
                           AND mp.farmacia_id = p.farmacia_id
                           AND p.promo_inicio <= CURDATE() 
                           AND p.promo_fim >= CURDATE()
      `;
      // --------------------
      
      let whereClauses = ['m.med_ativo = true'];
      let queryParams = [];

      if (search) {
        whereClauses.push('(m.med_nome LIKE ? OR l.lab_nome LIKE ? OR t.nome_tipo LIKE ?)');
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      const whereStatement = ' WHERE ' + whereClauses.join(' AND ');
      countSql += whereStatement;
      dataSql += whereStatement;

      const [[{ total: totalItens }]] = await db.query(countSql, queryParams);
      const totalPaginas = Math.ceil(totalItens / limit);

      dataSql += ` 
        ORDER BY mp.medp_preco ASC, m.med_nome ASC 
        LIMIT ? 
        OFFSET ?;
      `;
      queryParams.push(limit, offset);

      const [rows] = await db.query(dataSql, queryParams);

      // Mapeamento de dados (passando os novos campos)
      const dados = rows.map(oferta => ({
        // Campos para a lista de busca
        id: oferta.oferta_id,
        nome: oferta.med_nome,
        laboratorio: oferta.lab_nome,
        preco: parseFloat(oferta.medp_preco || 0),
        imagem: gerarUrl(oferta.med_imagem, 'medicamentos', 'sem-imagem.png'),
        categoria: oferta.categoria || 'Geral',
        farmaciaNome: oferta.farm_nome,
        
        // Campos de promoção (agora incluindo datas)
        promo_desconto: parseFloat(oferta.promo_desconto || 0), 
        promo_inicio: oferta.promo_inicio,
        promo_fim: oferta.promo_fim,
        
        // Campos necessários para a tela 'Produto'
        med_id: oferta.med_id,
        farm_id: oferta.farm_id,
        med_nome: oferta.med_nome,
        med_dosagem: oferta.med_dosagem,
        med_quantidade: oferta.med_quantidade,
        med_descricao: oferta.med_descricao || 'Descrição não disponível.',
        lab_nome: oferta.lab_nome,
        tipo_nome: oferta.categoria,
        forma_nome: oferta.forma_nome,
        emEstoque: Boolean(oferta.med_ativo)
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: `Ofertas recuperadas com sucesso.`,
        dados: dados,
        paginacao: {
          paginaAtual: page,
          totalItens: totalItens,
          totalPaginas: totalPaginas,
        },
      });
    } catch (error) { 
      return handleServerError(response, error);
    }
  },

  // Rota ADMIN (sem alteração)
  async cadastrarMedicamentos(request, response) {
    // ... (seu código está correto)
    let connection; 
    try {
      const { med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, tipo_id, farmacia_id, med_preco } = request.body;
      const med_imagem_nome = request.file ? request.file.filename : null; 

      if (!med_nome || !med_dosagem || !med_quantidade || !med_cod_barras || !tipo_id || !forma_id || !lab_id || !farmacia_id || med_preco === undefined) {
        return response.status(400).json({ sucesso: false, mensagem: 'Todos os campos obrigatórios devem ser fornecidos.' });
      }
      
      if (parseFloat(med_preco) <= 0) {
        return response.status(400).json({ sucesso: false, mensagem: 'O preço deve ser um valor positivo.' });
      }
      
      connection = await db.getConnection();
      await connection.beginTransaction();

      const sqlMedicamento = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, tipo_id, med_ativo, med_imagem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?);`;
      const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, tipo_id, med_imagem_nome];
      const [resultMedicamento] = await connection.query(sqlMedicamento, valuesMedicamento);
      const novoMedicamentoId = resultMedicamento.insertId;

      const sqlMedpreco = `INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);`;
      const valuesMedpreco = [farmacia_id, novoMedicamentoId, med_preco];
      await connection.query(sqlMedpreco, valuesMedpreco);
      
      await connection.commit();
      return response.status(201).json({ sucesso: true, mensagem: 'Medicamento e preço cadastrados com sucesso.', dados: { med_id: novoMedicamentoId } });
    } catch (error) {
      if (connection) { await connection.rollback(); }
      return handleServerError(response, error);
    } finally {
      if (connection) { connection.release(); }
    }
  },

  // Rota ADMIN (sem alteração)
  async editarMedicamentos(request, response) {
    // ... (seu código está correto)
    let connection;
    try {
        const { med_id } = request.params;
        const body = request.body;

        if (Object.keys(body).length === 2 && body.med_ativo !== undefined && body.farmacia_id !== undefined) {
            const { med_ativo, farmacia_id } = body;
            const sqlCheckOwner = 'SELECT COUNT(*) as count FROM medpreco WHERE medicamento_id = ? AND farmacia_id = ?';
            const [[{ count }]] = await db.query(sqlCheckOwner, [med_id, farmacia_id]);

            if (count === 0) {
              return response.status(403).json({ sucesso: false, mensagem: 'Operação não permitida. Este medicamento não pertence à sua farmácia.' });
            }
        
            const sqlUpdateStatus = 'UPDATE medicamento SET med_ativo = ? WHERE med_id = ?';
            await db.query(sqlUpdateStatus, [med_ativo, med_id]);
            return response.status(200).json({ sucesso: true, mensagem: 'Status do medicamento atualizado com sucesso.' });
        }
        
        const { med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, tipo_id, med_ativo, farmacia_id, medp_preco } = body;
        const nova_imagem_nome = request.file ? request.file.filename : null;

        if (!farmacia_id || !med_nome || !med_dosagem || medp_preco === undefined) { 
            return response.status(400).json({ sucesso: false, mensagem: 'Campos essenciais são obrigatórios.' }); 
        }
        
        connection = await db.getConnection();
        await connection.beginTransaction();

        const sqlMedpreco = `UPDATE medpreco SET medp_preco = ? WHERE medicamento_id = ? AND farmacia_id = ?;`;
        const valuesMedpreco = [medp_preco, med_id, farmacia_id];
        const [resultMedpreco] = await connection.query(sqlMedpreco, valuesMedpreco);

        if (resultMedpreco.affectedRows === 0) {
            await connection.rollback();
            return response.status(403).json({ sucesso: false, mensagem: 'Operação não permitida. Medicamento não pertence à sua farmácia.' });
        }

        let sqlMedicamento;
        let valuesMedicamento;
        
        if (nova_imagem_nome) {
            sqlMedicamento = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, forma_id = ?, med_descricao = ?, lab_id = ?, tipo_id = ?, med_ativo = ?, med_imagem = ? WHERE med_id = ?;`;
            valuesMedicamento = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, tipo_id, med_ativo, nova_imagem_nome, med_id];
        } else {
            sqlMedicamento = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, forma_id = ?, med_descricao = ?, lab_id = ?, tipo_id = ?, med_ativo = ? WHERE med_id = ?;`;
            valuesMedicamento = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, tipo_id, med_ativo, med_id];
        }
        
        await connection.query(sqlMedicamento, valuesMedicamento);

        await connection.commit();
        return response.status(200).json({ sucesso: true, mensagem: 'Medicamento atualizado com sucesso.' });
    } catch (error) {
        if (connection) { await connection.rollback(); }
        return handleServerError(response, error);
    } finally {
        if (connection) { connection.release(); }
    }
  },

  // Rota ADMIN (sem alteração)
  async apagarMedicamentos(request, response) {
    // ... (seu código está correto)
    let connection;
    try {
      const { med_id } = request.params;
      const { farmacia_id } = request.body;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'A identificação da farmácia é obrigatória para excluir.' });
      }
      connection = await db.getConnection();
      await connection.beginTransaction();

      const sqlMedpreco = 'DELETE FROM medpreco WHERE medicamento_id = ? AND farmacia_id = ?;';
      const [resultMedpreco] = await connection.query(sqlMedpreco, [med_id, farmacia_id]);

      if (resultMedpreco.affectedRows === 0) {
        await connection.rollback();
        return response.status(403).json({ sucesso: false, mensagem: 'Operação não permitida. Este medicamento não pertence à sua farmácia ou não existe.' });
      }
      
      await connection.commit();
      return response.status(200).json({ sucesso: true, mensagem: 'Oferta do medicamento apagada com sucesso.' });
    } catch (error) {
      if (connection) { await connection.rollback(); }
      return handleServerError(response, error);
    } finally {
      if (connection) { connection.release(); }
    }
  }
};
// A chave '}' extra foi removida
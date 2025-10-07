const db = require('../dataBase/connection');
// CORREÇÃO: Importar a função para gerar a URL completa da imagem.
const { gerarUrl } = require('../utils/gerarUrl');

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
  });
};

module.exports = {
  async listarMedicamentos(request, response) {
    try {
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }
      const sql = `SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_cod_barras, m.forma_id, m.med_descricao, l.lab_nome, m.med_imagem, m.tipo_id, m.med_data_cadastro, m.med_data_atualizacao, m.med_ativo, mp.medp_preco, mp.farmacia_id FROM medicamento m INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id INNER JOIN laboratorios l ON m.lab_id = l.lab_id WHERE mp.farmacia_id = ?;`;
      const values = [farmacia_id];
      const [rows] = await db.query(sql, values);

      // CORREÇÃO: Mapeia os resultados para transformar o nome da imagem em uma URL completa.
      const dados = rows.map(medicamento => ({
        ...medicamento,
        med_imagem: gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({ sucesso: true, mensagem: 'Lista de medicamentos recuperada com sucesso.', itens: dados.length, dados: dados });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async listarTodosMedicamentosPaginado(request, response) {
    try {
      const page = parseInt(request.query.page || '1', 10);
      const limit = parseInt(request.query.limit || '10', 10);
      const offset = (page - 1) * limit;
      const countSql = 'SELECT COUNT(*) as total FROM medicamento;';
      const [[{ total: totalItens }]] = await db.query(countSql);
      const totalPaginas = Math.ceil(totalItens / limit);
      const dataSql = `
        SELECT m.med_id, m.med_nome, m.med_dosagem, m.med_quantidade, m.med_imagem
        FROM medicamento m
        LIMIT ?
        OFFSET ?;
      `;
      const values = [limit, offset];
      const [rows] = await db.query(dataSql, values);

      // CORREÇÃO: Mapeia os resultados para transformar o nome da imagem em uma URL completa.
      const dados = rows.map(medicamento => ({
        ...medicamento,
        med_imagem: gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png')
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: `Página ${page} de medicamentos recuperada com sucesso.`,
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

  async listarMedicamentoPorId(request, response) {
    try {
      const { med_id } = request.params;
      const { farmacia_id } = request.query;
      if (!farmacia_id) {
        return response.status(400).json({ sucesso: false, mensagem: 'O parâmetro farmacia_id é obrigatório.' });
      }
      const sql = `SELECT m.*, mp.medp_preco, mp.farmacia_id FROM medicamento m
                   INNER JOIN medpreco mp ON m.med_id = mp.medicamento_id
                   WHERE m.med_id = ? AND mp.farmacia_id = ?;`;
      const values = [med_id, farmacia_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'Medicamento não encontrado ou não pertence a esta farmácia.' });
      }
      
      // CORREÇÃO: Transforma o nome da imagem em uma URL completa para o objeto único.
      const medicamento = rows[0];
      medicamento.med_imagem = gerarUrl(medicamento.med_imagem, 'medicamentos', 'sem-imagem.png');

      return response.status(200).json({ sucesso: true, mensagem: 'Dados do medicamento recuperados com sucesso.', dados: medicamento });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async cadastrarMedicamentos(request, response) {
    let connection; 
    try {
      const { med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, tipo_id, farmacia_id, med_preco } = request.body;
      
      // CORREÇÃO: Salvar apenas o 'filename' em vez do 'path' completo.
      // Isso desacopla a estrutura de pastas do servidor dos dados no banco.
      const med_imagem = request.file ? request.file.filename : null;

      if (!med_nome || !med_dosagem || !med_quantidade || !med_cod_barras || !tipo_id || !forma_id || !lab_id || !farmacia_id || med_preco === undefined) {
        return response.status(400).json({ sucesso: false, mensagem: 'Todos os campos obrigatórios devem ser fornecidos.' });
      }
      
      if (parseFloat(med_preco) <= 0) {
        return response.status(400).json({ sucesso: false, mensagem: 'O preço deve ser um valor positivo.' });
      }
      
      connection = await db.getConnection();
      await connection.beginTransaction();

      const sqlMedicamento = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id, 1];
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

  async editarMedicamentos(request, response) {
    let connection;
    try {
        const { med_id } = request.params;
        const body = request.body;

        const isToggleStatusOnly = Object.keys(body).length === 2 && body.med_ativo !== undefined && body.farmacia_id !== undefined;
        if (isToggleStatusOnly) {
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
        
        // CORREÇÃO: Salvar apenas o 'filename' da nova imagem.
        const nova_imagem_nome = request.file ? request.file.filename : null;

        if (!farmacia_id || !med_nome || !med_dosagem || medp_preco === undefined) { 
            return response.status(400).json({ sucesso: false, mensagem: 'Campos essenciais são obrigatórios.' }); 
        }
        
        connection = await db.getConnection();
        await connection.beginTransaction();

        const sqlMedpreco = `UPDATE medpreco SET medp_preco = ? WHERE medicamento_id = ? AND farmacia_id = ?;`;
        const [resultMedpreco] = await connection.query(sqlMedpreco, [medp_preco, med_id, farmacia_id]);

        if (resultMedpreco.affectedRows === 0) {
            await connection.rollback();
            return response.status(403).json({ sucesso: false, mensagem: 'Operação não permitida. Medicamento não pertence à sua farmácia.' });
        }

        let sqlMedicamento;
        let valuesMedicamento;

        if (nova_imagem_nome) {
            sqlMedicamento = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, forma_id = ?, med_descricao = ?, lab_id = ?, med_imagem = ?, tipo_id = ?, med_ativo = ? WHERE med_id = ?;`;
            valuesMedicamento = [med_nome, med_dosagem, med_quantidade, forma_id, med_descricao, lab_id, nova_imagem_nome, tipo_id, med_ativo, med_id];
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

  async apagarMedicamentos(request, response) {
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
      const sqlMedicamento = 'DELETE FROM medicamento WHERE med_id = ?;';
      const [resultMedicamento] = await connection.query(sqlMedicamento, [med_id]);
      if (resultMedicamento.affectedRows === 0) {
        await connection.rollback();
        return response.status(404).json({ sucesso: false, mensagem: 'Medicamento não encontrado na tabela principal, embora um preço tenha sido removido.' });
      }
      await connection.commit();
      return response.status(200).json({ sucesso: true, mensagem: 'Medicamento apagado com sucesso.' });
    } catch (error) {
      if (connection) { await connection.rollback(); }
      return handleServerError(response, error);
    } finally {
      if (connection) { connection.release(); }
    }
  }
};
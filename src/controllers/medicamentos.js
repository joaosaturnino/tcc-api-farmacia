const db = require('../dataBase/connection');

const handleServerError = (response, error) => {
  console.error(error);
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
  });
};

module.exports = {
  // ... (As funções listarMedicamentos e listarMedicamentoPorId não precisam de alteração)
  async listarMedicamentos(request, response) {
    try {
      const sql = `SELECT
    m.med_id,
    m.med_nome,
    m.med_dosagem,
    m.med_quantidade,
    m.med_cod_barras,
    m.forma_id,
    m.med_descricao,
    l.lab_nome, 
    m.med_imagem,
    m.tipo_id,
    m.med_data_cadastro,
    m.med_data_atualizacao,
    m.med_ativo,
    mp.medp_preco,
    mp.farmacia_id
FROM
    medicamento m
INNER JOIN
    medpreco mp ON m.med_id = mp.medicamento_id
INNER JOIN
    laboratorios l ON m.lab_id = l.lab_id;`;
      const [rows] = await db.query(sql);
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos recuperada com sucesso.',
        itens: rows.length,
        dados: rows
      });
    } catch (error) {
      return handleServerError(response, error);
    }
  },

  async listarMedicamentoPorId(request, response) {
    try {
      const { med_id } = request.params;
      
      const sql = `SELECT * FROM medicamento WHERE med_id = ?;`;
      const values = [med_id];
      const [rows] = await db.query(sql, values);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado.',
        });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Dados do medicamento recuperados com sucesso.',
        dados: rows[0]
      });

    } catch (error) {
      return handleServerError(response, error);
    }
  },

  /**
   * Cadastra um novo medicamento e seu preço inicial usando uma transação.
   */
  async cadastrarMedicamentos(request, response) {
    let connection; 
    try {
      const { 
        med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, 
        med_descricao, lab_id, med_imagem, tipo_id,
        farmacia_id, med_preco
      } = request.body;

      if (!med_nome || !med_dosagem || !med_cod_barras || !tipo_id || !forma_id || !lab_id || !farmacia_id || med_preco === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Todos os campos obrigatórios devem ser fornecidos: nome, dosagem, código de barras, tipo, forma, laboratório, farmácia e preço.',
        });
      }
      
      if (parseFloat(med_preco) <= 0 || parseInt(med_quantidade) <= 0) {
        return response.status(400).json({
            sucesso: false,
            mensagem: 'Preço e quantidade devem ser valores positivos.'
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      // CORREÇÃO 1: Adicionado o campo 'med_ativo' na query SQL.
      const sqlMedicamento = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, med_cod_barras,
                              forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
                              
      // CORREÇÃO 2: Adicionado o valor para 'med_ativo' (1 = true) no array de valores.
      // Todo novo medicamento será cadastrado como ativo por padrão.
      const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id, 1];
      
      const [resultMedicamento] = await connection.query(sqlMedicamento, valuesMedicamento);
      const novoMedicamentoId = resultMedicamento.insertId;

      const sqlMedpreco = `INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);`;
      const valuesMedpreco = [farmacia_id, novoMedicamentoId, med_preco];
      await connection.query(sqlMedpreco, valuesMedpreco);

      await connection.commit();

      return response.status(201).json({
        sucesso: true,
        mensagem: 'Medicamento e preço cadastrados com sucesso.',
        dados: { med_id: novoMedicamentoId }
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      return handleServerError(response, error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },

  // ... (As funções editarMedicamentos e apagarMedicamentos não precisam de alteração)
  async editarMedicamentos(request, response) {
    let connection;
    try {
        const { med_id } = request.params;
        const body = request.body;

        const isToggleStatusOnly = Object.keys(body).length === 1 && body.med_ativo !== undefined;

        if (isToggleStatusOnly) {
            const sqlToggle = `UPDATE medicamento SET med_ativo = ? WHERE med_id = ?;`;
            const [result] = await db.query(sqlToggle, [body.med_ativo, med_id]);

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    sucesso: false,
                    mensagem: 'Medicamento não encontrado para alteração de status.',
                });
            }

            return response.status(200).json({
                sucesso: true,
                mensagem: 'Status do medicamento atualizado com sucesso.',
            });
        }

        const {
            med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id,
            med_descricao, lab_id, med_imagem, tipo_id, med_ativo,
            farmacia_id, med_preco
        } = body;

        if (!med_nome || !med_dosagem || !med_cod_barras || !farmacia_id || med_preco === undefined) {
            return response.status(400).json({
                sucesso: false,
                mensagem: 'Campos essenciais como nome, dosagem, código de barras, farmácia e preço são obrigatórios para a atualização.',
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const sqlMedicamento = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, med_cod_barras = ?,
                                forma_id = ?, med_descricao = ?, lab_id = ?, med_imagem = ?, tipo_id = ?, med_ativo = ?
                                WHERE med_id = ?;`;
        const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_cod_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo, med_id];
        const [resultMedicamento] = await connection.query(sqlMedicamento, valuesMedicamento);

        if (resultMedicamento.affectedRows === 0) {
            await connection.rollback();
            return response.status(404).json({
                sucesso: false,
                mensagem: 'Medicamento não encontrado com o ID fornecido.',
            });
        }

        const sqlMedpreco = `INSERT INTO medpreco (medicamento_id, farmacia_id, medp_preco) 
                             VALUES (?, ?, ?)
                             ON DUPLICATE KEY UPDATE medp_preco = VALUES(medp_preco);`;
        const valuesMedpreco = [med_id, farmacia_id, med_preco];
        await connection.query(sqlMedpreco, valuesMedpreco);

        await connection.commit();

        return response.status(200).json({
            sucesso: true,
            mensagem: 'Medicamento e preço atualizados com sucesso.',
            dados: { med_id: parseInt(med_id) }
        });
    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        return handleServerError(response, error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
  },

  async apagarMedicamentos(request, response) {
    let connection;
    try {
      const { med_id } = request.params;
      
      connection = await db.getConnection();
      await connection.beginTransaction();

      const sqlMedpreco = 'DELETE FROM medpreco WHERE medicamento_id = ?;';
      await connection.query(sqlMedpreco, [med_id]);

      const sqlMedicamento = 'DELETE FROM medicamento WHERE med_id = ?;';
      const [resultMedicamento] = await connection.query(sqlMedicamento, [med_id]);
      
      if (resultMedicamento.affectedRows === 0) {
        await connection.rollback();
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado com o ID fornecido.',
        });
      }
      
      await connection.commit();

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento e seus preços associados foram apagados com sucesso.'
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      return handleServerError(response, error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
};
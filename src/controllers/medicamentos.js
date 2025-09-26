const db = require('../dataBase/connection');

// ANOTAÇÃO: Foi criada uma função de log de erros para centralizar o tratamento
// de exceções, evitando expor detalhes de implementação ao cliente.
const handleServerError = (response, error) => {
  console.error(error); // Loga o erro completo no console do servidor para depuração.
  return response.status(500).json({
    sucesso: false,
    mensagem: 'Ocorreu um erro inesperado no servidor. Tente novamente mais tarde.',
    // A propriedade 'erro' foi removida da resposta ao cliente por segurança.
  });
};

module.exports = {
  /**
   * Lista todos os medicamentos.
   */
  async listarMedicamentos(request, response) {
    try {
      // ANOTAÇÃO: A query foi atualizada para incluir o código de barras, um campo importante
      // que estava faltando na listagem.
      const sql = `SELECT med_id, med_nome, med_dosagem, med_quantidade, med_codigo_barras,
                  forma_id, med_descricao, lab_id, med_imagem, tipo_id, 
                  med_data_cadastro, med_data_atualizacao, med_ativo 
                  FROM medicamento;`;
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

  /**
   * Busca um único medicamento pelo seu ID.
   */
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
      // ANOTAÇÃO: A desestruturação foi atualizada para incluir `med_codigo_barras`
      // e renomear `preco` para `medp_preco` para corresponder ao banco de dados.
      // Isso corrige a inconsistência entre o frontend e o backend.
      const { 
        med_nome, med_dosagem, med_quantidade, med_codigo_barras, forma_id, 
        med_descricao, lab_id, med_imagem, tipo_id,
        farmacia_id, med_preco // Recebe 'med_preco' do frontend
      } = request.body;

      // ANOTAÇÃO: A validação foi expandida para incluir todos os campos essenciais.
      // Isso garante a integridade dos dados antes de tentar a inserção no banco.
      if (!med_nome || !med_dosagem || !med_codigo_barras || !tipo_id || !forma_id || !lab_id || !farmacia_id || med_preco === undefined) {
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

      // CORREÇÃO: A query SQL INSERT foi atualizada para incluir o campo `med_codigo_barras`.
      const sqlMedicamento = `INSERT INTO medicamento (med_nome, med_dosagem, med_quantidade, med_codigo_barras,
                              forma_id, med_descricao, lab_id, med_imagem, tipo_id) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;
      const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_codigo_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id];
      const [resultMedicamento] = await connection.query(sqlMedicamento, valuesMedicamento);
      const novoMedicamentoId = resultMedicamento.insertId;

      const sqlMedpreco = `INSERT INTO medpreco (farmacia_id, medicamento_id, medp_preco) VALUES (?, ?, ?);`;
      const valuesMedpreco = [farmacia_id, novoMedicamentoId, med_preco]; // Usa 'med_preco' aqui
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

  /**
   * Edita um medicamento existente e atualiza ou insere (upsert) seu preço.
   */
  async editarMedicamentos(request, response) {
    let connection;
    try {
      const { med_id } = request.params; 
      const { 
        med_nome, med_dosagem, med_quantidade, med_codigo_barras, forma_id, 
        med_descricao, lab_id, med_imagem, tipo_id, med_ativo,
        farmacia_id, med_preco
      } = request.body; 

      if (!med_nome || !med_dosagem || !med_codigo_barras || !farmacia_id || med_preco === undefined) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Campos essenciais como nome, dosagem, código de barras, farmácia e preço são obrigatórios para a atualização.',
        });
      }

      connection = await db.getConnection();
      await connection.beginTransaction();

      // CORREÇÃO: A query SQL UPDATE foi atualizada para incluir `med_codigo_barras`.
      const sqlMedicamento = `UPDATE medicamento SET med_nome = ?, med_dosagem = ?, med_quantidade = ?, med_codigo_barras = ?,
                              forma_id = ?, med_descricao = ?, lab_id = ?, med_imagem = ?, tipo_id = ?, med_ativo = ?
                              WHERE med_id = ?;`;
      const valuesMedicamento = [med_nome, med_dosagem, med_quantidade, med_codigo_barras, forma_id, med_descricao, lab_id, med_imagem, tipo_id, med_ativo, med_id];
      const [resultMedicamento] = await connection.query(sqlMedicamento, valuesMedicamento);

      if (resultMedicamento.affectedRows === 0) {
        await connection.rollback();
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Medicamento não encontrado com o ID fornecido.',
        });
      }
      
      // MELHORIA: A lógica de preço foi trocada para um "UPSERT" (INSERT ... ON DUPLICATE KEY UPDATE).
      // Isso permite que o endpoint crie um preço caso não exista, ou o atualize caso já exista.
      // É muito mais flexível e robusto do que o `UPDATE` simples anterior.
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

  /**
   * Apaga um medicamento e todos os seus preços associados.
   */
  async apagarMedicamentos(request, response) {
    let connection;
    try {
      const { med_id } = request.params;
      
      connection = await db.getConnection();
      await connection.beginTransaction();

      // ANOTAÇÃO: A ordem de exclusão está correta (primeiro a chave estrangeira),
      // garantindo a integridade referencial do banco de dados.
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
const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');

module.exports = {
  async listarFarmacias(request, response) {
    try {

      const { qtde } = request.query;
      if (qtde) {
        const sqlQtde = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                        farm_email,  farm_logo, farm_cidade_id FROM farmacia ORDER BY RAND() LIMIT ?;`;
        const [rowsQtde] = await db.query(sqlQtde, [parseInt(qtde)]); 
        const farmaciasComUrlQtde = rowsQtde.map(farmacia => ({
          ...farmacia,
          // CORREÇÃO: A pasta 'teste' foi substituída por 'logos' para consistência.
          farm_logo_url: gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png')
        }));
        return response.status(200).json({
          sucesso: true,
          mensagem: `Lista de farmácias (limitada a ${qtde})`,
          itens: rowsQtde.length,
          dados: farmaciasComUrlQtde
        });
      }



      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email,  farm_logo, farm_cidade_id FROM farmacia;`;
      const [rows] = await db.query(sql);
      
      const farmaciasComUrl = rows.map(farmacia => ({
        ...farmacia,
        farm_logo_url: gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png')
      }));
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de farmácias',
        itens: rows.length,
        dados: farmaciasComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  async listarFarmaciaPorId(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email, farm_logo, farm_cidade_id FROM farmacia WHERE farm_id = ?;`;
      const [rows] = await db.query(sql, [farm_id]);

      if (rows.length === 0) {
        return response.status(404).json({
          sucesso: false,
          mensagem: 'Farmácia não encontrada.',
        });
      }

      const farmacia = rows[0];
      const farmaciaComUrl = {
        ...farmacia,
        farm_logo_url: gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png')
      };
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Dados da farmácia.',
        dados: farmaciaComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  },

  /**
   * CORRIGIDO: Lista os medicamentos associados a uma farmácia através da tabela `medpreco`.
   */
  async listarMedicamentosPorFarmacia(request, response) {
    try {
      const { farm_id } = request.params;

      // CORREÇÃO: A consulta foi reescrita para juntar as tabelas `medicamento` e `medpreco`
      // e buscar os dados corretos (preço e imagem) da farmácia específica.
      const sql = `
        SELECT 
          med.med_id as id, 
          med.med_nome as nome,
          med.med_dosagem as dosagem,
          lab.lab_nome as laboratorio,
          mp.medp_preco as preco, 
          mp.medp_imagem as imagem
        FROM medpreco mp
        INNER JOIN medicamento med ON mp.medicamento_id = med.med_id
        LEFT JOIN laboratorios lab ON med.lab_id = lab.lab_id
        WHERE mp.farmacia_id = ?;`;

      const [rows] = await db.query(sql, [farm_id]);

      const medicamentosComUrl = rows.map(medicamento => ({
        ...medicamento,
        imagem_url: gerarUrl(medicamento.imagem, 'medicamentos', 'sem-imagem.png') 
      }));

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de medicamentos da farmácia.',
        itens: medicamentosComUrl.length,
        dados: medicamentosComUrl
      });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição de medicamentos.',
        dados: error.message
      });
    }
  },

  async cadastrarFarmacias(request, response) {
    try {
      const { farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, farm_senha, farm_cidade_id } = request.body;
      
      if (!farm_nome || !farm_email || !farm_senha) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nome, e-mail e senha são obrigatórios.',
        });
      }

      let nomeArquivo = null;
      if (request.file) {
        nomeArquivo = request.file.filename;
      }

      const sql = `INSERT INTO farmacia (farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email, farm_senha, farm_logo, farm_cidade_id) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, farm_senha, nomeArquivo, farm_cidade_id];
      
      const [rows] = await db.query(sql, values);
      const farmaciaUrl = gerarUrl(nomeArquivo, 'logos', 'default-logo.png');
      
      return response.status(201).json({
        sucesso: true,
        mensagem: 'Farmácia cadastrada com sucesso.',
        dados: { 
          farm_id: rows.insertId,
          farm_logo: nomeArquivo,
          farm_logo_url: farmaciaUrl
        }
      });
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro interno no servidor.',
        dados: error.message
      });
    }
  },

  async editarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const camposRecebidos = request.body; 
      
      if (Object.keys(camposRecebidos).length === 0 && !request.file) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum dado fornecido para atualização.',
        });
      }

      const camposParaAtualizar = [];
      const values = [];
      let novoNomeArquivo = null;

      Object.entries(camposRecebidos).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          camposParaAtualizar.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (request.file) {
        novoNomeArquivo = request.file.filename;
        camposParaAtualizar.push(`farm_logo = ?`);
        values.push(novoNomeArquivo);
      }
      
      if (camposParaAtualizar.length === 0) {
         return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum campo válido fornecido para atualização.',
        });
      }

      values.push(farm_id);
      const sql = `UPDATE farmacia SET ${camposParaAtualizar.join(', ')} WHERE farm_id = ?;`;
      await db.query(sql, values);

      let nomeLogoFinal = novoNomeArquivo;
      if (!nomeLogoFinal) {
          const [result] = await db.query('SELECT farm_logo FROM farmacia WHERE farm_id = ?', [farm_id]);
          if (result.length > 0) {
              nomeLogoFinal = result[0].farm_logo;
          }
      }
      
      const farmaciaUrl = gerarUrl(nomeLogoFinal, 'logos', 'default-logo.png');
      
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia editada com sucesso.',
        dados: {
            farm_logo_url: farmaciaUrl 
        }
      });
    } catch (error) {
      console.error('Erro ao editar farmácia:', error); 
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        dados: error.message
      });
    }
  },
  
  async verificarEmail(request, response) {
    try {
      const { farm_email } = request.body;
      if (!farm_email) {
        return response.status(400).json({ sucesso: false, mensagem: 'O e-mail é obrigatório.' });
      }
      const sql = 'SELECT farm_id FROM farmacia WHERE farm_email = ?;';
      const [rows] = await db.query(sql, [farm_email]);
      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'E-mail não encontrado.' });
      }
      return response.status(200).json({ sucesso: true, mensagem: 'E-mail verificado com sucesso.' });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
        dados: error.message
      });
    }
  },

  async redefinirSenhaPorEmail(request, response) {
    try {
      const { farm_email, nova_senha } = request.body;
      if (!farm_email || !nova_senha) {
        return response.status(400).json({ sucesso: false, mensagem: 'E-mail e nova senha são obrigatórios.' });
      }
      if (nova_senha.length < 6) {
        return response.status(400).json({ sucesso: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      const sql = 'UPDATE farmacia SET farm_senha = ? WHERE farm_email = ?;';
      const [result] = await db.query(sql, [nova_senha, farm_email]);
      if (result.affectedRows === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'E-mail não encontrado para atualização.' });
      }
      return response.status(200).json({ sucesso: true, mensagem: 'Senha alterada com sucesso.' });
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro no servidor.',
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
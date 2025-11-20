const db = require('../dataBase/connection');
const { gerarUrl } = require('../utils/gerarUrl');
const bcrypt = require('bcrypt');

module.exports = {
  // Lista farmácias com opção de limite aleatório (para destaques na home)
  async listarFarmacias(request, response) {
    try {
      const { qtde } = request.query;

      // Se passar o parâmetro 'qtde', retorna um número limitado de farmácias aleatórias
      if (qtde) {
        const sqlQtde = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                        farm_email, farm_logo, farm_cidade_id 
                        FROM farmacia ORDER BY RAND() LIMIT ?;`;
        // parseInt garante que o limite seja um número inteiro
        const [rowsQtde] = await db.query(sqlQtde, [parseInt(qtde)]); 
        
        // Mapeia os resultados para adicionar a URL completa da logo
        const farmaciasComUrlQtde = rowsQtde.map(farmacia => ({
          ...farmacia,
          farm_logo_url: gerarUrl(farmacia.farm_logo, 'logos', 'default-logo.png')
        }));
        
        return response.status(200).json({
          sucesso: true,
          mensagem: `Lista de farmácias (limitada a ${qtde})`,
          itens: rowsQtde.length,
          dados: farmaciasComUrlQtde
        });
      }

      // Se não passar 'qtde', retorna todas as farmácias
      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email, farm_logo, farm_cidade_id FROM farmacia;`;
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

  // Busca os detalhes de uma farmácia específica pelo ID
  async listarFarmaciaPorId(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = `SELECT farm_id, farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
                  farm_email, farm_logo, farm_cidade_id 
                  FROM farmacia WHERE farm_id = ?;`;
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

  // Lista os medicamentos vendidos por uma farmácia específica
  async listarMedicamentosPorFarmacia(request, response) {
    try {
      const { farm_id } = request.params;

      // Join entre medpreco (tabela de ligação/preços), medicamento e laboratórios
      // Correção: Usando med.med_imagem para garantir que pegamos a imagem do cadastro do remédio
      const sql = `
        SELECT 
          med.med_id as id, 
          med.med_nome as nome,
          med.med_dosagem as dosagem,
          lab.lab_nome as laboratorio,
          mp.medp_preco as preco, 
          med.med_imagem as imagem 
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

  // Cadastra uma nova farmácia
  async cadastrarFarmacias(request, response) {
    try {
      const { farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, farm_senha, farm_cidade_id } = request.body;
      
      // Validação básica de campos obrigatórios
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

      // Criptografa a senha antes de salvar no banco
      const hashedSenha = await bcrypt.hash(farm_senha, 10);

      const sql = `INSERT INTO farmacia (farm_nome, farm_cnpj, farm_endereco, farm_telefone, 
          farm_email, farm_senha, farm_logo, farm_cidade_id) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
      const values = [farm_nome, farm_cnpj, farm_endereco, farm_telefone, farm_email, hashedSenha, nomeArquivo, farm_cidade_id];
      
      const [rows] = await db.query(sql, values);
      
      // Gera a URL da logo recém cadastrada para retornar ao front-end
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

  // Edita dados de uma farmácia existente
  async editarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const camposRecebidos = request.body; 
      
      // Se não enviou campos nem arquivo, retorna erro
      if (Object.keys(camposRecebidos).length === 0 && !request.file) {
        return response.status(400).json({
          sucesso: false,
          mensagem: 'Nenhum dado fornecido para atualização.',
        });
      }

      const camposParaAtualizar = [];
      const values = [];
      let novoNomeArquivo = null;

      // Itera sobre os campos recebidos para montar a query dinâmica
      for (const [key, value] of Object.entries(camposRecebidos)) {
        if (value !== null && value !== undefined) {
          // Se for atualização de senha, criptografa a nova senha
          if (key === 'farm_senha' && value && value.trim() !== '') {
            const hashed = await bcrypt.hash(value, 10);
            camposParaAtualizar.push(`${key} = ?`);
            values.push(hashed);
          } else {
            camposParaAtualizar.push(`${key} = ?`);
            values.push(value);
          }
        }
      }

      // Se enviou nova logo, atualiza o campo farm_logo
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

      // Recupera a logo atual (nova ou a que já estava) para retornar a URL correta
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
  
  // Verifica se um e-mail existe (útil para recuperação de senha)
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

  // Redefine senha via e-mail (fluxo de "esqueci minha senha")
  async redefinirSenhaPorEmail(request, response) {
    try {
      const { farm_email, nova_senha } = request.body;
      if (!farm_email || !nova_senha) {
        return response.status(400).json({ sucesso: false, mensagem: 'E-mail e nova senha são obrigatórios.' });
      }
      if (nova_senha.length < 6) {
        return response.status(400).json({ sucesso: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      const hashed = await bcrypt.hash(nova_senha, 10);
      const sql = 'UPDATE farmacia SET farm_senha = ? WHERE farm_email = ?;';
      const [result] = await db.query(sql, [hashed, farm_email]);
      
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

  // Altera senha logada (exige senha atual)
  async alterarSenha(request, response) {
    try {
      const { farm_id } = request.params;
      const { senha_atual, nova_senha } = request.body;

      if (!senha_atual || !nova_senha) {
        return response.status(400).json({ sucesso: false, mensagem: 'Senha atual e nova senha são obrigatórias.' });
      }

      if (nova_senha.length < 6) {
        return response.status(400).json({ sucesso: false, mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
      }

      // Busca a senha atual (hash) no banco
      const [rows] = await db.query('SELECT farm_senha FROM farmacia WHERE farm_id = ?;', [farm_id]);
      if (rows.length === 0) {
        return response.status(404).json({ sucesso: false, mensagem: 'Farmácia não encontrada.' });
      }

      const atualHash = rows[0].farm_senha;
      // Compara a senha enviada com o hash do banco
      const match = await bcrypt.compare(senha_atual, atualHash);
      if (!match) {
        return response.status(401).json({ sucesso: false, mensagem: 'Senha atual incorreta.' });
      }

      // Se correta, gera hash da nova senha e atualiza
      const novaHash = await bcrypt.hash(nova_senha, 10);
      const sql = 'UPDATE farmacia SET farm_senha = ? WHERE farm_id = ?;';
      await db.query(sql, [novaHash, farm_id]);

      return response.status(200).json({ sucesso: true, mensagem: 'Senha alterada com sucesso.' });
    } catch (error) {
      return response.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.', dados: error.message });
    }
  },

  // Remove uma farmácia
  async apagarFarmacias(request, response) {
    try {
      const { farm_id } = request.params;
      const sql = 'DELETE FROM farmacia WHERE farm_id = ?;';
      const values = [farm_id];
      const [rows] = await db.query(sql, values);
      
      if (rows.affectedRows === 0) {
          return response.status(404).json({
              sucesso: false,
              mensagem: 'Farmácia não encontrada para exclusão.'
          });
      }

      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmácia apagada com sucesso.',
        dados: rows
      });
    } catch (error) {
      // Erro comum de chave estrangeira (tentar apagar farmácia com vendas/produtos vinculados)
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
          return response.status(400).json({
              sucesso: false,
              mensagem: 'Não é possível apagar esta farmácia pois ela possui registros vinculados (medicamentos, vendas, etc).'
          });
      }
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.message
      });
    }
  }
};
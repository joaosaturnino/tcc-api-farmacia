const db = require('../dataBase/connection');
const { json, response } = require('express');

// Controler para gerenciar listagens unicas
// Este modulo contem funcoes para listar um unico item no banco de dados
module.exports = {

    // Listar unica avaliacao
    async listarUnicaAvaliacao(request, response) {
        try{
            // parametros passados via url
            const { ava_id } = request.params;
            // instrucao sql para listar uma avaliacao
            const sql = 'SELECT ava_id, usu_id, far_id, nota, ava_comentario FROM avaliacao WHERE ava_id = ?;';
            // verifica se o id foi passado
            const values = [ava_id];
            // executa a consulta no banco de dados
            const [rows] = await db.query(sql, [ava_id]);
            // verifica se ha registros retornados
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Lista de avaliação',
                itens: rows.length,
                dados: rows
            });
            // retorna erro caso ocorra
        }catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.mensage
            });
        }
    },

    // Listar unica cidade
    async listarUnicaCidade(request, response) {
        try{
            // parametros passados via url
            const { cidade_id } = request.params;
            // instrução sql para listar uma cidade especifica
            const sql = 'SELECT cidade_id, nome_cidade, uf_sigla FROM cidade WHERE cidade_id = ?;';
            // definição de array com parametros que receberao os valores do front-end
            const values = [cidade_id];
            // executa a consulta no banco de dados
            const [rows] = await db.query(sql, values);
            // verifica se ha registros retornados
            return response.status(200).json({
                sucesso: true,
                mensagem: 'Cidade encontrada.',
                itens: rows.length,
                dados: rows
            });
            // retorna erro caso ocorra
        }catch (error) {
            return response.status(500).json({
                sucesso: false,
                mensagem: 'Erro na requisição.',
                dados: error.mensage
            });
        }
        
    },

    // listar uma forma farmaceutica especifica
  async listarUnicaForma(request, response) {
    try {
      // parametro passado via url
      const { forma_id } = request.params;
      // instrução sql para listar uma forma farmaceutica especifica
      const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica WHERE forma_id = ?;';
      // definição de array com parametros que receberão os valores do front-end
      const values = [forma_id];
      // executa a instrução de listagem no baanco de dados
      const [rows] = await db.query(sql, values);
      // verifica se há registros retornados
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Forma farmaceutica encontrada.',
        itens: rows.length,
        dados: rows
      });
      // retorna erro caso ocorra
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // listar uma farmacia espesifica
  async listarUnicaFarmacia(request, response) {
    try {
      // parametros passados via url
      const { farm_id } = request.params;
      // instrução sql para listar farnacias
      const sql = 'SELECT farm_id, farm_nome, farm_endereco, farm_telefone, farm_email, farm_senha, cnpj, farm_logo, func_id, cid_id FROM farmacia WHERE farm_id = ?;';
      // definição de array com parametros que receberão os valores do front-end
      const values = [farm_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // verifica se ha registros retornados
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Farmacia encontrada',
        itens: rows.length,
        dados: rows
      });
      // retorna erro caso ocorra
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // listar funcionario especifico
  async listarUnicoFuncionario(request, response) {
    try {
      // parametros passados via url
      const {func_id} = request.params;
      // instrução sql para listar funcionario especifico
      const sql = 'SELECT func_id, cargo, usu_id FROM funcionarios WHERE func_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [func_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Funcionario encontrado.',
        itens: rows.length,
        dados: rows
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // listar laboratorio específico
  async listarUnicoLaboratorio(request, response) {
    try {
      // parametros passados via url
      const { lab_id } = request.params;
      // instrução sql para listar laboratorio específico
      const sql = 'SELECT lab_id, nome_laboratorio, lab_cnpj FROM laboratorio WHERE lab_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [lab_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Laboratório encontrado.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // listar medicamento especifico
  async listarUnicoMedicamento(request, response) {
    try {
      // parametros passados via url
      const { med_id } = request.params;
      // instrução sql para listar medicamento especifico
      const sql = 'SELECT med_id, med_nome, med_dosagem, med_quantidade, forma_id descricao, lab_id, med_img, tipo_id FROM medicamento WHERE med_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [med_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Medicamento encontrado.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Listar Preços de medicamentos específicos
  async listarUnicoMedPreco(request, response) {
    try {
      // parametros passados via url
      const { medpreco_id } = request.params;
      // instrução sql para listar preços de medicamentos específicos
      const sql = 'SELECT medpreco_id, farmacia_id, med_id, preco FROM medpreco WHERE medpreco_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [medpreco_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Lista de Preços de medicamentos',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Listar uma promoção específica
  async listarUnicaPromocao(request, response) {
    try {
      // parametros passados via url
      const { promo_id } = request.params;
      // instrução sql para listagem
      const sql = 'SELECT promo_id, farm_id, med_id, promo_desconto, promo_inicio, promo_fim FROM promocao WHERE promo_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [promo_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Promoção encontrada.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Listar um único Tipo de Produto
  async listarUnicoTipoProduto(request, response) {
    try {
      // parametros passados via url
      const { tipo_id } = request.params;
      // instrução sql para listar um único tipo de produto
      const sql = 'SELECT tipo_id, nome_tipo FROM tipo_produto WHERE tipo_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [tipo_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Tipo de Produto encontrado.',
        itens: rows.length,
        dados: rows
      });
      // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  // Listar um usuário específico
  async listarUnicoUsuario(request, response) {
    try {
      // parametros passados via url
      const { usu_id } = request.params;
      // instrução sql para listagem de um usuário específico
      const sql = 'SELECT usu_id, usu_nome, usu_email, usu_senha, usu_cpf, usu_tipo, cid_id FROM usuarios WHERE usu_id = ?;';
      // definição de array com paramentros que receberão os valores do front-end
      const values = [usu_id];
      // executa a instrução de listagem no banco de dados
      const [rows] = await db.query(sql, values);
      // exibe o resultado da consulta
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Usuário encontrado.',
        itens: rows.length,
        dados: rows
      });
    // retorna erro caso ocorra
    } catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensage
      });
    }
  },

  async listarLimitePromocao(request, response) {
    try {
      const sql = `SELECT promo_id, farm_id, med_id, promo_desconto, promo_inicio, promo_fim
      FROM promocao
      ORDER BY RAND()
      LIMIT 4;`;

      const promo = await db.query(sql);
      const nItens = promo[0].length;
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Itens na promoção',
        dados: promo[0],
        nItens
      });
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensagem
      });
    }
  },

  async listarLimiteCidade(request, response) {
    try {
      const sql = `SELECT cidade_id, nome_cidade, uf_sigla
      FROM cidade
      ORDER BY RAND()
      LIMIT 10;`;
      
      const cida = await db.query(sql);
      const nItens = cida[0].length;
      return response.status(200).json({
        sucesso: true,
        mensagem: 'Cidades encontradas',
        dados: cida[0],
        nItens
      });
    }catch (error) {
      return response.status(500).json({
        sucesso: false,
        mensagem: 'Erro na requisição.',
        dados: error.mensagem
      });
    }
  },

  // ... outras funções existentes ...

async listarUnicaFormaFarmaceutica(request, response) {
  try {
    const { forma_id } = request.params;
    const sql = 'SELECT forma_id, forma_nome FROM forma_farmaceutica WHERE forma_id = ?;';
    const values = [forma_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Forma farmacêutica encontrada.',
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

async listarUnicoLaboratorio(request, response) {
  try {
    const { lab_id } = request.params;
    const sql = 'SELECT lab_id, nome_laboratorio, lab_cnpj FROM laboratorio WHERE lab_id = ?;';
    const values = [lab_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Laboratório encontrado.',
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

async listarUnicoFuncionario(request, response) {
  try {
    const { func_id } = request.params;
    const sql = 'SELECT func_id, cargo, farm_id FROM funcionarios WHERE func_id = ?;';
    const values = [func_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Funcionário encontrado.',
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

async listarUnicoUsuario(request, response) {
  try {
    const { usu_id } = request.params;
    const sql = 'SELECT usu_id, usu_nome, usu_email, usu_cpf FROM usuarios WHERE usu_id = ?;';
    const values = [usu_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Usuário encontrado.',
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

async listarUnicaAvaliacao(request, response) {
  try {
    const { ava_id } = request.params;
    const sql = 'SELECT ava_id, usu_id, far_id, nota, ava_comentario FROM avaliacao WHERE ava_id = ?;';
    const values = [ava_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Avaliação encontrada.',
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

async listarUnicoFavorito(request, response) {
  try {
    const { fav_id } = request.params;
    const sql = 'SELECT fav_id, usu_id, far_id, med_id FROM favoritos WHERE fav_id = ?;';
    const values = [fav_id];
    const [rows] = await db.query(sql, values);
    return response.status(200).json({
      sucesso: true,
      mensagem: 'Favorito encontrado.',
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
}

};

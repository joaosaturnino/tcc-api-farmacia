const db = require('../dataBase/connection'); 

module.exports = {

    // =========================================================================
    // 1. CRIAR ALERTA E VERIFICAR PREÇOS IMEDIATAMENTE
    // =========================================================================
    async criarAlerta(req, res) {
        const { usuario_id, termo_busca, preco_alvo } = req.body;

        // Validação
        if (!usuario_id || !termo_busca || !preco_alvo) {
            return res.status(400).json({ sucesso: false, mensagem: 'Informe o medicamento e o preço alvo.' });
        }

        try {
            // -----------------------------------------------------------------
            // PASSO A: Salvar o alerta no banco de dados
            // -----------------------------------------------------------------
            const sqlInsert = `INSERT INTO alertas (usuario_id, termo_busca, preco_alvo) VALUES (?, ?, ?)`;
            await db.query(sqlInsert, [usuario_id, termo_busca, preco_alvo]);

            // -----------------------------------------------------------------
            // PASSO B: Varredura Inteligente (Verifica se já existe oferta agora)
            // -----------------------------------------------------------------
            // Busca na tabela de preços (medpreco) cruzando com medicamentos e farmácias
            const sqlCheck = `
                SELECT 
                    f.farm_nome, 
                    m.med_nome, 
                    mp.medp_preco
                FROM medpreco mp
                JOIN medicamento m ON mp.medicamento_id = m.med_id
                JOIN farmacia f ON mp.farmacia_id = f.farm_id
                WHERE m.med_nome LIKE ?       -- Nome parecido com o que o usuário digitou
                AND mp.medp_preco <= ?        -- Preço MENOR ou IGUAL ao alvo
                ORDER BY mp.medp_preco ASC    -- Pega o mais barato primeiro
                LIMIT 1
            `;
            
            const [ofertas] = await db.query(sqlCheck, [`%${termo_busca}%`, preco_alvo]);

            let mensagemRetorno = 'Alerta criado! Avisaremos assim que o preço baixar.';

            // -----------------------------------------------------------------
            // PASSO C: Se encontrou, notifica imediatamente
            // -----------------------------------------------------------------
            if (ofertas.length > 0) {
                const oferta = ofertas[0];
                const precoFormatado = parseFloat(oferta.medp_preco).toFixed(2).replace('.', ',');
                
                const tituloNotif = 'Achamos uma oferta! 🎉';
                const msgNotif = `O remédio ${oferta.med_nome} está por R$ ${precoFormatado} na ${oferta.farm_nome}!`;

                // Insere na tabela de notificações para aparecer no "Sininho" do app
                await db.query(
                    `INSERT INTO notificacoes (usuario_id, titulo, mensagem) VALUES (?, ?, ?)`, 
                    [usuario_id, titulo, msgNotif]
                );
                
                // Mensagem de sucesso para o modal já avisando o usuário
                mensagemRetorno = `Alerta criado! E já encontramos na ${oferta.farm_nome} por R$ ${precoFormatado}. Verifique suas notificações.`;
            }

            // -----------------------------------------------------------------
            // PASSO D: Opcional - Criar um post automático na comunidade
            // -----------------------------------------------------------------
            // Isso ajuda outros usuários a saberem que alguém procura esse remédio
            const textoComunidade = `[ALERTA DE PREÇO] Estou monitorando "${termo_busca}" por menos de R$ ${parseFloat(preco_alvo).toFixed(2).replace('.', ',')}.`;
            await db.query(
                `INSERT INTO comunidade_posts (usuario_id, medicamento_nome, preco, texto, tipo) VALUES (?, ?, ?, ?, 'ALERTA')`,
                [usuario_id, termo_busca, preco_alvo, textoComunidade]
            );

            return res.status(201).json({ 
                sucesso: true, 
                mensagem: mensagemRetorno 
            });

        } catch (error) {
            console.error("Erro ao criar alerta:", error);
            return res.status(500).json({ sucesso: false, mensagem: 'Erro interno ao criar alerta.' });
        }
    },

    // =========================================================================
    // 2. LISTAR NOTIFICAÇÕES (Para o "Sininho" do App)
    // =========================================================================
    async listarNotificacoes(req, res) {
        const { usuario_id } = req.params;
        try {
            const [notificacoes] = await db.query(
                `SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY data_notificacao DESC`, 
                [usuario_id]
            );
            res.status(200).json({ sucesso: true, dados: notificacoes });
        } catch (error) {
            res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar notificações.' });
        }
    },

    // =========================================================================
    // 3. MARCAR NOTIFICAÇÃO COMO LIDA
    // =========================================================================
    async marcarLida(req, res) {
        const { id } = req.params;
        try {
            await db.query(`UPDATE notificacoes SET lida = 1 WHERE id = ?`, [id]);
            res.status(200).json({ sucesso: true });
        } catch (error) {
            res.status(500).json({ sucesso: false });
        }
    }
};
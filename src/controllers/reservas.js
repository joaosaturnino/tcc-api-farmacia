const db = require('../dataBase/connection'); 

// Função Auxiliar
function gerarProtocolo() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const dia = String(agora.getDate()).padStart(2, '0');
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sufixo = '';
    for (let i = 0; i < 4; i++) {
        sufixo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return `RES-${ano}${mes}${dia}-${sufixo}`;
}

// 1. Criar Reserva
exports.createReserva = async (req, res) => {
    const { usuario_id, medicamento_id, farmacia_id, quantidade, valor_unitario } = req.body;
    if (!usuario_id || !medicamento_id || !farmacia_id || !quantidade) {
        return res.status(400).json({ sucesso: false, mensagem: 'Dados incompletos.' });
    }
    try {
        const valor_total = quantidade * valor_unitario;
        const protocolo = gerarProtocolo();
        const sql = `INSERT INTO reservas (protocolo, usuario_id, medicamento_id, farmacia_id, quantidade, valor_unitario, valor_total, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDENTE')`;
        const [result] = await db.query(sql, [protocolo, usuario_id, medicamento_id, farmacia_id, quantidade, valor_unitario, valor_total]);
        res.status(201).json({ sucesso: true, mensagem: 'Reserva realizada!', id: result.insertId, protocolo: protocolo });
    } catch (error) {
        console.error("Erro ao criar reserva:", error);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
    }
};

// 2. Histórico do Usuário
exports.getReservasByUsuario = async (req, res) => {
    const { id } = req.params; 
    try {
        const sql = `
            SELECT r.id, r.protocolo, r.status, r.data_reserva, r.quantidade, 
            CASE WHEN r.status IN ('PENDENTE', 'CONFIRMADO') AND mp.medp_preco IS NOT NULL THEN (mp.medp_preco * r.quantidade) ELSE r.valor_total END AS valor_total,
            m.med_nome AS medicamento_nome, m.med_dosagem AS dosagem, f.farm_nome AS farmacia_nome
            FROM reservas r
            INNER JOIN medicamento m ON r.medicamento_id = m.med_id
            INNER JOIN farmacia f ON r.farmacia_id = f.farm_id
            LEFT JOIN medpreco mp ON r.medicamento_id = mp.medicamento_id AND r.farmacia_id = mp.farmacia_id
            WHERE r.usuario_id = ? AND r.visivel_usuario = 1 
            ORDER BY r.data_reserva DESC
        `;
        const [results] = await db.query(sql, [id]);
        res.status(200).json({ sucesso: true, dados: results });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar histórico.' });
    }
};

// 3. Painel da Farmácia
exports.getReservasByFarmacia = async (req, res) => {
    const { id } = req.params; 
    try {
        const sql = `
            SELECT r.id AS reserva_id, r.protocolo, r.status, r.data_reserva, r.quantidade, r.valor_total, r.valor_unitario,
            COALESCE(m.med_nome, 'Produto Excluído') AS medicamento_nome, COALESCE(m.med_dosagem, '-') AS dosagem,
            COALESCE(u.usu_nome, 'Cliente Excluído') AS usuario_nome, u.usu_cpf AS usuario_cpf
            FROM reservas r
            LEFT JOIN medicamento m ON r.medicamento_id = m.med_id
            LEFT JOIN usuarios u ON r.usuario_id = u.usu_id
            WHERE r.farmacia_id = ? AND r.visivel_farmacia = 1 
            ORDER BY r.data_reserva DESC
        `;
        const [results] = await db.query(sql, [id]);
        res.status(200).json({ sucesso: true, dados: results });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
    }
};

// 4. Atualizar Status
exports.updateStatusReserva = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const statusValidos = ['PENDENTE', 'CONFIRMADO', 'RETIRADO', 'CANCELADO'];
    if (!statusValidos.includes(status)) return res.status(400).json({ sucesso: false, mensagem: 'Status inválido.' });

    try {
        const sql = `UPDATE reservas SET status = ? WHERE id = ?`;
        const [result] = await db.query(sql, [status, id]);
        if (result.affectedRows === 0) return res.status(404).json({ sucesso: false, mensagem: 'Reserva não encontrada.' });
        res.status(200).json({ sucesso: true, mensagem: `Status atualizado.` });
    } catch (error) {
        return res.status(500).json({ sucesso: false, mensagem: 'Erro interno.' });
    }
};

// 5. Ocultar Reserva (Soft Delete)
// NOME PADRONIZADO: ocultarReserva
exports.ocultarReserva = async (req, res) => {
    const { id } = req.params;
    const { parte } = req.body; 

    if (!parte || !['usuario', 'farmacia'].includes(parte)) {
        return res.status(400).json({ sucesso: false, mensagem: 'Informe quem está excluindo.' });
    }

    try {
        // 1. Oculta
        const campo = parte === 'usuario' ? 'visivel_usuario' : 'visivel_farmacia';
        await db.query(`UPDATE reservas SET ${campo} = 0 WHERE id = ?`, [id]);

        // 2. Verifica se ambos ocultaram (Delete físico)
        const [rows] = await db.query('SELECT visivel_usuario, visivel_farmacia FROM reservas WHERE id = ?', [id]);
        if (rows.length > 0) {
            if (rows[0].visivel_usuario === 0 && rows[0].visivel_farmacia === 0) {
                await db.query('DELETE FROM reservas WHERE id = ?', [id]);
                console.log(`Reserva ${id} apagada permanentemente.`);
            }
        }
        res.status(200).json({ sucesso: true, mensagem: 'Removido do histórico.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor.' });
    }
};
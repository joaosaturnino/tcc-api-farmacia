const db = require('../dataBase/connection'); 

// 1. Listar Posts (Com contagem real de Likes, Comentários e o novo campo TIPO)
exports.listarPosts = async (req, res) => {
    const { usuario_id } = req.query; // Recebemos o ID do usuário para saber se ELE curtiu

    try {
        const sql = `
            SELECT 
                p.*, 
                u.usu_nome,
                -- Conta quantos likes o post tem na tabela de likes
                (SELECT COUNT(*) FROM comunidade_likes WHERE post_id = p.id) AS total_likes,
                -- Conta quantos comentários o post tem
                (SELECT COUNT(*) FROM comunidade_comentarios WHERE post_id = p.id) AS total_comentarios,
                -- Verifica se o usuário atual curtiu (retorna 1 ou 0)
                (SELECT COUNT(*) FROM comunidade_likes WHERE post_id = p.id AND usuario_id = ?) AS curtiu
            FROM comunidade_posts p
            JOIN usuarios u ON p.usuario_id = u.usu_id
            ORDER BY p.data_postagem DESC
        `;
        
        const [posts] = await db.query(sql, [usuario_id || 0]);
        res.status(200).json({ sucesso: true, dados: posts });
    } catch (error) {
        console.error("Erro ao listar posts:", error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro no servidor' });
    }
};

// 2. Criar Post (CORRIGIDO: Agora salva o TIPO)
exports.criarPost = async (req, res) => {
    // Adicionado 'tipo' na desestruturação
    const { usuario_id, medicamento_nome, farmacia_nome, preco, texto, tipo } = req.body;

    if (!usuario_id || !texto) {
        return res.status(400).json({ sucesso: false, mensagem: 'Texto obrigatório.' });
    }

    // Se o frontend não mandar o tipo, define como 'DICA' por padrão
    const tipoFinal = tipo || 'DICA';

    try {
        // Atualizado para incluir a coluna 'tipo'
        const sql = `INSERT INTO comunidade_posts (usuario_id, medicamento_nome, farmacia_nome, preco, texto, tipo) VALUES (?, ?, ?, ?, ?, ?)`;
        
        await db.query(sql, [usuario_id, medicamento_nome, farmacia_nome, preco, texto, tipoFinal]);
        
        res.status(201).json({ sucesso: true, mensagem: 'Post criado!' });
    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao postar.' });
    }
};

// 3. Toggle Like (Curtir ou Descurtir)
exports.toggleLike = async (req, res) => {
    const { id } = req.params; // ID do Post
    const { usuario_id } = req.body;

    try {
        // Verifica se já curtiu
        const [check] = await db.query('SELECT * FROM comunidade_likes WHERE post_id = ? AND usuario_id = ?', [id, usuario_id]);

        if (check.length > 0) {
            // Se já curtiu, REMOVE (Descurtir)
            await db.query('DELETE FROM comunidade_likes WHERE post_id = ? AND usuario_id = ?', [id, usuario_id]);
            return res.status(200).json({ sucesso: true, acao: 'descurtiu' });
        } else {
            // Se não curtiu, ADICIONA (Curtir)
            await db.query('INSERT INTO comunidade_likes (post_id, usuario_id) VALUES (?, ?)', [id, usuario_id]);
            return res.status(200).json({ sucesso: true, acao: 'curtiu' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ sucesso: false });
    }
};

// 4. Listar Comentários
exports.listarComentarios = async (req, res) => {
    const { postId } = req.params;
    try {
        const sql = `
            SELECT c.*, u.usu_nome 
            FROM comunidade_comentarios c
            JOIN usuarios u ON c.usuario_id = u.usu_id
            WHERE c.post_id = ?
            ORDER BY c.data_comentario ASC
        `;
        const [comentarios] = await db.query(sql, [postId]);
        res.status(200).json({ sucesso: true, dados: comentarios });
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};

// 5. Criar Comentário
exports.criarComentario = async (req, res) => {
    const { post_id, usuario_id, texto } = req.body;
    if (!texto) return res.status(400).json({ sucesso: false });

    try {
        await db.query('INSERT INTO comunidade_comentarios (post_id, usuario_id, texto) VALUES (?, ?, ?)', [post_id, usuario_id, texto]);
        res.status(201).json({ sucesso: true });
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};

// 6. Excluir Post
exports.excluirPost = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM comunidade_posts WHERE id = ?', [id]);
        res.status(200).json({ sucesso: true, mensagem: 'Post excluído' });
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};

// 7. Excluir Comentário
exports.excluirComentario = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM comunidade_comentarios WHERE id = ?', [id]);
        res.status(200).json({ sucesso: true, mensagem: 'Comentário excluído' });
    } catch (error) {
        res.status(500).json({ sucesso: false });
    }
};
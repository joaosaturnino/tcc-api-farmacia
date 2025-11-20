const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadImage = (destinationFolder) => {
    // Validação simples para garantir que o programador passou o nome da pasta
    if (!destinationFolder) {
        throw new Error("O nome da pasta de destino é obrigatório.");
    }

    // 1. Define o caminho completo: Raiz do Projeto + public + pasta_especifica
    const fullPath = path.join(process.cwd(), 'public', destinationFolder);

    // 2. Cria a pasta automaticamente se ela não existir
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    // 3. Configuração de Armazenamento
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // Indica onde salvar o arquivo
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            // Gera um nome único para não sobrescrever arquivos com mesmo nome.
            // Ex: 16982323-123123.png
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            
            // CORREÇÃO: Usa path.extname para pegar a extensão original do arquivo (.jpg, .png)
            // É mais seguro que tentar adivinhar pelo mimetype
            const extension = path.extname(file.originalname);
            
            cb(null, uniqueSuffix + extension);
        }
    });

    // 4. Filtro de Arquivos (Segurança)
    const fileFilter = (req, file, cb) => {
        const allowedMimes = [
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif',
            'image/webp' // Adicionei webp que é comum hoje
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true); // Aceita
        } else {
            cb(new Error('Formato inválido! Apenas imagens (JPEG, PNG, GIF, WEBP) são permitidas.'), false); // Rejeita
        }
    };

    // Retorna o objeto Multer configurado
    return multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5 // Limite de 5MB por arquivo
        },
        fileFilter: fileFilter
    });
}

module.exports = uploadImage;
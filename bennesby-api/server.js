// --- 1. Importar as "Ferramentas" ---
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// --- 2. Criar a "Cozinha" (App Express) ---
const app = express();
const PORT = 3000;

// --- 3. Configurações da Cozinha (Middlewares) ---
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. Configuração do MULTER (A "Recepção de Pacotes/Fotos") ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

// --- 5. Configuração da "Linha Telefônica" para o MySQL ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Bennesby@2025', // Sua senha
    database: 'bennesby_db'
};

// --- 6. A "Receita": Rota para "Salvar Colaborador" (com Foto!) ---
app.post('/api/colaboradores', upload.single('inputFotoColaborador'), async (req, res) => {
    
    console.log('Pedido de cadastro recebido!');

    const {
        situacao, nome, cpf, data_nascimento, unidade,
        setor, funcao, usuario_ad, usuario_apollo, email, ramal
    } = req.body;

    const fotoPath = req.file ? req.file.path : null;

    let dataNascimentoFormatada = null;
    if (data_nascimento) {
        const [dia, mes, ano] = data_nascimento.split('/');
        dataNascimentoFormatada = `${ano}-${mes}-${dia}`;
    }
    
    const sql = `
        INSERT INTO colaboradores 
        (situacao, nome, cpf, data_nascimento, unidade, setor, funcao, 
         foto_path, usuario_ad, usuario_apollo, email, ramal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        situacao, nome, cpf, dataNascimentoFormatada, unidade, setor,
        funcao, fotoPath, usuario_ad, usuario_apollo, email, ramal
    ];

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(sql, values);
        await connection.end();
        
        res.status(201).json({ 
            message: 'Colaborador salvo com sucesso!', 
            id: result.insertId 
        });

    } catch (error) {
        //
        // --- MUDANÇA IMPORTANTE AQUI (O "TRADUTOR" DE ERROS) ---
        //
        console.error('Erro no banco de dados:', error); // Para nós (devs) vermos o erro real

        let userMessage = 'Ocorreu um erro desconhecido ao salvar. Tente novamente.';

        // MySQL Erro 1062: Entrada duplicada (ER_DUP_ENTRY)
        if (error.code === 1062) {
            if (error.message.includes('colaboradores.cpf')) {
                // Pega o erro específico que você teve (CPF vazio ou duplicado)
                userMessage = 'O CPF informado já existe no sistema ou está em branco. Por favor, verifique o campo CPF.';
            } else if (error.message.includes('colaboradores.email')) {
                userMessage = 'O Email informado já existe no sistema. Por favor, verifique o campo Email.';
            } else {
                userMessage = 'Este item já foi cadastrado (entrada duplicada).';
            }
        }
        // Outros erros comuns (opcional, mas bom ter)
        else if (error.code === 'ER_DATA_TOO_LONG') {
             userMessage = 'Um dos campos excedeu o limite de caracteres permitido.';
        }

        // Enviamos um status de "Requisição Ruim" (400) e a mensagem traduzida
        res.status(400).json({ 
            error: 'Falha na validação dos dados.', 
            message: userMessage // A mensagem amigável!
        });
    }
});

// --- 7. Ligar o "Fogão" (Iniciar o Servidor) ---
app.listen(PORT, () => {
    console.log(`API (cozinha) está aberta e ouvindo na porta ${PORT} 🍳`);
    console.log('Pronto para receber pedidos do seu HTML!');
});
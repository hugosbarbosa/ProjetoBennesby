const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Bennesby@2025', // Confirme sua senha
    database: 'bennesby_db'
};

// --- 1. ROTA: SALVAR NOVO (POST) ---
app.post('/api/colaboradores', upload.any(), async (req, res) => {
    console.log('--- Novo Cadastro Recebido ---');
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();

        const { situacao, nome, cpf, data_nascimento, unidade, setor, funcao, usuario_ad, usuario_apollo, email, ramal } = req.body;
        
        const fotoColabFile = req.files.find(f => f.fieldname === 'inputFotoColaborador');
        const fotoPath = fotoColabFile ? fotoColabFile.path : null;
        
        let dataNasc = null;
        if (data_nascimento) dataNasc = data_nascimento.split('/').reverse().join('-');

        const [resultColab] = await connection.execute(`
            INSERT INTO colaboradores (situacao, nome, cpf, data_nascimento, unidade, setor, funcao, foto_path, usuario_ad, usuario_apollo, email, ramal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [situacao, nome, cpf, dataNasc, unidade, setor, funcao, fotoPath, usuario_ad, usuario_apollo, email, ramal]);

        const novoId = resultColab.insertId;

        // Telefonia
        if (req.body.telefonia_modelo) {
             await connection.execute(`INSERT INTO telefonia (colaborador_id, fabricante, modelo, imei, operadora, numero_chip) VALUES (?, ?, ?, ?, ?, ?)`, 
             [novoId, req.body.telefonia_fabricante, req.body.telefonia_modelo, req.body.telefonia_imei, req.body.telefonia_operadora, req.body.telefonia_numero]);
        }

        // Equipamento TI (PC)
        if (req.body.equip_modelo) {
             let dataContrato = null;
             if(req.body.equip_data_contrato) dataContrato = req.body.equip_data_contrato.split('/').reverse().join('-');
             await connection.execute(`INSERT INTO equipamentos_ti (colaborador_id, tipo, fabricante, modelo, serial_number, hostname, revenda_contrato, numero_contrato, data_contrato, prazo_meses, parceiro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
             [novoId, req.body.equip_tipo, req.body.equip_fabricante, req.body.equip_modelo, req.body.equip_serial, req.body.equip_hostname, req.body.equip_revenda, req.body.equip_contrato, dataContrato, req.body.equip_prazo, req.body.equip_parceiro]);
        }

        // Monitores
        if (req.body.monitores_dados) {
            const monitoresLista = JSON.parse(req.body.monitores_dados);
            for (const m of monitoresLista) {
                await connection.execute(`INSERT INTO equipamentos_ti (colaborador_id, tipo, fabricante, modelo, serial_number) VALUES (?, 'Monitor', ?, ?, ?)`, 
                [novoId, m.fabricante, m.modelo, m.serial]);
            }
        }

        // Termos
        if (req.body.termos_dados) {
            const termosLista = JSON.parse(req.body.termos_dados);
            for (let i = 0; i < termosLista.length; i++) {
                const t = termosLista[i];
                let dataAss = null;
                if(t.data) dataAss = t.data.split('/').reverse().join('-');
                
                const fEquip = req.files.find(f => f.fieldname === `termo_foto_equip_${i}`);
                const fPapel = req.files.find(f => f.fieldname === `termo_foto_papel_${i}`);

                await connection.execute(`INSERT INTO termos (colaborador_id, tipo_termo, equipamento_alvo, data_assinatura, caminho_foto_equip, caminho_foto_termo) VALUES (?, ?, ?, ?, ?, ?)`, 
                [novoId, t.tipo, t.equipamento, dataAss, fEquip ? fEquip.path : null, fPapel ? fPapel.path : null]);
            }
        }

        await connection.commit();
        res.status(201).json({ message: 'Sucesso!', id: novoId });

    } catch (error) {
        await connection.rollback();
        console.error('Erro no POST:', error);
        let msg = 'Erro ao salvar.';
        if (error.code === 'ER_DUP_ENTRY') msg = 'CPF ou Email duplicado.';
        res.status(400).json({ error: true, message: msg });
    } finally {
        await connection.end();
    }
});

// --- 2. ROTA: PESQUISAR (GET LISTA) ---
app.get('/api/colaboradores', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { q, unidade, setor, tem_notebook } = req.query;
        let sql = `
            SELECT c.id, c.nome, c.cpf, c.unidade, c.setor, c.funcao, c.situacao, c.foto_path,
            (SELECT hostname FROM equipamentos_ti WHERE colaborador_id = c.id AND tipo = 'Computador' LIMIT 1) as computador_host,
            (SELECT COUNT(*) FROM equipamentos_ti WHERE colaborador_id = c.id AND modelo LIKE '%Notebook%') as possui_notebook
            FROM colaboradores c WHERE 1=1 
        `;
        const params = [];

       if (q) { 
            // Busca por Nome OU CPF OU ID
            // O 'CAST' transforma o ID (número) em texto para podermos pesquisar "parte" dele também
            sql += ` AND (c.nome LIKE ? OR c.cpf LIKE ? OR CAST(c.id AS CHAR) LIKE ?)`; 
            params.push(`%${q}%`, `%${q}%`, `%${q}%`); 
        }
        if (unidade) { sql += ` AND c.unidade = ?`; params.push(unidade); }
        if (setor) { sql += ` AND c.setor = ?`; params.push(setor); }
        if (tem_notebook === 'sim') { sql += ` AND EXISTS (SELECT 1 FROM equipamentos_ti WHERE colaborador_id = c.id AND modelo LIKE '%Notebook%')`; }

        sql += ` ORDER BY c.id DESC`;
        const [rows] = await connection.execute(sql, params);

        const dadosFormatados = rows.map(colab => ({
            ...colab,
            foto_url: colab.foto_path ? `http://localhost:3000/${colab.foto_path.replace(/\\/g, '/')}` : null
        }));
        res.json(dadosFormatados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro na pesquisa' });
    } finally {
        await connection.end();
    }
});

// --- 3. ROTA: PEGAR UM (GET POR ID - VERSÃO BLINDADA) ---
app.get('/api/colaboradores/:id', async (req, res) => {
    const connection = await mysql.createConnection(dbConfig);
    try {
        const { id } = req.params;
        
        // Busca Dados Principais
        const [rows] = await connection.execute(`
            SELECT c.*, 
                   t.fabricante as tel_fab, t.modelo as tel_mod, t.imei as tel_imei, t.operadora as tel_ope, t.numero_chip as tel_num,
                   e.tipo as equip_tipo, e.fabricante as equip_fab, e.modelo as equip_mod, e.serial_number as equip_serial, 
                   e.hostname as equip_host, e.revenda_contrato as equip_rev, e.numero_contrato as equip_num, 
                   e.data_contrato as equip_data, e.prazo_meses as equip_prazo, e.parceiro as equip_parc
            FROM colaboradores c
            LEFT JOIN telefonia t ON c.id = t.colaborador_id
            LEFT JOIN equipamentos_ti e ON c.id = e.colaborador_id AND e.tipo != 'Monitor'
            WHERE c.id = ?
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Não encontrado' });
        const dados = rows[0];

        // --- CORREÇÃO DE DATAS (BLINDAGEM) ---
        // Garante que vira string YYYY-MM-DD sem quebrar se já for string ou se for Data
        if (dados.data_nascimento) {
            dados.data_nascimento = new Date(dados.data_nascimento).toISOString().split('T')[0];
        }
        
        // Arruma data do contrato do PC também, se existir
        if (dados.equip_data) {
            dados.equip_data = new Date(dados.equip_data).toISOString().split('T')[0];
        }

        // Arruma Foto
        if(dados.foto_path) {
            dados.foto_url = `http://localhost:3000/${dados.foto_path.replace(/\\/g, '/')}`;
        }
        
        // Busca Monitores
        const [monitores] = await connection.execute(`SELECT * FROM equipamentos_ti WHERE colaborador_id = ? AND tipo = 'Monitor'`, [id]);

        // Busca Termos
        const [termos] = await connection.execute(`SELECT * FROM termos WHERE colaborador_id = ?`, [id]);
        
        // Formatar termos
        const termosFormatados = termos.map(t => {
            let dataAss = '';
            if (t.data_assinatura) {
                dataAss = new Date(t.data_assinatura).toISOString().split('T')[0];
            }
            return {
                ...t,
                data_assinatura: dataAss,
                foto_equip_url: t.caminho_foto_equip ? `http://localhost:3000/${t.caminho_foto_equip.replace(/\\/g, '/')}` : null,
                foto_termo_url: t.caminho_foto_termo ? `http://localhost:3000/${t.caminho_foto_termo.replace(/\\/g, '/')}` : null
            };
        });

        res.json({ main: dados, monitores, termos: termosFormatados });

    } catch (error) {
        console.error("ERRO AO BUSCAR DETALHES:", error); // Isso vai mostrar o erro real no seu terminal
        res.status(500).json({ error: 'Erro ao buscar detalhes' });
    } finally {
        await connection.end();
    }
});

// --- 4. ROTA: ATUALIZAR COLABORADOR (PUT /:id) ---
app.put('/api/colaboradores/:id', upload.any(), async (req, res) => {
    console.log(`--- Atualizando ID ${req.params.id} ---`);
    const connection = await mysql.createConnection(dbConfig);

    try {
        await connection.beginTransaction();
        const { id } = req.params;
        
        // Dados recebidos do formulário
        const { situacao, nome, cpf, data_nascimento, unidade, setor, funcao, usuario_ad, usuario_apollo, email, ramal } = req.body;

        // 1. Atualiza a Tabela Principal (Colaboradores)
        // Lógica Inteligente: Só atualiza a foto se o usuário enviou uma nova.
        const fotoColabFile = req.files.find(f => f.fieldname === 'inputFotoColaborador');
        let dataNasc = null;
        if (data_nascimento) dataNasc = data_nascimento.split('/').reverse().join('-');

        let sql = `UPDATE colaboradores SET situacao=?, nome=?, cpf=?, data_nascimento=?, unidade=?, setor=?, funcao=?, usuario_ad=?, usuario_apollo=?, email=?, ramal=?`;
        const params = [situacao, nome, cpf, dataNasc, unidade, setor, funcao, usuario_ad, usuario_apollo, email, ramal];

        if (fotoColabFile) {
            sql += `, foto_path=?`; // Adiciona campo foto só se tiver arquivo novo
            params.push(fotoColabFile.path);
        }
        
        sql += ` WHERE id=?`;
        params.push(id);

        await connection.execute(sql, params);

        // 2. Atualiza Tabelas Filhas (Estratégia: Apagar Velhos -> Criar Novos)
        // Isso evita ter que verificar um por um qual mudou.

        // A. Telefonia
        await connection.execute('DELETE FROM telefonia WHERE colaborador_id = ?', [id]);
        if (req.body.telefonia_modelo) {
             await connection.execute(`INSERT INTO telefonia (colaborador_id, fabricante, modelo, imei, operadora, numero_chip) VALUES (?, ?, ?, ?, ?, ?)`, 
             [id, req.body.telefonia_fabricante, req.body.telefonia_modelo, req.body.telefonia_imei, req.body.telefonia_operadora, req.body.telefonia_numero]);
        }

        // B. Equipamento TI (PC Principal)
        // Deleta tudo que NÃO é monitor
        await connection.execute("DELETE FROM equipamentos_ti WHERE colaborador_id = ? AND tipo != 'Monitor'", [id]);
        if (req.body.equip_modelo) {
             let dataC = null;
             if(req.body.equip_data_contrato) dataC = req.body.equip_data_contrato.split('/').reverse().join('-');
             
             await connection.execute(`INSERT INTO equipamentos_ti (colaborador_id, tipo, fabricante, modelo, serial_number, hostname, revenda_contrato, numero_contrato, data_contrato, prazo_meses, parceiro) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
             [id, req.body.equip_tipo, req.body.equip_fabricante, req.body.equip_modelo, req.body.equip_serial, req.body.equip_hostname, req.body.equip_revenda, req.body.equip_contrato, dataC, req.body.equip_prazo, req.body.equip_parceiro]);
        }

        // C. Monitores (Loop)
        await connection.execute("DELETE FROM equipamentos_ti WHERE colaborador_id = ? AND tipo = 'Monitor'", [id]);
        if (req.body.monitores_dados) {
            const lista = JSON.parse(req.body.monitores_dados);
            for (const m of lista) {
                await connection.execute(`INSERT INTO equipamentos_ti (colaborador_id, tipo, fabricante, modelo, serial_number) VALUES (?, 'Monitor', ?, ?, ?)`, 
                [id, m.fabricante, m.modelo, m.serial]);
            }
        }

        // D. Termos
        // Nota: Ao editar, se não reenviar as fotos dos termos, elas podem se perder nesta estratégia simples de Delete/Insert.
        // Para manter simples, estamos resetando os termos.
        await connection.execute('DELETE FROM termos WHERE colaborador_id = ?', [id]);
        if (req.body.termos_dados) {
            const lista = JSON.parse(req.body.termos_dados);
            for (let i = 0; i < lista.length; i++) {
                const t = lista[i];
                let dataAss = null;
                if(t.data) dataAss = t.data.split('/').reverse().join('-');

                const fEquip = req.files.find(f => f.fieldname === `termo_foto_equip_${i}`);
                const fPapel = req.files.find(f => f.fieldname === `termo_foto_papel_${i}`);

                await connection.execute(`INSERT INTO termos (colaborador_id, tipo_termo, equipamento_alvo, data_assinatura, caminho_foto_equip, caminho_foto_termo) VALUES (?, ?, ?, ?, ?, ?)`, 
                [id, t.tipo, t.equipamento, dataAss, fEquip ? fEquip.path : null, fPapel ? fPapel.path : null]);
            }
        }

        await connection.commit();
        res.json({ message: 'Cadastro atualizado com sucesso!', id: id });

    } catch (error) {
        await connection.rollback();
        console.error('Erro no PUT:', error);
        res.status(500).json({ error: true, message: 'Erro ao atualizar dados.' });
    } finally {
        await connection.end();
    }
});

app.listen(PORT, () => { console.log(`API rodando na porta ${PORT} 🍳`); });
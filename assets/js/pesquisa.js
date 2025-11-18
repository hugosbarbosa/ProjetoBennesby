document.addEventListener("DOMContentLoaded", () => {
    console.log("Pesquisa.js carregado (v. Final - Sem Lápis).");

    const tabelaCorpo = document.getElementById('tabelaCorpo');
    const contadorResultados = document.getElementById('contadorResultados');
    
    // Elementos dos Filtros
    const filtroTexto = document.getElementById('filtroTexto');
    const filtroUnidade = document.getElementById('filtroUnidade');
    const filtroSetor = document.getElementById('filtroSetor');
    const filtroNotebook = document.getElementById('filtroNotebook');
    const formFiltros = document.getElementById('formFiltros');
    const btnLimpar = document.getElementById('btnLimpar');

    // Elementos da Busca Global
    const formBuscaGlobal = document.getElementById('formBuscaGlobal');
    const inputBuscaGlobal = document.getElementById('inputBuscaGlobal');

    // --- 1. LÓGICA DA BUSCA GLOBAL ---
    if (formBuscaGlobal) {
        formBuscaGlobal.addEventListener('submit', (e) => {
            e.preventDefault();
            const termo = inputBuscaGlobal.value;
            if (window.location.pathname.includes('pesquisa.html')) {
                filtroTexto.value = termo;
                carregarDados();
            } else {
                window.location.href = `pesquisa.html?q=${encodeURIComponent(termo)}`;
            }
        });
    }

    // --- 2. CARREGAR DADOS ---
    const carregarDados = async () => {
        try {
            tabelaCorpo.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border text-primary"></div><div class="mt-2">Buscando...</div></td></tr>';

            const params = new URLSearchParams();
            if (filtroTexto.value) params.append('q', filtroTexto.value);
            if (filtroUnidade.value) params.append('unidade', filtroUnidade.value);
            if (filtroSetor.value) params.append('setor', filtroSetor.value);
            if (filtroNotebook.checked) params.append('tem_notebook', 'sim');

            const url = `http://localhost:3000/api/colaboradores?${params.toString()}`;
            const response = await fetch(url);
            const dados = await response.json();

            renderizarTabela(dados);

        } catch (error) {
            console.error("Erro:", error);
            tabelaCorpo.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-4">Erro de conexão com o servidor. Verifique se o "node server.js" está rodando.</td></tr>';
        }
    };

    // --- 3. DESENHAR A TABELA ---
    const renderizarTabela = (dados) => {
        tabelaCorpo.innerHTML = '';
        contadorResultados.textContent = `${dados.length} encontrados`;

        if (dados.length === 0) {
            tabelaCorpo.innerHTML = '<tr><td colspan="8" class="text-center py-5 text-muted">Nenhum resultado encontrado.</td></tr>';
            return;
        }

        dados.forEach(colab => {
            const fotoHtml = colab.foto_url 
                ? `<img src="${colab.foto_url}" class="rounded-circle" style="width: 40px; height: 40px; object-fit: cover; border: 1px solid #ddd;">`
                : `<div class="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center" style="width: 40px; height: 40px;"><i class="bi bi-person-fill"></i></div>`;

            const statusBadge = colab.situacao === 'Ativo' 
                ? '<span class="badge bg-success-subtle text-success border border-success">Ativo</span>'
                : '<span class="badge bg-danger-subtle text-danger border border-danger">Inativo</span>';

            const notebookIcon = colab.possui_notebook 
                ? '<i class="bi bi-laptop text-primary" title="Possui Notebook"></i> Sim' 
                : '<span class="text-muted">-</span>';

            const row = document.createElement('tr');
            
            // AQUI ESTÁ A CORREÇÃO:
            // 1. Apenas UM botão (o olho)
            // 2. É um link <a> direto
            // 3. Alinhado à direita (text-end)
            row.innerHTML = `
                <td class="fw-bold text-muted">#${colab.id}</td>
                <td>${fotoHtml}</td>
                <td>
                    <div class="fw-bold text-dark">${colab.nome}</div>
                    <small class="text-muted">${colab.cpf}</small>
                </td>
                <td>
                    <div>${colab.setor}</div>
                    <small class="text-muted">${colab.unidade}</small>
                </td>
                <td><span class="badge bg-light text-dark border">${colab.computador_host || 'S/ PC'}</span></td>
                <td>${notebookIcon}</td>
                <td>${statusBadge}</td>
                
                <td class="text-end pe-4">
                    <a href="index.html?id=${colab.id}" class="btn btn-sm btn-outline-primary" title="Visualizar / Editar">
                        <i class="bi bi-eye"></i>
                    </a>
                </td>
            `;
            tabelaCorpo.appendChild(row);
        });
    };

    // --- 4. INICIALIZAÇÃO ---
    const urlParams = new URLSearchParams(window.location.search);
    const queryGlobal = urlParams.get('q');
    if (queryGlobal) {
        filtroTexto.value = queryGlobal;
    }

    formFiltros.addEventListener('submit', (e) => { e.preventDefault(); carregarDados(); });
    btnLimpar.addEventListener('click', () => { formFiltros.reset(); carregarDados(); });

    carregarDados();
});
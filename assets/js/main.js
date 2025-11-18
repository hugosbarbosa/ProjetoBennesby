document.addEventListener("DOMContentLoaded", () => {
  console.log("Main.js vFinal (Logic Match Fix) carregado.");

  // ==================================================================
  // 1. MODAL & UTILS
  // ==================================================================
  const responseModalElement = document.getElementById('responseModal');
  let responseModal; 
  if(responseModalElement) responseModal = new bootstrap.Modal(responseModalElement);

  const showAlertModal = (message, title, type = 'success') => {
    if(!responseModal) { alert(message); return; }
    const header = responseModalElement.querySelector('.modal-header');
    const titleEl = responseModalElement.querySelector('.modal-title');
    const bodyEl = responseModalElement.querySelector('.modal-body');
    
    header.classList.remove('bg-success', 'bg-danger', 'bg-warning');
    if (type === 'success') header.classList.add('bg-success');
    else if (type === 'danger') header.classList.add('bg-danger');
    else header.classList.add('bg-warning');

    titleEl.textContent = title;
    bodyEl.textContent = message;
    responseModal.show();
  };

  function formatDateToPT(isoDate) {
      if (!isoDate) return '';
      const [y, m, d] = isoDate.split('T')[0].split('-');
      return `${d}/${m}/${y}`;
  }

  const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };

  // ==================================================================
  // 2. MONITOR
  // ==================================================================
  const inputComputador = document.getElementById('inputComputador');
  const secaoMonitor = document.getElementById('secaoMonitor');

  const verificarMonitor = () => {
    if (!inputComputador || !secaoMonitor) return;
    if (inputComputador.value === 'Desktop') secaoMonitor.classList.remove('d-none');
    else secaoMonitor.classList.add('d-none');
  };

  if (inputComputador) {
      inputComputador.addEventListener('change', verificarMonitor);
      verificarMonitor();
  }

  const configurarPreviewImagem = (inputFileElement) => {
    if (!inputFileElement) return;
    const parentContainer = inputFileElement.closest(".foto-preview-container, #colaborador-foto-container");
    if (!parentContainer) return;
    const previewImg = parentContainer.querySelector("img");
    const defaultSrc = "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=FOTO&f=png";
    
    inputFileElement.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => { previewImg.src = e.target.result; };
        reader.readAsDataURL(file);
      } else {
        previewImg.src = defaultSrc;
      }
    });
  };

  // ==================================================================
  // 3. ITENS DINÂMICOS
  // ==================================================================
  const setupDynamicSection = (btnAddId, containerId, itemClass, removeBtnClass) => {
      const btnAdd = document.getElementById(btnAddId);
      const container = document.getElementById(containerId);
      let counter = 1;

      if (btnAdd && container) {
          btnAdd.addEventListener("click", () => {
              counter++;
              const template = container.querySelector(`.${itemClass}`);
              if (!template) return;

              const clone = template.cloneNode(true);
              clone.querySelectorAll("input, select").forEach(input => {
                  if(input.type !== "file" && input.type !== "checkbox") input.value = "";
                  else if(input.type === "checkbox") input.checked = false;
                  else input.value = null;
                  input.classList.remove('is-invalid');
                  input.disabled = false;
              });
              
              clone.querySelectorAll("img").forEach(img => img.src = "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=FOTO&f=png");
              clone.querySelectorAll("[id]").forEach(el => el.id = el.id.split("-")[0] + `-${counter}`);
              
              if(window.flatpickr) clone.querySelectorAll(".datepicker").forEach(el => flatpickr(el, { locale: "pt", dateFormat: "d/m/Y", allowInput: true }));
              clone.querySelectorAll('input[type="file"]').forEach(el => configurarPreviewImagem(el));

              const removeBtn = clone.querySelector(`.${removeBtnClass}`);
              if(removeBtn) removeBtn.style.display = "block";

              const devDiv = clone.querySelector('.campos-devolucao');
              if(devDiv) devDiv.style.opacity = '1';

              container.appendChild(clone);
          });

          container.addEventListener("click", (e) => {
              const btn = e.target.closest(`.${removeBtnClass}`);
              if(btn) btn.closest(`.${itemClass}`).remove();
          });
      }
  };

  setupDynamicSection("add-termo-btn", "termos-container", "termo-item", "remove-termo-btn");
  setupDynamicSection("add-monitor-btn", "monitores-container", "monitor-item", "btn-remove-monitor");

  const termosContainer = document.getElementById("termos-container");
  if(termosContainer) {
      termosContainer.addEventListener("click", (event) => {
          const target = event.target;
          if (target.closest(".remove-termo-btn")) {
            target.closest(".termo-item").remove();
          }
          
          // Visual Toggle (Opacidade)
          if (target.matches('.check-em-uso')) {
              const itemRow = target.closest('.termo-item');
              const devolucaoDiv = itemRow.querySelector('.campos-devolucao');
              
              if(devolucaoDiv) {
                  if (target.checked) {
                      devolucaoDiv.style.opacity = '0.4';
                      devolucaoDiv.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
                  } else {
                      devolucaoDiv.style.opacity = '1';
                      devolucaoDiv.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
                      
                      // Auto-preenche visualmente para ajudar o usuário
                      const selectEsquerda = itemRow.querySelector('select[name*="equipamento]"]');
                      const selectDireita = devolucaoDiv.querySelector('select');
                      if (selectEsquerda && selectDireita) selectDireita.value = selectEsquerda.value;
                  }
              }
          }
      });
  }

  // Plugins
  if(window.flatpickr) document.querySelectorAll(".datepicker").forEach(el => flatpickr(el, { locale: "pt", dateFormat: "d/m/Y", allowInput: true }));
  document.querySelectorAll('input[type="file"]').forEach(el => configurarPreviewImagem(el));
  const cpfInput = document.getElementById("inputCPF"); if(cpfInput && window.IMask) IMask(cpfInput, { mask: "000.000.000-00" });
  const chipInput = document.getElementById("inputNumeroChip"); if(chipInput && window.IMask) IMask(chipInput, { mask: "(00) 00000-0000" });
  const hostInput = document.getElementById("inputHostName"); if(hostInput) hostInput.addEventListener("input", () => hostInput.value = hostInput.value.toUpperCase());
  
  const selectSituacao = document.getElementById("inputSituacao");
  if (selectSituacao) {
    selectSituacao.addEventListener("change", () => {
       selectSituacao.classList.remove("bg-success", "bg-danger", "text-white");
       if (selectSituacao.value === "Ativo") selectSituacao.classList.add("bg-success", "text-white");
       else if (selectSituacao.value === "Inativo") selectSituacao.classList.add("bg-danger", "text-white");
    });
    selectSituacao.dispatchEvent(new Event('change'));
  }

  // ==================================================================
  // 4. CARREGAR DADOS (EDIÇÃO)
  // ==================================================================
  let isEditMode = false;
  let currentEditId = null;
  const formPrincipal = document.querySelector("form.row.g-3");
  const btnSubmit = formPrincipal ? formPrincipal.querySelector('button[type="submit"]') : null;

  async function carregarDadosParaEdicao(id) {
      try {
          if(formPrincipal) formPrincipal.classList.add('loading-effect');
          const response = await fetch(`http://localhost:3000/api/colaboradores/${id}`);
          if(!response.ok) throw new Error("Colaborador não encontrado");
          const data = await response.json();
          const m = data.main;

          isEditMode = true;
          currentEditId = id;

          setTimeout(() => {
              setVal('inputSituacao', m.situacao); setVal('inputName', m.nome); setVal('inputCPF', m.cpf);
              if(cpfInput && cpfInput.mask) cpfInput.mask.value = m.cpf;
              setVal('datepickerNascimento', formatDateToPT(m.data_nascimento));
              setVal('inputUnidade', m.unidade); setVal('inputSetor', m.setor); setVal('inputFuncao', m.funcao);
              setVal('inputUsuarioAD', m.usuario_ad); setVal('inputUsuarioApollo', m.usuario_apollo);
              setVal('inputEmail', m.email); setVal('inputRamal', m.ramal);
              if(m.foto_url) document.getElementById('imagePreviewColaborador').src = m.foto_url;
              
              setVal('inputFabricanteCelular', m.tel_fab); setVal('inputModeloCelular', m.tel_mod);
              setVal('inputIMEI', m.tel_imei); setVal('inputOperadora', m.tel_ope); setVal('inputNumeroChip', m.tel_num);
              
              setVal('inputComputador', m.equip_tipo);
              if(inputComputador) inputComputador.dispatchEvent(new Event('change'));
              setVal('inputFabricantePC', m.equip_fab); setVal('inputModeloPC', m.equip_mod); setVal('inputSerial', m.equip_serial);
              setVal('inputHostName', m.equip_host); setVal('inputRevenda', m.equip_rev); setVal('inputContrato', m.equip_num);
              setVal('datepickerContrato', formatDateToPT(m.equip_data)); setVal('inputPrazo', m.equip_prazo); setVal('inputParceiro', m.equip_parc);

              // Monitores
              document.querySelectorAll('.monitor-item').forEach((el, i) => { if(i>0) el.remove(); });
              if(data.monitores && data.monitores.length > 0) {
                  const btnAddMonitor = document.getElementById('add-monitor-btn');
                  const m1 = data.monitores[0];
                  setVal('inputFabricanteMonitor-1', m1.fabricante);
                  setVal('inputModeloMonitor-1', m1.modelo);
                  setVal('inputSerialMonitor-1', m1.serial_number);
                  for(let i = 1; i < data.monitores.length; i++) {
                      btnAddMonitor.click();
                      const items = document.querySelectorAll('.monitor-item');
                      const lastItem = items[items.length - 1];
                      const m = data.monitores[i];
                      lastItem.querySelector('.monitor-fabricante').value = m.fabricante;
                      lastItem.querySelector('.monitor-modelo').value = m.modelo;
                      lastItem.querySelector('.monitor-serial').value = m.serial_number;
                  }
              }

              // Termos (Lógica de Match)
              document.querySelectorAll('.termo-item').forEach((el, i) => { if(i>0) el.remove(); });
              if(data.termos && data.termos.length > 0) {
                  const btnAddTermo = document.getElementById('add-termo-btn');
                  const entregas = data.termos.filter(t => t.tipo_termo === 'Entrega');
                  const devolucoes = data.termos.filter(t => t.tipo_termo === 'Devolucao');

                  entregas.forEach((entrega, index) => {
                      let itemRow;
                      if (index === 0) { itemRow = document.querySelector('.termo-item'); }
                      else { btnAddTermo.click(); const rows = document.querySelectorAll('.termo-item'); itemRow = rows[rows.length - 1]; }

                      itemRow.querySelector('select[name*="equipamento]"]').value = entrega.equipamento_alvo;
                      itemRow.querySelector('input[name*="data_assinatura"]').value = formatDateToPT(entrega.data_assinatura);
                      const imgEquip = itemRow.querySelector('img[id*="imagePreviewEquip"]');
                      const imgPapel = itemRow.querySelector('img[id*="imagePreviewTermos"]');
                      if(entrega.foto_equip_url) imgEquip.src = entrega.foto_equip_url;
                      if(entrega.foto_termo_url) imgPapel.src = entrega.foto_termo_url;

                      const devolucaoIndex = devolucoes.findIndex(d => d.equipamento_alvo === entrega.equipamento_alvo);
                      const checkEmUso = itemRow.querySelector('.check-em-uso');
                      const devolucaoDiv = itemRow.querySelector('.campos-devolucao');

                      if (devolucaoIndex !== -1) {
                          const devolucao = devolucoes[devolucaoIndex];
                          devolucoes.splice(devolucaoIndex, 1);
                          checkEmUso.checked = false;
                          devolucaoDiv.style.opacity = '1';
                          devolucaoDiv.querySelectorAll('input, select, button').forEach(el => el.disabled = false);
                          itemRow.querySelector('select[name*="equipamento_devolucao"]').value = devolucao.equipamento_alvo;
                          itemRow.querySelector('input[name*="data_devolucao"]').value = formatDateToPT(devolucao.data_assinatura);
                      } else {
                          checkEmUso.checked = true;
                          devolucaoDiv.style.opacity = '0.4';
                          devolucaoDiv.querySelectorAll('input, select, button').forEach(el => el.disabled = true);
                      }
                  });
              }

              if(btnSubmit) { btnSubmit.textContent = "Salvar Alterações"; btnSubmit.classList.replace('btn-primary', 'btn-warning'); }
              if(selectSituacao) selectSituacao.dispatchEvent(new Event('change'));
              if(formPrincipal) formPrincipal.classList.remove('loading-effect');
          }, 300);
      } catch (error) {
          console.error(error);
          showAlertModal('Erro ao carregar dados.', 'Erro', 'danger');
          if(formPrincipal) formPrincipal.classList.remove('loading-effect');
      }
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlId = urlParams.get('id');
  const btnLimparEdicao = document.getElementById('btnLimparEdicao');
  const searchInput = document.getElementById('navbarSearchInput');
  if(urlId) {
      if(btnLimparEdicao) {
          btnLimparEdicao.classList.remove('d-none');
          if(searchInput) searchInput.placeholder = `Editando ID: ${urlId}`;
          btnLimparEdicao.addEventListener('click', () => { window.location.href = 'index.html'; });
      }
      carregarDadosParaEdicao(urlId);
  }

  // ==================================================================
  // 5. SUBMIT
  // ==================================================================
  if (formPrincipal) {
    formPrincipal.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      const nome = document.getElementById("inputName").value;
      const cpf = document.getElementById("inputCPF").value;
      const gridCheck = document.getElementById("gridCheck");
      let isValid = true;
      document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
      if (!nome.trim()) { document.getElementById("inputName").classList.add('is-invalid'); isValid = false; }
      if (!cpf.trim()) { document.getElementById("inputCPF").classList.add('is-invalid'); isValid = false; }
      if (!gridCheck.checked) { gridCheck.classList.add('is-invalid'); isValid = false; }
      if (!isValid) { showAlertModal('Verifique os campos obrigatórios.', 'Atenção', 'warning'); return; }

      const originalBtnText = btnSubmit.innerHTML;
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';

      const formData = new FormData();
      const append = (k, id) => { const el=document.getElementById(id); if(el) formData.append(k, el.value); }
      
      append("situacao", "inputSituacao"); append("nome", "inputName"); append("cpf", "inputCPF");
      append("data_nascimento", "datepickerNascimento"); append("unidade", "inputUnidade");
      append("setor", "inputSetor"); append("funcao", "inputFuncao");
      append("usuario_ad", "inputUsuarioAD"); append("usuario_apollo", "inputUsuarioApollo");
      append("email", "inputEmail"); append("ramal", "inputRamal");
      const fColab = document.getElementById("inputFotoColaborador");
      if (fColab && fColab.files[0]) formData.append("inputFotoColaborador", fColab.files[0]);

      append("telefonia_fabricante", "inputFabricanteCelular"); append("telefonia_modelo", "inputModeloCelular");
      append("telefonia_imei", "inputIMEI"); append("telefonia_operadora", "inputOperadora");
      append("telefonia_numero", "inputNumeroChip");
      append("equip_tipo", "inputComputador"); append("equip_fabricante", "inputFabricantePC");
      append("equip_modelo", "inputModeloPC"); append("equip_serial", "inputSerial");
      append("equip_hostname", "inputHostName"); append("equip_revenda", "inputRevenda");
      append("equip_contrato", "inputContrato"); append("equip_data_contrato", "datepickerContrato");
      append("equip_prazo", "inputPrazo"); append("equip_parceiro", "inputParceiro");

      if (document.getElementById("inputComputador").value === 'Desktop') {
          const monitores = [];
          document.querySelectorAll('.monitor-item').forEach(item => {
             const fab = item.querySelector('.monitor-fabricante').value;
             const mod = item.querySelector('.monitor-modelo').value;
             const ser = item.querySelector('.monitor-serial').value;
             if(fab || mod || ser) monitores.push({ fabricante: fab, modelo: mod, serial: ser });
          });
          formData.append('monitores_dados', JSON.stringify(monitores));
      }

      const termos = [];
      document.querySelectorAll('.termo-item').forEach((item, index) => {
        const sEquip = item.querySelector('select[name*="equipamento]"]');
        const iData = item.querySelector('input[name*="data_assinatura"]');
        const equipValue = sEquip ? sEquip.value : '';

        // 1. Salva Entrega
        termos.push({ tipo: 'Entrega', equipamento: equipValue, data: iData.value });
        const fEquip = item.querySelector('input[name*="foto_equip]"]');
        if (fEquip && fEquip.files[0]) formData.append(`termo_foto_equip_${index}`, fEquip.files[0]);
        const fPapel = item.querySelector('input[name*="foto_termo]"]');
        if (fPapel && fPapel.files[0]) formData.append(`termo_foto_papel_${index}`, fPapel.files[0]);

        // 2. Verifica Devolução
        const check = item.querySelector('.check-em-uso');
        
        // SE O BOTÃO ESTIVER DESMARCADO (DEVOLVEU)
        if (check && !check.checked) {
            const iDataDev = item.querySelector('input[name*="data_devolucao"]');
            
            // [CORREÇÃO CRÍTICA]: FORÇA O USO DO EQUIPAMENTO DA ESQUERDA
            // Ignora o que está selecionado no select da direita para garantir o par
            if (equipValue) {
                termos.push({ 
                    tipo: 'Devolucao', 
                    equipamento: equipValue, // Usa o mesmo nome da entrega!
                    data: iDataDev ? iDataDev.value : '' 
                });

                const idxD = index + 1000;
                const fEquipD = item.querySelector('input[name*="foto_equip_devolucao"]');
                if (fEquipD && fEquipD.files[0]) formData.append(`termo_foto_equip_${idxD}`, fEquipD.files[0]);
                const fPapelD = item.querySelector('input[name*="foto_termo_devolucao"]');
                if (fPapelD && fPapelD.files[0]) formData.append(`termo_foto_papel_${idxD}`, fPapelD.files[0]);
            }
        }
      });
      formData.append('termos_dados', JSON.stringify(termos));

      let url = "http://localhost:3000/api/colaboradores";
      let method = "POST";
      if (isEditMode && currentEditId) { url += `/${currentEditId}`; method = "PUT"; }

      try {
        const response = await fetch(url, { method: method, body: formData });
        const res = await response.json();
        if (!response.ok) throw new Error(res.message || res.error);
        showAlertModal(isEditMode ? 'Dados atualizados com sucesso!' : `Cadastrado! ID: ${res.id}`, 'Sucesso', 'success');
        responseModalElement.addEventListener('hidden.bs.modal', () => {
            if (isEditMode) window.location.href = 'index.html'; 
            else window.location.reload();
        }, { once: true });
      } catch (error) {
        console.error(error);
        showAlertModal(`Erro: ${error.message}`, 'Falha', 'danger');
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalBtnText;
      }
    });
  }

  // 6. BUSCA INTELIGENTE
  const navbarSearchForm = document.getElementById('navbarSearchForm');
  if (navbarSearchForm) {
      navbarSearchForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const term = document.getElementById('navbarSearchInput').value.trim();
          if (!term) return;
          try {
              if (!isNaN(term)) {
                  const responseId = await fetch(`http://localhost:3000/api/colaboradores/${term}`);
                  if (responseId.ok) {
                      const dataId = await responseId.json();
                      const id = dataId.main.id;
                      const newUrl = new URL(window.location);
                      newUrl.searchParams.set('id', id);
                      window.history.pushState({}, '', newUrl);
                      if (window.location.pathname.includes('index.html') || window.location.pathname === '/') window.location.reload();
                      else window.location.href = `index.html?id=${id}`;
                      return;
                  }
              }
              const response = await fetch(`http://localhost:3000/api/colaboradores?q=${encodeURIComponent(term)}`);
              const data = await response.json();
              if (data.length === 1) {
                  const id = data[0].id;
                  const newUrl = new URL(window.location);
                  newUrl.searchParams.set('id', id);
                  window.history.pushState({}, '', newUrl);
                  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') window.location.reload();
                  else window.location.href = `index.html?id=${id}`;
              } else if (data.length > 1) {
                  window.location.href = `pesquisa.html?q=${encodeURIComponent(term)}`;
              } else {
                  showAlertModal('Nenhum colaborador encontrado.', 'Não encontrado', 'warning');
              }
          } catch (error) {
              console.error("Erro na busca:", error);
          }
      });
  }
});
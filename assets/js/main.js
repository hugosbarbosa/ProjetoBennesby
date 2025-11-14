document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM carregado! main.js (v. Modal + Validação Completa) está funcionando.");

  // --- 1. PREPARAR O MODAL DE RESPOSTA ---
  const responseModalElement = document.getElementById('responseModal');
  const responseModal = new bootstrap.Modal(responseModalElement);
  const modalHeader = responseModalElement.querySelector('.modal-header');
  const modalTitle = responseModalElement.querySelector('.modal-title');
  const modalBody = responseModalElement.querySelector('.modal-body');

  /**
   * Mostra um Modal do Bootstrap na tela.
   * @param {string} message A mensagem para o corpo do modal.
   * @param {string} title O título para o cabeçalho.
   * @param {string} type 'success' (verde), 'danger' (vermelho), ou 'warning' (amarelo)
   */
  const showAlertModal = (message, title, type = 'success') => {
    modalHeader.classList.remove('bg-success', 'bg-danger', 'bg-warning'); // Limpa cores

    if (type === 'success') {
      modalHeader.classList.add('bg-success');
    } else if (type === 'danger') {
      modalHeader.classList.add('bg-danger');
    } else if (type === 'warning') {
      modalHeader.classList.add('bg-warning');
    }

    modalTitle.textContent = title;
    modalBody.textContent = message;

    responseModal.show();
  };
  // --- FIM DA PREPARAÇÃO DO MODAL ---


  // --- CÓDIGO ORIGINAL (PREVIEWS, MÁSCARAS, ETC.) ---
  const configurarPreviewImagem = (inputFileElement) => {
    if (!inputFileElement) return;
    const parentContainer = inputFileElement.closest(
      ".foto-preview-container, #colaborador-foto-container"
    );
    if (!parentContainer) return;

    const previewImg = parentContainer.querySelector("img");
    if (!previewImg) return;

    const defaultImgSrc =
      "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=FOTO&f=png";
    const pdfIconSrc =
      "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23dc3545' class='bi bi-file-earmark-pdf-fill' viewBox='0 0 16 16'%3e%3cpath d='M5.523 12.424q.21-.164.479-.164.27 0 .479.164.21.164.21.377a.72.72 0 0 1-.21.566q-.21.164-.479.164-.27 0-.479-.164a.72.72 0 0 1-.21-.566q0-.213.21-.377'/%3e%3cpath d='M4.603 14.087q-.42.215-.748.215a1.13 1.13 0 0 1-.933-.417q-.354-.417-.354-1.007c0-.666.318-1.17.933-1.17.346 0 .65.163.847.435l.12.166q.163.215.28.435a1.12 1.12 0 0 1 .148.566c0 .51-.158.94-.47 1.252m-1.57-.49c.26 0 .435-.14.53-.285l.04-.066q-.133-.28-.31-.49a.52.52 0 0 0-.49-.164q-.346 0-.53.224a.55.55 0 0 0-.188.468q0 .29.188.45a.53.53 0 0 0 .53.164'/%3e%3cpath d='M8.861 10.112q-.43.26-.74.26-.377 0-.633-.194a.72.72 0 0 1-.254-.577q0-.354.224-.53a.8.8 0 0 1 .592-.174q.318 0 .566.194l.053.066q.174.215.26.435.096.224.096.49 0 .329-.158.586a1.06 1.06 0 0 1-.417.417m-1.554.49q.318 0 .53-.157a.54.54 0 0 0 .194-.406q0-.23-.133-.385a.58.58 0 0 0-.406-.157q-.224 0-.354.12-.133.111-.133.266a.49.49 0 0 0 .12.354q.12.12.3.12'/%3e%3cpath fill-rule='evenodd' d='M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2.793a1 1 0 0 0 1 1H13v-.546l-1.745-1.745a.5.5 0 0 0-.707 0L8.5 6.207l-1.745-1.745a.5.5 0 0 0-.707 0L3 7.707V2.5a.5.5 0 0 1 .5-.5z'/%3e%3c/svg%3e";

    inputFileElement.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) {
        if (previewImg.id.includes("Termos")) {
          previewImg.src =
            "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=PDF&f=png";
        } else {
          previewImg.src = defaultImgSrc;
        }
        return;
      }
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => { (previewImg.src = e.target.result); };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        previewImg.src = pdfIconSrc;
      } else {
        previewImg.src = defaultImgSrc;
      }
    });
  };

  const addTermoBtn = document.getElementById("add-termo-btn");
  const termosContainer = document.getElementById("termos-container");
  let termoCounter = 1;

  if (addTermoBtn && termosContainer) {
    addTermoBtn.addEventListener("click", () => {
      termoCounter++;
      const template = termosContainer.querySelector(".termo-item");
      const clone = template.cloneNode(true);
      clone.querySelectorAll("input, select").forEach((input) => {
        if (input.type !== "file") { (input.value = ""); } else { (input.value = null); }
      });
      clone.querySelectorAll("img").forEach((img) => {
        if (img.id.includes("Termos")) {
          img.src =
            "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=PDF&f=png";
        } else {
          img.src =
            "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=FOTO&f=png";
        }
      });
      clone.querySelectorAll("[id]").forEach((element) => {
        element.id = element.id.split("-")[0] + `-${termoCounter}`;
      });
      clone.querySelectorAll("label[for]").forEach((label) => {
        const oldFor = label.getAttribute("for");
        if (oldFor) {
          label.setAttribute("for", oldFor.split("-")[0] + `-${termoCounter}`);
        }
      });
      clone.querySelectorAll("[name]").forEach((element) => {
        element.name = element.name.replace(/\[\d+\]/, `[${termoCounter}]`);
      });
      clone.querySelectorAll(".datepicker").forEach((newDatepicker) => {
        flatpickr(newDatepicker, flatpickrConfig);
      });
      clone.querySelectorAll('input[type="file"]').forEach((input) => {
        configurarPreviewImagem(input);
      });
      const removeBtn = clone.querySelector(".remove-termo-btn");
      if (removeBtn) removeBtn.style.display = "block";
      termosContainer.appendChild(clone);
    });
  }

  if (termosContainer) {
    termosContainer.addEventListener("click", (event) => {
      const removeButton = event.target.closest(".remove-termo-btn");
      if (removeButton) {
        removeButton.closest(".termo-item").remove();
      }
    });
  }

  const flatpickrConfig = {
    locale: "pt",
    dateFormat: "d/m/Y",
    allowInput: true,
  };
  document
    .querySelectorAll(".datepicker")
    .forEach((el) => flatpickr(el, flatpickrConfig));

  document
    .querySelectorAll('input[type="file"]')
    .forEach((input) => {
      configurarPreviewImagem(input);
    });

  const cpfInput = document.getElementById("inputCPF");
  if (cpfInput) IMask(cpfInput, { mask: "000.000.000-00" });

  const chipInput = document.getElementById("inputNumeroChip");
  if (chipInput) IMask(chipInput, { mask: "(00) 00000-0000" });

  const hostInput = document.getElementById("inputHostName");
  if (hostInput)
    hostInput.addEventListener(
      "input",
      () => (hostInput.value = hostInput.value.toUpperCase())
    );

  const selectSituacao = document.getElementById("inputSituacao");
  if (selectSituacao) {
    const atualizaCor = () => {
      selectSituacao.classList.remove("bg-success", "bg-danger", "text-white");
      if (selectSituacao.value === "Ativo") {
        selectSituacao.classList.add("bg-success", "text-white");
      } else if (selectSituacao.value === "Inativo") {
        selectSituacao.classList.add("bg-danger", "text-white");
      }
    };
    selectSituacao.addEventListener("change", atualizaCor);
    atualizaCor();
  }

  // --- CÓDIGO DA API (FETCH) ATUALIZADO ---
  const formPrincipal = document.querySelector("form.row.g-3");

  if (formPrincipal) {
    formPrincipal.addEventListener("submit", async (event) => {
      event.preventDefault();

      //
      // --- BLOCO DE VALIDAÇÃO ATUALIZADO ---
      //
      const nome = document.getElementById("inputName").value;
      const cpf = document.getElementById("inputCPF").value;
      const gridCheck = document.getElementById("gridCheck"); // Pega o checkbox

      // 1. Checa Nome e CPF
      if (!nome.trim() || !cpf.trim()) {
        showAlertModal('Os campos "Nome" e "CPF" são obrigatórios!', 'Campos Vazios', 'danger');
        return; 
      }

      // 2. Checa o "Confirmar dados"
      if (!gridCheck.checked) {
        showAlertModal('Você precisa "Confirmar os dados" antes de salvar.', 'Confirmação Pendente', 'warning'); // 'warning' é amarelo
        return;
      }
      // --- FIM DO BLOCO DE VALIDAÇÃO ---
      
      console.log("Formulário enviado! (Com FormData)");

      const formData = new FormData();
      formData.append("situacao", document.getElementById("inputSituacao").value);
      formData.append("nome", nome);
      formData.append("cpf", cpf);
      formData.append(
        "data_nascimento",
        document.getElementById("datepickerNascimento").value
      );
      formData.append("unidade", document.getElementById("inputUnidade").value);
      formData.append("setor", document.getElementById("inputSetor").value);
      formData.append("funcao", document.getElementById("inputFuncao").value);
      formData.append(
        "usuario_ad",
        document.getElementById("inputUsuarioAD")?.value
      );
      formData.append(
        "usuario_apollo",
        document.getElementById("inputUsuarioApollo")?.value
      );
      formData.append("email", document.getElementById("inputEmail").value);
      formData.append("ramal", document.getElementById("inputRamal").value);

      const inputFoto = document.getElementById("inputFotoColaborador");
      if (inputFoto.files[0]) {
        formData.append("inputFotoColaborador", inputFoto.files[0]);
      }

      console.log("Enviando FormData para a API...");

      try {
        const response = await fetch(
          "http://localhost:3000/api/colaboradores",
          {
            method: "POST",
            body: formData,
          }
        );

        const resultado = await response.json();

        if (!response.ok) {
          throw new Error(
            resultado.message || `Erro da API: ${response.statusText}`
          );
        }

        const successMessage = `Cadastro salvo com sucesso!! Você é o colaborador ${resultado.id}`;
        showAlertModal(successMessage, 'Sucesso!', 'success');
        
        //
        // --- CÓDIGO CORRETO PARA "TRAVAR" A TELA ---
        //
        // Adiciona um "ouvinte" que só roda UMA VEZ.
        // Ele espera o modal ser totalmente fechado (pelo "OK" ou "X")
        // e SÓ ENTÃO limpa o formulário.
        responseModalElement.addEventListener('hidden.bs.modal', () => {
            formPrincipal.reset(); // Limpa os campos
            // Reseta a cor do <select> de Situação
            selectSituacao.dispatchEvent(new Event('change')); 
            // Reseta a imagem de preview
            document.getElementById("imagePreviewColaborador").src =
              "https://via.assets.so/img.jpg?w=400&h=400&gradientFrom=56CCF2&gradientTo=2F80ED&gradientAngle=135&text=FOTO&f=png";
        }, { once: true }); // {once: true} faz o ouvinte se auto-destruir.

      } catch (error) {
        console.error("Erro ao enviar pedido:", error);
        showAlertModal(`Falha ao salvar: ${error.message}`, 'Erro no Cadastro', 'danger');
      }
    });
  }
});
/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DO PAINEL GERAL DE CONTRATOS (R$ 14,2M) • LDO & LOA
 * Arquivo: js/app-contratos.js
 * ============================================================================
 */

window.app = window.app || {};
window.app.render = window.app.render || {};

app.contratos = {
  // CALCULA O SEMÁFORO DE VENCIMENTOS COM BASE NA DATA ATUAL
  calculateStatus(dataVencimentoIso, statusRegistro) {
    if (statusRegistro === "Arquivado") {
      return { label: "Arquivado", badgeClass: "semaforo-arquivado", isUrgente: false };
    }

    if (!dataVencimentoIso) {
      return { label: "Sem Data", badgeClass: "semaforo-atencao", isUrgente: false };
    }

    const hoje = new Date(2026, 8, 21); // Data de referência do exercício (21/09/2026)
    const [ano, mes, dia] = dataVencimentoIso.split('-').map(Number);
    const venc = new Date(ano, mes - 1, dia);

    const diffTempo = venc.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

    if (diasRestantes < 0) {
      return { label: `Vencido há ${Math.abs(diasRestantes)} dias`, badgeClass: "semaforo-critico", isUrgente: true, dias: diasRestantes };
    } else if (diasRestantes <= 30) {
      return { label: `Vence em ${diasRestantes} dias!`, badgeClass: "semaforo-critico", isUrgente: true, dias: diasRestantes };
    } else if (diasRestantes <= 90) {
      return { label: `Atenção: ${diasRestantes} dias`, badgeClass: "semaforo-atencao", isUrgente: false, dias: diasRestantes };
    } else {
      return { label: `Vigente (${diasRestantes} dias)`, badgeClass: "semaforo-vigente", isUrgente: false, dias: diasRestantes };
    }
  },

  DEFAULT_FISCAIS: ["ADRI", "FRAN", "LASIER", "NAIARA", "PREFEITURA", "SANDRO"],

  getFiscais() {
    let list = [];
    try {
      const raw = localStorage.getItem('torres_fiscais_v1');
      if (raw) list = JSON.parse(raw);
    } catch(e) {}
    if (!Array.isArray(list) || list.length === 0) {
      list = [...this.DEFAULT_FISCAIS];
    }
    if (app.state.panelContracts) {
      app.state.panelContracts.forEach(c => {
        if (c.fiscal) {
          const fUpper = String(c.fiscal).trim().toUpperCase();
          if (fUpper && !list.includes(fUpper)) list.push(fUpper);
        }
      });
    }
    return Array.from(new Set(list.map(f => String(f).trim().toUpperCase()))).filter(Boolean).sort();
  },

  saveFiscais(list) {
    try {
      localStorage.setItem('torres_fiscais_v1', JSON.stringify(list));
    } catch(e) {}
  },

  populateFiscalSelect(selectEl, selectedVal) {
    if (!selectEl) return;
    const fiscais = this.getFiscais();
    const curr = (selectedVal || selectEl.value || fiscais[0] || '').toUpperCase();
    selectEl.innerHTML = fiscais.map(f => `<option value="${f}" ${f === curr ? 'selected' : ''}>${f}</option>`).join('');
    if (!fiscais.includes(curr) && curr) {
      selectEl.innerHTML += `<option value="${curr}" selected>${curr}</option>`;
    }
  },

  populateYearSelect(selectEl, selectedYear) {
    if (!selectEl) return;
    const currentYear = 2026;
    const startYear = 2018;
    const target = Number(selectedYear) || currentYear;
    let html = '';
    for (let y = currentYear; y >= startYear; y--) {
      html += `<option value="${y}" ${y === target ? 'selected' : ''}>${y}</option>`;
    }
    if (target < startYear) {
      html += `<option value="${target}" selected>${target}</option>`;
    }
    selectEl.innerHTML = html;
  },

  openAddFiscalModal(targetSelectId) {
    app.state.targetFiscalSelectId = targetSelectId;
    const m = document.getElementById('modal-adicionar-fiscal');
    const input = document.getElementById('input-novo-fiscal');
    if (input) input.value = '';
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
      setTimeout(() => input && input.focus(), 80);
    }
  },

  closeAddFiscalModal() {
    const m = document.getElementById('modal-adicionar-fiscal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
    app.state.targetFiscalSelectId = null;
  },

  saveNewFiscalFromModal() {
    const input = document.getElementById('input-novo-fiscal');
    const nome = input ? input.value.trim().toUpperCase() : '';
    if (!nome) return app.ui.toast("Digite o nome ou sigla do fiscal.", "warning", "Campo Obrigatório");
    
    let list = this.getFiscais();
    if (!list.includes(nome)) {
      list.push(nome);
      list.sort();
      this.saveFiscais(list);
    }
    
    const targetId = app.state.targetFiscalSelectId;
    if (targetId) {
      const selectEl = document.getElementById(targetId);
      if (selectEl) {
        this.populateFiscalSelect(selectEl, nome);
        selectEl.value = nome;
      }
    }
    this.closeAddFiscalModal();
    app.ui.toast(`Fiscal "${nome}" cadastrado com sucesso!`, "success", "Fiscais");
  },

  deleteSelectedFiscal(selectId) {
    if (!app.admin.isAdminUser()) {
      return app.ui.toast("Apenas o Administrador tem permissão para excluir fiscais cadastrados.", "warning", "Acesso Restrito");
    }
    const selectEl = document.getElementById(selectId);
    if (!selectEl) return;
    const fiscal = selectEl.value;
    if (!fiscal) return;

    if (!confirm(`Deseja realmente remover o fiscal "${fiscal}" da lista de fiscais?`)) return;

    let list = this.getFiscais().filter(f => f !== fiscal);
    this.saveFiscais(list);
    this.populateFiscalSelect(selectEl, list[0] || '');
    app.ui.toast(`Fiscal "${fiscal}" removido com sucesso.`, "info", "Fiscais");
  },

  onDateChange(mode) {
    const dateInput = document.getElementById(mode === 'new' ? 'panel-new-venc-iso' : 'panel-edit-venc-iso');
    const prazoInput = document.getElementById(mode === 'new' ? 'panel-new-prazo-txt' : 'panel-edit-prazo-txt');
    if (!dateInput || !prazoInput) return;
    const val = dateInput.value;
    if (val && !prazoInput.value.trim()) {
      const [ano, mes, dia] = val.split('-');
      if (ano && mes && dia) {
        prazoInput.value = `Até ${dia}/${mes}/${ano}`;
      }
    }
  },

  applyRubrica(novoTexto, textoOriginal, usuario) {
    const novo = String(novoTexto || '').trim();
    const orig = String(textoOriginal || '').trim();
    if (!novo) return '';
    if (novo === orig) return orig;

    const now = new Date();
    const dataHora = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    if (!novo.startsWith('[')) {
      return `[${usuario} em ${dataHora}]: ${novo}`;
    }
    return `${novo} | [${usuario} em ${dataHora}]`;
  },

  openNewModal() {
    if (!app.permissions.can('panel_create')) return app.ui.toast("Sem permissão para cadastrar contratos no painel.", "warning", "Acesso Restrito");
    const m = document.getElementById('modal-novo-painel-contrato');
    if (m) {
      m.classList.remove('hidden'); m.classList.add('flex');
      document.getElementById('panel-new-empresa').value = '';
      document.getElementById('panel-new-ctt-num').value = '';
      this.populateYearSelect(document.getElementById('panel-new-ctt-ano'), 2026);
      this.populateFiscalSelect(document.getElementById('panel-new-fiscal'));
      document.getElementById('panel-new-valor').value = '';
      document.getElementById('panel-new-venc-iso').value = '';
      document.getElementById('panel-new-prazo-txt').value = '';
      document.getElementById('panel-new-objeto').value = '';
      document.getElementById('panel-new-observacao').value = '';
      setTimeout(() => document.getElementById('panel-new-empresa').focus(), 80);
    }
  },

  closeNewModal() {
    const m = document.getElementById('modal-novo-painel-contrato');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  async saveNewContract(e) {
    e.preventDefault();
    const empresa = document.getElementById('panel-new-empresa').value.trim();
    let numCtt = document.getElementById('panel-new-ctt-num').value.replace(/[^0-9]/g, '').slice(0, 5);
    const anoCtt = document.getElementById('panel-new-ctt-ano').value;
    const valor = parseFloat(document.getElementById('panel-new-valor').value) || 0;
    const dataIso = document.getElementById('panel-new-venc-iso').value;
    const fiscal = document.getElementById('panel-new-fiscal').value.toUpperCase();
    const prazoTxt = document.getElementById('panel-new-prazo-txt').value.trim();
    const objeto = document.getElementById('panel-new-objeto').value.trim();
    const obsTxt = document.getElementById('panel-new-observacao').value.trim();

    if (!empresa || !numCtt || !dataIso) return app.ui.toast("Preencha ao menos Empresa, Nº do Contrato e Vencimento.", "warning", "Campos Obrigatórios");

    const numeroCtt = `${numCtt}/${anoCtt}`;
    const now = new Date();
    const criadoEm = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const criadoPor = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';
    const observacao = obsTxt ? this.applyRubrica(obsTxt, '', criadoPor) : '';

    const newObj = {
      id: Date.now(), empresa, numeroCtt, prazoVencimento: prazoTxt,
      dataVencimentoIso: dataIso, valorContrato: valor, fiscal,
      status: "Ativo", objeto, criadoEm, criadoPor, observacao
    };

    if (!app.state.panelContracts) app.state.panelContracts = [];
    app.state.panelContracts.unshift(newObj);
    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(app.state.panelContracts);
    }
    this.closeNewModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Cadastrando Contrato",
        subtitle: "Gravando dados do contrato na planilha",
        step1: "Validando dados do contrato",
        step2: "Registrando na planilha Google Sheets",
        step3: "Atualizando mural institucional",
        icon: "📋"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "CREATE_PANEL_CONTRACT",
        contract: newObj
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast("Contrato cadastrado com sucesso!", "success", "Painel de Contratos");
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  openEditModal(id) {
    if (!app.permissions.can('panel_edit')) return app.ui.toast("Sem permissão para editar contratos no painel.", "warning", "Acesso Restrito");
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    document.getElementById('panel-edit-id').value = item.id;
    document.getElementById('panel-edit-empresa').value = item.empresa;

    let num = '';
    let ano = '2026';
    if (String(item.numeroCtt).includes('/')) {
      const parts = String(item.numeroCtt).split('/');
      num = parts[0].replace(/[^0-9]/g, '').slice(0, 5);
      ano = parts[1].trim() || '2026';
    } else {
      num = String(item.numeroCtt).replace(/[^0-9]/g, '').slice(0, 5);
    }
    document.getElementById('panel-edit-ctt-num').value = num;
    this.populateYearSelect(document.getElementById('panel-edit-ctt-ano'), ano);
    this.populateFiscalSelect(document.getElementById('panel-edit-fiscal'), item.fiscal);

    document.getElementById('panel-edit-valor').value = item.valorContrato;
    document.getElementById('panel-edit-venc-iso').value = item.dataVencimentoIso;
    document.getElementById('panel-edit-prazo-txt').value = item.prazoVencimento;
    document.getElementById('panel-edit-objeto').value = item.objeto || '';
    
    const obsEl = document.getElementById('panel-edit-observacao');
    const badgeEl = document.getElementById('panel-edit-obs-rubrica-badge');
    obsEl.value = item.observacao || '';
    if (item.observacao) {
      badgeEl.textContent = 'Possui registro';
      badgeEl.title = item.observacao;
    } else {
      badgeEl.textContent = '';
      badgeEl.title = '';
    }

    const m = document.getElementById('modal-editar-painel-contrato');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  },

  closeEditModal() {
    const m = document.getElementById('modal-editar-painel-contrato');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  async confirmEdit(e) {
    e.preventDefault();
    if (!app.permissions.can('panel_edit')) return app.ui.toast("Sem permissão para editar contratos no painel.", "warning", "Acesso Restrito");
    const id = Number(document.getElementById('panel-edit-id').value);
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    let numCtt = document.getElementById('panel-edit-ctt-num').value.replace(/[^0-9]/g, '').slice(0, 5);
    const anoCtt = document.getElementById('panel-edit-ctt-ano').value;
    if (!numCtt) return app.ui.toast("Preencha o número do contrato.", "warning", "Campo Obrigatório");

    const currentUser = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';
    const newObs = document.getElementById('panel-edit-observacao').value.trim();
    const obsFinal = this.applyRubrica(newObs, item.observacao || '', currentUser);

    item.empresa = document.getElementById('panel-edit-empresa').value.trim();
    item.numeroCtt = `${numCtt}/${anoCtt}`;
    item.valorContrato = parseFloat(document.getElementById('panel-edit-valor').value) || 0;
    item.dataVencimentoIso = document.getElementById('panel-edit-venc-iso').value;
    item.fiscal = document.getElementById('panel-edit-fiscal').value.toUpperCase();
    item.prazoVencimento = document.getElementById('panel-edit-prazo-txt').value.trim();
    item.objeto = document.getElementById('panel-edit-objeto').value.trim();
    item.observacao = obsFinal;

    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(app.state.panelContracts);
    }
    this.closeEditModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Atualizando Contrato",
        subtitle: "Sincronizando alterações na planilha",
        step1: "Processando alterações",
        step2: "Atualizando linha no Google Sheets",
        step3: "Finalizando sincronização",
        icon: "✏️"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_PANEL_CONTRACT",
        contract: item
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast("Contrato atualizado com sucesso!", "success", "Painel de Contratos");
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // ARQUIVAR / DESARQUIVAR (PRESERVAÇÃO DO HISTÓRICO LDO)
  async toggleArchive(id) {
    if (!app.permissions.can('panel_archive')) return app.ui.toast("Sem permissão para arquivar contratos.", "warning", "Acesso Restrito");
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    const novoStatus = item.status === "Arquivado" ? "Ativo" : "Arquivado";
    item.status = novoStatus;

    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(app.state.panelContracts);
    }
    app.render.contratosHub(document.getElementById('app-viewport'));

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: novoStatus === "Arquivado" ? "Arquivando Contrato" : "Desarquivando Contrato",
        subtitle: "Atualizando status na planilha",
        step1: "Identificando registro institucional",
        step2: "Registrando novo status no Google Sheets",
        step3: "Atualizando painel de visualização",
        icon: "📁"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "ARCHIVE_PANEL_CONTRACT",
        id: id,
        status: novoStatus
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast(`Contrato ${novoStatus.toLowerCase()} com sucesso!`, "info", "Painel de Contratos");
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // EXCLUSÃO BLINDADA (DIGITAÇÃO OBRIGATÓRIA SEM COLAR - SÓ ADMINISTRADOR)
  openDeleteModal(id) {
    if (!app.admin.isAdminUser()) return app.ui.toast("Apenas o Administrador tem permissão para excluir contratos.", "warning", "Acesso Restrito");
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    app.state.deletePanelTarget = item;
    document.getElementById('panel-delete-target-id').value = item.id;
    document.getElementById('panel-delete-expected-ctt').textContent = item.numeroCtt;
    document.getElementById('panel-delete-typed-ctt').value = '';
    document.getElementById('panel-delete-error-msg').classList.add('hidden');

    document.getElementById('panel-delete-preview-empresa').textContent = item.empresa;
    document.getElementById('panel-delete-preview-valor').textContent = `R$ ${item.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    document.getElementById('panel-delete-preview-fiscal').textContent = item.fiscal;

    const m = document.getElementById('modal-excluir-painel-contrato');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); setTimeout(() => document.getElementById('panel-delete-typed-ctt').focus(), 80); }
  },

  closeDeleteModal() {
    app.state.deletePanelTarget = null;
    const m = document.getElementById('modal-excluir-painel-contrato');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  blockPaste(e) {
    e.preventDefault();
    app.ui.toast("Por segurança institucional, digite o número do contrato manualmente.", "warning", "Bloqueio de Colagem");
    return false;
  },

  async confirmDelete(e) {
    e.preventDefault();
    const target = app.state.deletePanelTarget;
    if (!target) return;

    const typed = document.getElementById('panel-delete-typed-ctt').value.trim();
    const errEl = document.getElementById('panel-delete-error-msg');

    if (typed.toLowerCase() !== String(target.numeroCtt).trim().toLowerCase()) {
      errEl.textContent = `Número incorreto! Você digitou "${typed}", mas o contrato é "${target.numeroCtt}".`;
      errEl.classList.remove('hidden');
      return;
    }

    app.state.panelContracts = app.state.panelContracts.filter(c => c.id !== target.id);
    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(app.state.panelContracts);
    }
    this.closeDeleteModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Excluindo Contrato",
        subtitle: "Removendo registro da planilha",
        step1: "Verificando autorização administrativa",
        step2: "Excluindo linha no Google Sheets",
        step3: "Finalizando exclusão",
        icon: "🗑️"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "DELETE_PANEL_CONTRACT",
        id: target.id
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast(`Contrato ${target.numeroCtt} (${target.empresa}) excluído definitivamente.`, "info", "Contrato Excluído");
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao excluir na planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // FILTROS & BUSCA EM TEMPO REAL (SEM PERDER FOCO DO INPUT)
  setFilter(f) {
    app.state.panelContractsFilter = f;
    const container = document.getElementById('painel-contratos-content');
    if (container) {
      document.querySelectorAll('[data-panel-filter]').forEach(btn => {
        const filterType = btn.getAttribute('data-panel-filter');
        if (filterType === f) {
          if (filterType === 'CRITICOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap bg-rose-600 text-white shadow-xs";
          } else if (filterType === 'ATENCAO') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-amber-500 text-slate-950 shadow-xs";
          } else if (filterType === 'ARQUIVADOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-600 text-white shadow-xs";
          } else {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-900 text-white shadow-xs";
          }
        } else {
          if (filterType === 'CRITICOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap bg-rose-100 text-rose-800 hover:bg-rose-200";
          } else if (filterType === 'ATENCAO') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-amber-100 text-amber-800 hover:bg-amber-200";
          } else if (filterType === 'ARQUIVADOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-100 text-slate-500 hover:bg-slate-200";
          } else {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-100 text-slate-600 hover:bg-slate-200";
          }
        }
      });
      this.updateContent();
    } else {
      app.render.contratosHub(document.getElementById('app-viewport'));
    }
  },

  setFiscal(fiscal) {
    app.state.panelFiscalFilter = fiscal;
    this.updateContent();
  },

  setSearch(val) {
    app.state.panelSearch = (val || '').toLowerCase();
    const clearBtn = document.getElementById('panel-contratos-search-clear');
    if (clearBtn) {
      if (app.state.panelSearch.trim().length > 0) {
        clearBtn.classList.remove('hidden');
      } else {
        clearBtn.classList.add('hidden');
      }
    }
    this.updateContent();
  },

  clearSearch() {
    app.state.panelSearch = '';
    const inp = document.getElementById('panel-contratos-search-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
    const clearBtn = document.getElementById('panel-contratos-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.updateContent();
  },

  switchViewMode(mode) {
    app.state.panelViewMode = mode;
    const isCards = mode === 'CARDS';
    const btnCards = document.getElementById('panel-btn-cards');
    const btnTabela = document.getElementById('panel-btn-tabela');
    if (btnCards && btnTabela) {
      btnCards.className = `p-1.5 rounded-lg text-xs font-bold transition ${isCards ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`;
      btnTabela.className = `p-1.5 rounded-lg text-xs font-bold transition ${!isCards ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}`;
    }
    this.updateContent();
  },

  updateContent() {
    const container = document.getElementById('painel-contratos-content');
    if (container) {
      container.innerHTML = this.renderContentHtml();
    } else {
      const vp = document.getElementById('app-viewport');
      if (vp) app.render.contratosHub(vp);
    }
    const countEl = document.getElementById('panel-filtered-count');
    if (countEl) {
      const list = this.getFilteredList();
      const total = (app.state.panelContracts || []).length;
      countEl.textContent = `Exibindo ${list.length} de ${total} contratos`;
    }
  },

  getFilteredList() {
    let list = app.state.panelContracts || [];

    const normalize = (str) => String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return list.filter(c => {
      const semaforo = this.calculateStatus(c.dataVencimentoIso, c.status);

      // Filtro Status / Semáforo
      let matchStatus = true;
      if (app.state.panelContractsFilter === 'ATIVOS') matchStatus = c.status !== 'Arquivado';
      else if (app.state.panelContractsFilter === 'CRITICOS') matchStatus = semaforo.isUrgente && c.status !== 'Arquivado';
      else if (app.state.panelContractsFilter === 'ATENCAO') matchStatus = semaforo.label.includes('Atenção') && c.status !== 'Arquivado';
      else if (app.state.panelContractsFilter === 'VIGENTES') matchStatus = semaforo.label.includes('Vigente') && c.status !== 'Arquivado';
      else if (app.state.panelContractsFilter === 'ARQUIVADOS') matchStatus = c.status === 'Arquivado';

      // Filtro Fiscal
      let matchFiscal = (!app.state.panelFiscalFilter || app.state.panelFiscalFilter === 'TODOS') || (c.fiscal === app.state.panelFiscalFilter);

      // Busca Textual Normalizada
      let s = (app.state.panelSearch || '').trim();
      let matchSearch = true;
      if (s) {
        const normS = normalize(s);
        const searchable = [
          c.empresa,
          c.numeroCtt,
          c.fiscal,
          c.objeto,
          c.observacao,
          c.prazoVencimento,
          c.status,
          semaforo.label
        ].map(x => normalize(x)).join(' ');

        matchSearch = searchable.includes(normS);
      }

      return matchStatus && matchFiscal && matchSearch;
    });
  },

  renderCard(c) {
    const sem = this.calculateStatus(c.dataVencimentoIso, c.status);
    const isArch = c.status === 'Arquivado';
    return `
      <div class="bg-white rounded-[2rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group relative ${isArch ? 'opacity-70 bg-slate-50' : ''}">
          <div>
              <!-- TOPO DO CARD: SEMÁFORO E FISCAL -->
              <div class="flex items-center justify-between gap-1.5 mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sem.badgeClass}">
                      ${sem.label}
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-black text-slate-700">
                      FISCAL: ${c.fiscal}
                  </span>
              </div>

              <!-- NOME DA EMPRESA E NÚMERO DO CONTRATO -->
              <h3 class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2" title="${c.empresa}">
                  ${c.empresa}
              </h3>
              <span class="block text-xs font-mono font-bold text-blue-600 mt-1">CTT: ${c.numeroCtt}</span>

              <!-- DADOS FINANCEIROS E PRAZO -->
              <div class="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                  <div class="flex justify-between">
                      <span class="text-slate-400 font-bold text-[10px] uppercase">Valor Anual:</span>
                      <span class="font-black text-slate-900 text-xs">R$ ${c.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div class="flex justify-between">
                      <span class="text-slate-400 font-bold text-[10px] uppercase">Vencimento:</span>
                      <span class="font-bold text-slate-700 text-[11px]">${c.prazoVencimento}</span>
                  </div>
              </div>

              ${c.objeto ? `<p class="text-[11px] text-slate-500 italic mt-2 line-clamp-2">${c.objeto}</p>` : ''}

              <!-- OBSERVAÇÃO INSTITUCIONAL COM RUBRICA -->
              ${c.observacao ? `
                <div class="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
                  <span class="font-black text-[10px] text-amber-800 uppercase tracking-wide flex items-center gap-1 mb-0.5">
                    📝 Observação:
                  </span>
                  <span class="break-words line-clamp-3" title="${c.observacao}">${c.observacao}</span>
                </div>
              ` : ''}
          </div>

          <!-- AÇÕES NO RODAPÉ -->
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              ${app.permissions.can('panel_archive') ? `
                <button onclick="app.contratos.toggleArchive(${c.id})" class="text-[11px] font-bold text-slate-400 hover:text-slate-700">
                    ${isArch ? '↩️ Desarquivar' : '📁 Arquivar'}
                </button>
              ` : `<span></span>`}

              <div class="flex items-center gap-1.5">
                  ${app.permissions.can('panel_edit') ? `
                    <button onclick="app.contratos.openEditModal(${c.id})" title="Editar Contrato" class="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded-lg font-bold">
                        ✏️
                    </button>
                  ` : ''}
                  ${app.admin.isAdminUser() ? `
                    <button onclick="app.contratos.openDeleteModal(${c.id})" title="Excluir Definitivo (Administrador)" class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg font-bold">
                        🗑️
                    </button>
                  ` : ''}
              </div>
          </div>
      </div>
    `;
  },

  renderTableRow(c) {
    const sem = this.calculateStatus(c.dataVencimentoIso, c.status);
    return `
      <tr class="hover:bg-slate-50">
          <td class="p-3.5 font-bold text-slate-900">
              <div>${c.empresa}</div>
              ${c.observacao ? `<div class="text-[10px] text-amber-800 font-semibold italic mt-0.5 max-w-sm truncate" title="${c.observacao}">📝 ${c.observacao}</div>` : ''}
          </td>
          <td class="p-3.5 font-mono text-blue-700 font-bold">${c.numeroCtt}</td>
          <td class="p-3.5 text-right font-black text-slate-900">R$ ${c.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">${c.fiscal}</span></td>
          <td class="p-3.5 text-slate-600 text-xs">${c.prazoVencimento}</td>
          <td class="p-3.5 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sem.badgeClass}">${sem.label}</span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap print:hidden">
              ${app.permissions.can('panel_edit') ? `<button onclick="app.contratos.openEditModal(${c.id})" class="text-slate-600 hover:text-amber-700 font-bold mr-1.5" title="Editar">✏️</button>` : ''}
              ${app.permissions.can('panel_archive') ? `<button onclick="app.contratos.toggleArchive(${c.id})" class="text-slate-400 hover:text-slate-700 font-bold mr-1.5" title="Arquivar">📁</button>` : ''}
              ${app.admin.isAdminUser() ? `<button onclick="app.contratos.openDeleteModal(${c.id})" class="text-rose-500 hover:text-rose-700 font-bold" title="Excluir">🗑️</button>` : ''}
          </td>
      </tr>
    `;
  },

  renderContentHtml() {
    const filteredList = this.getFilteredList();
    const isCardsMode = (app.state.panelViewMode || 'CARDS') === 'CARDS';

    if (filteredList.length === 0) {
      if (app.data && app.data.isSyncing) {
        return `
          <div class="col-span-full p-12 text-center text-slate-500 font-medium text-xs bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center">
            <div class="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <span class="text-sm font-black text-slate-800">Carregando Contratos da Planilha...</span>
            <span class="text-slate-400 text-xs mt-1">Sincronizando dados em tempo real com o Google Sheets</span>
          </div>
        `;
      }
      return `
        <div class="col-span-full p-12 text-center text-slate-400 font-medium text-xs bg-white rounded-2xl border border-slate-200">
          <span class="block text-2xl mb-2">🔍</span>
          Nenhum contrato encontrado para os filtros ou busca selecionados.
        </div>
      `;
    }

    if (isCardsMode) {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${filteredList.map(c => this.renderCard(c)).join('')}
        </div>
      `;
    } else {
      return `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="custom-scroll overflow-y-auto max-h-[640px] relative">
            <table id="table-painel-contratos" class="w-full text-left border-collapse text-xs">
              <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
                <tr>
                  <th class="p-3.5 min-w-[220px]">Empresa / Prestador</th>
                  <th class="p-3.5 w-28">Nº CTT</th>
                  <th class="p-3.5 text-right w-36">Valor Contrato (R$)</th>
                  <th class="p-3.5 w-28">Fiscal</th>
                  <th class="p-3.5 min-w-[200px]">Vencimento / Prazo</th>
                  <th class="p-3.5 text-center w-36">Situação</th>
                  <th class="p-3.5 text-center w-28 print:hidden">Ações</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 font-medium">
                ${filteredList.map(c => this.renderTableRow(c)).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  },

  exportCSV() {
    const list = this.getFilteredList();
    const headers = ["ID", "Empresa", "Numero_CTT", "Objeto", "Observacao", "Fiscal", "Prazo_Vencimento", "Vencimento_ISO", "Valor_Contrato", "Situacao"];
    const rows = list.map(c => {
      const sem = this.calculateStatus(c.dataVencimentoIso, c.status);
      return [
        c.id, `"${c.empresa.replace(/"/g, '""')}"`, `"${c.numeroCtt}"`, `"${(c.objeto || '').replace(/"/g, '""')}"`,
        `"${(c.observacao || '').replace(/"/g, '""')}"`, `"${c.fiscal}"`, `"${c.prazoVencimento}"`, `"${c.dataVencimentoIso}"`, c.valorContrato, `"${sem.label}"`
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Painel_Contratos_Saude_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// ============================================================================
// TELA PRINCIPAL: PAINEL GERAL DE CONTRATOS (MURAL VISUAL & LDO/LOA)
// ============================================================================
app.render.contratosHub = function(el) {
  const allContracts = app.state.panelContracts || [];
  const activeContracts = allContracts.filter(c => c.status !== 'Arquivado');
  
  // CÁLCULOS DOS KPIS SOLICITADOS
  const totalContratos = activeContracts.length;
  const montanteGlobal = activeContracts.reduce((acc, c) => acc + (c.valorContrato || 0), 0);
  const valorMedio = totalContratos > 0 ? (montanteGlobal / totalContratos) : 0;
  
  // MAIOR CONTRATO
  let maiorContrato = { valorContrato: 0, empresa: "Nenhum", numeroCtt: "" };
  activeContracts.forEach(c => {
    if (c.valorContrato > maiorContrato.valorContrato) maiorContrato = c;
  });

  const filteredList = app.contratos.getFilteredList();
  const isCardsMode = (app.state.panelViewMode || 'CARDS') === 'CARDS';

  el.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">
        
        <div class="mb-4">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Voltar para o Portal de Acessos</span>
            </button>
        </div>

        <!-- CABEÇALHO DO PAINEL -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Governança Fiscal • Lei nº 5.627 (LDO Torres)</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Painel & Gestão Geral de Contratos</h2>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">Mural visual de monitoramento de vigências, semáforo de alerta e previsão orçamentária.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="app.contratos.exportCSV()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                    📥 Exportar Relatório LDO (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                    🖨️ Imprimir
                </button>
                ${app.permissions.can('panel_create') ? `
                  <button onclick="app.contratos.openNewModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                      <span class="text-sm">+</span> Novo Contrato no Mural
                  </button>
                ` : ''}
            </div>
        </div>

        <!-- OS 4 KPIS OBRIGATÓRIOS DO TOPO -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- 1. TOTAL DE CONTRATOS -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Contratos Ativos</span>
                <p class="text-2xl font-black text-slate-900 mt-1">${totalContratos}</p>
                <span class="text-[10px] text-slate-400">Contratos contínuos em execução</span>
            </div>

            <!-- 2. VALOR MÉDIO -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Médio por Contrato</span>
                <p class="text-xl sm:text-2xl font-black text-blue-700 mt-1">R$ ${valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-slate-400">Média por ajuste formal</span>
            </div>

            <!-- 3. MAIOR CONTRATO -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 bg-indigo-50/30">
                <span class="text-[10px] font-black text-indigo-900 uppercase tracking-wider">Maior Contrato em Vigor</span>
                <p class="text-lg sm:text-xl font-black text-indigo-900 mt-1 truncate" title="${maiorContrato.empresa}">R$ ${maiorContrato.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-indigo-700 font-bold truncate block">${maiorContrato.empresa} (${maiorContrato.numeroCtt})</span>
            </div>

            <!-- 4. MONTANTE GLOBAL LDO -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 bg-emerald-50/30">
                <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wider">Total Contratualizado (FMS)</span>
                <p class="text-xl sm:text-2xl font-black text-emerald-800 mt-1">R$ ${montanteGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-emerald-700 font-bold">Reserva continuada para LOA 2027</span>
            </div>
        </div>

        <!-- BARRA DE FILTROS & FISCAIS -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-4 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            <!-- BUSCA EM TEMPO REAL -->
            <div class="relative flex-1">
                <input type="text" id="panel-contratos-search-input" oninput="app.contratos.setSearch(this.value)" value="${app.state.panelSearch || ''}" placeholder="Buscar em tempo real por empresa, número CTT, fiscal ou serviço..." class="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 transition font-medium">
                <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                <button id="panel-contratos-search-clear" onclick="app.contratos.clearSearch()" class="${(app.state.panelSearch || '').trim() ? '' : 'hidden'} absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1" title="Limpar busca">✕</button>
            </div>

            <!-- FILTRO POR FISCAL -->
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Fiscal:</span>
                <select onchange="app.contratos.setFiscal(this.value)" class="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 uppercase">
                    <option value="TODOS" ${app.state.panelFiscalFilter === 'TODOS' ? 'selected' : ''}>Todos os Fiscais</option>
                    ${app.contratos.getFiscais().map(f => `<option value="${f}" ${app.state.panelFiscalFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </div>

            <!-- FILTRO POR SEMÁFORO / STATUS -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button data-panel-filter="ATIVOS" onclick="app.contratos.setFilter('ATIVOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ATIVOS' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    Ativos (${activeContracts.length})
                </button>
                <button data-panel-filter="CRITICOS" onclick="app.contratos.setFilter('CRITICOS')" class="px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${app.state.panelContractsFilter === 'CRITICOS' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}">
                    🔴 Críticos (< 30d)
                </button>
                <button data-panel-filter="ATENCAO" onclick="app.contratos.setFilter('ATENCAO')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ATENCAO' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}">
                    🟡 Atenção
                </button>
                <button data-panel-filter="ARQUIVADOS" onclick="app.contratos.setFilter('ARQUIVADOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ARQUIVADOS' ? 'bg-slate-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                    📁 Arquivados
                </button>
            </div>

            <!-- ALTERNAR MURAL / TABELA -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button id="panel-btn-cards" onclick="app.contratos.switchViewMode('CARDS')" title="Mural de Cards (Estilo Parede)" class="p-1.5 rounded-lg text-xs font-bold transition ${isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}">
                    🗂️ Mural
                </button>
                <button id="panel-btn-tabela" onclick="app.contratos.switchViewMode('TABELA')" title="Tabela Analítica Financeira" class="p-1.5 rounded-lg text-xs font-bold transition ${!isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}">
                    📊 Tabela
                </button>
            </div>

        </div>

        <!-- CONTADOR DE CONTRATOS -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
            <span id="panel-filtered-count">Exibindo ${filteredList.length} de ${allContracts.length} contratos</span>
        </div>

        <!-- CONTEÚDO DINÂMICO (MURAL DE CARDS OU TABELA ANALÍTICA) -->
        <div id="painel-contratos-content">
            ${app.contratos.renderContentHtml()}
        </div>

    </div>
  `;
};

/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE DOTAÇÕES: Livro Digital de Pedidos, Baixa Contábil e Rastreabilidade
 * Arquivo: js/app-dotacoes.js
 * Fluxo em 3 Etapas Institucionais:
 *   1. Comprador: Entrada rápida de SF, 1Doc, Objeto, Ata, Processo (com edição livre)
 *   2. Setor Financeiro: Fila com 1 clique para Dotar (zero digitação manual)
 *   3. Comprador: Complementação de Empenho, Situação e Patrimônio (opcional)
 * Sem alert() • Notificações Desktop, Toasts e Pesquisa Dinâmica em Tempo Real
 * ============================================================================
 */

window.app = window.app || {};
window.app.render = window.app.render || {};

app.dotacoes = {
  // --------------------------------------------------------------------------
  // CONTROLE DINÂMICO DE EMENDA PARLAMENTAR (TOGGLE CHECKBOX)
  // --------------------------------------------------------------------------
  toggleEmendaField(context) {
    let chkId = 'dot-field-check-emenda';
    let wrapId = 'dot-wrap-emenda-nova';
    let inpId = 'dot-field-emenda';

    if (context === 'edit') {
      chkId = 'edit-dot-check-emenda';
      wrapId = 'edit-wrap-emenda';
      inpId = 'edit-dot-emenda';
    } else if (context === 'comp') {
      chkId = 'comp-dot-check-emenda';
      wrapId = 'comp-wrap-emenda';
      inpId = 'comp-dot-emenda';
    }

    const chk = document.getElementById(chkId);
    const wrap = document.getElementById(wrapId);
    const inp = document.getElementById(inpId);

    if (wrap) {
      if (chk && chk.checked) {
        wrap.classList.remove('hidden');
        setTimeout(() => { if (inp) inp.focus(); }, 60);
      } else {
        wrap.classList.add('hidden');
        if (inp) inp.value = '';
      }
    }
  },

  // --------------------------------------------------------------------------
  // ETAPA 1: NOVO PEDIDO (COMPRADOR)
  // --------------------------------------------------------------------------
  openNewModal(clearForm = true) {
    if (!app.permissions.can('dotacoes_create')) {
      return app.ui.toast("Seu perfil de acesso não tem permissão para cadastrar pedidos de dotação.", "warning", "Acesso Restrito");
    }

    const modal = document.getElementById('modal-nova-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      if (clearForm) {
        const sfEl = document.getElementById('dot-field-sf');
        const doc1El = document.getElementById('dot-field-1doc');
        const objEl = document.getElementById('dot-field-objeto');
        const ataEl = document.getElementById('dot-field-ata');
        const procEl = document.getElementById('dot-field-processo');
        const valEl = document.getElementById('dot-field-valor');
        const empEl = document.getElementById('dot-field-empenho');
        const sitEl = document.getElementById('dot-field-situacao');
        const chkEmenda = document.getElementById('dot-field-check-emenda');
        const wrapEmenda = document.getElementById('dot-wrap-emenda-nova');
        const emendaEl = document.getElementById('dot-field-emenda');

        if (sfEl) sfEl.value = '';
        if (doc1El) doc1El.value = '';
        if (objEl) objEl.value = '';
        if (ataEl) ataEl.value = '';
        if (procEl) procEl.value = '';
        if (valEl) valEl.value = '';
        if (empEl) empEl.value = '';
        if (sitEl) sitEl.value = '';
        if (chkEmenda) chkEmenda.checked = false;
        if (wrapEmenda) wrapEmenda.classList.add('hidden');
        if (emendaEl) emendaEl.value = '';
      }

      setTimeout(() => {
        const sfEl = document.getElementById('dot-field-sf');
        if (sfEl) sfEl.focus();
      }, 80);
    }
  },

  closeNewModal() {
    const modal = document.getElementById('modal-nova-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async saveNewDotacao(e) {
    if (e) e.preventDefault();

    const sf = (document.getElementById('dot-field-sf')?.value || '').trim();
    const doc1 = (document.getElementById('dot-field-1doc')?.value || '').trim();
    const objeto = (document.getElementById('dot-field-objeto')?.value || '').trim();
    const ata = (document.getElementById('dot-field-ata')?.value || '').trim();
    const processo = (document.getElementById('dot-field-processo')?.value || '').trim();
    const valor = (document.getElementById('dot-field-valor')?.value || '').trim();
    const empenho = (document.getElementById('dot-field-empenho')?.value || '').trim();
    const situacao = (document.getElementById('dot-field-situacao')?.value || '').trim();
    const isEmenda = document.getElementById('dot-field-check-emenda')?.checked;
    const emenda = isEmenda ? (document.getElementById('dot-field-emenda')?.value || '').trim() : '';

    if (!sf || !objeto) {
      return app.ui.toast("Preencha pelo menos o Nº da SF e o Objeto/Destinação.", "warning", "Campos Obrigatórios");
    }

    const compradorNome = (app.state.auth.user && (app.state.auth.user.nome || app.state.auth.user.usuario)) || '';
    const compradorLogin = (app.state.auth.user && app.state.auth.user.usuario) || '';
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord = {
      id: Date.now(),
      sf: sf,
      ata: ata,
      processo: processo,
      objeto: objeto,
      doc1: doc1,
      empenho: empenho,
      situacao: situacao || "Aguardando dotação do setor financeiro",
      patrimonio: "",
      status: empenho ? "DOTADO" : "AGUARDANDO",
      emenda: emenda,
      comprador: compradorNome,
      compradorLogin: compradorLogin,
      dataSolicitacao: dataHoraStr,
      validador: empenho ? "Setor Financeiro" : "",
      validadorLogin: empenho ? "financeiro" : "",
      dataValidacao: empenho ? dataHoraStr : "",
      valor: valor || ""
    };

    app.state.dotacoes.unshift(newRecord);
    app.data.saveLocalDotacoes();

    this.closeNewModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    // Feedback visual suave e notificação para o computador
    app.ui.toast(`Pedido SF ${sf} encaminhado com sucesso para a fila do Setor Financeiro!`, "success", "✓ Pedido Registrado");
    app.notifications.send("Novo Pedido de Dotação Registrado", `SF ${sf}: ${objeto.length > 55 ? objeto.substring(0, 55) + '...' : objeto}`);

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Registrando Pedido de Dotação",
        subtitle: `Enviando SF ${sf} para a planilha Google Sheets`,
        step1: "Validando campos obrigatórios",
        step2: "Registrando na planilha Google Sheets",
        step3: "Notificando fila do Setor Financeiro",
        icon: "📝"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "CREATE_DOTACAO",
        dotacao: newRecord
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar pedido com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // CORREÇÃO LIVRE DO COMPRADOR (EDITAR PEDIDO)
  // --------------------------------------------------------------------------
  openEditModal(id) {
    if (!app.permissions.can('dotacoes_edit')) {
      return app.ui.toast("Seu perfil de acesso não tem permissão para editar pedidos.", "warning", "Acesso Restrito");
    }

    const item = app.state.dotacoes.find(d => Number(d.id) === Number(id));
    if (!item) return;

    const idEl = document.getElementById('edit-dot-id');
    const sfEl = document.getElementById('edit-dot-sf');
    const doc1El = document.getElementById('edit-dot-1doc');
    const objEl = document.getElementById('edit-dot-objeto');
    const ataEl = document.getElementById('edit-dot-ata');
    const procEl = document.getElementById('edit-dot-processo');
    const valEl = document.getElementById('edit-dot-valor');
    const empEl = document.getElementById('edit-dot-empenho');
    const sitEl = document.getElementById('edit-dot-situacao');
    const chkEmenda = document.getElementById('edit-dot-check-emenda');
    const wrapEmenda = document.getElementById('edit-wrap-emenda');
    const emendaEl = document.getElementById('edit-dot-emenda');

    if (idEl) idEl.value = item.id;
    if (sfEl) sfEl.value = item.sf || '';
    if (doc1El) doc1El.value = item.doc1 || '';
    if (objEl) objEl.value = item.objeto || '';
    if (ataEl) ataEl.value = item.ata || '';
    if (procEl) procEl.value = item.processo || '';
    if (valEl) valEl.value = item.valor || '';
    if (empEl) empEl.value = item.empenho || '';
    if (sitEl) sitEl.value = item.situacao || '';

    if (item.emenda) {
      if (chkEmenda) chkEmenda.checked = true;
      if (wrapEmenda) wrapEmenda.classList.remove('hidden');
      if (emendaEl) emendaEl.value = item.emenda;
    } else {
      if (chkEmenda) chkEmenda.checked = false;
      if (wrapEmenda) wrapEmenda.classList.add('hidden');
      if (emendaEl) emendaEl.value = '';
    }

    const modal = document.getElementById('modal-editar-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => { if (sfEl) sfEl.focus(); }, 80);
    }
  },

  closeEditModal() {
    const modal = document.getElementById('modal-editar-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async saveEditDotacao(e) {
    if (e) e.preventDefault();

    const id = Number(document.getElementById('edit-dot-id')?.value);
    const item = app.state.dotacoes.find(d => Number(d.id) === id);
    if (!item) return;

    item.sf = (document.getElementById('edit-dot-sf')?.value || '').trim();
    item.doc1 = (document.getElementById('edit-dot-1doc')?.value || '').trim();
    item.objeto = (document.getElementById('edit-dot-objeto')?.value || '').trim();
    item.ata = (document.getElementById('edit-dot-ata')?.value || '').trim();
    item.processo = (document.getElementById('edit-dot-processo')?.value || '').trim();
    item.valor = (document.getElementById('edit-dot-valor')?.value || '').trim();
    item.empenho = (document.getElementById('edit-dot-empenho')?.value || '').trim();
    item.situacao = (document.getElementById('edit-dot-situacao')?.value || '').trim();
    const isEmenda = document.getElementById('edit-dot-check-emenda')?.checked;
    item.emenda = isEmenda ? (document.getElementById('edit-dot-emenda')?.value || '').trim() : '';

    if (item.empenho && (item.status === 'AGUARDANDO' || !item.status)) {
      item.status = 'DOTADO';
    }

    app.data.saveLocalDotacoes();
    this.closeEditModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    app.ui.toast(`Correções no pedido SF ${item.sf} salvas com sucesso!`, "success", "✓ Pedido Corrigido");

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Atualizando Pedido",
        subtitle: `Sincronizando correções de SF ${item.sf}`,
        step1: "Processando alterações nos campos",
        step2: "Atualizando linha no Google Sheets",
        step3: "Finalizando sincronização",
        icon: "✏️"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_DOTACAO",
        dotacao: item
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar correções com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // ETAPA 2: CHECK DO GESTOR FINANCEIRO - 1 CLIQUE, ZERO DIGITAÇÃO
  // --------------------------------------------------------------------------
  async dotarPedido(id) {
    if (!app.permissions.can('dotacoes_check')) {
      return app.ui.toast("Apenas o Gestor Financeiro e Administrador têm permissão para dotar pedidos.", "warning", "Acesso Restrito");
    }

    const item = app.state.dotacoes.find(d => Number(d.id) === Number(id));
    if (!item) return;

    const gestorNome = (app.state.auth.user && (app.state.auth.user.nome || app.state.auth.user.usuario)) || 'Setor Financeiro';
    const gestorLogin = (app.state.auth.user && app.state.auth.user.usuario) || 'financeiro';
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    item.status = "DOTADO";
    item.validador = gestorNome;
    item.validadorLogin = gestorLogin;
    item.dataValidacao = dataHoraStr;

    if (!item.situacao || item.situacao.includes("Aguardando dotação")) {
      item.situacao = `Dotação confirmada em ${dataHoraStr.split(' ')[0]} - aguardando empenho`;
    }

    app.data.saveLocalDotacoes();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    // Toasts e notificações de retorno ao comprador
    app.ui.toast(`Dotação aprovada para SF ${item.sf}! Pedido retornado ao comprador para empenho.`, "success", "✓ Pedido Dotado");
    app.notifications.send("Pedido Dotado pelo Financeiro!", `SF ${item.sf} foi validado por ${gestorNome}. Prossiga com o empenho e compra.`);

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Confirmando Dotação",
        subtitle: `Validando dotação financeira para SF ${item.sf}`,
        step1: "Registrando validação do gestor",
        step2: "Atualizando status na planilha Google Sheets",
        step3: "Liberando pedido para empenho",
        icon: "✓"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_DOTACAO_STATUS",
        id: item.id,
        status: "DOTADO",
        validador: gestorNome,
        validadorLogin: gestorLogin,
        dataValidacao: dataHoraStr,
        situacao: item.situacao
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar status de dotação com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // ETAPA 3: COMPLEMENTAÇÃO PÓS-DOTAÇÃO (COMPRADOR)
  // --------------------------------------------------------------------------
  openComplementarModal(id) {
    const item = app.state.dotacoes.find(d => Number(d.id) === Number(id));
    if (!item) return;

    const idEl = document.getElementById('comp-dot-id');
    const infoEl = document.getElementById('comp-info-pedido');
    const empEl = document.getElementById('comp-field-empenho');
    const sitEl = document.getElementById('comp-field-situacao');
    const patEl = document.getElementById('comp-field-patrimonio');
    const chkEmenda = document.getElementById('comp-dot-check-emenda');
    const wrapEmenda = document.getElementById('comp-wrap-emenda');
    const emendaEl = document.getElementById('comp-dot-emenda');

    if (idEl) idEl.value = item.id;
    if (infoEl) {
      infoEl.textContent = `SF: ${item.sf || '—'} | Ata: ${item.ata || '—'} | Processo: ${item.processo || '—'} • ${item.objeto ? (item.objeto.length > 50 ? item.objeto.substring(0, 50) + '...' : item.objeto) : ''}`;
    }
    if (empEl) empEl.value = item.empenho || '';
    if (sitEl) sitEl.value = item.situacao || '';
    if (patEl) patEl.value = item.patrimonio || '';

    if (item.emenda) {
      if (chkEmenda) chkEmenda.checked = true;
      if (wrapEmenda) wrapEmenda.classList.remove('hidden');
      if (emendaEl) emendaEl.value = item.emenda;
    } else {
      if (chkEmenda) chkEmenda.checked = false;
      if (wrapEmenda) wrapEmenda.classList.add('hidden');
      if (emendaEl) emendaEl.value = '';
    }

    const modal = document.getElementById('modal-complementar-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => { if (empEl) empEl.focus(); }, 80);
    }
  },

  closeComplementarModal() {
    const modal = document.getElementById('modal-complementar-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async saveComplementarDotacao(e) {
    if (e) e.preventDefault();

    const id = Number(document.getElementById('comp-dot-id')?.value);
    const item = app.state.dotacoes.find(d => Number(d.id) === id);
    if (!item) return;

    item.empenho = (document.getElementById('comp-field-empenho')?.value || '').trim();
    item.situacao = (document.getElementById('comp-field-situacao')?.value || '').trim();
    item.patrimonio = (document.getElementById('comp-field-patrimonio')?.value || '').trim();
    const isEmenda = document.getElementById('comp-dot-check-emenda')?.checked;
    item.emenda = isEmenda ? (document.getElementById('comp-dot-emenda')?.value || '').trim() : '';

    // Se possui empenho e a situação indica entrega/conclusão, evolui para CONCLUIDO
    const sitLower = item.situacao.toLowerCase();
    if (item.empenho && (sitLower.includes('nf') || sitLower.includes('entregue') || sitLower.includes('concluid') || sitLower.includes('recebido'))) {
      item.status = "CONCLUIDO";
    }

    app.data.saveLocalDotacoes();
    this.closeComplementarModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    app.ui.toast(`Dados de empenho e entrega vinculados ao pedido SF ${item.sf}!`, "success", "✓ Dados Atualizados");

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Atualizando Pedido",
        subtitle: `Registrando empenho de SF ${item.sf}`,
        step1: "Processando dados de empenho e entrega",
        step2: "Atualizando dados na planilha Google Sheets",
        step3: "Finalizando atualização",
        icon: "📦"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_DOTACAO",
        dotacao: item
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar empenho com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // CANCELAMENTO DE PEDIDO COM JUSTIFICATIVA
  // --------------------------------------------------------------------------
  openCancelarModal(id) {
    const item = app.state.dotacoes.find(d => Number(d.id) === Number(id));
    if (!item) return;

    const idEl = document.getElementById('cancel-dot-id');
    const infoEl = document.getElementById('cancel-info-pedido');
    const motivoEl = document.getElementById('cancel-field-motivo');

    if (idEl) idEl.value = item.id;
    if (infoEl) infoEl.textContent = `SF: ${item.sf} • ${item.objeto ? item.objeto.substring(0, 45) + '...' : ''}`;
    if (motivoEl) motivoEl.value = '';

    const modal = document.getElementById('modal-cancelar-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => { if (motivoEl) motivoEl.focus(); }, 80);
    }
  },

  closeCancelarModal() {
    const modal = document.getElementById('modal-cancelar-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async confirmCancelarDotacao(e) {
    if (e) e.preventDefault();

    const id = Number(document.getElementById('cancel-dot-id')?.value);
    const item = app.state.dotacoes.find(d => Number(d.id) === id);
    if (!item) return;

    const motivo = (document.getElementById('cancel-field-motivo')?.value || '').trim();
    if (!motivo) {
      return app.ui.toast("Por favor, digite o motivo do cancelamento.", "warning", "Justificativa Necessária");
    }

    item.status = "CANCELADO";
    item.motivoCancelamento = motivo;
    item.situacao = `CANCELADO: ${motivo}`;

    app.data.saveLocalDotacoes();
    this.closeCancelarModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    app.ui.toast(`Pedido SF ${item.sf} marcado como Cancelado.`, "info", "Pedido Cancelado");

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Cancelando Pedido",
        subtitle: `Cancelando SF ${item.sf}`,
        step1: "Registrando motivo do cancelamento",
        step2: "Atualizando status na planilha Google Sheets",
        step3: "Finalizando cancelamento",
        icon: "🚫"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_DOTACAO",
        dotacao: item
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao cancelar na planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // REABERTURA DE PEDIDO
  // --------------------------------------------------------------------------
  async reabrirPedido(id) {
    const item = app.state.dotacoes.find(d => Number(d.id) === Number(id));
    if (!item) return;

    item.status = "AGUARDANDO";
    item.situacao = "Reaberto para nova dotação";
    app.data.saveLocalDotacoes();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    app.ui.toast(`Pedido SF ${item.sf} reaberto e retornado à fila de dotação!`, "info", "✓ Pedido Reativado");

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Reabrindo Pedido",
        subtitle: `Reativando SF ${item.sf}`,
        step1: "Reiniciando status do pedido",
        step2: "Atualizando planilha Google Sheets",
        step3: "Retornando à fila do setor financeiro",
        icon: "↩️"
      });
    }

    try {
      await app.data.sendToCloud({
        action: "UPDATE_DOTACAO",
        dotacao: item
      });
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao reabrir na planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // FILTROS E PESQUISA DINÂMICA EM TEMPO REAL
  // --------------------------------------------------------------------------
  setFilter(status) {
    app.state.dotacoesFilter = status;
    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }
  },

  setUserFilter(user) {
    app.state.dotacoesUserFilter = user;
    const tbody = document.getElementById('table-dotacoes-body');
    if (tbody) tbody.innerHTML = this.renderTableRows();
    const countEl = document.getElementById('table-filtered-count');
    if (countEl) countEl.textContent = this.getFilteredList().length;
  },

  filterMyOrders() {
    const logged = app.state.auth.user?.usuario || app.state.auth.user?.nome || '';
    if (!logged) {
      return app.ui.toast("Faça login para filtrar seus pedidos.", "info", "Filtro Pessoal");
    }
    if (app.state.dotacoesUserFilter === logged) {
      this.setUserFilter('TODOS');
    } else {
      this.setUserFilter(logged);
    }
    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }
  },

  setSearch(val) {
    app.state.dotacoesSearch = (val || '').trim();
    const tbody = document.getElementById('table-dotacoes-body');
    if (tbody) tbody.innerHTML = this.renderTableRows();
    const countEl = document.getElementById('table-filtered-count');
    if (countEl) countEl.textContent = this.getFilteredList().length;
  },

  clearSearch() {
    this.setSearch('');
    const input = document.getElementById('dotacoes-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  },

  getFilteredList() {
    const currentFilter = (app.state.dotacoesFilter || 'TODOS').toUpperCase();
    const userFilter = (app.state.dotacoesUserFilter || 'TODOS').toLowerCase().trim();
    const s = (app.state.dotacoesSearch || '').trim();

    // Normalizador de acentos e maiúsculas para busca robusta
    const normalize = (str) => String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const normS = normalize(s);

    return (app.state.dotacoes || []).filter(d => {
      const status = (d.status || 'AGUARDANDO').toUpperCase();

      // 1. Filtro de Abas de Status
      let matchStatus = false;
      if (currentFilter === 'TODOS') {
        matchStatus = true;
      } else if (currentFilter === 'AGUARDANDO' || currentFilter === 'PENDENTES') {
        matchStatus = (status === 'AGUARDANDO' || status === 'PENDENTE');
      } else if (currentFilter === 'DOTADOS' || currentFilter === 'REGISTRADOS') {
        matchStatus = (status === 'DOTADO' || status === 'REGISTRADO');
      } else if (currentFilter === 'CONCLUIDOS') {
        matchStatus = (status === 'CONCLUIDO');
      } else if (currentFilter === 'CANCELADOS') {
        matchStatus = (status === 'CANCELADO');
      }

      // 2. Filtro Seletor de Usuário
      let matchUser = true;
      if (userFilter && userFilter !== 'todos') {
        const comp = normalize(d.comprador);
        const login = normalize(d.compradorLogin);
        const val = normalize(d.validador);
        const valLogin = normalize(d.validadorLogin);
        const uNorm = normalize(userFilter);

        matchUser = comp.includes(uNorm) || login.includes(uNorm) || val.includes(uNorm) || valLogin.includes(uNorm);
      }

      // 3. Pesquisa Dinâmica em Tempo Real por Qualquer Termo (SF, Objeto, Usuário, etc.)
      let matchSearch = true;
      if (normS) {
        const searchable = [
          d.sf, d.ata, d.processo, d.objeto, d.doc1, d.empenho,
          d.situacao, d.patrimonio, d.comprador, d.compradorLogin,
          d.validador, d.validadorLogin, d.valor, d.emenda, d.motivoCancelamento
        ].map(x => normalize(x)).join(' ');

        matchSearch = searchable.includes(normS);
      }

      return matchStatus && matchUser && matchSearch;
    });

    // ORDEM: DOS MAIS NOVOS PARA OS MAIS ANTIGOS (Decrescente)
    return filtered.sort((a, b) => {
      // 1. Pelo ID decrescente (pedidos novos têm ID maior / timestamp)
      const idA = Number(a.id) || 0;
      const idB = Number(b.id) || 0;
      if (idB !== idA) return idB - idA;

      // 2. Fallback pelo número do SF decrescente se houver
      const sfA = parseInt(String(a.sf || '').replace(/\D/g, ''), 10) || 0;
      const sfB = parseInt(String(b.sf || '').replace(/\D/g, ''), 10) || 0;
      return sfB - sfA;
    });
  },

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DAS LINHAS DA TABELA
  // --------------------------------------------------------------------------
  renderTableRows() {
    const list = this.getFilteredList();

    if (list.length === 0) {
      if (app.data && app.data.isSyncing) {
        return `
          <tr>
            <td colspan="9" class="p-12 text-center text-slate-500 font-medium text-xs">
              <div class="flex flex-col items-center justify-center">
                <div class="w-10 h-10 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
                <span class="text-sm font-black text-slate-800">Carregando Pedidos de Dotação...</span>
                <span class="text-slate-400 text-xs mt-1">Sincronizando registros da planilha Google Sheets em tempo real</span>
              </div>
            </td>
          </tr>
        `;
      }
      return `
        <tr>
          <td colspan="9" class="p-12 text-center text-slate-400 font-medium text-xs">
            <span class="block text-2xl mb-2">🔍</span>
            Nenhum pedido de dotação encontrado para os filtros ou busca selecionados.
          </td>
        </tr>
      `;
    }

    const canCheck = app.permissions.can('dotacoes_check');
    const canEdit = app.permissions.can('dotacoes_edit');

    return list.map(d => {
      const status = (d.status || 'AGUARDANDO').toUpperCase();
      const isAguardando = (status === 'AGUARDANDO' || status === 'PENDENTE');
      const isDotado = (status === 'DOTADO' || status === 'REGISTRADO');
      const isConcluido = (status === 'CONCLUIDO');
      const isCancelado = (status === 'CANCELADO');

      let rowClass = "hover:bg-slate-50 transition border-b border-slate-200";
      if (isAguardando) rowClass = "bg-amber-50/40 hover:bg-amber-100/50 transition border-b border-amber-100";
      else if (isCancelado) rowClass = "bg-rose-50/20 hover:bg-rose-50/40 transition border-b border-rose-100 opacity-75";

      return `
        <tr class="${rowClass}">
          <!-- 1. SF (75px) -->
          <td class="p-2.5 font-mono font-black text-slate-900 text-xs whitespace-nowrap overflow-hidden">
            <div class="flex items-center gap-1">
              ${isAguardando ? '<span class="inline-block w-2 h-2 shrink-0 rounded-full bg-amber-500 animate-pulse" title="Aguardando Dotação"></span>' : ''}
              <span class="truncate">${d.sf || '—'}</span>
            </div>
          </td>

          <!-- 2. OBJETO & DESTINAÇÃO (Livre / Auto) -->
          <td class="p-2.5 overflow-hidden">
            <div class="space-y-0.5">
              <p class="font-bold text-slate-900 text-xs leading-snug line-clamp-2 break-words" title="${d.objeto || ''}">${d.objeto || '—'}</p>
              <div class="flex flex-wrap items-center gap-1.5 mt-0.5">
                ${d.valor ? `<span class="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Valor: R$ ${d.valor}</span>` : ''}
                ${d.emenda ? `<span class="inline-flex items-center gap-1 text-[10px] font-black text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200" title="Recurso de Emenda Parlamentar: ${d.emenda}">🏛️ Emenda: ${d.emenda}</span>` : ''}
              </div>
            </div>
          </td>

          <!-- 3. ATA & PROCESSO (110px) -->
          <td class="p-2.5 overflow-hidden text-[11px] leading-tight">
            <div class="font-mono text-slate-800 truncate" title="Ata: ${d.ata || '—'}"><strong>Ata:</strong> ${d.ata || '—'}</div>
            <div class="font-mono text-slate-500 truncate text-[10px]" title="Processo: ${d.processo || '—'}"><strong>Proc:</strong> ${d.processo || '—'}</div>
          </td>

          <!-- 4. 1DOC (90px) -->
          <td class="p-2.5 font-mono font-bold text-slate-800 text-xs whitespace-nowrap text-center overflow-hidden">
            ${d.doc1 ? `<span class="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 block truncate" title="${d.doc1}">${d.doc1}</span>` : '<span class="text-slate-300">—</span>'}
          </td>

          <!-- 5. EMPENHO (105px) -->
          <td class="p-2.5 font-mono text-xs whitespace-nowrap text-center overflow-hidden">
            ${d.empenho ? `
              <span class="font-black text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 block truncate shadow-xs" title="${d.empenho}">
                ${d.empenho}
              </span>
            ` : '<span class="text-slate-400 italic text-[10px] block">—</span>'}
          </td>

          <!-- 6. SITUAÇÃO / HISTÓRICO (260px) -->
          <td class="p-2.5 text-[11px] text-slate-600 overflow-hidden">
            <p class="line-clamp-2 break-words leading-tight" title="${d.situacao || ''}">${d.situacao || '—'}</p>
          </td>

          <!-- 7. PATRIMÔNIO (75px) -->
          <td class="p-2.5 text-center whitespace-nowrap overflow-hidden">
            ${d.patrimonio ? `
              <span class="font-mono font-bold text-amber-950 bg-amber-100 px-1.5 py-0.5 rounded text-[10px] border border-amber-200 inline-block truncate max-w-[65px]" title="Patrimônio: ${d.patrimonio}">
                🏷️ ${d.patrimonio}
              </span>
            ` : '<span class="text-slate-300">—</span>'}
          </td>

          <!-- 8. STATUS & RESPONSÁVEL (145px) -->
          <td class="p-2.5 text-center whitespace-nowrap overflow-hidden">
            ${isAguardando ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                ⏳ Aguardando
              </span>
            ` : isDotado ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                ✓ Dotado
              </span>
              ${d.validador ? `<span class="block text-[9px] text-slate-500 truncate max-w-[135px] mx-auto mt-0.5" title="Validado por ${d.validador}">${d.validador}</span>` : ''}
            ` : isConcluido ? `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-200">
                ✅ Concluído
              </span>
            ` : `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                🚫 Cancelado
              </span>
            `}
            ${d.comprador ? `<span class="block text-[9px] text-slate-400 truncate max-w-[135px] mx-auto mt-0.5" title="Criado por ${d.comprador}">${d.comprador}</span>` : ''}
          </td>

          <!-- 9. AÇÕES CONTEXTUAIS (115px) -->
          <td class="p-2.5 text-center whitespace-nowrap overflow-hidden">
            <div class="flex items-center justify-center gap-1">
              ${isAguardando && canCheck ? `
                <button onclick="app.dotacoes.dotarPedido(${d.id})" class="px-2 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg text-xs font-black shadow-xs transition flex items-center gap-0.5" title="1 Clique: Confirmar Dotação (Financeiro)">
                  <span>✓</span> Dotar
                </button>
              ` : ''}

              ${(isDotado || isConcluido) ? `
                <button onclick="app.dotacoes.openComplementarModal(${d.id})" class="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-bold border border-blue-200 transition flex items-center gap-0.5" title="Vincular Empenho, Situação e Patrimônio">
                  <span>📦</span> Emp.
                </button>
              ` : ''}

              ${canEdit && !isCancelado ? `
                <button onclick="app.dotacoes.openEditModal(${d.id})" class="p-1 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg text-xs font-bold border border-slate-200 transition" title="Corrigir / Editar dados do pedido">
                  ✏️
                </button>
              ` : ''}

              ${!isCancelado ? `
                <button onclick="app.dotacoes.openCancelarModal(${d.id})" class="p-1 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg text-xs font-bold border border-slate-200 transition" title="Cancelar Pedido">
                  ✕
                </button>
              ` : `
                <button onclick="app.dotacoes.reabrirPedido(${d.id})" class="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border transition" title="Reativar pedido">
                  ↩ Reabrir
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // --------------------------------------------------------------------------
  // EXPORTAÇÃO COMPLETA PARA EXCEL (CSV FORMATADO UTF-8 COM BOM)
  // --------------------------------------------------------------------------
  exportCSV() {
    const list = this.getFilteredList();
    if (list.length === 0) {
      return app.ui.toast("Nenhum registro para exportar com os filtros atuais.", "warning", "Sem Dados");
    }

    const headers = [
      "SF", "ATA", "Nº PROCESSO", "OBJETO / DESTINAÇÃO", "1DOC",
      "EMPENHO", "SITUAÇÃO / ENTREGA", "PATRIMÔNIO", "STATUS",
      "COMPRADOR", "DATA SOLICITAÇÃO", "VALIDADOR (FINANCEIRO)", "DATA VALIDAÇÃO", "VALOR ESTIMADO", "EMENDA PARLAMENTAR"
    ];

    const rows = list.map(d => [
      `"${(d.sf || '').replace(/"/g, '""')}"`,
      `"${(d.ata || '').replace(/"/g, '""')}"`,
      `"${(d.processo || '').replace(/"/g, '""')}"`,
      `"${(d.objeto || '').replace(/"/g, '""')}"`,
      `"${(d.doc1 || '').replace(/"/g, '""')}"`,
      `"${(d.empenho || '').replace(/"/g, '""')}"`,
      `"${(d.situacao || '').replace(/"/g, '""')}"`,
      `"${(d.patrimonio || '').replace(/"/g, '""')}"`,
      `"${(d.status || '').replace(/"/g, '""')}"`,
      `"${(d.comprador || '').replace(/"/g, '""')}"`,
      `"${(d.dataSolicitacao || '').replace(/"/g, '""')}"`,
      `"${(d.validador || '').replace(/"/g, '""')}"`,
      `"${(d.dataValidacao || '').replace(/"/g, '""')}"`,
      `"${(d.valor || '').replace(/"/g, '""')}"`,
      `"${(d.emenda || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `Dotacoes_Saude_Torres_${dStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    app.ui.toast(`Exportados ${list.length} registros para arquivo CSV compatível com o Excel!`, "success", "✓ Relatório Gerado");
  }
};

// ----------------------------------------------------------------------------
// VIEW PRINCIPAL DO LIVRO DIGITAL DE DOTAÇÕES
// ----------------------------------------------------------------------------
app.render.dotacoesHub = function(el) {
  const allList = app.state.dotacoes || [];
  const totalCount = allList.length;

  const aguardandoCount = allList.filter(d => {
    const st = (d.status || 'AGUARDANDO').toUpperCase();
    return st === 'AGUARDANDO' || st === 'PENDENTE';
  }).length;

  const dotadosCount = allList.filter(d => {
    const st = (d.status || '').toUpperCase();
    return st === 'DOTADO' || st === 'REGISTRADO';
  }).length;

  const concluidosCount = allList.filter(d => (d.status || '').toUpperCase() === 'CONCLUIDO').length;
  const canceladosCount = allList.filter(d => (d.status || '').toUpperCase() === 'CANCELADO').length;

  const canCreate = app.permissions.can('dotacoes_create');
  const hasDesktopNotifications = ("Notification" in window) && Notification.permission === "granted";

  const currentFilter = (app.state.dotacoesFilter || 'TODOS').toUpperCase();
  const currentUserFilter = (app.state.dotacoesUserFilter || 'TODOS');

  // Coleta lista única de compradores para o filtro dropdown
  const uniqueUsersMap = new Map();
  allList.forEach(d => {
    if (d.comprador) {
      const key = (d.compradorLogin || d.comprador).toLowerCase();
      if (!uniqueUsersMap.has(key)) {
        uniqueUsersMap.set(key, { login: d.compradorLogin || key, nome: d.comprador });
      }
    }
  });

  const uniqueUsersOptions = Array.from(uniqueUsersMap.values()).map(u => {
    const isSelected = (currentUserFilter.toLowerCase() === u.login.toLowerCase() || currentUserFilter.toLowerCase() === u.nome.toLowerCase());
    return `<option value="${u.login}" ${isSelected ? 'selected' : ''}>👤 ${u.nome}</option>`;
  }).join('');

  const loggedUser = app.state.auth.user;
  const isFilteringMine = loggedUser && (currentUserFilter.toLowerCase() === (loggedUser.usuario || '').toLowerCase() || currentUserFilter.toLowerCase() === (loggedUser.nome || '').toLowerCase());

  el.innerHTML = `
    <div class="w-full max-w-[1880px] mx-auto px-3 sm:px-6 py-4 fade-in">
        
        <!-- NAVEGAÇÃO DE TOPO -->
        <div class="mb-2">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition group py-0.5">
                <svg class="w-3.5 h-3.5 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Voltar para o Portal de Acessos</span>
            </button>
        </div>

        <!-- CABEÇALHO DO LIVRO DIGITAL -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200">
            <div>
                <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Contabilidade & Compras</span>
                    
                    <!-- Indicador de Notificação do Navegador -->
                    <button onclick="app.notifications.requestPermission()" title="${hasDesktopNotifications ? 'Alertas do computador ativos' : 'Clique para receber aviso quando o Financeiro dotar seu pedido'}" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition ${hasDesktopNotifications ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900 hover:bg-amber-200 cursor-pointer animate-pulse'}">
                        <span>🔔</span>
                        <span>${hasDesktopNotifications ? 'Alertas no Computador Ativos' : 'Ativar Alertas de Navegador'}</span>
                    </button>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight">Livro Digital de Pedidos de Dotação</h2>
                <p class="text-xs text-slate-500">
                    Fluxo Integrado: <strong class="text-slate-700">1. Comprador lança</strong> → <strong class="text-slate-700">2. Setor Financeiro valida (1 clique)</strong> → <strong class="text-slate-700">3. Comprador insere empenho</strong>.
                </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
                <button onclick="app.dotacoes.exportCSV()" class="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5">
                    <span>📥</span> Exportar Excel
                </button>
                <button onclick="app.data.syncFromCloud(true)" class="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition flex items-center gap-1.5">
                    <span>🔄</span> Sincronizar
                </button>
                ${canCreate ? `
                  <button onclick="app.dotacoes.openNewModal(true)" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center gap-1.5">
                      <span class="text-base leading-none">+</span> Nova Solicitação (SF)
                  </button>
                ` : ''}
            </div>
        </div>

        <!-- CARDS DE RESUMO DO FLUXO (COMPACTOS) -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3.5">
            <!-- 1. TOTAL -->
            <div onclick="app.dotacoes.setFilter('TODOS')" class="cursor-pointer bg-white p-3.5 rounded-xl shadow-xs border border-slate-100 hover:border-slate-300 transition ${currentFilter === 'TODOS' ? 'ring-2 ring-slate-900' : ''}">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Histórico Geral</span>
                    <span class="p-1 bg-slate-100 rounded-md text-slate-600 text-xs">📋</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">${totalCount}</p>
                <span class="text-[10px] text-slate-400">Total de pedidos</span>
            </div>
            
            <!-- 2. AGUARDANDO (FILA DO FINANCEIRO) -->
            <div onclick="app.dotacoes.setFilter('AGUARDANDO')" class="cursor-pointer bg-amber-50/70 p-3.5 rounded-xl shadow-xs border border-amber-200 hover:bg-amber-100/70 transition ${currentFilter === 'AGUARDANDO' || currentFilter === 'PENDENTES' ? 'ring-2 ring-amber-500' : ''}">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-amber-900 uppercase tracking-wider">⏳ Fila do Financeiro</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-amber-200 text-amber-900">Check Pendente</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-amber-800 mt-0.5">${aguardandoCount}</p>
                <span class="text-[10px] text-amber-700 font-bold">1 Clique para dotar</span>
            </div>

            <!-- 3. DOTADOS (EM COMPRAS) -->
            <div onclick="app.dotacoes.setFilter('DOTADOS')" class="cursor-pointer bg-blue-50/70 p-3.5 rounded-xl shadow-xs border border-blue-200 hover:bg-blue-100/70 transition ${currentFilter === 'DOTADOS' || currentFilter === 'REGISTRADOS' ? 'ring-2 ring-blue-600' : ''}">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-blue-900 uppercase tracking-wider">📦 Dotados / Em Compras</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-blue-200 text-blue-900">Comprador</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-blue-900 mt-0.5">${dotadosCount}</p>
                <span class="text-[10px] text-blue-700 font-bold">Aguardando empenho</span>
            </div>

            <!-- 4. CONCLUÍDOS -->
            <div onclick="app.dotacoes.setFilter('CONCLUIDOS')" class="cursor-pointer bg-emerald-50/70 p-3.5 rounded-xl shadow-xs border border-emerald-200 hover:bg-emerald-100/70 transition ${currentFilter === 'CONCLUIDOS' ? 'ring-2 ring-emerald-600' : ''}">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wider">✅ Concluídos & Entregues</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-200 text-emerald-900">Finalizados</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-emerald-800 mt-0.5">${concluidosCount}</p>
                <span class="text-[10px] text-emerald-700 font-bold">Empenho vinculado</span>
            </div>
        </div>

        <!-- BARRA DE PESQUISA, FILTRO DE USUÁRIO E ABAS DE STATUS -->
        <div class="bg-white p-3 rounded-xl shadow-xs border border-slate-100 mb-3.5 space-y-2.5">
            <div class="flex flex-col sm:flex-row items-center gap-2.5">
                <div class="relative flex-1 w-full">
                    <input type="text" id="dotacoes-search-input" oninput="app.dotacoes.setSearch(this.value)" value="${app.state.dotacoesSearch || ''}" placeholder="Buscar em tempo real por SF (ex: 18306), Objeto, 1Doc, Empenho ou Usuário (ex: diego)..." class="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 font-medium">
                    <span class="absolute left-2.5 top-2.5 text-slate-400 text-xs">🔍</span>
                    ${app.state.dotacoesSearch ? `
                      <button onclick="app.dotacoes.clearSearch()" class="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1" title="Limpar busca">✕</button>
                    ` : ''}
                </div>

                <!-- SELETOR DINÂMICO DE USUÁRIO / COMPRADOR -->
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select onchange="app.dotacoes.setUserFilter(this.value)" class="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-emerald-500 text-slate-700">
                        <option value="TODOS" ${currentUserFilter === 'TODOS' ? 'selected' : ''}>👤 Todos os Usuários</option>
                        ${uniqueUsersOptions}
                    </select>
                    
                    ${loggedUser ? `
                      <button onclick="app.dotacoes.filterMyOrders()" class="px-3 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap ${isFilteringMine ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" title="Filtrar apenas os pedidos lançados por você">
                        ${isFilteringMine ? '✓ Meus Pedidos' : 'Meus Pedidos'}
                      </button>
                    ` : ''}
                </div>
            </div>

            <!-- ABAS DE STATUS -->
            <div class="flex items-center justify-between border-t border-slate-100 pt-2">
                <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 w-full">
                    <button onclick="app.dotacoes.setFilter('TODOS')" class="px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${currentFilter === 'TODOS' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        Todos (${totalCount})
                    </button>
                    <button onclick="app.dotacoes.setFilter('AGUARDANDO')" class="px-3 py-1 rounded-lg text-xs font-black transition whitespace-nowrap ${currentFilter === 'AGUARDANDO' || currentFilter === 'PENDENTES' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        ⏳ Aguardando (${aguardandoCount})
                    </button>
                    <button onclick="app.dotacoes.setFilter('DOTADOS')" class="px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${currentFilter === 'DOTADOS' || currentFilter === 'REGISTRADOS' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        📦 Dotados (${dotadosCount})
                    </button>
                    <button onclick="app.dotacoes.setFilter('CONCLUIDOS')" class="px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${currentFilter === 'CONCLUIDOS' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                        ✅ Concluídos (${concluidosCount})
                    </button>
                    ${canceladosCount > 0 ? `
                      <button onclick="app.dotacoes.setFilter('CANCELADOS')" class="px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${currentFilter === 'CANCELADOS' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                          🚫 Cancelados (${canceladosCount})
                      </button>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- TABELA DO LIVRO DIGITAL (OTIMIZADA PARA DESKTOP 1920x1080) -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="custom-scroll overflow-x-auto overflow-y-auto max-h-[calc(100vh-275px)] min-h-[480px] relative">
                <table id="table-dotacoes" class="w-full text-left border-collapse text-xs table-fixed">
                    <colgroup>
                        <col style="width: 75px;">
                        <col style="width: auto;">
                        <col style="width: 110px;">
                        <col style="width: 90px;">
                        <col style="width: 105px;">
                        <col style="width: 260px;">
                        <col style="width: 75px;">
                        <col style="width: 145px;">
                        <col style="width: 115px;">
                    </colgroup>
                    <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
                        <tr>
                            <th class="p-2.5 text-slate-800">Nº SF</th>
                            <th class="p-2.5 text-slate-800">Objeto / Destinação</th>
                            <th class="p-2.5 text-slate-800">Ata / Proc.</th>
                            <th class="p-2.5 text-center text-slate-800">1Doc</th>
                            <th class="p-2.5 text-center text-slate-800">Empenho</th>
                            <th class="p-2.5 text-slate-800">Situação / Entrega</th>
                            <th class="p-2.5 text-center text-slate-800">Patrim.</th>
                            <th class="p-2.5 text-center text-slate-800">Status / Resp.</th>
                            <th class="p-2.5 text-center text-slate-800">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="table-dotacoes-body" class="divide-y divide-slate-200 font-medium">
                        ${app.dotacoes.renderTableRows()}
                    </tbody>
                </table>
            </div>
            <div class="p-2.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 font-bold">
                <span class="text-slate-400">💡 Ordem decrescente (mais novos primeiro) • Layout panorâmico para Desktop (1920x1080)</span>
                <span>Exibindo <span id="table-filtered-count" class="text-slate-800 font-black">${app.dotacoes.getFilteredList().length}</span> de ${totalCount} pedidos registrados</span>
            </div>
        </div>

    </div>
  `;
};

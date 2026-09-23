/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE DOTAÇÕES: Livro Digital de Pedidos, Baixa Contábil e Rastreabilidade
 * Arquivo: js/app-dotacoes.js
 * ============================================================================
 */

app.dotacoes = {
  openNewModal(clearForm = true) {
    if (!app.permissions.can('dotacoes_create')) {
      return alert("Seu perfil de acesso não tem permissão para cadastrar pedidos de dotação.");
    }

    const modal = document.getElementById('modal-nova-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      if (clearForm) {
        document.getElementById('dot-field-processo').value = '';
        document.getElementById('dot-field-origem').value = '';
        document.getElementById('dot-field-solicitante').value = '';
        document.getElementById('dot-field-quantidade').value = '';
        document.getElementById('dot-field-objeto').value = '';
      }

      setTimeout(() => document.getElementById('dot-field-processo').focus(), 80);
    }
  },

  closeNewModal() {
    const modal = document.getElementById('modal-nova-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  openConfirmModal(e) {
    e.preventDefault();
    const processo = document.getElementById('dot-field-processo').value.trim();
    const origem = document.getElementById('dot-field-origem').value.trim();
    const solicitante = document.getElementById('dot-field-solicitante').value.trim();
    const quantidade = parseInt(document.getElementById('dot-field-quantidade').value, 10) || 0;
    const objeto = document.getElementById('dot-field-objeto').value.trim();

    if (!processo || !origem || !solicitante || !quantidade || !objeto) {
      return alert("Preencha todos os campos da dotação.");
    }

    const compradorNome = (app.state.auth.user && (app.state.auth.user.nome || app.state.auth.user.usuario)) || 'Comprador';
    const compradorLogin = (app.state.auth.user && app.state.auth.user.usuario) || 'comprador';

    app.state.pendingDotacaoTemp = {
      processo, origem, solicitante, quantidade, objeto,
      comprador: compradorNome,
      compradorLogin: compradorLogin
    };

    document.getElementById('conf-processo').textContent = processo;
    document.getElementById('conf-origem').textContent = origem;
    document.getElementById('conf-solicitante').textContent = solicitante;
    document.getElementById('conf-quantidade').textContent = `${quantidade.toLocaleString('pt-BR')} unidades`;
    document.getElementById('conf-objeto').textContent = objeto;
    document.getElementById('conf-comprador').textContent = `${compradorNome} (${compradorLogin})`;

    this.closeNewModal();
    const confModal = document.getElementById('modal-conferencia-dotacao');
    if (confModal) {
      confModal.classList.remove('hidden');
      confModal.classList.add('flex');
    }
  },

  cancelConfirm() {
    const confModal = document.getElementById('modal-conferencia-dotacao');
    if (confModal) {
      confModal.classList.add('hidden');
      confModal.classList.remove('flex');
    }

    const modal = document.getElementById('modal-nova-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      if (app.state.pendingDotacaoTemp) {
        document.getElementById('dot-field-processo').value = app.state.pendingDotacaoTemp.processo || '';
        document.getElementById('dot-field-origem').value = app.state.pendingDotacaoTemp.origem || '';
        document.getElementById('dot-field-solicitante').value = app.state.pendingDotacaoTemp.solicitante || '';
        document.getElementById('dot-field-quantidade').value = app.state.pendingDotacaoTemp.quantidade || '';
        document.getElementById('dot-field-objeto').value = app.state.pendingDotacaoTemp.objeto || '';
      }

      setTimeout(() => document.getElementById('dot-field-processo').focus(), 80);
    }
  },

  async saveToCloud() {
    if (!app.state.pendingDotacaoTemp) return;

    const confModal = document.getElementById('modal-conferencia-dotacao');
    if (confModal) {
      confModal.classList.add('hidden');
      confModal.classList.remove('flex');
    }

    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newRecord = {
      id: Date.now(),
      ...app.state.pendingDotacaoTemp,
      dataSolicitacao: dataHoraStr,
      status: "PENDENTE",
      empenhoDoc: "",
      validador: "",
      validadorLogin: "",
      dataValidacao: ""
    };

    app.state.dotacoes.unshift(newRecord);
    app.data.saveLocalDotacoes();

    app.state.pendingDotacaoTemp = null;
    document.getElementById('dot-field-processo').value = '';
    document.getElementById('dot-field-origem').value = '';
    document.getElementById('dot-field-solicitante').value = '';
    document.getElementById('dot-field-quantidade').value = '';
    document.getElementById('dot-field-objeto').value = '';

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    await app.data.sendToCloud({
      action: "CREATE_DOTACAO",
      dotacao: newRecord
    });
  },

  openEditModal(id) {
    if (!app.permissions.can('dotacoes_edit')) {
      return alert("Apenas Administrador e Gestor Financeiro podem editar solicitações.");
    }

    const item = app.state.dotacoes.find(d => d.id === id);
    if (!item) return;

    document.getElementById('edit-dot-id').value = item.id;
    document.getElementById('edit-dot-processo').value = item.processo;
    document.getElementById('edit-dot-origem').value = item.origem;
    document.getElementById('edit-dot-solicitante').value = item.solicitante;
    document.getElementById('edit-dot-quantidade').value = item.quantidade;
    document.getElementById('edit-dot-objeto').value = item.objeto;

    const modal = document.getElementById('modal-editar-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeEditModal() {
    const modal = document.getElementById('modal-editar-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async confirmEdit(e) {
    e.preventDefault();
    const id = Number(document.getElementById('edit-dot-id').value);
    const item = app.state.dotacoes.find(d => d.id === id);
    if (!item) return;

    item.processo = document.getElementById('edit-dot-processo').value.trim();
    item.origem = document.getElementById('edit-dot-origem').value.trim();
    item.solicitante = document.getElementById('edit-dot-solicitante').value.trim();
    item.quantidade = parseInt(document.getElementById('edit-dot-quantidade').value, 10) || 0;
    item.objeto = document.getElementById('edit-dot-objeto').value.trim();

    app.data.saveLocalDotacoes();
    this.closeEditModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    await app.data.sendToCloud({
      action: "UPDATE_DOTACAO",
      dotacao: item
    });

    alert("Solicitação corrigida e atualizada no Google Sheets!");
  },

  openDeleteModal(id) {
    if (!app.permissions.can('dotacoes_delete')) {
      return alert("Apenas Administrador e Gestor Financeiro têm permissão para excluir solicitações.");
    }

    const item = app.state.dotacoes.find(d => d.id === id);
    if (!item) return;

    app.state.deleteDotacaoTarget = item;

    document.getElementById('delete-dot-target-id').value = item.id;
    document.getElementById('delete-dot-expected-num').textContent = item.processo;
    document.getElementById('delete-dot-typed-processo').value = '';
    document.getElementById('delete-dot-error-msg').classList.add('hidden');

    document.getElementById('delete-preview-origem').textContent = item.origem;
    document.getElementById('delete-preview-solicitante').textContent = item.solicitante;
    document.getElementById('delete-preview-quantidade').textContent = `${item.quantidade.toLocaleString('pt-BR')} un.`;
    document.getElementById('delete-preview-objeto').textContent = item.objeto;

    const modal = document.getElementById('modal-excluir-dotacao');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => document.getElementById('delete-dot-typed-processo').focus(), 80);
    }
  },

  closeDeleteModal() {
    app.state.deleteDotacaoTarget = null;
    const modal = document.getElementById('modal-excluir-dotacao');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  blockPaste(e) {
    e.preventDefault();
    alert("Por segurança institucional, não é permitido colar. Digite os números manualmente.");
    return false;
  },

  async confirmDelete(e) {
    e.preventDefault();
    const target = app.state.deleteDotacaoTarget;
    if (!target) return;

    const typed = document.getElementById('delete-dot-typed-processo').value.trim();
    const errorEl = document.getElementById('delete-dot-error-msg');

    if (typed !== String(target.processo).trim()) {
      errorEl.textContent = `O número digitado (${typed}) não confere com o processo (${target.processo}).`;
      errorEl.classList.remove('hidden');
      document.getElementById('delete-dot-typed-processo').focus();
      return;
    }

    app.state.dotacoes = app.state.dotacoes.filter(d => d.id !== target.id);
    app.data.saveLocalDotacoes();
    this.closeDeleteModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    await app.data.sendToCloud({
      action: "DELETE_DOTACAO",
      id: target.id
    });

    alert(`Processo nº ${target.processo} excluído com sucesso.`);
  },

  openBaixaModal(id) {
    if (!app.permissions.can('dotacoes_check')) {
      return alert("Apenas Gestor Financeiro e Administrador têm permissão para dar baixa contábil.");
    }

    const item = app.state.dotacoes.find(d => d.id === id);
    if (!item) return;

    document.getElementById('baixa-target-id').value = id;
    document.getElementById('baixa-info-processo').textContent = `Processo nº ${item.processo} (${item.origem} • Solicitado por: ${item.solicitante})`;
    document.getElementById('baixa-field-doc').value = '';

    const m = document.getElementById('modal-baixa-dotacao');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
      setTimeout(() => document.getElementById('baixa-field-doc').focus(), 80);
    }
  },

  closeBaixaModal() {
    const m = document.getElementById('modal-baixa-dotacao');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  },

  async confirmBaixa(e) {
    e.preventDefault();
    const id = Number(document.getElementById('baixa-target-id').value);
    const docNum = document.getElementById('baixa-field-doc').value.trim();

    const item = app.state.dotacoes.find(d => d.id === id);
    if (!item) return;

    const gestorNome = (app.state.auth.user && (app.state.auth.user.nome || app.state.auth.user.usuario)) || 'Gestor Financeiro';
    const gestorLogin = (app.state.auth.user && app.state.auth.user.usuario) || 'financeiro';
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    item.status = "REGISTRADO";
    item.empenhoDoc = docNum || "Confirmado";
    item.validador = gestorNome;
    item.validadorLogin = gestorLogin;
    item.dataValidacao = dataHoraStr;

    app.data.saveLocalDotacoes();
    this.closeBaixaModal();

    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }

    await app.data.sendToCloud({
      action: "UPDATE_DOTACAO_STATUS",
      id: id,
      status: "REGISTRADO",
      empenhoDoc: item.empenhoDoc,
      validador: gestorNome,
      validadorLogin: gestorLogin,
      dataValidacao: dataHoraStr
    });
  },

  setFilter(status) {
    app.state.dotacoesFilter = status;
    if (app.state.view === 'dotacoes_hub') {
      app.render.dotacoesHub(document.getElementById('app-viewport'));
    }
  },

  setSearch(val) {
    app.state.dotacoesSearch = val.toLowerCase().trim();
    const tbody = document.getElementById('table-dotacoes-body');
    if (tbody) tbody.innerHTML = this.renderTableRows();
  },

  renderTableRows() {
    const filtered = app.state.dotacoes.filter(d => {
      const matchStatus = (app.state.dotacoesFilter === 'TODOS') ||
                          (app.state.dotacoesFilter === 'PENDENTES' && d.status === 'PENDENTE') ||
                          (app.state.dotacoesFilter === 'REGISTRADOS' && d.status === 'REGISTRADO');

      const s = app.state.dotacoesSearch;
      const matchSearch = !s ||
                          String(d.processo).toLowerCase().includes(s) ||
                          d.origem.toLowerCase().includes(s) ||
                          d.objeto.toLowerCase().includes(s) ||
                          d.solicitante.toLowerCase().includes(s) ||
                          d.comprador.toLowerCase().includes(s) ||
                          (d.empenhoDoc && d.empenhoDoc.toLowerCase().includes(s));

      return matchStatus && matchSearch;
    });

    if (filtered.length === 0) {
      return `<tr><td colspan="7" class="p-8 text-center text-slate-400 font-medium text-xs">Nenhum registro de dotação encontrado para os filtros selecionados.</td></tr>`;
    }

    const canCheck = app.permissions.can('dotacoes_check');
    const canEdit = app.permissions.can('dotacoes_edit');
    const canDelete = app.permissions.can('dotacoes_delete');

    return filtered.map(d => {
      const isPend = d.status === 'PENDENTE';
      return `
        <tr class="border-b border-slate-200 transition ${isPend ? 'bg-amber-50/40 hover:bg-amber-100/40' : 'bg-white hover:bg-slate-50'}">
          <td class="p-3.5 font-black text-slate-900 text-xs sm:text-sm font-mono">${d.processo}</td>
          <td class="p-3.5">
            <span class="block font-bold text-slate-800 text-xs">${d.origem}</span>
            <span class="block text-[11px] text-slate-500 line-clamp-1 italic">${d.objeto}</span>
          </td>
          <td class="p-3.5 text-xs">
            <span class="font-bold text-slate-900">${d.solicitante}</span>
          </td>
          <td class="p-3.5 text-right font-black text-slate-900 text-xs sm:text-sm">${d.quantidade.toLocaleString('pt-BR')} un.</td>
          <td class="p-3.5 text-xs text-slate-600">
            <span class="font-bold text-slate-800 block">${d.comprador}</span>
            <span class="text-[10px] text-slate-400 block">${d.dataSolicitacao}</span>
          </td>
          <td class="p-3.5 text-center">
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isPend ? 'badge-dotacao-pendente' : 'badge-dotacao-registrado'}">
              ${isPend ? '⏳ Aguardando' : '✅ Registrado'}
            </span>
            ${!isPend && d.empenhoDoc ? `<span class="block text-[10px] text-emerald-800 font-mono font-bold mt-0.5">Doc: ${d.empenhoDoc}</span>` : ''}
            ${!isPend && d.validador ? `<span class="block text-[9px] text-slate-400 mt-0.5">por ${d.validador}</span>` : ''}
          </td>
          <td class="p-3.5 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1.5">
              ${isPend && canCheck ? `
                <button onclick="app.dotacoes.openBaixaModal(${d.id})" class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-xs transition">
                  ✅ Baixar
                </button>
              ` : ''}
              
              ${canEdit ? `
                <button onclick="app.dotacoes.openEditModal(${d.id})" title="Editar Lançamento" class="px-2 py-1.5 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-800 rounded-lg text-xs font-bold border transition">
                  ✏️
                </button>
              ` : ''}

              ${canDelete ? `
                <button onclick="app.dotacoes.openDeleteModal(${d.id})" title="Excluir Lançamento (Requer confirmação)" class="px-2 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg text-xs font-bold border transition">
                  🗑️
                </button>
              ` : ''}

              ${!isPend && !canEdit && !canDelete ? `<span class="text-[11px] font-bold text-emerald-700">✓ Concluído</span>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
};

app.render.dotacoesHub = function(el) {
  const pendentesCount = app.state.dotacoes.filter(d => d.status === 'PENDENTE').length;
  const registradosCount = app.state.dotacoes.filter(d => d.status === 'REGISTRADO').length;
  const canCreate = app.permissions.can('dotacoes_create');

  el.innerHTML = `
    <div class="container mx-auto px-6 py-6 sm:py-8 fade-in">
        
        <div class="mb-4">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-emerald-600 transition group py-1">
                <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Voltar para o Portal de Acessos</span>
            </button>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Contabilidade & Suprimentos da Saúde</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Livro Digital de Dotações</h2>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">Registro seguro de pedidos de compra e controle de baixa orçamentária.</p>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="app.data.syncFromCloud(true)" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                    🔄 Atualizar
                </button>
                ${canCreate ? `
                  <button onclick="app.dotacoes.openNewModal(true)" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                      <span class="text-sm">+</span> Nova Solicitação
                  </button>
                ` : ''}
            </div>
        </div>

        <!-- CARDS DE RESUMO -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Pedidos</span>
                <p class="text-2xl font-black text-slate-800 mt-1">${app.state.dotacoes.length}</p>
                <span class="text-[10px] text-slate-400">Processos lançados no livro</span>
            </div>
            
            <div onclick="app.dotacoes.setFilter('PENDENTES')" class="cursor-pointer bg-amber-50/60 p-5 rounded-2xl shadow-sm border border-amber-200 hover:bg-amber-100/60 transition">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-amber-900 uppercase tracking-wider">⏳ Aguardando Registro</span>
                    <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">Fila Ativa</span>
                </div>
                <p class="text-2xl font-black text-amber-800 mt-1">${pendentesCount}</p>
                <span class="text-[10px] text-amber-700 font-bold">Clique para filtrar apenas pendentes</span>
            </div>

            <div onclick="app.dotacoes.setFilter('REGISTRADOS')" class="cursor-pointer bg-emerald-50/60 p-5 rounded-2xl shadow-sm border border-emerald-200 hover:bg-emerald-100/60 transition">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wider">✅ Baixas Realizadas</span>
                </div>
                <p class="text-2xl font-black text-emerald-800 mt-1">${registradosCount}</p>
                <span class="text-[10px] text-emerald-700 font-bold">Clique para filtrar concluídos</span>
            </div>
        </div>

        <!-- BARRA DE PESQUISA E FILTROS -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div class="relative flex-1 w-full">
                <input type="text" oninput="app.dotacoes.setSearch(this.value)" placeholder="Buscar por processo (ex: 19011), solicitante, comprador ou objeto..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-emerald-500">
                <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>

            <div class="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <button onclick="app.dotacoes.setFilter('PENDENTES')" class="px-3.5 py-2 rounded-xl text-xs font-black transition whitespace-nowrap ${app.state.dotacoesFilter === 'PENDENTES' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    ⏳ Apenas Pendentes (${pendentesCount})
                </button>
                <button onclick="app.dotacoes.setFilter('REGISTRADOS')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.dotacoesFilter === 'REGISTRADOS' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    ✅ Apenas Registrados
                </button>
                <button onclick="app.dotacoes.setFilter('TODOS')" class="px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.dotacoesFilter === 'TODOS' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    Todos
                </button>
            </div>
        </div>

        <!-- TABELA EM ORDEM DECRESCENTE -->
        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="custom-scroll overflow-y-auto max-h-[600px] relative">
                <table id="table-dotacoes" class="w-full text-left border-collapse text-xs">
                    <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
                        <tr>
                            <th class="p-3.5 w-24">Processo</th>
                            <th class="p-3.5 min-w-[200px]">Origem & Objeto</th>
                            <th class="p-3.5 w-40">Solicitante (Quem pediu)</th>
                            <th class="p-3.5 text-right w-24">Quantidade</th>
                            <th class="p-3.5 w-40">Lançado por (Comprador)</th>
                            <th class="p-3.5 text-center w-36">Situação</th>
                            <th class="p-3.5 text-center w-36">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="table-dotacoes-body" class="divide-y divide-slate-200 font-medium">
                        ${app.dotacoes.renderTableRows()}
                    </tbody>
                </table>
            </div>
        </div>

    </div>
  `;
};

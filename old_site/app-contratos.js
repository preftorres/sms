/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DO PAINEL GERAL DE CONTRATOS (R$ 14,2M) • LDO & LOA
 * Arquivo: app-contratos.js
 * ============================================================================
 */

app.contratos = {
  // CALCULA O SEMÁFORO DE VENCIMENTOS COM BASE NA DATA ATUAL (SET/2026)
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

  // MODAIS DE CADASTRO E EDIÇÃO
  openNewModal() {
    if (!app.admin.isGestorFinanceiro()) return alert("Apenas Administrador e Gestor Financeiro podem cadastrar contratos no painel.");
    const m = document.getElementById('modal-novo-painel-contrato');
    if (m) {
      m.classList.remove('hidden'); m.classList.add('flex');
      document.getElementById('panel-new-empresa').value = '';
      document.getElementById('panel-new-ctt').value = '';
      document.getElementById('panel-new-valor').value = '';
      document.getElementById('panel-new-venc-iso').value = '';
      document.getElementById('panel-new-prazo-txt').value = '';
      document.getElementById('panel-new-objeto').value = '';
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
    const numeroCtt = document.getElementById('panel-new-ctt').value.trim();
    const valor = parseFloat(document.getElementById('panel-new-valor').value) || 0;
    const dataIso = document.getElementById('panel-new-venc-iso').value;
    const fiscal = document.getElementById('panel-new-fiscal').value;
    const prazoTxt = document.getElementById('panel-new-prazo-txt').value.trim();
    const objeto = document.getElementById('panel-new-objeto').value.trim();

    if (!empresa || !numeroCtt || !dataIso) return alert("Preencha ao menos Empresa, Nº Contrato e Vencimento.");

    const now = new Date();
    const criadoEm = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const criadoPor = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';

    const newObj = {
      id: Date.now(), empresa, numeroCtt, prazoVencimento: prazoTxt,
      dataVencimentoIso: dataIso, valorContrato: valor, fiscal,
      status: "Ativo", objeto, criadoEm, criadoPor
    };

    if (!app.state.panelContracts) app.state.panelContracts = [];
    app.state.panelContracts.unshift(newObj);
    this.closeNewModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "CREATE_PANEL_CONTRACT",
      contract: newObj
    });
  },

  openEditModal(id) {
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    document.getElementById('panel-edit-id').value = item.id;
    document.getElementById('panel-edit-empresa').value = item.empresa;
    document.getElementById('panel-edit-ctt').value = item.numeroCtt;
    document.getElementById('panel-edit-valor').value = item.valorContrato;
    document.getElementById('panel-edit-venc-iso').value = item.dataVencimentoIso;
    document.getElementById('panel-edit-fiscal').value = item.fiscal;
    document.getElementById('panel-edit-prazo-txt').value = item.prazoVencimento;
    document.getElementById('panel-edit-objeto').value = item.objeto || '';

    const m = document.getElementById('modal-editar-painel-contrato');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  },

  closeEditModal() {
    const m = document.getElementById('modal-editar-painel-contrato');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  async confirmEdit(e) {
    e.preventDefault();
    const id = Number(document.getElementById('panel-edit-id').value);
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    item.empresa = document.getElementById('panel-edit-empresa').value.trim();
    item.numeroCtt = document.getElementById('panel-edit-ctt').value.trim();
    item.valorContrato = parseFloat(document.getElementById('panel-edit-valor').value) || 0;
    item.dataVencimentoIso = document.getElementById('panel-edit-venc-iso').value;
    item.fiscal = document.getElementById('panel-edit-fiscal').value;
    item.prazoVencimento = document.getElementById('panel-edit-prazo-txt').value.trim();
    item.objeto = document.getElementById('panel-edit-objeto').value.trim();

    this.closeEditModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "UPDATE_PANEL_CONTRACT",
      contract: item
    });
  },

  // ARQUIVAR / DESARQUIVAR (PRESERVAÇÃO DO HISTÓRICO LDO)
  async toggleArchive(id) {
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    const novoStatus = item.status === "Arquivado" ? "Ativo" : "Arquivado";
    item.status = novoStatus;
    app.render.contratosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "ARCHIVE_PANEL_CONTRACT",
      id: id,
      status: novoStatus
    });
  },

  // EXCLUSÃO BLINDADA (DIGITAÇÃO OBRIGATÓRIA SEM COLAR - SÓ ADMIN "DEUS")
  openDeleteModal(id) {
    if (!app.admin.isAdminUser()) return alert("Apenas o Administrador Geral ('Deus') tem permissão para excluir contratos.");
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
    alert("Por segurança institucional, digite o número do contrato manualmente.");
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
    this.closeDeleteModal();
    app.render.contratosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "DELETE_PANEL_CONTRACT",
      id: target.id
    });

    alert(`Contrato ${target.numeroCtt} (${target.empresa}) excluído definitivamente.`);
  },

  // FILTROS
  setFilter(f) {
    app.state.panelContractsFilter = f;
    app.render.contratosHub(document.getElementById('app-viewport'));
  },

  setFiscal(fiscal) {
    app.state.panelFiscalFilter = fiscal;
    app.render.contratosHub(document.getElementById('app-viewport'));
  },

  setSearch(val) {
    app.state.panelSearch = val.toLowerCase().trim();
    app.render.contratosHub(document.getElementById('app-viewport'));
  },

  switchViewMode(mode) {
    app.state.panelViewMode = mode;
    app.render.contratosHub(document.getElementById('app-viewport'));
  },

  getFilteredList() {
    let list = app.state.panelContracts || [];

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
      let matchFiscal = (app.state.panelFiscalFilter === 'TODOS') || (c.fiscal === app.state.panelFiscalFilter);

      // Busca Textual
      let s = app.state.panelSearch || '';
      let matchSearch = !s ||
        c.empresa.toLowerCase().includes(s) ||
        c.numeroCtt.toLowerCase().includes(s) ||
        c.fiscal.toLowerCase().includes(s) ||
        (c.objeto && c.objeto.toLowerCase().includes(s));

      return matchStatus && matchFiscal && matchSearch;
    });
  },

  exportCSV() {
    const list = this.getFilteredList();
    const headers = ["ID", "Empresa", "Numero_CTT", "Objeto", "Fiscal", "Prazo_Vencimento", "Vencimento_ISO", "Valor_Contrato", "Situacao"];
    const rows = list.map(c => {
      const sem = this.calculateStatus(c.dataVencimentoIso, c.status);
      return [
        c.id, `"${c.empresa.replace(/"/g, '""')}"`, `"${c.numeroCtt}"`, `"${(c.objeto || '').replace(/"/g, '""')}"`,
        `"${c.fiscal}"`, `"${c.prazoVencimento}"`, `"${c.dataVencimentoIso}"`, c.valorContrato, `"${sem.label}"`
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
                ${app.admin.isGestorFinanceiro() ? `
                  <button onclick="app.contratos.openNewModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                      <span class="text-sm">+</span> Novo Contrato no Mural
                  </button>
                ` : ''}
            </div>
        </div>

        <!-- OS 4 KPIS OBRIGATÓRIOS DO TOPO (EXATAMENTE COMO PEDIDO) -->
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
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            
            <!-- BUSCA -->
            <div class="relative flex-1">
                <input type="text" oninput="app.contratos.setSearch(this.value)" value="${app.state.panelSearch || ''}" placeholder="Buscar por empresa, número CTT, fiscal ou serviço..." class="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500">
                <span class="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>

            <!-- FILTRO POR FISCAL (DA FOTO DA PAREDE) -->
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap">Fiscal:</span>
                <select onchange="app.contratos.setFiscal(this.value)" class="p-2 bg-slate-50 border rounded-xl text-xs font-bold text-slate-700 outline-none">
                    <option value="TODOS" ${app.state.panelFiscalFilter === 'TODOS' ? 'selected' : ''}>Todos os Fiscais</option>
                    <option value="NAIARA" ${app.state.panelFiscalFilter === 'NAIARA' ? 'selected' : ''}>NAIARA</option>
                    <option value="SANDRO" ${app.state.panelFiscalFilter === 'SANDRO' ? 'selected' : ''}>SANDRO</option>
                    <option value="FRAN" ${app.state.panelFiscalFilter === 'FRAN' ? 'selected' : ''}>FRAN</option>
                    <option value="LASIER" ${app.state.panelFiscalFilter === 'LASIER' ? 'selected' : ''}>LASIER</option>
                    <option value="ADRI" ${app.state.panelFiscalFilter === 'ADRI' ? 'selected' : ''}>ADRI</option>
                    <option value="PREFEITURA" ${app.state.panelFiscalFilter === 'PREFEITURA' ? 'selected' : ''}>PREFEITURA GERAL</option>
                </select>
            </div>

            <!-- FILTRO POR SEMÁFORO / STATUS -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
                <button onclick="app.contratos.setFilter('ATIVOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ATIVOS' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    Ativos (${activeContracts.length})
                </button>
                <button onclick="app.contratos.setFilter('CRITICOS')" class="px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${app.state.panelContractsFilter === 'CRITICOS' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}">
                    🔴 Críticos (< 30d)
                </button>
                <button onclick="app.contratos.setFilter('ATENCAO')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ATENCAO' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}">
                    🟡 Atenção
                </button>
                <button onclick="app.contratos.setFilter('ARQUIVADOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${app.state.panelContractsFilter === 'ARQUIVADOS' ? 'bg-slate-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
                    📁 Arquivados
                </button>
            </div>

            <!-- ALTERNAR MURAL / TABELA -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button onclick="app.contratos.switchViewMode('CARDS')" title="Mural de Cards (Estilo Parede)" class="p-1.5 rounded-lg text-xs font-bold transition ${isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}">
                    🗂️ Mural
                </button>
                <button onclick="app.contratos.switchViewMode('TABELA')" title="Tabela Analítica Financeira" class="p-1.5 rounded-lg text-xs font-bold transition ${!isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500'}">
                    📊 Tabela
                </button>
            </div>

        </div>

        <!-- CONTEÚDO: MURAL DE CARDS OU TABELA ANALÍTICA -->
        ${isCardsMode ? `
            <!-- VISÃO MURAL EM CARDS (IGUAL À PAREDE, MAS INTELIGENTE) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${filteredList.map(c => {
                  const sem = app.contratos.calculateStatus(c.dataVencimentoIso, c.status);
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
                        </div>

                        <!-- AÇÕES NO RODAPÉ -->
                        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                            <button onclick="app.contratos.toggleArchive(${c.id})" class="text-[11px] font-bold text-slate-400 hover:text-slate-700">
                                ${isArch ? '↩️ Desarquivar' : '📁 Arquivar'}
                            </button>

                            <div class="flex items-center gap-1.5">
                                <button onclick="app.contratos.openEditModal(${c.id})" title="Editar Contrato" class="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded-lg font-bold">
                                    ✏️
                                </button>
                                ${app.admin.isAdminUser() ? `
                                  <button onclick="app.contratos.openDeleteModal(${c.id})" title="Excluir Definitivo (Só Admin)" class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg font-bold">
                                      🗑️
                                  </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
        ` : `
            <!-- VISÃO TABELA ANALÍTICA FINANCEIRA (PARA LDO/LOA) -->
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
                            ${filteredList.map(c => {
                              const sem = app.contratos.calculateStatus(c.dataVencimentoIso, c.status);
                              return `
                                <tr class="hover:bg-slate-50">
                                    <td class="p-3.5 font-bold text-slate-900">${c.empresa}</td>
                                    <td class="p-3.5 font-mono text-blue-700 font-bold">${c.numeroCtt}</td>
                                    <td class="p-3.5 text-right font-black text-slate-900">R$ ${c.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">${c.fiscal}</span></td>
                                    <td class="p-3.5 text-slate-600 text-xs">${c.prazoVencimento}</td>
                                    <td class="p-3.5 text-center">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sem.badgeClass}">${sem.label}</span>
                                    </td>
                                    <td class="p-3.5 text-center whitespace-nowrap print:hidden">
                                        <button onclick="app.contratos.openEditModal(${c.id})" class="text-slate-600 hover:text-amber-700 font-bold mr-1.5">✏️</button>
                                        <button onclick="app.contratos.toggleArchive(${c.id})" class="text-slate-400 hover:text-slate-700 font-bold mr-1.5" title="Arquivar">📁</button>
                                        ${app.admin.isAdminUser() ? `<button onclick="app.contratos.openDeleteModal(${c.id})" class="text-rose-500 hover:text-rose-700 font-bold" title="Excluir">🗑️</button>` : ''}
                                    </td>
                                </tr>
                              `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `}

    </div>
  `;
};

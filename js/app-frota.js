/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA MUNICIPAL DE SAÚDE
 * MÓDULO DE GESTÃO DA FROTA DE VEÍCULOS & HISTÓRICO DE MANUTENÇÃO
 * COM ANALISADOR DE ORÇAMENTOS POR INTELIGÊNCIA ARTIFICIAL (ZERO-COST PROMPT)
 * Arquivo: js/app-frota.js
 * ============================================================================
 */

window.app = window.app || {};
window.app.render = window.app.render || {};

app.frota = {
  currentVehicleId: null,

  // --------------------------------------------------------------------------
  // FORMATAÇÃO E UTILITÁRIOS
  // --------------------------------------------------------------------------
  formatCurrency(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  formatKm(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('pt-BR') + ' km';
  },

  formatDateBr(isoOrBr) {
    if (!isoOrBr) return '-';
    const s = String(isoOrBr).trim();
    const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (mIso) return `${mIso[3]}/${mIso[2]}/${mIso[1]}`;
    return s;
  },

  getCategoryBadge(cat) {
    const c = String(cat || '').toUpperCase();
    if (c.includes('AMBULANCIA')) {
      return {
        label: '🚑 Ambulância',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    }
    if (c.includes('COLETIVO') || c.includes('ONIBUS') || c.includes('VAN')) {
      return {
        label: '🚐 Coletivo / TFD',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200'
      };
    }
    if (c.includes('MOTO')) {
      return {
        label: '🏍️ Motocicleta',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
      };
    }
    if (c.includes('REBOQUE')) {
      return {
        label: '🚛 Reboque / Carga',
        badgeClass: 'bg-slate-200 text-slate-800 border-slate-300'
      };
    }
    return {
      label: '🚗 Carro Leve',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
    };
  },

  getStatusBadge(status) {
    const s = String(status || '').trim();
    if (s === 'Em Manutenção') {
      return {
        label: 'Em Manutenção',
        dotClass: 'bg-amber-500 animate-pulse',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        cardBorder: 'border-amber-400 ring-2 ring-amber-100'
      };
    }
    if (s === 'Reserva') {
      return {
        label: 'Em Reserva',
        dotClass: 'bg-slate-400',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
        cardBorder: 'border-slate-200'
      };
    }
    return {
      label: 'Em Operação',
      dotClass: 'bg-emerald-500',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 font-bold',
      cardBorder: 'border-slate-200 hover:border-blue-400'
    };
  },

  // --------------------------------------------------------------------------
  // CONSULTAS E FILTROS DE FROTA E MANUTENÇÕES
  // --------------------------------------------------------------------------
  getFilteredVehicles() {
    const frota = app.state.frota || [];
    const search = (app.state.frotaSearch || '').toLowerCase().trim();
    const catFilter = String(app.state.frotaFilter || 'all').trim();
    const statusFilter = String(app.state.frotaStatusFilter || 'all').trim();
    const linhaFilter = String(app.state.frotaLinhaFilter || 'all').trim();

    return frota.filter(v => {
      // Filtro de Categoria
      if (catFilter && catFilter !== 'all' && catFilter !== 'TODOS' && catFilter !== 'TODAS') {
        if (v.categoria !== catFilter) return false;
      }
      // Filtro de Status
      if (statusFilter && statusFilter !== 'all' && statusFilter !== 'TODOS' && statusFilter !== 'TODAS') {
        if (v.status !== statusFilter) return false;
      }
      // Filtro de Linha (Leve / Pesada)
      if (linhaFilter && linhaFilter !== 'all' && linhaFilter !== 'TODOS' && linhaFilter !== 'TODAS') {
        if (v.linha !== linhaFilter) return false;
      }
      // Busca Textual
      if (search) {
        const fullText = [
          v.placa,
          v.marca,
          v.modelo,
          v.renavam,
          v.chassi,
          v.setor,
          v.proprietario,
          v.combustivel,
          v.observacao
        ].filter(Boolean).join(' ').toLowerCase();

        if (!fullText.includes(search)) return false;
      }
      return true;
    }).sort((a, b) => {
      // Prioridade: Veículos em manutenção no topo, depois por placa
      if (a.status === 'Em Manutenção' && b.status !== 'Em Manutenção') return -1;
      if (a.status !== 'Em Manutenção' && b.status === 'Em Manutenção') return 1;
      return (a.placa || '').localeCompare(b.placa || '');
    });
  },

  getVehicleById(id) {
    const numId = Number(id);
    return (app.state.frota || []).find(v => Number(v.id) === numId);
  },

  getMaintenancesByVehicleId(veiculoId) {
    const numId = Number(veiculoId);
    return (app.state.manutencoes || []).filter(m => Number(m.veiculoId) === numId)
      .sort((a, b) => (b.dataEntrada || '').localeCompare(a.dataEntrada || ''));
  },

  getActiveMaintenance(veiculoId) {
    const numId = Number(veiculoId);
    return (app.state.manutencoes || []).find(m => Number(m.veiculoId) === numId && m.status !== 'Concluída');
  },

  getMaintenanceById(manutencaoId) {
    const numId = Number(manutencaoId);
    return (app.state.manutencoes || []).find(m => Number(m.id) === numId);
  },

  getKpis() {
    const frota = app.state.frota || [];
    const total = frota.length;
    const emOperacao = frota.filter(v => v.status === 'Em Operação').length;
    const emManutencao = frota.filter(v => v.status === 'Em Manutenção').length;
    const emReserva = frota.filter(v => v.status === 'Reserva').length;
    const ambulancias = frota.filter(v => v.categoria === 'AMBULANCIA').length;
    const coletivo = frota.filter(v => v.categoria === 'COLETIVO').length;

    return { total, emOperacao, emManutencao, emReserva, ambulancias, coletivo };
  },

  // --------------------------------------------------------------------------
  // CONTROLES DE INTERFACE
  // --------------------------------------------------------------------------
  setSearch(val) {
    app.state.frotaSearch = val || '';
    this.refreshGrid();
  },

  setFilter(cat) {
    app.state.frotaFilter = cat || 'all';
    this.refreshGrid();
  },

  setStatusFilter(status) {
    app.state.frotaStatusFilter = status || 'all';
    this.refreshGrid();
  },

  setLinhaFilter(linha) {
    app.state.frotaLinhaFilter = linha || 'all';
    this.refreshGrid();
  },

  setViewMode(mode) {
    app.state.frotaViewMode = mode || 'cards';
    this.refreshGrid();
  },

  refreshGrid() {
    const container = document.getElementById('frota-content-area');
    if (!container) return;
    const vehicles = this.getFilteredVehicles();
    if (String(app.state.frotaViewMode || '').toLowerCase() === 'table') {
      container.innerHTML = this.renderTableView(vehicles);
    } else {
      container.innerHTML = this.renderCardsView(vehicles);
    }
  },

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DA VIEW DE CARDS
  // --------------------------------------------------------------------------
  renderCardsView(vehicles) {
    if (!vehicles || vehicles.length === 0) {
      return `
        <div class="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <div class="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">🚗</div>
          <h3 class="text-lg font-bold text-slate-700">Nenhum veículo encontrado</h3>
          <p class="text-sm text-slate-400 mt-1 max-w-md mx-auto">Nenhum veículo corresponde aos filtros selecionados ou à pesquisa digitada.</p>
          <button onclick="app.frota.resetFilters()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition">
            Limpar Filtros de Busca
          </button>
        </div>
      `;
    }

    const canEdit = !app.state.auth.isLogged || app.permissions.can('frota_edit');
    const canMaint = !app.state.auth.isLogged || app.permissions.can('frota_maintenance');

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${vehicles.map(v => {
          const catInfo = this.getCategoryBadge(v.categoria);
          const statusInfo = this.getStatusBadge(v.status);
          const activeMaint = this.getActiveMaintenance(v.id);
          const maintHistory = this.getMaintenancesByVehicleId(v.id);
          const maintCount = maintHistory.length;

          return `
            <div class="bg-white rounded-[2rem] border ${statusInfo.cardBorder} p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between relative group">
              
              <!-- TOPO DO CARD: PLACA MERCOSUL & BADGES -->
              <div>
                <div class="flex items-start justify-between gap-3 mb-4">
                  <!-- PLACA ESTILIZADA -->
                  <div class="inline-flex flex-col border-2 border-slate-800 rounded-lg overflow-hidden shadow-xs bg-white">
                    <div class="bg-blue-800 text-white text-[9px] font-black uppercase px-3 py-0.5 tracking-wider flex items-center justify-between gap-2">
                      <span>BRASIL</span>
                      <span class="w-2 h-1.5 bg-yellow-400 rounded-xs inline-block"></span>
                    </div>
                    <div class="px-3 py-0.5 text-center font-black text-slate-900 tracking-wider text-base font-mono">
                      ${v.placa}
                    </div>
                  </div>

                  <!-- BADGES DE STATUS E CATEGORIA -->
                  <div class="flex flex-col items-end gap-1.5">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.badgeClass}">
                      <span class="w-2 h-2 rounded-full ${statusInfo.dotClass}"></span>
                      ${statusInfo.label}
                    </span>
                    <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${catInfo.badgeClass}">
                      ${catInfo.label}
                    </span>
                  </div>
                </div>

                <!-- TÍTULO: MARCA E MODELO -->
                <div class="mb-3">
                  <span class="text-[10px] font-black text-blue-600 uppercase tracking-widest">${v.marca || 'VEÍCULO'}</span>
                  <h3 class="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition">
                    ${v.modelo}
                  </h3>
                  <p class="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <span class="font-bold text-slate-700">Lotação:</span>
                    <span class="truncate" title="${v.setor || 'Secretaria de Saúde'}">${v.setor || 'Secretaria de Saúde'}</span>
                  </p>
                </div>

                <!-- ESPECIFICAÇÕES TÉCNICAS RÁPIDAS -->
                <div class="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-4">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Ano Fab/Mod</span>
                    <span class="font-bold text-slate-700">${v.anoFab} / ${v.anoMod}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Combustível</span>
                    <span class="font-bold text-slate-700">${v.combustivel || 'FLEX'}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Capacidade</span>
                    <span class="font-bold text-slate-700">${v.capacidade ? `${v.capacidade} lug.` : 'Condutor'}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">KM Atual</span>
                    <span class="font-bold text-slate-700 font-mono">${this.formatKm(v.kmAtual)}</span>
                  </div>
                </div>

                <!-- ALERTA DE MANUTENÇÃO ATIVA (SE HOUVER) -->
                ${v.status === 'Em Manutenção' && activeMaint ? `
                  <div class="mb-4 p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl">
                    <div class="flex items-center justify-between text-[11px] font-black text-amber-900 mb-1.5">
                      <span class="flex items-center gap-1.5">
                        <span class="text-sm">⚠️</span> EM MANUTENÇÃO
                      </span>
                      <span class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        Entrada: ${this.formatDateBr(activeMaint.dataEntrada)}
                      </span>
                    </div>
                    <p class="text-xs text-amber-950 font-semibold leading-relaxed line-clamp-2" title="${activeMaint.defeitoApresentado}">
                      <span class="font-bold text-amber-800">Defeito:</span> "${activeMaint.defeitoApresentado || 'Não especificado'}"
                    </p>
                    <div class="mt-2 text-[11px] text-amber-800 flex items-center justify-between border-t border-amber-200/60 pt-2">
                      <span><strong class="text-amber-900">Oficina:</strong> ${activeMaint.oficina || 'Credenciada'}</span>
                      <button onclick="app.frota.openAiPromptModal(${v.id}, ${activeMaint.id})" class="text-[11px] font-black text-blue-700 hover:text-blue-900 underline flex items-center gap-1">
                        🤖 Analisar c/ IA
                      </button>
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- BOTÕES DE AÇÃO DO CARD -->
              <div class="pt-4 border-t border-slate-100 flex flex-col gap-2">
                
                ${v.status === 'Em Manutenção' ? `
                  <div class="grid grid-cols-2 gap-2">
                    <button onclick="app.frota.openAiPromptModal(${v.id}, ${activeMaint ? activeMaint.id : 'null'})" 
                            class="w-full py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5">
                      <span>🤖</span> Analisar IA
                    </button>
                    ${canMaint ? `
                    <button onclick="app.frota.openCompleteMaintenanceModal(${activeMaint ? activeMaint.id : 'null'}, ${v.id})" 
                            class="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition flex items-center justify-center gap-1">
                      <span>✅</span> Concluir
                    </button>
                    ` : ''}
                  </div>
                ` : `
                  ${canMaint ? `
                  <button onclick="app.frota.openSendToMaintenanceModal(${v.id})" 
                          class="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black shadow-xs hover:shadow-md transition flex items-center justify-center gap-1.5">
                    <span>🔧</span> Enviar p/ Manutenção
                  </button>
                  ` : ''}
                `}

                <div class="flex items-center justify-between text-xs font-bold pt-1">
                  <button onclick="app.frota.openMaintenanceHistoryModal(${v.id})" 
                          class="text-slate-500 hover:text-blue-600 transition flex items-center gap-1 text-[11px]">
                    <span>📜</span> Histórico (${maintCount})
                  </button>
                  
                  <div class="flex items-center gap-2">
                    <button onclick="app.frota.openAiPromptModal(${v.id})" 
                            class="text-blue-600 hover:text-blue-800 transition text-[11px] font-bold" title="Gerar prompt de análise de orçamento para este veículo">
                      🤖 Prompt IA
                    </button>
                    ${canEdit ? `
                    <button onclick="app.frota.openVehicleModal(${v.id})" 
                            class="text-slate-400 hover:text-slate-700 transition text-[11px]" title="Editar dados do veículo">
                      ✏️ Editar
                    </button>
                    ` : ''}
                  </div>
                </div>

              </div>

            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DA VIEW DE TABELA
  // --------------------------------------------------------------------------
  renderTableView(vehicles) {
    if (!vehicles || vehicles.length === 0) {
      return `
        <div class="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <p class="text-sm text-slate-500 font-bold">Nenhum veículo encontrado com os filtros atuais.</p>
        </div>
      `;
    }

    const canMaint = !app.state.auth.isLogged || app.permissions.can('frota_maintenance');
    const canEdit = !app.state.auth.isLogged || app.permissions.can('frota_edit');

    return `
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                <th class="py-3 px-4">Placa</th>
                <th class="py-3 px-4">Categoria</th>
                <th class="py-3 px-4">Marca / Modelo</th>
                <th class="py-3 px-4">Ano</th>
                <th class="py-3 px-4">Combustível</th>
                <th class="py-3 px-4">Setor / Lotação</th>
                <th class="py-3 px-4">KM Atual</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
              ${vehicles.map(v => {
                const catInfo = this.getCategoryBadge(v.categoria);
                const statusInfo = this.getStatusBadge(v.status);
                const activeMaint = this.getActiveMaintenance(v.id);

                return `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-3 px-4 font-mono font-bold text-slate-900">${v.placa}</td>
                    <td class="py-3 px-4">
                      <span class="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${catInfo.badgeClass}">
                        ${catInfo.label}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-bold text-slate-900">
                      ${v.marca} ${v.modelo}
                    </td>
                    <td class="py-3 px-4">${v.anoFab}/${v.anoMod}</td>
                    <td class="py-3 px-4">${v.combustivel || 'FLEX'}</td>
                    <td class="py-3 px-4 max-w-[200px] truncate" title="${v.setor}">${v.setor || '-'}</td>
                    <td class="py-3 px-4 font-mono">${this.formatKm(v.kmAtual)}</td>
                    <td class="py-3 px-4">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusInfo.badgeClass}">
                        <span class="w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}"></span>
                        ${statusInfo.label}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right space-x-1">
                      ${v.status === 'Em Manutenção' ? `
                        <button onclick="app.frota.openAiPromptModal(${v.id}, ${activeMaint ? activeMaint.id : 'null'})" 
                                class="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700" title="Analisar Orçamento IA">
                          🤖 IA
                        </button>
                        ${canMaint ? `
                        <button onclick="app.frota.openCompleteMaintenanceModal(${activeMaint ? activeMaint.id : 'null'}, ${v.id})" 
                                class="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700" title="Concluir Manutenção">
                          ✅ Concluir
                        </button>
                        ` : ''}
                      ` : `
                        ${canMaint ? `
                        <button onclick="app.frota.openSendToMaintenanceModal(${v.id})" 
                                class="px-2 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold hover:bg-amber-600" title="Enviar para Manutenção">
                          🔧 Enviar
                        </button>
                        ` : ''}
                      `}
                      <button onclick="app.frota.openMaintenanceHistoryModal(${v.id})" 
                              class="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200" title="Histórico">
                        📜
                      </button>
                      ${canEdit ? `
                      <button onclick="app.frota.openVehicleModal(${v.id})" 
                              class="px-2 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200" title="Editar">
                        ✏️
                      </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  resetFilters() {
    app.state.frotaSearch = '';
    app.state.frotaFilter = 'all';
    app.state.frotaStatusFilter = 'all';
    app.state.frotaLinhaFilter = 'all';
    const input = document.getElementById('frota-search-input');
    if (input) input.value = '';
    const selCat = document.getElementById('frota-filter-categoria');
    if (selCat) selCat.value = 'all';
    const selStat = document.getElementById('frota-filter-status');
    if (selStat) selStat.value = 'all';
    this.refreshGrid();
  },

  // --------------------------------------------------------------------------
  // MODAL 1: ENVIAR VEÍCULO PARA MANUTENÇÃO (REGISTRO IMEDIATO DO DEFEITO)
  // --------------------------------------------------------------------------
  openSendToMaintenanceModal(veiculoId) {
    const v = this.getVehicleById(veiculoId);
    if (!v) return;

    const modalHost = document.getElementById('modal-host');
    const todayIso = new Date().toISOString().split('T')[0];

    modalHost.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
          
          <!-- CABEÇALHO DO MODAL -->
          <div class="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
                🔧
              </div>
              <div>
                <h3 class="font-black text-lg leading-tight">Enviar para Manutenção</h3>
                <p class="text-xs text-amber-100 font-medium">Registro imediato do defeito e encaminhamento mecânico</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition">
              ✕
            </button>
          </div>

          <!-- RESUMO DO VEÍCULO SELECIONADO -->
          <div class="px-6 py-3 bg-amber-50/70 border-b border-amber-100 flex items-center justify-between text-xs">
            <div>
              <span class="font-black text-amber-950 text-sm font-mono mr-2">${v.placa}</span>
              <span class="font-bold text-amber-900">${v.marca} ${v.modelo} (${v.anoFab}/${v.anoMod})</span>
            </div>
            <span class="text-amber-800 font-medium">${v.setor || 'Saúde'}</span>
          </div>

          <!-- FORMULÁRIO -->
          <form onsubmit="app.frota.submitSendToMaintenance(event, ${v.id})" class="p-6 space-y-4">
            
            <!-- CAMPO CRUCIAL: DEFEITO APRESENTADO / PREVENTIVO -->
            <div>
              <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                Defeito Apresentado / Motivo do Envio <span class="text-rose-500">*</span>
              </label>
              <textarea id="maint-defeito" rows="3" required
                        placeholder="Ex: Barulho e folga no diferencial traseiro ao acelerar; revisão no freio e troca de óleo preventiva..."
                        class="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-medium leading-relaxed"></textarea>
              <p class="text-[11px] text-slate-400 mt-1">Este defeito será automaticamente injetado no <strong>Prompt de Inteligência Artificial</strong> para auditoria do orçamento que a oficina emitir.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Tipo de Manutenção
                </label>
                <select id="maint-tipo" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
                  <option value="Corretiva" selected>Corretiva (Reparo / Defeito)</option>
                  <option value="Preventiva">Preventiva (Revisão Periódica)</option>
                  <option value="Emergencial">Emergencial (Socorro / Pane na Estrada)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Oficina / Prestador
                </label>
                <input type="text" id="maint-oficina" placeholder="Ex: Nildiesel Retífica de Motores"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Data de Envio
                </label>
                <input type="date" id="maint-data" value="${todayIso}" required
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  KM no Envio
                </label>
                <input type="number" id="maint-km" value="${v.kmAtual || 0}" min="0" required
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Responsável / Motorista
                </label>
                <input type="text" id="maint-motorista" placeholder="Ex: Transporte Saúde"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
              </div>
            </div>

            <div>
              <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                Observações Adicionais
              </label>
              <input type="text" id="maint-obs" placeholder="Ex: Prioridade alta por ser van de hemodiálise"
                     class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none font-medium">
            </div>

            <!-- BOTÕES DE SUBMIT -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onclick="document.getElementById('modal-host').innerHTML=''" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2">
                <span>🔧</span> Confirmar Envio para Manutenção
              </button>
            </div>

          </form>

        </div>
      </div>
    `;
  },

  submitSendToMaintenance(e, veiculoId) {
    e.preventDefault();
    const v = this.getVehicleById(veiculoId);
    if (!v) return;

    const defeito = document.getElementById('maint-defeito').value.trim();
    const tipo = document.getElementById('maint-tipo').value;
    const oficina = document.getElementById('maint-oficina').value.trim() || 'Oficina Credenciada';
    const dataEntrada = document.getElementById('maint-data').value;
    const kmEntrada = Number(document.getElementById('maint-km').value) || v.kmAtual || 0;
    const motorista = document.getElementById('maint-motorista').value.trim() || 'Transporte Saúde';
    const obs = document.getElementById('maint-obs').value.trim();

    // 1. Atualiza status do veículo
    v.status = 'Em Manutenção';
    v.kmAtual = Math.max(v.kmAtual || 0, kmEntrada);

    // 2. Cria registro de manutenção
    const newId = (app.state.manutencoes || []).reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
    const newMaint = {
      id: newId,
      veiculoId: v.id,
      placa: v.placa,
      modelo: `${v.marca} ${v.modelo}`,
      tipo: tipo,
      defeitoApresentado: defeito,
      oficina: oficina,
      dataEntrada: dataEntrada,
      dataSaida: '',
      kmEntrada: kmEntrada,
      motorista: motorista,
      status: 'Em Aberto',
      orcamentoNum: '',
      empenhoPecas: '',
      valorPecas: 0,
      empenhoServicos: '',
      valorServicos: 0,
      notasFiscais: '',
      processo1Doc: '',
      itensOrcamento: '',
      observacoes: obs,
      criadoEm: new Date().toLocaleString('pt-BR'),
      criadoPor: (app.state.auth && app.state.auth.login) || 'operador'
    };

    app.state.manutencoes.unshift(newMaint);

    // 3. Salva nos caches locais
    if (app.data && app.data.saveLocalFrota) app.data.saveLocalFrota();
    if (app.data && app.data.saveLocalManutencoes) app.data.saveLocalManutencoes();

    // 4. Feedback e fechamento
    document.getElementById('modal-host').innerHTML = '';
    app.ui.toast(`Veículo ${v.placa} enviado para manutenção com sucesso!`, 'success', 'Status Atualizado');
    this.refreshGrid();

    // Oferece abrir a IA logo em seguida
    setTimeout(() => {
      app.ui.toast('Dica: Quando a oficina enviar o orçamento, use o botão "Analisar com IA" para auditar as peças!', 'info', 'Auditoria IA');
    }, 1500);
  },

  // --------------------------------------------------------------------------
  // MODAL 2: ANALISADOR DE ORÇAMENTOS POR IA (GERADOR DE PROMPTS ZERO-CUSTO)
  // --------------------------------------------------------------------------
  openAiPromptModal(veiculoId, manutencaoId = null) {
    const v = this.getVehicleById(veiculoId);
    if (!v) return;

    let maint = manutencaoId ? this.getMaintenanceById(manutencaoId) : this.getActiveMaintenance(v.id);
    if (!maint) {
      const history = this.getMaintenancesByVehicleId(v.id);
      if (history.length > 0) maint = history[0];
    }

    const defeito = maint ? (maint.defeitoApresentado || 'Revisão periódica / Defeito não detalhado') : 'Manutenção preventiva e corretiva';
    const oficina = maint ? (maint.oficina || 'Oficina Mecânica Credenciada') : 'Oficina Credenciada';
    const orcamentoNum = maint ? (maint.orcamentoNum || '') : '';
    const itensPreenchidos = maint ? (maint.itensOrcamento || '') : '';

    const initialPrompt = this.generateAiAuditPrompt(v, defeito, oficina, orcamentoNum, itensPreenchidos);

    const modalHost = document.getElementById('modal-host');
    modalHost.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
          
          <!-- CABEÇALHO DO MODAL -->
          <div class="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-5 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
                🤖
              </div>
              <div>
                <h3 class="font-black text-lg leading-tight">Analisador de Orçamento com IA</h3>
                <p class="text-xs text-blue-200 font-medium">Auditoria técnica mecânica sem custo de API (ChatGPT / Gemini / Claude)</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition">
              ✕
            </button>
          </div>

          <!-- BANNER INFORMATIVO / GUIA PASSO A PASSO -->
          <div class="bg-blue-50/90 border-b border-blue-100 p-4 text-xs text-blue-950">
            <div class="font-bold flex items-center gap-2 mb-1">
              <span class="text-base">💡</span> Como funciona esta auditoria inteligente:
            </div>
            <ol class="list-decimal list-inside space-y-1 text-slate-700 pl-1 font-medium">
              <li>Clique no botão <strong class="text-blue-700">"📋 Copiar Prompt Especializado"</strong> abaixo.</li>
              <li>Clique em um dos botões para abrir o <strong>Google Gemini</strong>, <strong>ChatGPT</strong> ou <strong>Claude</strong>.</li>
              <li>Cole o texto copiado no chat e <strong>anexe a foto ou PDF do orçamento</strong> enviado pela oficina.</li>
              <li>A IA fará a perícia técnica, checará se as peças fazem sentido para o defeito e dirá o que deve ser questionado!</li>
            </ol>
          </div>

          <div class="p-6 space-y-4">
            
            <!-- RESUMO DO VEÍCULO E DEFEITO -->
            <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">Veículo Alvo</span>
                <span class="font-black text-slate-800 font-mono">${v.placa}</span> - 
                <span class="font-bold text-slate-700">${v.marca} ${v.modelo} (${v.anoFab})</span>
              </div>
              <div class="sm:text-right">
                <span class="text-[10px] text-slate-400 font-bold uppercase block">Defeito Registrado no Envio</span>
                <span class="font-bold text-amber-800 truncate block max-w-xs" title="${defeito}">${defeito}</span>
              </div>
            </div>

            <!-- ÁREA DO PROMPT EDITÁVEL / COPIÁVEL -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-black uppercase text-slate-700 tracking-wider">
                  Prompt Especializado Gerado
                </label>
                <span class="text-[11px] text-slate-400 font-medium">Personalizado com os dados deste veículo</span>
              </div>
              <textarea id="ai-prompt-content" rows="11"
                        class="w-full text-xs font-mono p-3.5 rounded-2xl border border-slate-300 bg-slate-900 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed select-all">${initialPrompt}</textarea>
            </div>

            <!-- BOTÃO COPIAR PROMPT -->
            <div>
              <button id="btn-copy-prompt" onclick="app.frota.copyAiPrompt()" 
                      class="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <span>Copiar Prompt Especializado</span>
              </button>
            </div>

            <!-- BOTÕES PARA ABRIR IAs DIRETAMENTE (SEM CUSTO DE API) -->
            <div class="pt-3 border-t border-slate-100">
              <span class="text-[11px] font-black uppercase text-slate-400 tracking-wider block text-center mb-2.5">
                Abrir Ferramenta de Inteligência Artificial:
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                
                <!-- GOOGLE GEMINI -->
                <a href="https://gemini.google.com/" target="_blank" rel="noopener noreferrer"
                   class="flex items-center justify-center gap-2 p-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs transition shadow-xs">
                  <span class="text-base">🌐</span>
                  <span>Google Gemini</span>
                  <span class="text-[10px] text-blue-600">↗</span>
                </a>

                <!-- CHATGPT -->
                <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer"
                   class="flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition shadow-xs">
                  <span class="text-base">🟢</span>
                  <span>ChatGPT</span>
                  <span class="text-[10px] text-emerald-600">↗</span>
                </a>

                <!-- CLAUDE -->
                <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer"
                   class="flex items-center justify-center gap-2 p-3 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs transition shadow-xs">
                  <span class="text-base">🟣</span>
                  <span>Claude</span>
                  <span class="text-[10px] text-purple-600">↗</span>
                </a>

              </div>
            </div>

          </div>

          <!-- RODAPÉ DO MODAL -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Secretaria Municipal de Saúde • Torres/RS</span>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="font-bold text-slate-600 hover:text-slate-800">
              Fechar Janela
            </button>
          </div>

        </div>
      </div>
    `;
  },

  generateAiAuditPrompt(veiculo, defeito, oficina, orcamentoNum, itensPreenchidos) {
    const v = veiculo;
    const dataHoje = new Date().toLocaleDateString('pt-BR');

    return `Você é um Engenheiro Mecânico Perito e Auditor Especialista em Gestão de Frotas Públicas Municipais.
Estou lhe enviando um orçamento emitido por uma oficina mecânica prestadora de serviços para a Secretaria Municipal de Saúde de Torres/RS.
Por se tratar de dinheiro público e da segurança dos motoristas e pacientes atendidos pela saúde, preciso de uma auditoria técnica rigorosa.

--- DADOS TÉCNICOS DO VEÍCULO ---
• Veículo: ${v.marca} ${v.modelo}
• Categoria: ${v.categoria} (${v.linha || 'Linha Leve'})
• Ano Fabricação / Modelo: ${v.anoFab} / ${v.anoMod}
• Motorização: ${v.potencia || '-'} | Cilindrada: ${v.cilindrada || '-'}cc
• Combustível: ${v.combustivel || 'FLEX'}
• Placa: ${v.placa} | Chassi: ${v.chassi || '-'}
• Quilometragem Atual: ${v.kmAtual ? v.kmAtual.toLocaleString('pt-BR') : 'Não informada'} km
• Lotação / Setor de Uso: ${v.setor || 'Secretaria de Saúde'}

--- MOTIVO DO ENVIO / DEFEITO APRESENTADO ---
"${defeito || 'Revisão periódica / Defeito relatado pelo setor de transporte'}"

--- DADOS DO ORÇAMENTO RECEBIDO ---
• Oficina Emissora: ${oficina}
• Orçamento Nº: ${orcamentoNum || 'Conforme documento/foto anexa'}
• Data da Análise: ${dataHoje}
${itensPreenchidos ? `• Itens e Peças Descritas: ${itensPreenchidos}` : '• Itens e Peças: Por favor, analise a FOTO ou PDF do orçamento que acabo de anexar nesta conversa.'}

--- SUAS TAREFAS DE AUDITORIA ---
Por favor, elabore um parecer técnico respondendo de forma clara e didática aos seguintes tópicos:

1. COERÊNCIA MECÂNICA E NEXO CAUSAL:
   - Todas as peças e serviços orçados fazem sentido mecânico direto com o defeito apresentado e com as especificações deste veículo?
   - Há indícios de peças "estranhas", desnecessárias ou que pertencem a outro sistema não relacionado?

2. CLASSIFICAÇÃO DOS ITENS:
   - Divida os itens do orçamento em:
     a) OBRIGATÓRIOS / ESSENCIAIS (itens indispensáveis para solucionar o problema com segurança).
     b) COMPLEMENTARES / PREVENTIVOS (peças trocadas por desgaste natural conjunto).
     c) SUSPEITOS / DISPENSÁVEIS (itens que não deveriam estar presentes ou com valor/quantidade questionável).

3. MÃO DE OBRA E TEMPO DE SERVIÇO:
   - Os serviços de mão de obra cobrados são proporcionais e condizentes com as peças a serem trocadas?
   - Há cobrança duplicada de mão de obra para desmontagens da mesma área do veículo?

4. PERGUNTAS TÉCNICAS PARA QUESTIONAR A OFICINA:
   - Formule de 2 a 4 perguntas objetivas e técnicas que a Secretaria de Saúde deve formalizar à oficina antes de autorizar o conserto.

5. PARECER CONCLUSIVO:
   - Conclusão sucinta: [APROVAÇÃO TOTAL] / [APROVAÇÃO COM RESSALVAS] / [SUSPENDER E QUESTIONAR A OFICINA].`;
  },

  copyAiPrompt() {
    const textarea = document.getElementById('ai-prompt-content');
    if (!textarea) return;

    textarea.select();
    textarea.setSelectionRange(0, 99999);

    const btn = document.getElementById('btn-copy-prompt');

    try {
      navigator.clipboard.writeText(textarea.value).then(() => {
        if (btn) {
          btn.innerHTML = '<span>✅</span> <span>Prompt Copiado com Sucesso!</span>';
          btn.classList.remove('from-blue-600', 'to-indigo-600');
          btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
          setTimeout(() => {
            btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> <span>Copiar Prompt Especializado</span>';
            btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
            btn.classList.add('from-blue-600', 'to-indigo-600');
          }, 3000);
        }
        app.ui.toast('Prompt copiado! Abra o Gemini, ChatGPT ou Claude e cole junto à foto do orçamento.', 'success', 'Pronto para Colar');
      }).catch(() => {
        document.execCommand('copy');
        app.ui.toast('Prompt copiado para a área de transferência!', 'success', 'Copiado');
      });
    } catch (e) {
      document.execCommand('copy');
      app.ui.toast('Prompt copiado para a área de transferência!', 'success', 'Copiado');
    }
  },

  // --------------------------------------------------------------------------
  // MODAL 3: CONCLUIR MANUTENÇÃO (REGISTRO DE EMPENHOS, NFS E 1DOC)
  // --------------------------------------------------------------------------
  openCompleteMaintenanceModal(manutencaoId, fallbackVeiculoId = null) {
    let m = manutencaoId ? this.getMaintenanceById(manutencaoId) : null;
    let v = null;

    if (m) {
      v = this.getVehicleById(m.veiculoId);
    } else if (fallbackVeiculoId) {
      v = this.getVehicleById(fallbackVeiculoId);
      m = this.getActiveMaintenance(v.id);
    }

    if (!v) return;

    const modalHost = document.getElementById('modal-host');
    const todayIso = new Date().toISOString().split('T')[0];

    modalHost.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
          
          <!-- CABEÇALHO DO MODAL -->
          <div class="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl shadow-inner">
                ✅
              </div>
              <div>
                <h3 class="font-black text-lg leading-tight">Concluir Manutenção & Dar Baixa</h3>
                <p class="text-xs text-emerald-100 font-medium">Registro contábil de empenhos, notas fiscais e retorno do veículo à operação</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition">
              ✕
            </button>
          </div>

          <!-- RESUMO DO VEÍCULO E DEFEITO -->
          <div class="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div>
              <span class="font-black text-emerald-950 text-sm font-mono mr-2">${v.placa}</span>
              <span class="font-bold text-emerald-900">${v.marca} ${v.modelo}</span>
            </div>
            <span class="text-emerald-800 font-medium">${m ? m.oficina : 'Oficina Credenciada'}</span>
          </div>

          <!-- FORMULÁRIO DE FECHAMENTO -->
          <form onsubmit="app.frota.submitCompleteMaintenance(event, ${m ? m.id : 'null'}, ${v.id})" class="p-6 space-y-4">
            
            <!-- NÚMERO DO ORÇAMENTO -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Nº do Orçamento
                </label>
                <input type="text" id="maint-close-orc" value="${m ? (m.orcamentoNum || '') : ''}" placeholder="Ex: 2890"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-bold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Data de Saída / Retorno
                </label>
                <input type="date" id="maint-close-data" value="${todayIso}" required
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  KM de Retorno
                </label>
                <input type="number" id="maint-close-km" value="${v.kmAtual || 0}" min="${v.kmAtual || 0}" required
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono font-bold">
              </div>
            </div>

            <!-- DADOS DOS EMPENHOS (PEÇAS E SERVIÇOS) -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span class="text-xs font-black uppercase text-slate-700 tracking-wider block">
                Empenhos de Pagamento (Contabilidade)
              </span>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">
                    Empenho - PEÇAS
                  </label>
                  <input type="text" id="maint-close-emp-pecas" value="${m ? (m.empenhoPecas || '') : ''}" placeholder="Ex: 6844"
                         class="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold">
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">
                    Valor Total Peças (R$)
                  </label>
                  <input type="text" id="maint-close-val-pecas" value="${m && m.valorPecas ? this.formatCurrency(m.valorPecas) : ''}" placeholder="0,00"
                         oninput="app.empenhos.maskCurrencyInput(this)"
                         class="w-full text-xs p-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800">
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">
                    Empenho - SERVIÇOS
                  </label>
                  <input type="text" id="maint-close-emp-serv" value="${m ? (m.empenhoServicos || '') : ''}" placeholder="Ex: 6842"
                         class="w-full text-xs p-2 rounded-xl border border-slate-300 font-semibold">
                </div>

                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">
                    Valor Total Serviços (R$)
                  </label>
                  <input type="text" id="maint-close-val-serv" value="${m && m.valorServicos ? this.formatCurrency(m.valorServicos) : ''}" placeholder="0,00"
                         oninput="app.empenhos.maskCurrencyInput(this)"
                         class="w-full text-xs p-2 rounded-xl border border-slate-300 font-mono font-bold text-slate-800">
                </div>
              </div>
            </div>

            <!-- NOTAS FISCAIS E PROCESSO 1DOC -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Notas Fiscais Emitidas
                </label>
                <input type="text" id="maint-close-nfs" value="${m ? (m.notasFiscais || '') : ''}" placeholder="Ex: NF 08606 / NF 270"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Processo 1Doc
                </label>
                <input type="text" id="maint-close-1doc" value="${m ? (m.processo1Doc || '') : ''}" placeholder="Ex: 1Doc 19.562 / 1Doc 19.551"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-semibold">
              </div>
            </div>

            <!-- ITENS REPARADOS / PEÇAS TROCADAS -->
            <div>
              <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                Peças Substituídas / Serviços Executados
              </label>
              <textarea id="maint-close-itens" rows="2"
                        placeholder="Ex: Coroa e pinhão, rolamento traseiro, troca de óleo motor 15w40 e filtros..."
                        class="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium">${m ? (m.itensOrcamento || '') : ''}</textarea>
            </div>

            <!-- BOTÕES DE SUBMIT -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onclick="document.getElementById('modal-host').innerHTML=''" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition flex items-center gap-2">
                <span>✅</span> Concluir e Retornar Veículo à Operação
              </button>
            </div>

          </form>

        </div>
      </div>
    `;
  },

  submitCompleteMaintenance(e, maintId, veiculoId) {
    e.preventDefault();
    const v = this.getVehicleById(veiculoId);
    if (!v) return;

    let m = maintId ? this.getMaintenanceById(maintId) : this.getActiveMaintenance(v.id);
    if (!m) {
      // Cria manutenção retroativa caso não existisse
      const newId = (app.state.manutencoes || []).reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;
      m = {
        id: newId,
        veiculoId: v.id,
        placa: v.placa,
        modelo: `${v.marca} ${v.modelo}`,
        tipo: 'Corretiva',
        defeitoApresentado: 'Manutenção realizada',
        oficina: 'Oficina Credenciada',
        dataEntrada: new Date().toISOString().split('T')[0],
        status: 'Em Aberto',
        criadoEm: new Date().toLocaleString('pt-BR'),
        criadoPor: (app.state.auth && app.state.auth.login) || 'operador'
      };
      app.state.manutencoes.unshift(m);
    }

    const orcNum = document.getElementById('maint-close-orc').value.trim();
    const dataSaida = document.getElementById('maint-close-data').value;
    const kmSaida = Number(document.getElementById('maint-close-km').value) || v.kmAtual || 0;
    const empPecas = document.getElementById('maint-close-emp-pecas').value.trim();
    const valPecas = app.empenhos.parseCurrency(document.getElementById('maint-close-val-pecas').value);
    const empServ = document.getElementById('maint-close-emp-serv').value.trim();
    const valServ = app.empenhos.parseCurrency(document.getElementById('maint-close-val-serv').value);
    const nfs = document.getElementById('maint-close-nfs').value.trim();
    const doc1 = document.getElementById('maint-close-1doc').value.trim();
    const itens = document.getElementById('maint-close-itens').value.trim();

    // Atualiza registro de manutenção
    m.orcamentoNum = orcNum;
    m.dataSaida = dataSaida;
    m.empenhoPecas = empPecas;
    m.valorPecas = valPecas;
    m.empenhoServicos = empServ;
    m.valorServicos = valServ;
    m.notasFiscais = nfs;
    m.processo1Doc = doc1;
    m.itensOrcamento = itens;
    m.status = 'Concluída';

    // Atualiza status do veículo de volta para Operação
    v.status = 'Em Operação';
    v.kmAtual = Math.max(v.kmAtual || 0, kmSaida);

    // Salva caches locais
    if (app.data && app.data.saveLocalFrota) app.data.saveLocalFrota();
    if (app.data && app.data.saveLocalManutencoes) app.data.saveLocalManutencoes();

    // Fecha modal e feedback
    document.getElementById('modal-host').innerHTML = '';
    app.ui.toast(`Manutenção do veículo ${v.placa} concluída com sucesso! Veículo liberado para operação.`, 'success', 'Concluído');
    this.refreshGrid();
  },

  // --------------------------------------------------------------------------
  // MODAL 4: HISTÓRICO DE MANUTENÇÕES DO VEÍCULO
  // --------------------------------------------------------------------------
  openMaintenanceHistoryModal(veiculoId) {
    const v = this.getVehicleById(veiculoId);
    if (!v) return;

    const history = this.getMaintenancesByVehicleId(v.id);
    const totalPecas = history.reduce((sum, m) => sum + (Number(m.valorPecas) || 0), 0);
    const totalServicos = history.reduce((sum, m) => sum + (Number(m.valorServicos) || 0), 0);
    const totalInvestido = totalPecas + totalServicos;

    const modalHost = document.getElementById('modal-host');
    modalHost.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
          
          <!-- CABEÇALHO DO MODAL -->
          <div class="bg-torres-dark px-6 py-5 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner text-blue-400">
                📜
              </div>
              <div>
                <h3 class="font-black text-lg leading-tight">Histórico de Manutenções</h3>
                <p class="text-xs text-blue-300 font-medium">${v.placa} • ${v.marca} ${v.modelo} (${v.anoFab}/${v.anoMod})</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition">
              ✕
            </button>
          </div>

          <!-- RESUMO FINANCEIRO INVESTIDO NO VEÍCULO -->
          <div class="grid grid-cols-3 gap-2 p-4 bg-slate-50 border-b border-slate-200 text-center text-xs">
            <div class="p-2 bg-white rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Peças</span>
              <span class="font-black text-slate-800 font-mono">R$ ${this.formatCurrency(totalPecas)}</span>
            </div>
            <div class="p-2 bg-white rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Serviços</span>
              <span class="font-black text-slate-800 font-mono">R$ ${this.formatCurrency(totalServicos)}</span>
            </div>
            <div class="p-2 bg-blue-50/80 rounded-xl border border-blue-200">
              <span class="text-[10px] text-blue-600 font-bold uppercase block">Total Geral Investido</span>
              <span class="font-black text-blue-900 font-mono">R$ ${this.formatCurrency(totalInvestido)}</span>
            </div>
          </div>

          <!-- LISTA TIMELINE DE EVENTOS -->
          <div class="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            ${history.length === 0 ? `
              <div class="text-center py-12 text-slate-400 text-xs">
                <span class="text-3xl block mb-2">✨</span>
                Nenhum registro de manutenção anterior encontrado para este veículo.
              </div>
            ` : history.map(m => {
              const isAberta = m.status !== 'Concluída';
              return `
                <div class="p-4 rounded-2xl border ${isAberta ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'} shadow-xs space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <span class="inline-block px-2 py-0.5 rounded text-[10px] font-bold ${isAberta ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}">
                        ${m.status || 'Concluída'}
                      </span>
                      <span class="text-xs font-black text-slate-800 ml-2">${m.oficina || 'Oficina Mecânica'}</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-mono">
                      ${this.formatDateBr(m.dataEntrada)} ${m.dataSaida ? `até ${this.formatDateBr(m.dataSaida)}` : '(Em Aberto)'}
                    </span>
                  </div>

                  <!-- DEFEITO RELATADO -->
                  <p class="text-xs text-slate-700 font-medium">
                    <strong class="text-slate-900">Defeito:</strong> "${m.defeitoApresentado || 'Não especificado'}"
                  </p>

                  <!-- DADOS CONTÁBEIS (SE HOUVER) -->
                  ${(m.empenhoPecas || m.empenhoServicos || m.orcamentoNum || m.notasFiscais) ? `
                    <div class="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span class="text-[9px] text-slate-400 uppercase font-bold block">Orçamento</span>
                        <span class="font-bold text-slate-700">${m.orcamentoNum || '-'}</span>
                      </div>
                      <div>
                        <span class="text-[9px] text-slate-400 uppercase font-bold block">Emp. Peças</span>
                        <span class="font-bold text-slate-700">${m.empenhoPecas ? `${m.empenhoPecas} (R$ ${this.formatCurrency(m.valorPecas)})` : '-'}</span>
                      </div>
                      <div>
                        <span class="text-[9px] text-slate-400 uppercase font-bold block">Emp. Serviços</span>
                        <span class="font-bold text-slate-700">${m.empenhoServicos ? `${m.empenhoServicos} (R$ ${this.formatCurrency(m.valorServicos)})` : '-'}</span>
                      </div>
                      <div>
                        <span class="text-[9px] text-slate-400 uppercase font-bold block">NFs / 1Doc</span>
                        <span class="font-bold text-slate-700 truncate block" title="${m.notasFiscais || ''} ${m.processo1Doc || ''}">
                          ${m.notasFiscais || m.processo1Doc || '-'}
                        </span>
                      </div>
                    </div>
                  ` : ''}

                  <!-- PEÇAS TROCADAS / ITENS -->
                  ${m.itensOrcamento ? `
                    <p class="text-[11px] text-slate-600">
                      <strong class="text-slate-700">Peças:</strong> ${m.itensOrcamento}
                    </p>
                  ` : ''}

                  <div class="flex items-center justify-end gap-2 pt-1">
                    <button onclick="app.frota.openAiPromptModal(${v.id}, ${m.id})" 
                            class="text-blue-600 hover:text-blue-800 text-[11px] font-bold flex items-center gap-1">
                      <span>🤖</span> Reabrir Análise IA
                    </button>
                    ${isAberta ? `
                      <button onclick="app.frota.openCompleteMaintenanceModal(${m.id}, ${v.id})" 
                              class="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1 ml-2">
                        <span>✅</span> Baixar Manutenção
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            })}
          </div>

          <!-- RODAPÉ -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-400 font-bold">${history.length} manutenções registradas</span>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-300 transition">
              Fechar
            </button>
          </div>

        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // MODAL 5: CADASTRO / EDIÇÃO DE VEÍCULO
  // --------------------------------------------------------------------------
  openVehicleModal(veiculoId = null) {
    const isEdit = Boolean(veiculoId);
    const v = isEdit ? this.getVehicleById(veiculoId) : {
      id: null,
      placa: '',
      marca: '',
      modelo: '',
      anoFab: new Date().getFullYear(),
      anoMod: new Date().getFullYear(),
      combustivel: 'ALCOOL/GASOLINA',
      capacidade: 5,
      potencia: '',
      cilindrada: '',
      renavam: '',
      chassi: '',
      categoria: 'CARRO',
      linha: 'Leve',
      setor: 'Secretaria Municipal de Saúde',
      kmAtual: 0,
      status: 'Em Operação',
      observacao: ''
    };

    if (isEdit && !v) return;

    const modalHost = document.getElementById('modal-host');
    modalHost.innerHTML = `
      <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
          
          <div class="bg-torres-dark px-6 py-5 text-white flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner text-blue-400">
                ${isEdit ? '✏️' : '🚗'}
              </div>
              <div>
                <h3 class="font-black text-lg leading-tight">${isEdit ? 'Editar Dados do Veículo' : 'Cadastrar Novo Veículo na Frota'}</h3>
                <p class="text-xs text-blue-300 font-medium">Controle de Frota • Secretaria de Saúde</p>
              </div>
            </div>
            <button onclick="document.getElementById('modal-host').innerHTML=''" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition">
              ✕
            </button>
          </div>

          <form onsubmit="app.frota.submitVehicle(event, ${v.id || 'null'})" class="p-6 space-y-4">
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Placa <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="v-placa" value="${v.placa || ''}" required placeholder="ABC-1234"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Categoria <span class="text-rose-500">*</span>
                </label>
                <select id="v-categoria" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="CARRO" ${v.categoria === 'CARRO' ? 'selected' : ''}>🚗 Carro Leve</option>
                  <option value="AMBULANCIA" ${v.categoria === 'AMBULANCIA' ? 'selected' : ''}>🚑 Ambulância</option>
                  <option value="COLETIVO" ${v.categoria === 'COLETIVO' ? 'selected' : ''}>🚐 Coletivo / TFD</option>
                  <option value="MOTO" ${v.categoria === 'MOTO' ? 'selected' : ''}>🏍️ Motocicleta</option>
                  <option value="REBOQUE" ${v.categoria === 'REBOQUE' ? 'selected' : ''}>🚛 Reboque</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Linha
                </label>
                <select id="v-linha" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="Leve" ${v.linha === 'Leve' ? 'selected' : ''}>Linha Leve</option>
                  <option value="Pesada" ${v.linha === 'Pesada' ? 'selected' : ''}>Linha Pesada</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Marca <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="v-marca" value="${v.marca || ''}" required placeholder="Ex: CHEVROLET, RENAULT, FIAT"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Modelo <span class="text-rose-500">*</span>
                </label>
                <input type="text" id="v-modelo" value="${v.modelo || ''}" required placeholder="Ex: ONIX PLUS 10MT"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Ano Fab.
                </label>
                <input type="number" id="v-anofab" value="${v.anoFab || ''}" min="1990" max="2035"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Ano Mod.
                </label>
                <input type="number" id="v-anomod" value="${v.anoMod || ''}" min="1990" max="2035"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Combustível
                </label>
                <select id="v-combustivel" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
                  <option value="ALCOOL/GASOLINA" ${v.combustivel === 'ALCOOL/GASOLINA' ? 'selected' : ''}>FLEX</option>
                  <option value="DIESEL" ${v.combustivel === 'DIESEL' ? 'selected' : ''}>DIESEL</option>
                  <option value="GASOLINA" ${v.combustivel === 'GASOLINA' ? 'selected' : ''}>GASOLINA</option>
                  <option value="ELETRICO/HIBRIDO" ${v.combustivel === 'ELETRICO/HIBRIDO' ? 'selected' : ''}>HÍBRIDO/ELÉTRICO</option>
                  <option value="OUTROS" ${v.combustivel === 'OUTROS' ? 'selected' : ''}>OUTROS</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Capacidade
                </label>
                <input type="number" id="v-capacidade" value="${v.capacidade || 5}" min="0" max="100"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Setor / Lotação
                </label>
                <input type="text" id="v-setor" value="${v.setor || ''}" placeholder="Ex: SAMU, TFD, ESF Central"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Quilometragem (KM)
                </label>
                <input type="number" id="v-km" value="${v.kmAtual || 0}" min="0"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Renavam
                </label>
                <input type="text" id="v-renavam" value="${v.renavam || ''}"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Chassi
                </label>
                <input type="text" id="v-chassi" value="${v.chassi || ''}"
                       class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono uppercase">
              </div>

              <div>
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Status Operacional
                </label>
                <select id="v-status" class="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold">
                  <option value="Em Operação" ${v.status === 'Em Operação' ? 'selected' : ''}>🟢 Em Operação</option>
                  <option value="Em Manutenção" ${v.status === 'Em Manutenção' ? 'selected' : ''}>🟡 Em Manutenção</option>
                  <option value="Reserva" ${v.status === 'Reserva' ? 'selected' : ''}>⚪ Em Reserva</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button type="button" onclick="document.getElementById('modal-host').innerHTML=''" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button type="submit" class="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition">
                ${isEdit ? 'Salvar Alterações' : 'Cadastrar Veículo'}
              </button>
            </div>

          </form>

        </div>
      </div>
    `;
  },

  submitVehicle(e, veiculoId) {
    e.preventDefault();
    const isEdit = Boolean(veiculoId);
    let v = isEdit ? this.getVehicleById(veiculoId) : null;

    const placa = document.getElementById('v-placa').value.trim().toUpperCase();
    const categoria = document.getElementById('v-categoria').value;
    const linha = document.getElementById('v-linha').value;
    const marca = document.getElementById('v-marca').value.trim().toUpperCase();
    const modelo = document.getElementById('v-modelo').value.trim().toUpperCase();
    const anoFab = Number(document.getElementById('v-anofab').value) || 2024;
    const anoMod = Number(document.getElementById('v-anomod').value) || 2024;
    const combustivel = document.getElementById('v-combustivel').value;
    const capacidade = Number(document.getElementById('v-capacidade').value) || 5;
    const setor = document.getElementById('v-setor').value.trim() || 'Secretaria Municipal de Saúde';
    const kmAtual = Number(document.getElementById('v-km').value) || 0;
    const renavam = document.getElementById('v-renavam').value.trim();
    const chassi = document.getElementById('v-chassi').value.trim().toUpperCase();
    const status = document.getElementById('v-status').value;

    if (isEdit && v) {
      v.placa = placa;
      v.categoria = categoria;
      v.linha = linha;
      v.marca = marca;
      v.modelo = modelo;
      v.anoFab = anoFab;
      v.anoMod = anoMod;
      v.combustivel = combustivel;
      v.capacidade = capacidade;
      v.setor = setor;
      v.kmAtual = kmAtual;
      v.renavam = renavam;
      v.chassi = chassi;
      v.status = status;
    } else {
      const newId = (app.state.frota || []).reduce((max, x) => Math.max(max, Number(x.id) || 0), 0) + 1;
      const newV = {
        id: newId,
        numero: newId,
        placa: placa,
        categoria: categoria,
        linha: linha,
        marca: marca,
        modelo: modelo,
        anoFab: anoFab,
        anoMod: anoMod,
        combustivel: combustivel,
        capacidade: capacidade,
        potencia: '',
        cilindrada: '',
        setor: setor,
        kmAtual: kmAtual,
        renavam: renavam,
        chassi: chassi,
        proprietario: 'Prefeitura Municipal de Torres',
        status: status,
        observacao: ''
      };
      app.state.frota.push(newV);
    }

    if (app.data && app.data.saveLocalFrota) app.data.saveLocalFrota();
    document.getElementById('modal-host').innerHTML = '';
    app.ui.toast(`Veículo ${placa} salvo com sucesso!`, 'success', 'Frota Atualizada');
    this.refreshGrid();
  },

  // --------------------------------------------------------------------------
  // EXPORTAR DADOS PARA CSV
  // --------------------------------------------------------------------------
  exportCsv() {
    const list = this.getFilteredVehicles();
    if (!list || list.length === 0) {
      app.ui.toast('Nenhum veículo para exportar.', 'warning', 'Exportação Vazia');
      return;
    }

    const headers = [
      'Placa',
      'Categoria',
      'Linha',
      'Marca',
      'Modelo',
      'Ano Fab',
      'Ano Mod',
      'Combustivel',
      'Capacidade',
      'Setor / Lotacao',
      'KM Atual',
      'Renavam',
      'Chassi',
      'Status'
    ];

    const rows = list.map(v => [
      `"${v.placa || ''}"`,
      `"${v.categoria || ''}"`,
      `"${v.linha || ''}"`,
      `"${v.marca || ''}"`,
      `"${v.modelo || ''}"`,
      `"${v.anoFab || ''}"`,
      `"${v.anoMod || ''}"`,
      `"${v.combustivel || ''}"`,
      `"${v.capacidade || ''}"`,
      `"${(v.setor || '').replace(/"/g, '""')}"`,
      `"${v.kmAtual || 0}"`,
      `"${v.renavam || ''}"`,
      `"${v.chassi || ''}"`,
      `"${v.status || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `frota_saude_torres_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    app.ui.toast('Planilha CSV gerada com sucesso!', 'success', 'Exportação Concluída');
  }
};

// ============================================================================
// RENDERIZADOR PRINCIPAL DO MÓDULO DE FROTA (app.render.frotaHub)
// ============================================================================
app.render.frotaHub = function(el) {
  const kpis = app.frota.getKpis();
  const vehicles = app.frota.getFilteredVehicles();
  const canEdit = !app.state.auth.isLogged || app.permissions.can('frota_edit');

  el.innerHTML = `
    <!-- CABEÇALHO HERO DO MÓDULO DE FROTA -->
    <div class="bg-torres-dark text-white py-8 px-6 shadow-xl relative overflow-hidden">
      <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-9xl">🚗</div>
      
      <div class="container mx-auto">
        <!-- BREADCRUMB / VOLTAR -->
        <div class="flex items-center gap-3 mb-4">
          <button onclick="app.ui.navigate('landing')" class="p-2 hover:bg-white/10 rounded-full text-white transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </button>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-blue-400 uppercase tracking-widest">Secretaria Municipal de Saúde</span>
              <span class="text-white/40">•</span>
              <span class="text-xs text-white/60">Governança Operacional</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Frota de Veículos & Manutenções
            </h1>
          </div>
        </div>

        <p class="text-sm text-blue-200/90 max-w-2xl font-medium leading-relaxed">
          Monitoramento em tempo real dos 33 veículos oficiais da saúde, registro imediato de avarias, histórico contábil de empenhos e <strong>Analisador de Orçamentos com Inteligência Artificial</strong>.
        </p>

        <!-- CARDS DE KPIS DA FROTA -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          
          <div class="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15">
            <span class="text-[10px] text-blue-300 uppercase font-black tracking-wider block">Total Frota</span>
            <span class="text-2xl font-black text-white font-mono">${kpis.total}</span>
            <span class="text-[10px] text-white/60 block mt-0.5">Veículos ativos</span>
          </div>

          <div class="bg-emerald-500/20 backdrop-blur-md rounded-2xl p-3 border border-emerald-400/30">
            <span class="text-[10px] text-emerald-300 uppercase font-black tracking-wider block">Em Operação</span>
            <span class="text-2xl font-black text-emerald-300 font-mono">${kpis.emOperacao}</span>
            <span class="text-[10px] text-emerald-200/60 block mt-0.5">Disponíveis</span>
          </div>

          <div class="bg-amber-500/20 backdrop-blur-md rounded-2xl p-3 border border-amber-400/30">
            <span class="text-[10px] text-amber-300 uppercase font-black tracking-wider block">Em Manutenção</span>
            <span class="text-2xl font-black text-amber-300 font-mono">${kpis.emManutencao}</span>
            <span class="text-[10px] text-amber-200/60 block mt-0.5">Na oficina</span>
          </div>

          <div class="bg-rose-500/20 backdrop-blur-md rounded-2xl p-3 border border-rose-400/30">
            <span class="text-[10px] text-rose-300 uppercase font-black tracking-wider block">Ambulâncias</span>
            <span class="text-2xl font-black text-rose-300 font-mono">${kpis.ambulancias}</span>
            <span class="text-[10px] text-rose-200/60 block mt-0.5">SAMU / Remoção</span>
          </div>

          <div class="bg-indigo-500/20 backdrop-blur-md rounded-2xl p-3 border border-indigo-400/30">
            <span class="text-[10px] text-indigo-300 uppercase font-black tracking-wider block">Coletivo / TFD</span>
            <span class="text-2xl font-black text-indigo-300 font-mono">${kpis.coletivo}</span>
            <span class="text-[10px] text-indigo-200/60 block mt-0.5">Micro-ônibus TFD</span>
          </div>

          <div class="bg-slate-500/20 backdrop-blur-md rounded-2xl p-3 border border-slate-400/30">
            <span class="text-[10px] text-slate-300 uppercase font-black tracking-wider block">Reserva</span>
            <span class="text-2xl font-black text-slate-300 font-mono">${kpis.emReserva}</span>
            <span class="text-[10px] text-slate-200/60 block mt-0.5">Apoio</span>
          </div>

        </div>
      </div>
    </div>

    <!-- CORPO PRINCIPAL COM BARRA DE CONTROLES E GRID -->
    <div class="container mx-auto px-4 sm:px-6 py-8 flex-grow">
      
      <!-- BARRA DE PESQUISA, FILTROS E AÇÕES -->
      <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
        
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <!-- CAMPO DE BUSCA TEXTUAL -->
          <div class="relative flex-1">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" id="frota-search-input" value="${app.state.frotaSearch || ''}"
                   oninput="app.frota.setSearch(this.value)"
                   placeholder="Buscar por placa, modelo, marca, setor, chassi ou renavam..."
                   class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
          </div>

          <!-- BOTÕES DE VISUALIZAÇÃO E AÇÕES -->
          <div class="flex items-center gap-2 self-end lg:self-auto">
            
            <!-- TOGGLE CARDS / TABELA -->
            <div class="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center">
              <button onclick="app.frota.setViewMode('cards')" 
                      class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${app.state.frotaViewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}" title="Visualização em Cards">
                🎴 Cards
              </button>
              <button onclick="app.frota.setViewMode('table')" 
                      class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${app.state.frotaViewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'}" title="Visualização em Tabela">
                📋 Tabela
              </button>
            </div>

            <!-- EXPORTAR CSV -->
            <button onclick="app.frota.exportCsv()" 
                    class="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-xs" title="Exportar dados da frota para CSV">
              <span>📥</span> <span class="hidden sm:inline">Exportar</span>
            </button>

            <!-- NOVO VEÍCULO (SE PERMITIDO) -->
            ${canEdit ? `
              <button onclick="app.frota.openVehicleModal()" 
                      class="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md hover:shadow-lg">
                <span>+</span> <span>Novo Veículo</span>
              </button>
            ` : ''}

          </div>

        </div>

        <!-- FILTROS DROPDOWNS -->
        <div class="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          
          <!-- FILTRO CATEGORIA -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase text-slate-400">Categoria:</span>
            <select id="frota-filter-categoria" onchange="app.frota.setFilter(this.value)" 
                    class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all" ${app.state.frotaFilter === 'all' ? 'selected' : ''}>Todas as Categorias</option>
              <option value="AMBULANCIA" ${app.state.frotaFilter === 'AMBULANCIA' ? 'selected' : ''}>🚑 Ambulâncias</option>
              <option value="COLETIVO" ${app.state.frotaFilter === 'COLETIVO' ? 'selected' : ''}>🚐 Coletivo / TFD</option>
              <option value="CARRO" ${app.state.frotaFilter === 'CARRO' ? 'selected' : ''}>🚗 Carros Leves</option>
              <option value="MOTO" ${app.state.frotaFilter === 'MOTO' ? 'selected' : ''}>🏍️ Motos</option>
              <option value="REBOQUE" ${app.state.frotaFilter === 'REBOQUE' ? 'selected' : ''}>🚛 Reboque</option>
            </select>
          </div>

          <!-- FILTRO STATUS -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase text-slate-400">Status:</span>
            <select id="frota-filter-status" onchange="app.frota.setStatusFilter(this.value)" 
                    class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all" ${app.state.frotaStatusFilter === 'all' ? 'selected' : ''}>Todos os Status</option>
              <option value="Em Operação" ${app.state.frotaStatusFilter === 'Em Operação' ? 'selected' : ''}>🟢 Em Operação</option>
              <option value="Em Manutenção" ${app.state.frotaStatusFilter === 'Em Manutenção' ? 'selected' : ''}>🟡 Em Manutenção</option>
              <option value="Reserva" ${app.state.frotaStatusFilter === 'Reserva' ? 'selected' : ''}>⚪ Em Reserva</option>
            </select>
          </div>

          <!-- FILTRO LINHA -->
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-black uppercase text-slate-400">Porte:</span>
            <select onchange="app.frota.setLinhaFilter(this.value)" 
                    class="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="all" ${app.state.frotaLinhaFilter === 'all' ? 'selected' : ''}>Todos os Portes</option>
              <option value="Leve" ${app.state.frotaLinhaFilter === 'Leve' ? 'selected' : ''}>Linha Leve</option>
              <option value="Pesada" ${app.state.frotaLinhaFilter === 'Pesada' ? 'selected' : ''}>Linha Pesada</option>
            </select>
          </div>

          <!-- BOTÃO LIMPAR FILTROS -->
          <button onclick="app.frota.resetFilters()" 
                  class="ml-auto text-slate-400 hover:text-slate-600 text-xs font-bold underline transition">
            Limpar Filtros
          </button>

        </div>

      </div>

      <!-- ÁREA DE CARDS OU TABELA DOS VEÍCULOS -->
      <div id="frota-content-area" class="fade-in">
        ${String(app.state.frotaViewMode || '').toLowerCase() === 'table' ? app.frota.renderTableView(vehicles) : app.frota.renderCardsView(vehicles)}
      </div>

    </div>
  `;
};

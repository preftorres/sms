/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA MUNICIPAL DE SAÚDE
 * MÓDULO DE CONTROLE DE EMPENHOS (CARDS VISUAIS, GRÁFICO CIRCULAR, ATAs & CONTRATOS)
 * Arquivo: js/app-empenhos.js
 * ============================================================================
 */

window.app = window.app || {};
window.app.render = window.app.render || {};

app.empenhos = {
  currentHistoryEmpenhoId: null,

  // --------------------------------------------------------------------------
  // UTILITÁRIOS DE MOEDA, DATA E CÁLCULO DE SALDO
  // --------------------------------------------------------------------------
  formatCurrency(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  parseCurrency(str) {
    if (typeof str === 'number') return str;
    if (!str) return 0;
    let s = String(str).replace(/[^\d.,-]/g, '').trim();
    if (!s) return 0;
    if (s.includes(',')) {
      s = s.replace(/\./g, '').replace(',', '.');
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : Math.round(n * 100) / 100;
  },

  maskCurrencyInput(inputEl) {
    if (!inputEl) return;
    let digits = String(inputEl.value || '').replace(/\D/g, '');
    if (!digits) {
      inputEl.value = '';
      return;
    }
    const num = parseInt(digits, 10) / 100;
    inputEl.value = this.formatCurrency(num);
  },

  formatDateBr(isoOrBr) {
    if (!isoOrBr) return '';
    const s = String(isoOrBr).trim();
    const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (mIso) return `${mIso[3]}/${mIso[2]}/${mIso[1]}`;
    const mBr = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (mBr) return s;
    return s;
  },

  formatDateIso(val) {
    if (!val) return '';
    const s = String(val).trim();
    const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (mIso) return `${mIso[1]}-${mIso[2]}-${mIso[3]}`;
    const mBr = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (mBr) return `${mBr[3]}-${mBr[2]}-${mBr[1]}`;
    return '';
  },

  // Calcula indicadores financeiros e status visual do empenho
  getMetrics(emp) {
    const total = Math.max(0, Number(emp?.valorTotal) || 0);
    const usado = Math.max(0, Number(emp?.valorUsado) || 0);
    const saldo = Math.max(0, Math.round((total - usado) * 100) / 100);
    const excedido = usado > total ? Math.round((usado - total) * 100) / 100 : 0;

    const pctUsadoRaw = total > 0 ? (usado / total) * 100 : 0;
    const pctUsado = Math.min(100, Math.max(0, Math.round(pctUsadoRaw * 10) / 10));
    const pctRestante = Math.max(0, Math.round((100 - pctUsado) * 10) / 10);

    const isArquivado = emp?.status === 'Arquivado';

    let statusKey = 'SALDO_OK';
    let label = 'Saldo Disponível';
    let badgeClass = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
    let strokeColor = '#10b981'; // emerald-500
    let trackColor = '#d1fae5';  // emerald-100
    let saldoBoxClass = 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
    let saldoValueClass = 'text-emerald-700';

    if (isArquivado) {
      statusKey = 'ARQUIVADO';
      label = 'Arquivado';
      badgeClass = 'bg-slate-200 text-slate-600 border border-slate-300';
      strokeColor = '#64748b';
      trackColor = '#e2e8f0';
      saldoBoxClass = 'bg-slate-100 border-slate-200 text-slate-700';
      saldoValueClass = 'text-slate-700';
    } else if (total > 0 && saldo <= 0.009) {
      statusKey = 'ESGOTADO';
      label = 'Saldo Esgotado (100%)';
      badgeClass = 'bg-slate-800 text-white border border-slate-900';
      strokeColor = '#e11d48'; // rose-600
      trackColor = '#ffe4e6';
      saldoBoxClass = 'bg-rose-50/80 border-rose-200 text-rose-900';
      saldoValueClass = 'text-rose-700';
    } else if (pctUsado >= 90) {
      statusKey = 'CRITICO';
      label = `Saldo Crítico (${pctRestante.toFixed(1).replace('.', ',')}% livre)`;
      badgeClass = 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse';
      strokeColor = '#ef4444'; // red-500
      trackColor = '#fee2e2';
      saldoBoxClass = 'bg-rose-50/80 border-rose-200 text-rose-900';
      saldoValueClass = 'text-rose-700';
    } else if (pctUsado >= 75) {
      statusKey = 'ATENCAO';
      label = `Atenção (${pctRestante.toFixed(1).replace('.', ',')}% livre)`;
      badgeClass = 'bg-amber-100 text-amber-800 border border-amber-300';
      strokeColor = '#f59e0b'; // amber-500
      trackColor = '#fef3c7';
      saldoBoxClass = 'bg-amber-50/80 border-amber-200 text-amber-900';
      saldoValueClass = 'text-amber-700';
    }

    return {
      total,
      usado,
      saldo,
      excedido,
      pctUsado,
      pctRestante,
      statusKey,
      label,
      badgeClass,
      strokeColor,
      trackColor,
      saldoBoxClass,
      saldoValueClass
    };
  },

  // --------------------------------------------------------------------------
  // GERADOR DE GRÁFICO CIRCULAR (DONUT SVG PURO E EFICIENTE)
  // Raio = 15.91549430918954 => Circunferência exata = 100.0
  // --------------------------------------------------------------------------
  renderDonutSvg(metrics, size = 84, isMini = false) {
    const pct = Math.min(100, Math.max(0, Number(metrics.pctUsado) || 0));
    const dashArray = `${pct} ${100 - pct}`;
    const pctText = pct === 100 || pct === 0 ? `${Math.round(pct)}%` : `${pct.toFixed(1).replace('.', ',')}%`;

    if (isMini) {
      return `
        <div class="relative inline-flex items-center justify-center shrink-0" style="width:${size}px;height:${size}px;" title="Usado: ${pctText} | Restante: ${(100 - pct).toFixed(1).replace('.', ',')}%">
          <svg class="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="${metrics.trackColor}" stroke-width="4.5"></circle>
            <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="${metrics.strokeColor}" stroke-width="4.5" stroke-dasharray="${dashArray}" stroke-dashoffset="0" stroke-linecap="round"></circle>
          </svg>
          <span class="absolute text-[9px] font-black text-slate-800">${Math.round(pct)}%</span>
        </div>
      `;
    }

    return `
      <div class="relative flex flex-col items-center justify-center shrink-0 select-none" style="width:${size}px;height:${size}px;" title="Consumido: ${pctText} (R$ ${this.formatCurrency(metrics.usado)}) • Restante: R$ ${this.formatCurrency(metrics.saldo)}">
        <svg class="w-full h-full -rotate-90 transform drop-shadow-2xs" viewBox="0 0 36 36">
          <!-- Anel de fundo (Saldo Restante) -->
          <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="${metrics.trackColor}" stroke-width="4.2"></circle>
          <!-- Anel de preenchimento (Valor Usado) -->
          <circle cx="18" cy="18" r="15.9154943" fill="transparent" stroke="${metrics.strokeColor}" stroke-width="4.2" stroke-dasharray="${dashArray}" stroke-dashoffset="0" stroke-linecap="round" style="transition: stroke-dasharray 0.5s ease;"></circle>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center leading-none pointer-events-none">
          <span class="text-[13px] font-black text-slate-900 tracking-tight">${pctText}</span>
          <span class="text-[8px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">Usado</span>
        </div>
      </div>
    `;
  },

  // Retorna empenhos vinculados a um contrato específico (por ID ou por número CTT)
  getEmpenhosByContract(contract) {
    if (!contract) return [];
    const list = app.state.empenhos || [];
    const cttId = Number(contract.id);
    const cttNum = String(contract.numeroCtt || '').trim().toLowerCase();
    const isGeneric = !cttNum || cttNum === 'em aberto' || cttNum === 's/n';

    return list.filter(e => {
      if (!e || e.status === 'Arquivado') return false;
      if (cttId && Number(e.contratoId) === cttId) return true;
      if (!isGeneric && e.numeroContrato && String(e.numeroContrato).trim().toLowerCase() === cttNum) return true;
      return false;
    });
  },

  // Navega para a tela de Empenhos filtrando por um contrato específico
  filterByContract(numeroCtt) {
    app.state.empenhosContractFilter = String(numeroCtt || '').trim();
    app.state.empenhosFilter = 'TODOS_ATIVOS';
    app.state.empenhosSearch = '';
    app.ui.navigate('empenhos');
  },

  clearContractFilter() {
    app.state.empenhosContractFilter = 'TODOS';
    this.updateContent();
  },

  // --------------------------------------------------------------------------
  // FILTROS, BUSCA E ORDENAÇÃO EM TEMPO REAL
  // --------------------------------------------------------------------------
  setFilter(f) {
    app.state.empenhosFilter = f || 'TODOS_ATIVOS';
    const sel = document.getElementById('emp-filter-select');
    if (sel) sel.value = app.state.empenhosFilter;
    this.updateContent();
  },

  setContractFilter(ctt) {
    app.state.empenhosContractFilter = ctt || 'TODOS';
    const sel = document.getElementById('emp-contract-filter-select');
    if (sel) sel.value = app.state.empenhosContractFilter;
    this.updateContent();
  },

  setSort(mode) {
    app.state.empenhosSort = mode || 'RECENTES';
    this.updateContent();
  },

  getSortLabel(mode) {
    const map = {
      'RECENTES': 'Mais Recentes',
      'MAIOR_SALDO': 'Maior Saldo Disponível (R$)',
      'MENOR_SALDO': 'Menor Saldo Disponível (R$)',
      'MAIOR_USO_PCT': 'Maior % de Uso (Mais Críticos)',
      'MENOR_USO_PCT': 'Menor % de Uso (Mais Folgados)',
      'MAIOR_TOTAL': 'Maior Valor Empenhado (R$)',
      'EMPRESA_ASC': 'Empresa / Credor (A-Z)',
      'NUMERO_EMP': 'Nº do Empenho'
    };
    return map[mode] || 'Mais Recentes';
  },

  setSearch(val) {
    app.state.empenhosSearch = (val || '').toLowerCase();
    const clearBtn = document.getElementById('emp-search-clear');
    if (clearBtn) {
      if (app.state.empenhosSearch.trim().length > 0) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    this.updateContent();
  },

  clearSearch() {
    app.state.empenhosSearch = '';
    const inp = document.getElementById('emp-search-input');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
    const clearBtn = document.getElementById('emp-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.updateContent();
  },

  switchViewMode(mode) {
    app.state.empenhosViewMode = mode;
    const isCards = mode === 'CARDS';
    const btnCards = document.getElementById('emp-btn-cards');
    const btnTabela = document.getElementById('emp-btn-tabela');
    if (btnCards && btnTabela) {
      btnCards.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isCards ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`;
      btnTabela.className = `px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${!isCards ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`;
    }
    this.updateContent();
  },

  getFilteredList() {
    const rawList = (app.state.empenhos || []).filter(e => e && String(e.numeroEmpenho || e.empresa || '').trim().length > 0);
    const filter = app.state.empenhosFilter || 'TODOS_ATIVOS';
    const cttFilter = app.state.empenhosContractFilter || 'TODOS';
    const search = (app.state.empenhosSearch || '').trim();

    const normalize = (str) => String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const filtered = rawList.filter(e => {
      const m = this.getMetrics(e);
      const isArch = e.status === 'Arquivado';

      // 1. Filtro de Status / Saúde do Saldo
      let matchStatus = true;
      if (filter === 'TODOS_ATIVOS') matchStatus = !isArch;
      else if (filter === 'COM_SALDO') matchStatus = !isArch && m.saldo > 0.009;
      else if (filter === 'ATENCAO_CRITICO') matchStatus = !isArch && m.pctUsado >= 75 && m.saldo > 0.009;
      else if (filter === 'CRITICOS') matchStatus = !isArch && m.pctUsado >= 90 && m.saldo > 0.009;
      else if (filter === 'ESGOTADOS') matchStatus = !isArch && m.saldo <= 0.009;
      else if (filter === 'COM_ATA') matchStatus = !isArch && String(e.ata || '').trim().length > 0;
      else if (filter === 'COM_CONTRATO') matchStatus = !isArch && String(e.numeroContrato || '').trim().length > 0;
      else if (filter === 'ARQUIVADOS') matchStatus = isArch;

      // 2. Filtro por Contrato Vinculado
      let matchCtt = true;
      if (cttFilter && cttFilter !== 'TODOS') {
        if (cttFilter === 'SEM_CONTRATO') {
          matchCtt = !String(e.numeroContrato || '').trim();
        } else {
          matchCtt = String(e.numeroContrato || '').trim().toLowerCase() === String(cttFilter).trim().toLowerCase();
        }
      }

      // 3. Busca textual
      let matchSearch = true;
      if (search) {
        const normS = normalize(search);
        const hay = [
          e.numeroEmpenho,
          e.empresa,
          e.ata,
          e.numeroContrato,
          e.objeto,
          e.observacao,
          m.label
        ].map(x => normalize(x)).join(' ');
        matchSearch = hay.includes(normS);
      }

      return matchStatus && matchCtt && matchSearch;
    });

    const sortMode = app.state.empenhosSort || 'RECENTES';
    filtered.sort((a, b) => {
      const mA = this.getMetrics(a);
      const mB = this.getMetrics(b);

      if (sortMode === 'MAIOR_SALDO') return mB.saldo - mA.saldo;
      if (sortMode === 'MENOR_SALDO') return mA.saldo - mB.saldo;
      if (sortMode === 'MAIOR_USO_PCT') return mB.pctUsado - mA.pctUsado;
      if (sortMode === 'MENOR_USO_PCT') return mA.pctUsado - mB.pctUsado;
      if (sortMode === 'MAIOR_TOTAL') return mB.total - mA.total;
      if (sortMode === 'EMPRESA_ASC') {
        return String(a.empresa || '').localeCompare(String(b.empresa || ''), 'pt-BR', { sensitivity: 'base' });
      }
      if (sortMode === 'NUMERO_EMP') {
        return String(a.numeroEmpenho || '').localeCompare(String(b.numeroEmpenho || ''), 'pt-BR', { numeric: true });
      }
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

    return filtered;
  },

  updateContent() {
    const container = document.getElementById('painel-empenhos-content');
    if (container) {
      container.innerHTML = this.renderContentHtml();
    } else {
      const vp = document.getElementById('app-viewport');
      if (vp) app.render.empenhosHub(vp);
    }

    const countEl = document.getElementById('emp-filtered-count');
    if (countEl) {
      const list = this.getFilteredList();
      const total = (app.state.empenhos || []).filter(e => e && e.status !== 'Arquivado').length;
      const sortMode = app.state.empenhosSort || 'RECENTES';
      countEl.textContent = `Exibindo ${list.length} de ${total} empenhos ativos • Ordenado por: ${this.getSortLabel(sortMode)}`;
    }

    const bannerEl = document.getElementById('emp-contract-filter-banner');
    if (bannerEl) {
      const ctt = app.state.empenhosContractFilter;
      if (ctt && ctt !== 'TODOS') {
        bannerEl.classList.remove('hidden');
        bannerEl.innerHTML = `
          <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-2xl text-xs font-bold mb-4">
            <div class="flex items-center gap-2">
              <span>📄</span>
              <span>Exibindo empenhos vinculados ao Contrato: <strong class="font-mono underline">${ctt === 'SEM_CONTRATO' ? 'Sem Contrato (Avulsos / ATA)' : ctt}</strong></span>
            </div>
            <button onclick="app.empenhos.clearContractFilter()" class="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-[11px] font-black transition">
              ✕ Mostrar Todos os Empenhos
            </button>
          </div>
        `;
      } else {
        bannerEl.classList.add('hidden');
        bannerEl.innerHTML = '';
      }
    }
  },

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO DOS CARDS VISUAIS COM GRÁFICO CIRCULAR (DONUT)
  // --------------------------------------------------------------------------
  renderCard(emp) {
    const m = this.getMetrics(emp);
    const isArch = emp.status === 'Arquivado';
    const hasAta = String(emp.ata || '').trim().length > 0;
    const hasCtt = String(emp.numeroContrato || '').trim().length > 0;
    const dataBr = this.formatDateBr(emp.dataEmissaoIso);
    const canEdit = app.permissions.can('panel_edit') || app.permissions.can('dotacoes_edit');
    const canArchive = app.permissions.can('panel_archive');

    return `
      <div class="bg-white rounded-[2rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group relative ${isArch ? 'opacity-70 bg-slate-50' : ''}">
        <div>
          <!-- TOPO DO CARD: STATUS DO SALDO E BADGES DE VÍNCULO (ATA / CONTRATO) -->
          <div class="flex items-center justify-between gap-1.5 mb-3 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${m.badgeClass}">
              ${m.label}
            </span>
            <div class="flex items-center gap-1 flex-wrap">
              ${hasAta ? `
                <span class="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 font-mono text-[10px] font-black text-amber-900" title="Ata de Registro de Preços que gerou este empenho">
                  📑 ATA: ${emp.ata}
                </span>
              ` : ''}
              ${hasCtt ? `
                <button type="button" onclick="event.stopPropagation(); app.empenhos.goToLinkedContract('${String(emp.numeroContrato).replace(/'/g, "\\'")}')" class="px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-mono text-[10px] font-black text-indigo-800 transition flex items-center gap-0.5" title="Clique para ver o Contrato nº ${emp.numeroContrato} no Painel de Contratos">
                  <span>📄 CTT: ${emp.numeroContrato}</span>
                </button>
              ` : ''}
            </div>
          </div>

          <!-- NÚMERO DO EMPENHO EM DESTAQUE + EMPRESA / CREDOR -->
          <div class="flex items-baseline justify-between gap-2">
            <span class="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200/80">
              💳 EMPENHO Nº ${emp.numeroEmpenho || 'S/N'}
            </span>
            ${dataBr ? `<span class="text-[10px] font-semibold text-slate-400" title="Data de emissão do empenho">📅 ${dataBr}</span>` : ''}
          </div>

          <h3 class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2 mt-2" title="${emp.empresa || ''}">
            ${emp.empresa || 'Fornecedor não informado'}
          </h3>

          <!-- BLOCO VISUAL CENTRAL: GRÁFICO CIRCULAR (DONUT) + RESUMO FINANCEIRO -->
          <div class="mt-3.5 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/70 flex items-center gap-3.5">
            <!-- GRÁFICO CIRCULAR (DONUT SVG) -->
            ${this.renderDonutSvg(m, 82, false)}

            <!-- VALORES: TOTAL, USADO E SALDO RESTANTE -->
            <div class="flex-1 min-w-0 space-y-1.5 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase text-slate-400">Valor Total:</span>
                <span class="font-black text-slate-900 text-xs">R$ ${this.formatCurrency(m.total)}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-bold uppercase text-slate-500">Valor Usado:</span>
                <span class="font-bold text-slate-700 text-xs">R$ ${this.formatCurrency(m.usado)}</span>
              </div>
              <div class="pt-1 border-t border-slate-200/80">
                <div class="px-2.5 py-1.5 rounded-xl border ${m.saldoBoxClass} flex justify-between items-center">
                  <span class="text-[9px] font-black uppercase tracking-wider">Saldo:</span>
                  <span class="font-black text-xs ${m.saldoValueClass}">R$ ${this.formatCurrency(m.saldo)}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- BARRA COMPLEMENTAR DE ORIGEM (ATA & CONTRATO) -->
          <div class="mt-2.5 grid grid-cols-2 gap-1.5 text-[10px]">
            <div class="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 truncate" title="ATA geradora: ${hasAta ? emp.ata : 'Não vinculada'}">
              <span class="text-slate-400 font-bold uppercase text-[9px] block">ATA Geradora:</span>
              <span class="font-black ${hasAta ? 'text-amber-800 font-mono' : 'text-slate-400 italic'}">${hasAta ? emp.ata : 'Não aplicável'}</span>
            </div>
            <div class="bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 truncate" title="Contrato vinculado: ${hasCtt ? emp.numeroContrato : 'Sem contrato vinculado'}">
              <span class="text-slate-400 font-bold uppercase text-[9px] block">Contrato:</span>
              <span class="font-black ${hasCtt ? 'text-indigo-800 font-mono' : 'text-slate-400 italic'}">${hasCtt ? `CTT ${emp.numeroContrato}` : 'Avulso / Sem CTT'}</span>
            </div>
          </div>

          <!-- LINK EXTERNO (PORTAL TRANSPARÊNCIA / BETHA) -->
          ${emp.linkExterno ? `
            <div class="mt-2.5">
              <a href="${emp.linkExterno}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 transition shadow-2xs group/link">
                <span>🔗</span>
                <span class="group-hover/link:underline">Ver Empenho / Contrato no Betha</span>
                <span class="text-[10px] text-blue-400">↗</span>
              </a>
            </div>
          ` : ''}

          <!-- OBJETO DO EMPENHO -->
          ${emp.objeto ? `<p class="text-[11px] text-slate-500 italic mt-2 line-clamp-2" title="${emp.objeto}">${emp.objeto}</p>` : ''}

          <!-- OBSERVAÇÃO INSTITUCIONAL -->
          ${emp.observacao ? `
            <div class="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
              <div class="flex items-center justify-between mb-0.5">
                <span class="font-black text-[10px] text-amber-800 uppercase tracking-wide">📝 Observação:</span>
                <button type="button" onclick="event.stopPropagation(); app.empenhos.openHistoryModal(${emp.id})" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline">
                  📜 Histórico
                </button>
              </div>
              <span class="break-words line-clamp-2" title="${emp.observacao}">${emp.observacao}</span>
            </div>
          ` : ''}
        </div>

        <!-- RODAPÉ DE AÇÕES DO CARD -->
        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          ${canEdit && !isArch ? `
            <button type="button" onclick="app.empenhos.openAbaterModal(${emp.id})" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] shadow-xs transition flex items-center gap-1" title="Abater valor de Nota Fiscal ou lançar consumo neste empenho">
              <span>➕</span>
              <span>Abater / Uso</span>
            </button>
          ` : `
            ${canArchive ? `
              <button type="button" onclick="app.empenhos.toggleArchive(${emp.id})" class="text-[11px] font-bold text-slate-400 hover:text-slate-700">
                ${isArch ? '↩️ Desarquivar' : '📁 Arquivar'}
              </button>
            ` : '<span></span>'}
          `}

          <div class="flex items-center gap-1">
            <button type="button" onclick="app.empenhos.openHistoryModal(${emp.id})" title="Histórico de Consumo e Alterações do Empenho" class="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-lg font-bold">
              📜
            </button>
            ${canEdit ? `
              <button type="button" onclick="app.empenhos.openEditModal(${emp.id})" title="Editar Empenho" class="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded-lg font-bold">
                ✏️
              </button>
            ` : ''}
            ${canArchive && canEdit && !isArch ? `
              <button type="button" onclick="app.empenhos.toggleArchive(${emp.id})" title="Arquivar Empenho" class="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg font-bold">
                📁
              </button>
            ` : ''}
            ${app.admin.isAdminUser() ? `
              <button type="button" onclick="app.empenhos.openDeleteModal(${emp.id})" title="Excluir Empenho (Administrador)" class="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg font-bold">
                🗑️
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  renderTableRow(emp) {
    const m = this.getMetrics(emp);
    const hasAta = String(emp.ata || '').trim().length > 0;
    const hasCtt = String(emp.numeroContrato || '').trim().length > 0;
    const canEdit = app.permissions.can('panel_edit') || app.permissions.can('dotacoes_edit');
    const canArchive = app.permissions.can('panel_archive');

    return `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3.5 font-mono font-black text-blue-700 whitespace-nowrap">
          <div class="flex items-center gap-1.5">
            <span>💳 ${emp.numeroEmpenho || 'S/N'}</span>
          </div>
          ${emp.dataEmissaoIso ? `<div class="text-[10px] font-sans text-slate-400 font-semibold mt-0.5">📅 ${this.formatDateBr(emp.dataEmissaoIso)}</div>` : ''}
        </td>
        <td class="p-3.5 font-bold text-slate-900">
          <div>${emp.empresa || '—'}</div>
          ${emp.objeto ? `<div class="text-[10px] text-slate-500 font-normal italic line-clamp-1">${emp.objeto}</div>` : ''}
          ${emp.observacao ? `<div class="text-[10px] text-amber-800 font-semibold italic line-clamp-1 mt-0.5">📝 ${emp.observacao}</div>` : ''}
        </td>
        <td class="p-3.5 whitespace-nowrap">
          <div class="flex flex-col gap-1">
            ${hasCtt ? `<button onclick="app.empenhos.goToLinkedContract('${String(emp.numeroContrato).replace(/'/g, "\\'")}')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-mono text-[10px] font-black w-fit">📄 CTT: ${emp.numeroContrato}</button>` : '<span class="text-[10px] text-slate-400">Sem Contrato</span>'}
            ${hasAta ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10px] font-black w-fit">📑 ATA: ${emp.ata}</span>` : ''}
          </div>
        </td>
        <td class="p-3.5 text-right font-bold text-slate-800 whitespace-nowrap">
          R$ ${this.formatCurrency(m.total)}
        </td>
        <td class="p-3.5 text-right font-bold text-slate-600 whitespace-nowrap">
          R$ ${this.formatCurrency(m.usado)}
        </td>
        <td class="p-3.5 text-right whitespace-nowrap">
          <span class="px-2.5 py-1 rounded-lg font-black text-xs border ${m.saldoBoxClass}">
            R$ ${this.formatCurrency(m.saldo)}
          </span>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap">
          <div class="flex items-center justify-center gap-2">
            ${this.renderDonutSvg(m, 38, true)}
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${m.badgeClass}">
              ${m.label}
            </span>
          </div>
        </td>
        <td class="p-3.5 text-center whitespace-nowrap print:hidden">
          ${canEdit ? `<button onclick="app.empenhos.openAbaterModal(${emp.id})" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-[10px] mr-1.5 shadow-2xs" title="Abater Valor / Lançar Nota">➕ Uso</button>` : ''}
          <button onclick="app.empenhos.openHistoryModal(${emp.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-1.5 text-xs" title="Histórico de Consumo e Alterações">📜</button>
          ${canEdit ? `<button onclick="app.empenhos.openEditModal(${emp.id})" class="text-slate-600 hover:text-amber-700 font-bold mr-1.5" title="Editar">✏️</button>` : ''}
          ${canArchive ? `<button onclick="app.empenhos.toggleArchive(${emp.id})" class="text-slate-400 hover:text-slate-700 font-bold mr-1.5" title="Arquivar / Desarquivar">📁</button>` : ''}
          ${app.admin.isAdminUser() ? `<button onclick="app.empenhos.openDeleteModal(${emp.id})" class="text-rose-500 hover:text-rose-700 font-bold" title="Excluir">🗑️</button>` : ''}
        </td>
      </tr>
    `;
  },

  renderContentHtml() {
    const filteredList = this.getFilteredList();
    const isCardsMode = (app.state.empenhosViewMode || 'CARDS') === 'CARDS';

    if (filteredList.length === 0) {
      return `
        <div class="col-span-full p-12 text-center text-slate-400 font-medium text-xs bg-white rounded-2xl border border-slate-200">
          <span class="block text-3xl mb-2">💳</span>
          <p class="text-slate-700 font-black text-sm">Nenhum empenho encontrado para os filtros selecionados.</p>
          <p class="text-slate-400 text-xs mt-1">Cadastre um novo empenho clicando em "+ Novo Empenho" ou ajuste sua busca.</p>
        </div>
      `;
    }

    if (isCardsMode) {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          ${filteredList.map(e => this.renderCard(e)).join('')}
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="custom-scroll overflow-y-auto max-h-[640px] relative">
          <table class="w-full text-left border-collapse text-xs">
            <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
              <tr>
                <th class="p-3.5 w-32">Nº Empenho</th>
                <th class="p-3.5 min-w-[210px]">Empresa / Objeto</th>
                <th class="p-3.5 w-36">Contrato / ATA</th>
                <th class="p-3.5 text-right w-32">Valor Total</th>
                <th class="p-3.5 text-right w-32">Valor Usado</th>
                <th class="p-3.5 text-right w-36">Saldo Restante</th>
                <th class="p-3.5 text-center w-48">Gráfico & Status</th>
                <th class="p-3.5 text-center w-36 print:hidden">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 font-medium">
              ${filteredList.map(e => this.renderTableRow(e)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  goToLinkedContract(numeroCtt) {
    if (!numeroCtt) return;
    app.state.panelSearch = String(numeroCtt).trim().toLowerCase();
    app.state.panelContractsFilter = 'MURAL';
    app.ui.navigate('contratos');
    setTimeout(() => {
      app.ui.toast(`Exibindo o Contrato nº ${numeroCtt} vinculado ao empenho.`, 'info', 'Contrato Vinculado');
    }, 150);
  },

  // --------------------------------------------------------------------------
  // MODAL DE NOVO / EDITAR EMPENHO (COM PREVIEW DO GRÁFICO CIRCULAR AO VIVO)
  // --------------------------------------------------------------------------
  populateContractSelect(selectEl, selectedCtt = '') {
    if (!selectEl) return;
    const contracts = (app.state.panelContracts || []).filter(c => c && c.status !== 'Disponível' && String(c.empresa || '').trim().length > 0);
    const sorted = [...contracts].sort((a, b) => String(a.empresa || '').localeCompare(String(b.empresa || ''), 'pt-BR'));

    let html = `<option value="">— Sem Contrato Vinculado (Avulso / Somente ATA) —</option>`;
    sorted.forEach(c => {
      const ctt = app.contratos ? app.contratos.formatCttNumber(c.numeroCtt) : c.numeroCtt;
      if (!ctt || ctt === 'Em Aberto') return;
      const isSel = String(ctt).trim().toLowerCase() === String(selectedCtt || '').trim().toLowerCase();
      html += `<option value="${ctt}" data-ctt-id="${c.id}" data-empresa="${(c.empresa || '').replace(/"/g, '&quot;')}" data-objeto="${(c.objeto || '').replace(/"/g, '&quot;')}" data-link="${(c.linkContrato || '').replace(/"/g, '&quot;')}" ${isSel ? 'selected' : ''}>CTT ${ctt} — ${c.empresa}</option>`;
    });

    // Inclui também contratos da auditoria laboratorial caso ainda não estejam na lista
    (app.state.contracts || []).forEach(ac => {
      if (!ac.num) return;
      const exists = sorted.some(s => String(s.numeroCtt).trim() === String(ac.num).trim());
      if (!exists) {
        const isSel = String(ac.num).trim().toLowerCase() === String(selectedCtt || '').trim().toLowerCase();
        html += `<option value="${ac.num}" data-ctt-id="" data-empresa="${(ac.prestador || '').replace(/"/g, '&quot;')}" data-objeto="Exames Laboratoriais" data-link="" ${isSel ? 'selected' : ''}>CTT ${ac.num} — ${ac.prestador}</option>`;
      }
    });

    selectEl.innerHTML = html;
  },

  onContractSelectChange(prefix) {
    const sel = document.getElementById(`emp-${prefix}-contrato-select`);
    const manualCttEl = document.getElementById(`emp-${prefix}-contrato-manual`);
    const empEl = document.getElementById(`emp-${prefix}-empresa`);
    const objEl = document.getElementById(`emp-${prefix}-objeto`);
    const linkEl = document.getElementById(`emp-${prefix}-link`);

    if (!sel) return;
    const opt = sel.options[sel.selectedIndex];
    const val = sel.value;

    if (manualCttEl) manualCttEl.value = val || '';

    if (opt && val) {
      const emp = opt.getAttribute('data-empresa') || '';
      const obj = opt.getAttribute('data-objeto') || '';
      const link = opt.getAttribute('data-link') || '';
      if (empEl && (!empEl.value.trim() || prefix === 'new')) empEl.value = emp;
      if (objEl && !objEl.value.trim() && obj) objEl.value = obj;
      if (linkEl && !linkEl.value.trim() && link) linkEl.value = link;
    }
  },

  onValueInput(prefix, field) {
    const el = document.getElementById(`emp-${prefix}-${field}`);
    if (el) this.maskCurrencyInput(el);
    this.updateLivePreview(prefix);
  },

  updateLivePreview(prefix) {
    const total = this.parseCurrency(document.getElementById(`emp-${prefix}-total`)?.value);
    const usado = this.parseCurrency(document.getElementById(`emp-${prefix}-usado`)?.value);
    const m = this.getMetrics({ valorTotal: total, valorUsado: usado, status: 'Ativo' });

    const saldoEl = document.getElementById(`emp-${prefix}-saldo-preview`);
    if (saldoEl) {
      saldoEl.textContent = `R$ ${this.formatCurrency(m.saldo)}`;
      saldoEl.className = `text-base font-black ${m.saldoValueClass}`;
    }

    const donutHost = document.getElementById(`emp-${prefix}-donut-preview`);
    if (donutHost) {
      donutHost.innerHTML = this.renderDonutSvg(m, 64, false);
    }

    const statusHost = document.getElementById(`emp-${prefix}-status-preview`);
    if (statusHost) {
      statusHost.textContent = m.label;
      statusHost.className = `px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${m.badgeClass}`;
    }
  },

  openNewModal(preselectedCtt = '') {
    const canCreate = app.permissions.can('panel_create') || app.permissions.can('dotacoes_create');
    if (!canCreate) return app.ui.toast("Sem permissão para cadastrar empenhos.", "warning", "Acesso Restrito");

    const modal = document.getElementById('modal-form-empenho');
    if (!modal) return;

    document.getElementById('emp-form-id').value = '';
    document.getElementById('emp-form-title').textContent = 'Cadastrar Novo Empenho';
    document.getElementById('emp-form-subtitle').textContent = 'Controle de saldo, ATA geradora e contrato vinculado';
    document.getElementById('emp-btn-hist-modal')?.classList.add('hidden');

    document.getElementById('emp-form-numero').value = '';
    document.getElementById('emp-form-data').value = new Date().toISOString().slice(0, 10);
    document.getElementById('emp-form-ata').value = '';
    document.getElementById('emp-form-empresa').value = '';
    document.getElementById('emp-form-total').value = '';
    document.getElementById('emp-form-usado').value = '0,00';
    document.getElementById('emp-form-objeto').value = '';
    document.getElementById('emp-form-observacao').value = '';
    document.getElementById('emp-form-link').value = '';

    const defaultCtt = preselectedCtt || (app.state.empenhosContractFilter && app.state.empenhosContractFilter !== 'TODOS' && app.state.empenhosContractFilter !== 'SEM_CONTRATO' ? app.state.empenhosContractFilter : '');
    this.populateContractSelect(document.getElementById('emp-form-contrato-select'), defaultCtt);
    document.getElementById('emp-form-contrato-manual').value = defaultCtt;
    if (defaultCtt) this.onContractSelectChange('form');

    this.updateLivePreview('form');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('emp-form-numero')?.focus(), 80);
  },

  openEditModal(id) {
    const canEdit = app.permissions.can('panel_edit') || app.permissions.can('dotacoes_edit');
    if (!canEdit) return app.ui.toast("Sem permissão para editar empenhos.", "warning", "Acesso Restrito");

    const emp = (app.state.empenhos || []).find(e => Number(e.id) === Number(id));
    if (!emp) return;

    const modal = document.getElementById('modal-form-empenho');
    if (!modal) return;

    document.getElementById('emp-form-id').value = emp.id;
    document.getElementById('emp-form-title').textContent = `Editar Empenho nº ${emp.numeroEmpenho}`;
    document.getElementById('emp-form-subtitle').textContent = emp.empresa || 'Atualização cadastral e financeira';
    document.getElementById('emp-btn-hist-modal')?.classList.remove('hidden');

    document.getElementById('emp-form-numero').value = emp.numeroEmpenho || '';
    document.getElementById('emp-form-data').value = this.formatDateIso(emp.dataEmissaoIso);
    document.getElementById('emp-form-ata').value = emp.ata || '';
    document.getElementById('emp-form-empresa').value = emp.empresa || '';
    document.getElementById('emp-form-total').value = this.formatCurrency(emp.valorTotal || 0);
    document.getElementById('emp-form-usado').value = this.formatCurrency(emp.valorUsado || 0);
    document.getElementById('emp-form-objeto').value = emp.objeto || '';
    document.getElementById('emp-form-observacao').value = emp.observacao || '';
    document.getElementById('emp-form-link').value = emp.linkExterno || '';

    this.populateContractSelect(document.getElementById('emp-form-contrato-select'), emp.numeroContrato || '');
    document.getElementById('emp-form-contrato-manual').value = emp.numeroContrato || '';

    this.updateLivePreview('form');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeFormModal() {
    const modal = document.getElementById('modal-form-empenho');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async saveEmpenho(e) {
    e.preventDefault();
    const idRaw = document.getElementById('emp-form-id').value;
    const isEdit = !!idRaw;

    const numeroEmpenho = document.getElementById('emp-form-numero').value.trim();
    const dataEmissaoIso = this.formatDateIso(document.getElementById('emp-form-data').value);
    const ata = document.getElementById('emp-form-ata').value.trim();
    const numeroContrato = document.getElementById('emp-form-contrato-manual').value.trim() || document.getElementById('emp-form-contrato-select').value.trim();
    const empresa = document.getElementById('emp-form-empresa').value.trim();
    const valorTotal = this.parseCurrency(document.getElementById('emp-form-total').value);
    const valorUsado = this.parseCurrency(document.getElementById('emp-form-usado').value);
    const objeto = document.getElementById('emp-form-objeto').value.trim();
    const observacao = document.getElementById('emp-form-observacao').value.trim();
    const linkExterno = document.getElementById('emp-form-link').value.trim();

    if (!numeroEmpenho || !empresa || valorTotal <= 0) {
      return app.ui.toast("Preencha o Nº do Empenho, Empresa/Fornecedor e um Valor Total maior que zero.", "warning", "Campos Obrigatórios");
    }

    // Identifica contratoId correspondente se houver no painel
    const matchedCtt = (app.state.panelContracts || []).find(c => String(c.numeroCtt || '').trim().toLowerCase() === numeroContrato.toLowerCase());
    const contratoId = matchedCtt ? matchedCtt.id : null;

    const currentUser = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    if (!app.state.empenhos) app.state.empenhos = [];

    if (isEdit) {
      const item = app.state.empenhos.find(x => Number(x.id) === Number(idRaw));
      if (!item) return;

      const changes = [];
      if (item.numeroEmpenho !== numeroEmpenho) changes.push(`Nº Empenho: ${item.numeroEmpenho} ➔ ${numeroEmpenho}`);
      if (item.empresa !== empresa) changes.push(`Empresa: "${item.empresa}" ➔ "${empresa}"`);
      if (Math.abs(Number(item.valorTotal || 0) - valorTotal) > 0.009) {
        changes.push(`Valor Total: R$ ${this.formatCurrency(item.valorTotal)} ➔ R$ ${this.formatCurrency(valorTotal)}`);
      }
      if (Math.abs(Number(item.valorUsado || 0) - valorUsado) > 0.009) {
        changes.push(`Valor Usado: R$ ${this.formatCurrency(item.valorUsado)} ➔ R$ ${this.formatCurrency(valorUsado)}`);
      }
      if ((item.ata || '') !== ata) changes.push(`ATA: "${item.ata || '(vazio)'}" ➔ "${ata || '(vazio)'}"`);
      if ((item.numeroContrato || '') !== numeroContrato) changes.push(`Contrato: "${item.numeroContrato || '(vazio)'}" ➔ "${numeroContrato || '(vazio)'}"`);
      if ((item.objeto || '') !== objeto) changes.push(`Objeto atualizado`);
      if ((item.observacao || '') !== observacao) changes.push(`Observação atualizada`);

      item.numeroEmpenho = numeroEmpenho;
      item.dataEmissaoIso = dataEmissaoIso;
      item.ata = ata;
      item.numeroContrato = numeroContrato;
      item.contratoId = contratoId;
      item.empresa = empresa;
      item.valorTotal = valorTotal;
      item.valorUsado = valorUsado;
      item.objeto = objeto;
      item.observacao = observacao;
      item.linkExterno = linkExterno;

      const detalhesStr = changes.length > 0
        ? `Empenho nº ${numeroEmpenho} (${empresa}) [EMP_ID:${item.id}] | ` + changes.join(' | ')
        : `Empenho nº ${numeroEmpenho} (${empresa}) [EMP_ID:${item.id}] | Dados confirmados`;

      if (!app.state.auditLogs) app.state.auditLogs = [];
      app.state.auditLogs.unshift({
        id: Date.now(),
        dataHora: dataHoraStr,
        usuario: currentUser,
        modulo: "Empenhos",
        acao: "Editar Empenho",
        detalhes: detalhesStr,
        registroId: numeroEmpenho
      });

      app.data.saveLocalEmpenhos();
      this.closeFormModal();
      this.updateContent();

      await app.data.sendToCloud({
        action: "UPDATE_EMPENHO",
        empenho: item,
        detalhes: detalhesStr
      });

      if (changes.length > 0) {
        await app.data.sendToCloud({
          action: "RECORD_AUDIT_LOG",
          currentUser,
          modulo: "Empenhos",
          acao: "Editar Empenho",
          detalhes: detalhesStr,
          registroId: numeroEmpenho
        });
      }

      app.ui.toast(`Empenho nº ${numeroEmpenho} atualizado com sucesso!`, "success", "Controle de Empenhos");
    } else {
      const newEmp = {
        id: Date.now(),
        numeroEmpenho,
        empresa,
        valorTotal,
        valorUsado,
        ata,
        numeroContrato,
        contratoId,
        dataEmissaoIso,
        objeto,
        observacao,
        linkExterno,
        status: "Ativo",
        criadoEm: dataHoraStr,
        criadoPor: currentUser,
        historicoConsumo: valorUsado > 0 ? [
          {
            id: Date.now() + 1,
            dataHora: dataHoraStr,
            usuario: currentUser,
            valor: valorUsado,
            documento: "Saldo Inicial Já Executado",
            observacao: "Informado no momento do cadastro do empenho",
            saldoAnterior: valorTotal,
            saldoNovo: Math.max(0, valorTotal - valorUsado)
          }
        ] : []
      };

      app.state.empenhos.unshift(newEmp);
      app.data.saveLocalEmpenhos();

      const detalhesStr = `Empenho nº ${numeroEmpenho} (${empresa}) [EMP_ID:${newEmp.id}] | Valor Total: R$ ${this.formatCurrency(valorTotal)} | Usado: R$ ${this.formatCurrency(valorUsado)} | Saldo: R$ ${this.formatCurrency(Math.max(0, valorTotal - valorUsado))}${ata ? ` | ATA: ${ata}` : ''}${numeroContrato ? ` | CTT: ${numeroContrato}` : ''}`;

      if (!app.state.auditLogs) app.state.auditLogs = [];
      app.state.auditLogs.unshift({
        id: Date.now(),
        dataHora: dataHoraStr,
        usuario: currentUser,
        modulo: "Empenhos",
        acao: "Cadastrar Empenho",
        detalhes: detalhesStr,
        registroId: numeroEmpenho
      });

      this.closeFormModal();
      app.render.empenhosHub(document.getElementById('app-viewport'));

      await app.data.sendToCloud({
        action: "CREATE_EMPENHO",
        empenho: newEmp,
        detalhes: detalhesStr
      });

      await app.data.sendToCloud({
        action: "RECORD_AUDIT_LOG",
        currentUser,
        modulo: "Empenhos",
        acao: "Cadastrar Empenho",
        detalhes: detalhesStr,
        registroId: numeroEmpenho
      });

      app.ui.toast(`Empenho nº ${numeroEmpenho} cadastrado com sucesso!`, "success", "Controle de Empenhos");
    }
  },

  // --------------------------------------------------------------------------
  // MODAL DE ABATIMENTO RÁPIDO / LANÇAR NOTA FISCAL OU CONSUMO
  // --------------------------------------------------------------------------
  openAbaterModal(id) {
    const canEdit = app.permissions.can('panel_edit') || app.permissions.can('dotacoes_edit');
    if (!canEdit) return app.ui.toast("Sem permissão para lançar consumo de empenhos.", "warning", "Acesso Restrito");

    const emp = (app.state.empenhos || []).find(e => Number(e.id) === Number(id));
    if (!emp) return;

    const modal = document.getElementById('modal-abater-empenho');
    if (!modal) return;

    const m = this.getMetrics(emp);
    document.getElementById('abater-emp-id').value = emp.id;
    document.getElementById('abater-emp-titulo').textContent = `Empenho nº ${emp.numeroEmpenho} — ${emp.empresa}`;
    document.getElementById('abater-emp-saldo-atual').textContent = `R$ ${this.formatCurrency(m.saldo)}`;
    document.getElementById('abater-emp-valor').value = '';
    document.getElementById('abater-emp-doc').value = '';
    document.getElementById('abater-emp-obs').value = '';

    this.onAbaterValorInput();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => document.getElementById('abater-emp-valor')?.focus(), 80);
  },

  closeAbaterModal() {
    const modal = document.getElementById('modal-abater-empenho');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  onAbaterValorInput() {
    const valInput = document.getElementById('abater-emp-valor');
    if (valInput) this.maskCurrencyInput(valInput);

    const id = Number(document.getElementById('abater-emp-id')?.value);
    const emp = (app.state.empenhos || []).find(e => Number(e.id) === id);
    if (!emp) return;

    const valorAbater = this.parseCurrency(valInput?.value);
    const novoUsado = Math.round(((Number(emp.valorUsado) || 0) + valorAbater) * 100) / 100;
    const previewMetrics = this.getMetrics({ valorTotal: emp.valorTotal, valorUsado: novoUsado, status: emp.status });

    const novoSaldoEl = document.getElementById('abater-emp-novo-saldo');
    const warnEl = document.getElementById('abater-emp-warn');
    const donutEl = document.getElementById('abater-emp-donut-preview');

    if (novoSaldoEl) {
      novoSaldoEl.textContent = `R$ ${this.formatCurrency(previewMetrics.saldo)}`;
      novoSaldoEl.className = `text-base font-black ${previewMetrics.saldoValueClass}`;
    }
    if (donutEl) {
      donutEl.innerHTML = this.renderDonutSvg(previewMetrics, 60, false);
    }
    if (warnEl) {
      const saldoAnterior = Math.max(0, (Number(emp.valorTotal) || 0) - (Number(emp.valorUsado) || 0));
      if (valorAbater > saldoAnterior + 0.009) {
        warnEl.textContent = `⚠️ Atenção: O valor informado (R$ ${this.formatCurrency(valorAbater)}) ultrapassa o saldo disponível atual (R$ ${this.formatCurrency(saldoAnterior)})!`;
        warnEl.classList.remove('hidden');
      } else {
        warnEl.classList.add('hidden');
      }
    }
  },

  async confirmarAbatimento(e) {
    e.preventDefault();
    const id = Number(document.getElementById('abater-emp-id').value);
    const emp = (app.state.empenhos || []).find(x => Number(x.id) === id);
    if (!emp) return;

    const valorAbater = this.parseCurrency(document.getElementById('abater-emp-valor').value);
    const doc = document.getElementById('abater-emp-doc').value.trim();
    const obs = document.getElementById('abater-emp-obs').value.trim();

    if (valorAbater <= 0) {
      return app.ui.toast("Informe um valor maior que R$ 0,00 para abater do saldo.", "warning", "Valor Inválido");
    }

    const saldoAnterior = Math.max(0, Math.round(((Number(emp.valorTotal) || 0) - (Number(emp.valorUsado) || 0)) * 100) / 100);
    if (valorAbater > saldoAnterior + 0.009) {
      return app.ui.toast(`O valor de R$ ${this.formatCurrency(valorAbater)} é maior que o saldo disponível (R$ ${this.formatCurrency(saldoAnterior)}).`, "warning", "Saldo Insuficiente");
    }

    const novoUsado = Math.round(((Number(emp.valorUsado) || 0) + valorAbater) * 100) / 100;
    const saldoNovo = Math.max(0, Math.round(((Number(emp.valorTotal) || 0) - novoUsado) * 100) / 100);

    const currentUser = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;

    emp.valorUsado = novoUsado;
    if (!Array.isArray(emp.historicoConsumo)) emp.historicoConsumo = [];
    emp.historicoConsumo.unshift({
      id: Date.now(),
      dataHora: dataHoraStr,
      usuario: currentUser,
      valor: valorAbater,
      documento: doc || 'Baixa de Saldo',
      observacao: obs,
      saldoAnterior,
      saldoNovo
    });

    const detalhesStr = `Empenho nº ${emp.numeroEmpenho} (${emp.empresa}) [EMP_ID:${emp.id}] | Abatimento de R$ ${this.formatCurrency(valorAbater)}${doc ? ` (${doc})` : ''} | Saldo: R$ ${this.formatCurrency(saldoAnterior)} ➔ R$ ${this.formatCurrency(saldoNovo)}${obs ? ` | Obs: "${obs}"` : ''}`;

    if (!app.state.auditLogs) app.state.auditLogs = [];
    app.state.auditLogs.unshift({
      id: Date.now(),
      dataHora: dataHoraStr,
      usuario: currentUser,
      modulo: "Empenhos",
      acao: "Abater Saldo / Uso",
      detalhes: detalhesStr,
      registroId: emp.numeroEmpenho
    });

    app.data.saveLocalEmpenhos();
    this.closeAbaterModal();
    app.render.empenhosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "UPDATE_EMPENHO",
      empenho: emp,
      detalhes: detalhesStr
    });

    await app.data.sendToCloud({
      action: "RECORD_AUDIT_LOG",
      currentUser,
      modulo: "Empenhos",
      acao: "Abater Saldo / Uso",
      detalhes: detalhesStr,
      registroId: emp.numeroEmpenho
    });

    app.ui.toast(`Abatimento de R$ ${this.formatCurrency(valorAbater)} registrado! Novo saldo: R$ ${this.formatCurrency(saldoNovo)}`, "success", `Empenho nº ${emp.numeroEmpenho}`);
  },

  // --------------------------------------------------------------------------
  // MODAL DE HISTÓRICO DE CONSUMO E ALTERAÇÕES DO EMPENHO
  // --------------------------------------------------------------------------
  async openHistoryModal(targetId) {
    let id = targetId;
    if (!id) {
      const formId = document.getElementById('emp-form-id')?.value;
      if (formId) id = Number(formId);
    }
    const emp = (app.state.empenhos || []).find(e => Number(e.id) === Number(id));
    if (!emp) return;

    this.currentHistoryEmpenhoId = emp.id;

    const subEl = document.getElementById('hist-emp-subtitulo');
    if (subEl) {
      subEl.textContent = `Empenho nº ${emp.numeroEmpenho} — ${emp.empresa} (Total: R$ ${this.formatCurrency(emp.valorTotal)} | Saldo: R$ ${this.formatCurrency(Math.max(0, emp.valorTotal - emp.valorUsado))})`;
    }

    const listEl = document.getElementById('hist-emp-lista');
    if (listEl) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          <div class="w-8 h-8 mx-auto mb-2 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Carregando histórico de consumo e alterações do empenho...
        </div>
      `;
    }

    const modal = document.getElementById('modal-historico-empenho');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    if (app.data && app.data.fetchAuditLogs) {
      try {
        const freshLogs = await app.data.fetchAuditLogs(500);
        if (freshLogs && Array.isArray(freshLogs) && freshLogs.length > 0) {
          const existingKeys = new Set(freshLogs.map(l => `${l.usuario}_${l.dataHora}_${l.detalhes}`));
          const localOnly = (app.state.auditLogs || []).filter(l => !existingKeys.has(`${l.usuario}_${l.dataHora}_${l.detalhes}`));
          app.state.auditLogs = [...localOnly, ...freshLogs];
        }
      } catch (err) {
        console.warn("Erro ao buscar logs na nuvem:", err);
      }
    }

    this.renderHistoryList(emp);
  },

  closeHistoryModal() {
    const modal = document.getElementById('modal-historico-empenho');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  renderHistoryList(emp) {
    const listEl = document.getElementById('hist-emp-lista');
    if (!listEl) return;

    const consumoList = Array.isArray(emp.historicoConsumo) ? emp.historicoConsumo : [];
    const empIdStr = String(emp.id);
    const numEmp = String(emp.numeroEmpenho || '').trim().toLowerCase();

    const auditMatches = (app.state.auditLogs || []).filter(l => {
      if (!l) return false;
      const mod = String(l.modulo || '').toLowerCase();
      if (!mod.includes('empenho')) return false;
      const det = String(l.detalhes || '');
      const reg = String(l.registroId || '').trim().toLowerCase();
      if (det.includes(`[EMP_ID:${empIdStr}]`)) return true;
      if (numEmp && reg === numEmp) return true;
      return false;
    });

    let html = '';

    // 1. Seção de Lançamentos / Abatimentos de Saldo
    html += `
      <div class="mb-4">
        <h4 class="text-[11px] font-black uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
          <span>💳</span> Extrato de Consumo / Notas Abatidas (${consumoList.length})
        </h4>
        ${consumoList.length === 0 ? `
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 text-center">
            Nenhum abatimento avulso registrado ainda neste empenho.
          </div>
        ` : `
          <div class="space-y-2">
            ${consumoList.map(c => `
              <div class="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="space-y-0.5">
                  <div class="font-black text-emerald-950 flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-mono text-[11px]">- R$ ${this.formatCurrency(c.valor)}</span>
                    <span>${c.documento || 'Lançamento de Uso'}</span>
                  </div>
                  ${c.observacao ? `<p class="text-[11px] text-slate-600 italic mt-0.5">${c.observacao}</p>` : ''}
                  <div class="text-[10px] text-slate-500 font-medium pt-0.5">
                    Saldo: R$ ${this.formatCurrency(c.saldoAnterior)} ➔ <strong class="text-emerald-800">R$ ${this.formatCurrency(c.saldoNovo)}</strong>
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-500 shrink-0 font-mono">
                  <div class="font-bold text-slate-700">👤 ${c.usuario || 'admin'}</div>
                  <div>🕒 ${c.dataHora || '—'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // 2. Seção de Trilha de Auditoria e Edições Cadastrais
    html += `
      <div>
        <h4 class="text-[11px] font-black uppercase tracking-wider text-blue-800 mb-2 flex items-center gap-1.5">
          <span>📜</span> Histórico de Alterações Cadastrais (${auditMatches.length})
        </h4>
        ${auditMatches.length === 0 ? `
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 text-center">
            Nenhuma alteração cadastral registrada na trilha de auditoria para este empenho.
          </div>
        ` : `
          <div class="space-y-2">
            ${auditMatches.map(l => {
              const parts = String(l.detalhes || '').split(' | ').map(s => s.trim()).filter(Boolean);
              const changes = parts.length > 1 ? parts.slice(1) : parts;
              return `
                <div class="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs text-xs">
                  <div class="space-y-1 mb-2">
                    ${changes.map(ch => `
                      <div class="font-bold text-slate-800 flex items-start gap-1.5">
                        <span class="text-blue-600 mt-0.5">•</span>
                        <span>${ch.replace(/\[EMP_ID:\d+\]/g, '').trim()}</span>
                      </div>
                    `).join('')}
                  </div>
                  <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span class="font-bold text-slate-700">👤 ${l.usuario || 'admin'}</span>
                    <span class="font-mono">🕒 ${l.dataHora || '—'}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    listEl.innerHTML = html;
  },

  // --------------------------------------------------------------------------
  // ARQUIVAR E EXCLUIR EMPENHO
  // --------------------------------------------------------------------------
  async toggleArchive(id) {
    if (!app.permissions.can('panel_archive')) {
      return app.ui.toast("Sem permissão para arquivar empenhos.", "warning", "Acesso Restrito");
    }
    const emp = (app.state.empenhos || []).find(e => Number(e.id) === Number(id));
    if (!emp) return;

    emp.status = emp.status === 'Arquivado' ? 'Ativo' : 'Arquivado';
    app.data.saveLocalEmpenhos();
    app.render.empenhosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "UPDATE_EMPENHO",
      empenho: emp,
      detalhes: `Empenho nº ${emp.numeroEmpenho} (${emp.empresa}) [EMP_ID:${emp.id}] | Status alterado para ${emp.status}`
    });

    app.ui.toast(`Empenho nº ${emp.numeroEmpenho} ${emp.status === 'Arquivado' ? 'arquivado' : 'restaurado'} com sucesso.`, "info", "Controle de Empenhos");
  },

  openDeleteModal(id) {
    if (!app.admin.isAdminUser()) {
      return app.ui.toast("Apenas o Administrador pode excluir empenhos definitivamente.", "warning", "Acesso Restrito");
    }
    const emp = (app.state.empenhos || []).find(e => Number(e.id) === Number(id));
    if (!emp) return;

    document.getElementById('del-emp-id').value = emp.id;
    document.getElementById('del-emp-numero').textContent = `Empenho nº ${emp.numeroEmpenho}`;
    document.getElementById('del-emp-empresa').textContent = emp.empresa || '';

    const modal = document.getElementById('modal-excluir-empenho');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  },

  closeDeleteModal() {
    const modal = document.getElementById('modal-excluir-empenho');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  async confirmDelete() {
    if (!app.admin.isAdminUser()) return;
    const id = Number(document.getElementById('del-emp-id').value);
    const emp = (app.state.empenhos || []).find(e => Number(e.id) === id);
    if (!emp) return;

    app.state.empenhos = (app.state.empenhos || []).filter(e => Number(e.id) !== id);
    app.data.saveLocalEmpenhos();
    this.closeDeleteModal();
    app.render.empenhosHub(document.getElementById('app-viewport'));

    await app.data.sendToCloud({
      action: "DELETE_EMPENHO",
      id: emp.id,
      numeroEmpenho: emp.numeroEmpenho
    });

    app.ui.toast(`Empenho nº ${emp.numeroEmpenho} excluído com sucesso.`, "info", "Empenho Excluído");
  },

  // --------------------------------------------------------------------------
  // EXPORTAÇÃO CSV DE EMPENHOS
  // --------------------------------------------------------------------------
  exportCSV() {
    const list = this.getFilteredList();
    const headers = [
      "ID", "Numero_Empenho", "Data_Emissao", "Empresa_Credor",
      "Valor_Total_RS", "Valor_Usado_RS", "Saldo_Restante_RS", "Percentual_Usado",
      "ATA_Geradora", "Contrato_Vinculado", "Objeto", "Observacao", "Status"
    ];

    const rows = list.map(e => {
      const m = this.getMetrics(e);
      return [
        e.id,
        `"${(e.numeroEmpenho || '').replace(/"/g, '""')}"`,
        `"${this.formatDateBr(e.dataEmissaoIso)}"`,
        `"${(e.empresa || '').replace(/"/g, '""')}"`,
        m.total.toFixed(2),
        m.usado.toFixed(2),
        m.saldo.toFixed(2),
        `${m.pctUsado.toFixed(1)}%`,
        `"${(e.ata || '').replace(/"/g, '""')}"`,
        `"${(e.numeroContrato || '').replace(/"/g, '""')}"`,
        `"${(e.objeto || '').replace(/"/g, '""')}"`,
        `"${(e.observacao || '').replace(/"/g, '""')}"`,
        `"${m.label}"`
      ].join(';');
    });

    const csvContent = "\uFEFF" + [headers.join(';'), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Controle_Empenhos_Saude_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// ============================================================================
// TELA PRINCIPAL: CONTROLE DE EMPENHOS (CARDS VISUAIS & GRÁFICO CIRCULAR)
// ============================================================================
app.render.empenhosHub = function(el) {
  if (!app.state.empenhosFilter) app.state.empenhosFilter = 'TODOS_ATIVOS';
  if (!app.state.empenhosContractFilter) app.state.empenhosContractFilter = 'TODOS';
  if (!app.state.empenhosSort) app.state.empenhosSort = 'RECENTES';

  const allEmpenhos = (app.state.empenhos || []).filter(e => e && String(e.numeroEmpenho || e.empresa || '').trim().length > 0);
  const activeEmpenhos = allEmpenhos.filter(e => e.status !== 'Arquivado');

  let somaTotal = 0;
  let somaUsado = 0;
  let somaSaldo = 0;
  let countCriticos = 0;
  let countAtencao = 0;
  let countEsgotados = 0;
  let countComContrato = 0;
  let countComAta = 0;

  activeEmpenhos.forEach(e => {
    const m = app.empenhos.getMetrics(e);
    somaTotal += m.total;
    somaUsado += m.usado;
    somaSaldo += m.saldo;
    if (m.statusKey === 'CRITICO') countCriticos++;
    if (m.statusKey === 'ATENCAO') countAtencao++;
    if (m.statusKey === 'ESGOTADO') countEsgotados++;
    if (String(e.numeroContrato || '').trim()) countComContrato++;
    if (String(e.ata || '').trim()) countComAta++;
  });

  const globalMetrics = app.empenhos.getMetrics({ valorTotal: somaTotal, valorUsado: somaUsado, status: 'Ativo' });
  const filteredList = app.empenhos.getFilteredList();
  const isCardsMode = (app.state.empenhosViewMode || 'CARDS') === 'CARDS';
  const currFilter = app.state.empenhosFilter;
  const currCttFilter = app.state.empenhosContractFilter;
  const currSort = app.state.empenhosSort;
  const canCreate = app.permissions.can('panel_create') || app.permissions.can('dotacoes_create');

  // Lista única de contratos que possuem empenho ou estão ativos no mural
  const contractsSet = new Set();
  allEmpenhos.forEach(e => {
    if (e.numeroContrato && String(e.numeroContrato).trim()) contractsSet.add(String(e.numeroContrato).trim());
  });
  (app.state.panelContracts || []).forEach(c => {
    if (c && c.numeroCtt && c.numeroCtt !== 'Em Aberto' && c.status === 'Ativo') {
      contractsSet.add(app.contratos ? app.contratos.formatCttNumber(c.numeroCtt) : String(c.numeroCtt).trim());
    }
  });
  const contractOptions = Array.from(contractsSet).sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

  el.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">

      <!-- BARRA SUPERIOR DE NAVEGAÇÃO E ALTERNÂNCIA RÁPIDA (CONTRATOS <-> EMPENHOS) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
          <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>Voltar para o Portal de Acessos</span>
        </button>

        <!-- SELETOR INTEGRADO: CONTRATOS LDO vs CONTROLE DE EMPENHOS -->
        <div class="inline-flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80 self-start sm:self-auto">
          <button onclick="app.ui.navigate('contratos')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5">
            <span>📋</span>
            <span>Mural de Contratos (LDO)</span>
          </button>
          <button onclick="app.ui.navigate('empenhos')" class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white text-blue-700 shadow-xs transition flex items-center gap-1.5">
            <span>💳</span>
            <span>Controle de Empenhos</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800">${activeEmpenhos.length}</span>
          </button>
        </div>
      </div>

      <!-- CABEÇALHO DO PAINEL DE EMPENHOS -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
        <div>
          <span class="text-[10px] font-black uppercase tracking-widest text-emerald-600">Execução Orçamentária • Secretaria Municipal de Saúde</span>
          <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Controle Visual de Empenhos & Saldos</h2>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">Monitoramento em tempo real do valor empenhado, valor usado, saldo restante, ATAs geradoras e contratos vinculados.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="app.empenhos.exportCSV()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
            📥 Exportar (.CSV)
          </button>
          <button onclick="window.print()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
            🖨️ Imprimir
          </button>
          ${canCreate ? `
            <button onclick="app.empenhos.openNewModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
              <span class="text-sm">+</span> Novo Empenho
            </button>
          ` : ''}
        </div>
      </div>

      <!-- 4 KPIS ESTRATÉGICOS + GRÁFICO CIRCULAR CONSOLIDADO NO TOPO -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <!-- 1. TOTAL DE EMPENHOS ATIVOS -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empenhos Ativos</span>
            <span class="p-1 bg-slate-100 rounded text-slate-600 text-xs">💳</span>
          </div>
          <p class="text-2xl font-black text-slate-900 mt-1">${activeEmpenhos.length} Empenhos</p>
          <span class="text-[10px] text-slate-500 font-semibold">${countComContrato} c/ Contrato • ${countComAta} c/ ATA</span>
        </div>

        <!-- 2. VALOR TOTAL EMPENHADO -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 bg-blue-50/20 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-blue-900 uppercase tracking-wider">Valor Total Empenhado</span>
            <span class="p-1 bg-blue-100 rounded text-blue-700 text-xs">🏛️</span>
          </div>
          <p class="text-xl sm:text-2xl font-black text-blue-700 mt-1">R$ ${app.empenhos.formatCurrency(somaTotal)}</p>
          <span class="text-[10px] text-slate-500 font-medium">Soma global dos empenhos ativos</span>
        </div>

        <!-- 3. VALOR TOTAL USADO / LIQUIDADO -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 bg-amber-50/30 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black text-amber-900 uppercase tracking-wider">Total Já Usado (${globalMetrics.pctUsado.toFixed(1).replace('.', ',')}%)</span>
            <span class="p-1 bg-amber-100 rounded text-amber-800 text-xs">📉</span>
          </div>
          <p class="text-xl sm:text-2xl font-black text-amber-800 mt-1">R$ ${app.empenhos.formatCurrency(somaUsado)}</p>
          <span class="text-[10px] text-amber-700 font-bold">${countCriticos} críticos • ${countEsgotados} esgotados</span>
        </div>

        <!-- 4. SALDO TOTAL RESTANTE + GRÁFICO CIRCULAR GLOBAL -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50/30 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wider block">Saldo Total Restante</span>
            <p class="text-lg sm:text-xl font-black text-emerald-700 mt-1 truncate">R$ ${app.empenhos.formatCurrency(somaSaldo)}</p>
            <span class="text-[10px] text-emerald-800 font-bold block mt-0.5">${globalMetrics.pctRestante.toFixed(1).replace('.', ',')}% disponível</span>
          </div>
          ${app.empenhos.renderDonutSvg(globalMetrics, 68, false)}
        </div>
      </div>

      <!-- BANNER DE FILTRO DE CONTRATO VINCULADO (QUANDO ATIVO) -->
      <div id="emp-contract-filter-banner" class="${currCttFilter && currCttFilter !== 'TODOS' ? '' : 'hidden'}">
        ${currCttFilter && currCttFilter !== 'TODOS' ? `
          <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-2.5 rounded-2xl text-xs font-bold mb-4">
            <div class="flex items-center gap-2">
              <span>📄</span>
              <span>Exibindo empenhos vinculados ao Contrato: <strong class="font-mono underline">${currCttFilter === 'SEM_CONTRATO' ? 'Sem Contrato (Avulsos / ATA)' : currCttFilter}</strong></span>
            </div>
            <button onclick="app.empenhos.clearContractFilter()" class="px-3 py-1 bg-white hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 text-[11px] font-black transition">
              ✕ Mostrar Todos os Empenhos
            </button>
          </div>
        ` : ''}
      </div>

      <!-- BARRA INTEGRADA DE PESQUISA, FILTROS E ORDENAÇÃO -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-slate-100 mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        <!-- BUSCA EM TEMPO REAL -->
        <div class="relative flex-1 min-w-[200px]">
          <input type="text" id="emp-search-input" oninput="app.empenhos.setSearch(this.value)" value="${app.state.empenhosSearch || ''}" placeholder="Buscar por Nº do empenho, empresa, ATA, contrato ou objeto..." class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition font-medium">
          <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
          <button id="emp-search-clear" onclick="app.empenhos.clearSearch()" class="${(app.state.empenhosSearch || '').trim() ? '' : 'hidden'} absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1" title="Limpar busca">✕</button>
        </div>

        <!-- 1. FILTRO DE SALDO / SITUAÇÃO -->
        <div class="flex items-center gap-1 shrink-0">
          <label for="emp-filter-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Saldo:</label>
          <select id="emp-filter-select" onchange="app.empenhos.setFilter(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition">
            <option value="TODOS_ATIVOS" ${currFilter === 'TODOS_ATIVOS' ? 'selected' : ''}>💳 Todos Ativos (${activeEmpenhos.length})</option>
            <option value="COM_SALDO" ${currFilter === 'COM_SALDO' ? 'selected' : ''}>🟢 Com Saldo Disponível</option>
            <option value="ATENCAO_CRITICO" ${currFilter === 'ATENCAO_CRITICO' ? 'selected' : ''}>🟡 Atenção / Crítico (&lt; 25%)</option>
            <option value="CRITICOS" ${currFilter === 'CRITICOS' ? 'selected' : ''}>🔴 Saldo Crítico (&lt; 10%) (${countCriticos})</option>
            <option value="ESGOTADOS" ${currFilter === 'ESGOTADOS' ? 'selected' : ''}>⚫ Saldo Esgotado (100%) (${countEsgotados})</option>
            <option value="COM_ATA" ${currFilter === 'COM_ATA' ? 'selected' : ''}>📑 Gerados por ATA (${countComAta})</option>
            <option value="COM_CONTRATO" ${currFilter === 'COM_CONTRATO' ? 'selected' : ''}>📄 Vinculados a Contrato (${countComContrato})</option>
            <option value="ARQUIVADOS" ${currFilter === 'ARQUIVADOS' ? 'selected' : ''}>📁 Arquivados</option>
          </select>
        </div>

        <!-- 2. FILTRO POR CONTRATO -->
        <div class="flex items-center gap-1 shrink-0">
          <label for="emp-contract-filter-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Contrato:</label>
          <select id="emp-contract-filter-select" onchange="app.empenhos.setContractFilter(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition">
            <option value="TODOS" ${currCttFilter === 'TODOS' ? 'selected' : ''}>Todos os Contratos</option>
            <option value="SEM_CONTRATO" ${currCttFilter === 'SEM_CONTRATO' ? 'selected' : ''}>Sem Contrato (Avulsos/ATA)</option>
            ${contractOptions.map(c => `<option value="${c}" ${currCttFilter === c ? 'selected' : ''}>CTT ${c}</option>`).join('')}
          </select>
        </div>

        <!-- 3. ORDENAÇÃO -->
        <div class="flex items-center gap-1 shrink-0">
          <label for="emp-sort-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Ordenar:</label>
          <select id="emp-sort-select" onchange="app.empenhos.setSort(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition">
            <option value="RECENTES" ${currSort === 'RECENTES' ? 'selected' : ''}>🕒 Mais Recentes</option>
            <option value="MAIOR_SALDO" ${currSort === 'MAIOR_SALDO' ? 'selected' : ''}>💰 Maior Saldo Restante</option>
            <option value="MENOR_SALDO" ${currSort === 'MENOR_SALDO' ? 'selected' : ''}>⚠️ Menor Saldo Restante</option>
            <option value="MAIOR_USO_PCT" ${currSort === 'MAIOR_USO_PCT' ? 'selected' : ''}>📈 Maior % Usado</option>
            <option value="MENOR_USO_PCT" ${currSort === 'MENOR_USO_PCT' ? 'selected' : ''}>📉 Menor % Usado</option>
            <option value="MAIOR_TOTAL" ${currSort === 'MAIOR_TOTAL' ? 'selected' : ''}>🏛️ Maior Valor Total</option>
            <option value="EMPRESA_ASC" ${currSort === 'EMPRESA_ASC' ? 'selected' : ''}>🔤 Empresa (A-Z)</option>
            <option value="NUMERO_EMP" ${currSort === 'NUMERO_EMP' ? 'selected' : ''}>💳 Nº do Empenho</option>
          </select>
        </div>

        <!-- 4. ALTERNAR CARDS / TABELA -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button id="emp-btn-cards" onclick="app.empenhos.switchViewMode('CARDS')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}">
            <span>🗂️</span> <span class="hidden sm:inline">Cards</span>
          </button>
          <button id="emp-btn-tabela" onclick="app.empenhos.switchViewMode('TABELA')" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${!isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}">
            <span>📊</span> <span class="hidden sm:inline">Tabela</span>
          </button>
        </div>
      </div>

      <!-- CONTADOR DE REGISTROS -->
      <div class="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
        <span id="emp-filtered-count">Exibindo ${filteredList.length} de ${activeEmpenhos.length} empenhos ativos • Ordenado por: ${app.empenhos.getSortLabel(currSort)}</span>
      </div>

      <!-- GRADE DE CARDS VISUAIS OU TABELA ANALÍTICA -->
      <div id="painel-empenhos-content">
        ${app.empenhos.renderContentHtml()}
      </div>

    </div>
  `;
};

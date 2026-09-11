/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE AUDITORIA CONTRATUAL E PORTAL DE SERVIÇOS
 * Autor: Engenheiro Front-End Especialista em Sistemas Governamentais
 * Arquivo: app.js
 * ============================================================================
 */

// ESTADO GLOBAL DA APLICAÇÃO
const STATE_KEYS = {
  AUDIT_ITEMS: 'pmt_saude_audit_items_v2026',
  HEALTH_LINKS: 'pmt_saude_links_v2026',
  ADMIN_AUTH: 'pmt_saude_is_admin'
};

// Base de Dados Oficial dos Empenhos nº 3406 e 3407/2026 (M. B. Laboratório Ltda)
const INITIAL_AUDIT_DATA = [
  { id: 1, item: 1, cat: 'Laboratorial', descEmpenho: 'ÁCIDO FÓLICO', descPrestador: '02.02.01.002-3 / DOSAGEM DE ACIDO FOLICO', qtdEmpenho: 150, saldoAnterior: 107, faturado: 11 },
  { id: 6, item: 6, cat: 'Laboratorial', descEmpenho: 'ANÁLISE DE CARACTERES FÍSICOS, ELEMENTOS E SEDIMENTOS DA URINA (EQU)', descPrestador: '02.02.05.001-7 / URINÁLISE (EQU / EAS)', qtdEmpenho: 600, saldoAnterior: 44, faturado: 44 },
  { id: 16, item: 16, cat: 'Laboratorial', descEmpenho: 'COLESTEROL HDL', descPrestador: '02.02.01.028-7 / DOSAGEM DE COLESTEROL HDL', qtdEmpenho: 1200, saldoAnterior: 514, faturado: 81 },
  { id: 17, item: 17, cat: 'Laboratorial', descEmpenho: 'COLESTEROL LDL', descPrestador: '02.02.01.029-5 / DOSAGEM DE COLESTEROL LDL', qtdEmpenho: 1200, saldoAnterior: 602, faturado: 160 },
  { id: 19, item: 19, cat: 'Laboratorial', descEmpenho: 'CREATININA', descPrestador: '02.02.01.031-7 / DOSAGEM DE CREATININA', qtdEmpenho: 1200, saldoAnterior: 517, faturado: 178 },
  { id: 27, item: 27, cat: 'Laboratorial', descEmpenho: 'CPK - CREATINOFOSFOQUINASE', descPrestador: '02.02.01.032-5 / DOSAGEM DE CREATINOFOSFOQUINASE', qtdEmpenho: 200, saldoAnterior: 194, faturado: 3 },
  { id: 34, item: 34, cat: 'Laboratorial', descEmpenho: 'FERRO SÉRICO', descPrestador: '02.02.01.039-2 / DOSAGEM DE FERRO SERICO', qtdEmpenho: 200, saldoAnterior: 71, faturado: 28 },
  { id: 38, item: 38, cat: 'Laboratorial', descEmpenho: 'GLICOSE', descPrestador: '02.02.01.047-3 / DOSAGEM DE GLICOSE', qtdEmpenho: 800, saldoAnterior: 109, faturado: 109 },
  { id: 41, item: 41, cat: 'Laboratorial', descEmpenho: 'HEMOGRAMA COMPLETO', descPrestador: '02.02.02.038-0 / HEMOGRAMA COM CONTAGEM DE PLAQUETAS', qtdEmpenho: 2000, saldoAnterior: 1213, faturado: 194 },
  { id: 49, item: 49, cat: 'Laboratorial', descEmpenho: 'PCR - PROTEÍNA C REATIVA (QUANTITATIVA)', descPrestador: '02.02.03.076-8 / PROTEINA C REATIVA', qtdEmpenho: 100, saldoAnterior: 14, faturado: 14 },
  { id: 56, item: 56, cat: 'Laboratorial', descEmpenho: 'PSA TOTAL (ANTÍGENO PROSTÁTICO ESPECÍFICO)', descPrestador: '02.02.03.010-5 / DOSAGEM DE PSA TOTAL', qtdEmpenho: 600, saldoAnterior: 461, faturado: 33 },
  { id: 58, item: 58, cat: 'Laboratorial', descEmpenho: 'SÓDIO SÉRICO', descPrestador: '02.02.01.063-5 / DOSAGEM DE SODIO', qtdEmpenho: 600, saldoAnterior: 432, faturado: 54 },
  { id: 68, item: 68, cat: 'Laboratorial', descEmpenho: 'TRIGLICERÍDEOS', descPrestador: '02.02.01.067-8 / DOSAGEM DE TRIGLICERIDEOS', qtdEmpenho: 800, saldoAnterior: 114, faturado: 114 },
  { id: 74, item: 74, cat: 'Laboratorial', descEmpenho: 'VSG / VHS - VELOCIDADE DE HEMOSSEDIMENTAÇÃO', descPrestador: '02.02.02.015-0 / DETERMINACAO DE VHS', qtdEmpenho: 50, saldoAnterior: 23, faturado: 13 },
  // Exames Representativos de Diagnóstico por Imagem
  { id: 101, item: 101, cat: 'Imagem', descEmpenho: 'RADIOGRAFIA DE TÓRAX (PA E PERFIL)', descPrestador: '02.04.03.018-8 / RX DE TORAX PA E PERFIL', qtdEmpenho: 900, saldoAnterior: 410, faturado: 72 },
  { id: 102, item: 102, cat: 'Imagem', descEmpenho: 'ULTRASSONOGRAFIA DE ABDOME TOTAL', descPrestador: '02.05.02.004-6 / USG ABDOMEN TOTAL', qtdEmpenho: 450, saldoAnterior: 215, faturado: 48 },
  { id: 103, item: 103, cat: 'Imagem', descEmpenho: 'ELETROCARDIOGRAMA (ECG)', descPrestador: '02.11.02.003-6 / ELETROCARDIOGRAMA DE 12 DERIVACOES', qtdEmpenho: 1000, saldoAnterior: 620, faturado: 0 }
];

// Links Institucionais Padrão
const INITIAL_LINKS = [
  { id: '1', title: 'Betha Cloud Saúde', desc: 'Prontuário eletrônico, regulação e farmácia pública', url: 'https://cloud.betha.com.br', icon: 'server' },
  { id: '2', title: '1Doc - Protocolo Digital', desc: 'Tramitação de memorandos, ofícios e processos internos', url: 'https://torres.1doc.com.br', icon: 'file' },
  { id: '3', title: 'Portal ETP / TR Digital', desc: 'Estudos técnicos preliminares e termos de referência', url: '#', icon: 'document-text' },
  { id: '4', title: 'Sistema SI-PNI (Vacinas)', desc: 'Registro das campanhas e imunobiológicos aplicados', url: 'https://sipni.datasus.gov.br', icon: 'shield' },
  { id: '5', title: 'Almoxarifado Central', desc: 'Controle de entrada e dispensação de insumos hospitalares', url: '#', icon: 'archive' }
];

/* ==========================================================================
   GERENCIADOR DE ROTAS SPA
   ========================================================================== */
const Router = {
  currentView: 'landing',

  init() {
    window.addEventListener('popstate', (e) => {
      const view = e.state?.view || 'landing';
      this.render(view, false);
    });

    // Ler hash inicial ou renderizar landing
    const hash = window.location.hash.replace('#', '');
    if (['landing', 'saude_links', 'auditoria_exames'].includes(hash)) {
      this.navigate(hash);
    } else {
      this.navigate('landing');
    }
  },

  navigate(viewName) {
    if (this.currentView === viewName) return;
    this.render(viewName, true);
  },

  render(viewName, pushState = true) {
    this.currentView = viewName;

    // Alternar visibilidade das views
    document.querySelectorAll('.spa-view').forEach(view => view.classList.add('hidden'));

    if (viewName === 'landing') {
      document.getElementById('view-landing').classList.remove('hidden');
    } else if (viewName === 'saude_links') {
      document.getElementById('view-saude').classList.remove('hidden');
      App.renderLinks();
    } else if (viewName === 'auditoria_exames') {
      document.getElementById('view-auditoria').classList.remove('hidden');
      AuditModule.init();
    }

    if (pushState) {
      history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/* ==========================================================================
   MÓDULO DE GESTÃO E AUDITORIA DE EXAMES (EMPENHOS)
   ========================================================================== */
const AuditModule = {
  items: [],
  filters: {
    search: '',
    category: 'ALL',
    hideZero: false
  },

  init() {
    this.loadData();
    this.render();
  },

  loadData() {
    const saved = localStorage.getItem(STATE_KEYS.AUDIT_ITEMS);
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        console.error('Falha ao ler dados de auditoria:', e);
        this.items = JSON.parse(JSON.stringify(INITIAL_AUDIT_DATA));
      }
    } else {
      this.items = JSON.parse(JSON.stringify(INITIAL_AUDIT_DATA));
      this.saveData();
    }
  },

  saveData() {
    localStorage.setItem(STATE_KEYS.AUDIT_ITEMS, JSON.stringify(this.items));
  },

  confirmReset() {
    if (confirm("Deseja realmente restaurar todos os saldos e valores originais do contrato? Quaisquer alterações manuais serão perdidas.")) {
      this.items = JSON.parse(JSON.stringify(INITIAL_AUDIT_DATA));
      this.saveData();
      this.render();
    }
  },

  updateItemValues(id, field, value) {
    const numericVal = Math.max(0, parseInt(value, 10) || 0);
    const item = this.items.find(i => i.id === id);
    if (!item) return;

    item[field] = numericVal;
    this.saveData();
    this.render(); // Recalcula KPIs, tabela e regras condicionais em tempo real
  },

  calculateItem(item) {
    const saldoAnt = Number(item.saldoAnterior) || 0;
    const faturado = Number(item.faturado) || 0;
    const saldoAtual = saldoAnt - faturado;

    // Cálculos percentuais estritos com proteção contra divisão por zero
    let percConsumo = 0;
    let percRestante = 0;

    if (saldoAnt > 0) {
      percConsumo = (faturado / saldoAnt) * 100;
      percRestante = (saldoAtual / saldoAnt) * 100;
    } else if (saldoAnt === 0 && faturado > 0) {
      percConsumo = 100;
      percRestante = 0;
    }

    // Determinação da Situação Regulatória e Formatação de Cor
    let status = {
      label: 'Seguro',
      badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      rowClass: 'bg-white hover:bg-slate-50'
    };

    if (faturado === 0) {
      status = {
        label: 'Sem Movimento',
        badgeClass: 'bg-slate-100 text-slate-600 border border-slate-300',
        rowClass: 'bg-slate-50/60 hover:bg-slate-100/60 text-slate-600'
      };
    } else if (percConsumo >= 100 || saldoAtual <= 0) {
      status = {
        label: 'Esgotado',
        badgeClass: 'bg-purple-200 text-purple-900 border border-purple-400 font-extrabold',
        rowClass: 'bg-purple-100 text-purple-950 hover:bg-purple-200/80 font-medium'
      };
    } else if (percConsumo >= 50) {
      status = {
        label: 'Crítico (≥50%)',
        badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-bold',
        rowClass: 'bg-red-50 hover:bg-red-100/70 text-red-950 font-medium'
      };
    } else if (percConsumo >= 30) {
      status = {
        label: 'Alerta (≥30%)',
        badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
        rowClass: 'bg-amber-50/70 hover:bg-amber-100/70 text-amber-950'
      };
    }

    return {
      saldoAtual,
      percConsumo,
      percRestante,
      status
    };
  },

  applyFilters() {
    this.filters.search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
    this.filters.category = document.getElementById('filter-category')?.value || 'ALL';
    this.filters.hideZero = !!document.getElementById('filter-hide-zero')?.checked;
    this.render();
  },

  render() {
    const tbody = document.getElementById('audit-table-body');
    const emptyMsg = document.getElementById('table-empty-message');
    if (!tbody) return;

    let totalEmpenhado = 0;
    let totalFaturado = 0;
    let itensEsgotados = 0;
    let itensCriticos = 0;

    tbody.innerHTML = '';

    // Filtragem de Dados
    const filteredItems = this.items.filter(item => {
      const calc = this.calculateItem(item);

      // Soma KPIs globais (independente de filtro para manter visão holística)
      totalEmpenhado += Number(item.qtdEmpenho) || 0;
      totalFaturado += Number(item.faturado) || 0;
      if (calc.percConsumo >= 100 || calc.saldoAtual <= 0) itensEsgotados++;
      else if (calc.percConsumo >= 30) itensCriticos++;

      // Filtro de Texto
      const matchesSearch = !this.filters.search ||
        item.descEmpenho.toLowerCase().includes(this.filters.search) ||
        item.descPrestador.toLowerCase().includes(this.filters.search) ||
        String(item.item).includes(this.filters.search);

      // Filtro de Categoria
      const matchesCategory = this.filters.category === 'ALL' || item.cat === this.filters.category;

      // Filtro Ocultar Faturamento Zero
      const matchesZero = !this.filters.hideZero || item.faturado > 0;

      return matchesSearch && matchesCategory && matchesZero;
    });

    // Atualização dos Cards de KPIs
    document.getElementById('kpi-total-empenhado').textContent = totalEmpenhado.toLocaleString('pt-BR');
    document.getElementById('kpi-total-faturado').textContent = totalFaturado.toLocaleString('pt-BR');
    document.getElementById('kpi-itens-esgotados').textContent = itensEsgotados;
    document.getElementById('kpi-itens-criticos').textContent = itensCriticos;

    if (filteredItems.length === 0) {
      emptyMsg.classList.remove('hidden');
    } else {
      emptyMsg.classList.add('hidden');
    }

    // Renderização das Linhas da Tabela
    filteredItems.forEach(item => {
      const calc = this.calculateItem(item);
      const tr = document.createElement('tr');
      tr.className = `transition-colors duration-150 border-b border-slate-200/80 ${calc.status.rowClass}`;

      tr.innerHTML = `
        <td class="py-2.5 px-3 text-center font-bold">${item.item}</td>
        <td class="py-2.5 px-3">
          <span class="inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
            ${item.cat}
          </span>
        </td>
        <td class="py-2.5 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
        <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${item.descPrestador}</td>
        <td class="py-2.5 px-3 text-right font-medium text-slate-600">${item.qtdEmpenho.toLocaleString('pt-BR')}</td>
        
        <!-- Saldo Anterior Editável -->
        <td class="py-2.5 px-3 text-right">
          <input 
            type="number" 
            min="0"
            value="${item.saldoAnterior}" 
            onchange="AuditModule.updateItemValues(${item.id}, 'saldoAnterior', this.value)"
            class="table-num-input w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:ring-1 focus:ring-sky-500 font-semibold"
          />
        </td>

        <!-- Faturado no Período Editável -->
        <td class="py-2.5 px-3 text-right bg-sky-50/50 border-x border-sky-100">
          <input 
            type="number" 
            min="0"
            value="${item.faturado}" 
            onchange="AuditModule.updateItemValues(${item.id}, 'faturado', this.value)"
            class="table-num-input w-20 text-right px-2 py-1 text-xs border border-sky-300 rounded bg-white shadow-xs focus:ring-2 focus:ring-sky-500 font-bold text-sky-950"
          />
        </td>

        <!-- Saldo Atual Calculado -->
        <td class="py-2.5 px-3 text-right font-bold ${calc.saldoAtual <= 0 ? 'text-red-700 font-extrabold' : ''}">
          ${calc.saldoAtual.toLocaleString('pt-BR')}
        </td>

        <!-- Consumo do Período % -->
        <td class="py-2.5 px-3 text-right font-mono font-bold">
          ${calc.percConsumo.toFixed(1)}%
        </td>

        <!-- Saldo Restante % -->
        <td class="py-2.5 px-3 text-right font-mono">
          ${calc.percRestante.toFixed(1)}%
        </td>

        <!-- Tag de Situação -->
        <td class="py-2.5 px-3 text-center">
          <span class="badge-status ${calc.status.badgeClass}">
            ${calc.status.label}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  exportCSV() {
    const headers = [
      "Item",
      "Categoria",
      "Descricao_Empenho",
      "Descricao_Prestador",
      "Qtd_Total_Empenhada",
      "Saldo_Anterior",
      "Faturado_Periodo",
      "Saldo_Atual",
      "Perc_Consumo_Periodo",
      "Perc_Saldo_Restante",
      "Situacao"
    ];

    const rows = this.items.map(item => {
      const calc = this.calculateItem(item);
      return [
        item.item,
        `"${item.cat}"`,
        `"${item.descEmpenho.replace(/"/g, '""')}"`,
        `"${item.descPrestador.replace(/"/g, '""')}"`,
        item.qtdEmpenho,
        item.saldoAnterior,
        item.faturado,
        calc.saldoAtual,
        `"${calc.percConsumo.toFixed(2)}%"`,
        `"${calc.percRestante.toFixed(2)}%"`,
        `"${calc.status.label}"`
      ].join(";");
    });

    // Inclui BOM para que o MS Excel abra caracteres em UTF-8 corretamente
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Auditoria_Exames_Contrato_67_2026_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

/* ==========================================================================
   APLICAÇÃO GERAL & LINKS INSTITUCIONAIS (PORTAL SAÚDE)
   ========================================================================== */
const App = {
  isAdmin: false,
  draggedIndex: null,

  init() {
    Router.init();
  },

  getLinks() {
    const saved = localStorage.getItem(STATE_KEYS.HEALTH_LINKS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_LINKS;
  },

  saveLinks(links) {
    localStorage.setItem(STATE_KEYS.HEALTH_LINKS, JSON.stringify(links));
    this.renderLinks();
  },

  renderLinks() {
    const container = document.getElementById('links-container');
    if (!container) return;

    const links = this.getLinks();
    container.innerHTML = '';

    links.forEach((link, idx) => {
      const card = document.createElement('div');
      card.className = `drag-card bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between transition hover:shadow-md hover:border-slate-300 ${this.isAdmin ? 'cursor-grab' : ''}`;
      
      if (this.isAdmin) {
        card.setAttribute('draggable', 'true');
        card.dataset.index = idx;
        
        card.addEventListener('dragstart', (e) => {
          this.draggedIndex = idx;
          card.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('dragging');
        });

        card.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        card.addEventListener('drop', (e) => {
          e.preventDefault();
          const targetIndex = Number(card.dataset.index);
          if (this.draggedIndex !== null && this.draggedIndex !== targetIndex) {
            const reordered = [...links];
            const [removed] = reordered.splice(this.draggedIndex, 1);
            reordered.splice(targetIndex, 0, removed);
            this.saveLinks(reordered);
          }
        });
      }

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-sm">
              ${link.title.charAt(0)}
            </span>
            ${this.isAdmin ? `<button onclick="App.deleteLink('${link.id}')" class="text-xs text-rose-500 hover:text-rose-700">Excluir</button>` : ''}
          </div>
          <h5 class="text-sm font-bold text-slate-900">${link.title}</h5>
          <p class="text-xs text-slate-500 mt-1">${link.desc}</p>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-sky-600 hover:text-sky-800 inline-flex items-center">
            Acessar Sistema <span class="ml-1">↗</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  },

  deleteLink(id) {
    if (confirm("Deseja remover este atalho institucional?")) {
      const updated = this.getLinks().filter(l => l.id !== id);
      this.saveLinks(updated);
    }
  },

  openAdminAuthModal() {
    if (this.isAdmin) {
      this.isAdmin = false;
      document.getElementById('btn-admin-auth').classList.remove('bg-amber-100', 'text-amber-900');
      document.getElementById('drag-hint').classList.add('hidden');
      this.renderLinks();
      alert('Modo administrativo desativado.');
      return;
    }
    document.getElementById('admin-pass-input').value = '';
    document.getElementById('admin-auth-error').classList.add('hidden');
    document.getElementById('modal-admin-auth').classList.remove('hidden');
  },

  closeAdminModal() {
    document.getElementById('modal-admin-auth').classList.add('hidden');
  },

  verifyAdminPassword(e) {
    e.preventDefault();
    const pass = document.getElementById('admin-pass-input').value;
    // Senha de demonstração para homologação municipal: "saude2026"
    if (pass === 'saude2026') {
      this.isAdmin = true;
      this.closeAdminModal();
      document.getElementById('btn-admin-auth').classList.add('bg-amber-100', 'text-amber-900');
      document.getElementById('drag-hint').classList.remove('hidden');
      this.renderLinks();
    } else {
      document.getElementById('admin-auth-error').classList.remove('hidden');
    }
  }
};

// Inicialização automática após carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

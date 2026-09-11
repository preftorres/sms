/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * Portal Integrado, Gestão de Acessos e Auditoria de Cotas de Exames
 * Arquivo: app.js
 * ============================================================================
 */

const STORAGE = {
  LINKS: 'torres_links_v6',
  AUDIT_ITEMS: 'torres_audit_items_2026',
  CONTRACT_CONFIG: 'torres_contract_config_2026',
  ADMIN_SESSION: 'torres_admin_logged'
};

// LINKS INSTITUCIONAIS EXATOS DO SEU DOCUMENTO
const DEFAULT_LINKS = [
  { id: 1, title: 'Vacinas', url: 'http://vaciastorres.dpdns.org', desc: 'Controle de Imunização' },
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' }
];

// DADOS DO CONTRATO EDITÁVEIS
const DEFAULT_CONTRACT = {
  num: '67/2026',
  empenhos: '3406/2026 e 3407/2026',
  prestador: 'M. B. Laboratório de Análises Clínicas Ltda'
};

// BASE OFICIAL DE EXAMES (EMPENHOS 3406 E 3407/2026 + IMAGEM)
const DEFAULT_EXAMS = [
  { id: 1, item: 1, cat: 'Laboratorial', descEmpenho: 'ÁCIDO FÓLICO', descPrestador: '02.02.01.002-3 / DOSAGEM DE ACIDO FOLICO', qtdEmpenho: 150, saldoAnterior: 107, faturado: 11 },
  { id: 6, item: 6, cat: 'Laboratorial', descEmpenho: 'ANÁLISE DE URINA (EQU)', descPrestador: '02.02.05.001-7 / URINÁLISE (EQU / EAS)', qtdEmpenho: 600, saldoAnterior: 44, faturado: 44 },
  { id: 16, item: 16, cat: 'Laboratorial', descEmpenho: 'COLESTEROL HDL', descPrestador: '02.02.01.028-7 / DOSAGEM DE COLESTEROL HDL', qtdEmpenho: 1200, saldoAnterior: 514, faturado: 81 },
  { id: 17, item: 17, cat: 'Laboratorial', descEmpenho: 'COLESTEROL LDL', descPrestador: '02.02.01.029-5 / DOSAGEM DE COLESTEROL LDL', qtdEmpenho: 1200, saldoAnterior: 602, faturado: 160 },
  { id: 19, item: 19, cat: 'Laboratorial', descEmpenho: 'CREATININA', descPrestador: '02.02.01.031-7 / DOSAGEM DE CREATININA', qtdEmpenho: 1200, saldoAnterior: 517, faturado: 178 },
  { id: 27, item: 27, cat: 'Laboratorial', descEmpenho: 'CPK', descPrestador: '02.02.01.032-5 / DOSAGEM DE CREATINOFOSFOQUINASE', qtdEmpenho: 200, saldoAnterior: 194, faturado: 3 },
  { id: 34, item: 34, cat: 'Laboratorial', descEmpenho: 'FERRO SÉRICO', descPrestador: '02.02.01.039-2 / DOSAGEM DE FERRO SERICO', qtdEmpenho: 200, saldoAnterior: 71, faturado: 28 },
  { id: 38, item: 38, cat: 'Laboratorial', descEmpenho: 'GLICOSE', descPrestador: '02.02.01.047-3 / DOSAGEM DE GLICOSE', qtdEmpenho: 800, saldoAnterior: 109, faturado: 109 },
  { id: 41, item: 41, cat: 'Laboratorial', descEmpenho: 'HEMOGRAMA COMPLETO', descPrestador: '02.02.02.038-0 / HEMOGRAMA COM CONTAGEM', qtdEmpenho: 2000, saldoAnterior: 1213, faturado: 194 },
  { id: 49, item: 49, cat: 'Laboratorial', descEmpenho: 'PCR PROTEÍNA C REATIVA', descPrestador: '02.02.03.076-8 / PROTEINA C REATIVA', qtdEmpenho: 100, saldoAnterior: 14, faturado: 14 },
  { id: 56, item: 56, cat: 'Laboratorial', descEmpenho: 'PSA TOTAL', descPrestador: '02.02.03.010-5 / DOSAGEM DE PSA TOTAL', qtdEmpenho: 600, saldoAnterior: 461, faturado: 33 },
  { id: 58, item: 58, cat: 'Laboratorial', descEmpenho: 'SÓDIO', descPrestador: '02.02.01.063-5 / DOSAGEM DE SODIO', qtdEmpenho: 600, saldoAnterior: 432, faturado: 54 },
  { id: 68, item: 68, cat: 'Laboratorial', descEmpenho: 'TRIGLICERÍDEOS', descPrestador: '02.02.01.067-8 / DOSAGEM DE TRIGLICERIDEOS', qtdEmpenho: 800, saldoAnterior: 114, faturado: 114 },
  { id: 74, item: 74, cat: 'Laboratorial', descEmpenho: 'VSG / VHS', descPrestador: '02.02.02.015-0 / DETERMINACAO DE VHS', qtdEmpenho: 50, saldoAnterior: 23, faturado: 13 },
  // Exames Representativos de Diagnóstico por Imagem
  { id: 101, item: 101, cat: 'Imagem', descEmpenho: 'RAIO-X DE TÓRAX AP/PERFIL', descPrestador: '02.04.03.018-8 / RADIOGRAFIA TORACICA', qtdEmpenho: 800, saldoAnterior: 320, faturado: 45 },
  { id: 102, item: 102, cat: 'Imagem', descEmpenho: 'ULTRASSONOGRAFIA DE ABDOME TOTAL', descPrestador: '02.05.02.004-6 / ULTRASSONOGRAFIA ABDOMINAL', qtdEmpenho: 500, saldoAnterior: 230, faturado: 50 },
  { id: 103, item: 103, cat: 'Imagem', descEmpenho: 'ELETROCARDIOGRAMA (ECG)', descPrestador: '02.11.02.003-6 / ELETROCARDIOGRAMA', qtdEmpenho: 1000, saldoAnterior: 640, faturado: 0 }
];

const app = {
  state: {
    view: 'landing', // 'landing', 'saude_links', 'auditoria_exames'
    links: [],
    exams: [],
    contract: {},
    isAdmin: false,
    clockInterval: null,
    filters: {
      search: '',
      category: 'ALL',
      hideZero: false
    }
  },

  config: {
    pass: 'admin123'
  },

  init() {
    this.data.load();
    this.router.init();
    this.admin.checkSession();
  },

  data: {
    load() {
      // Carregar links
      const rawLinks = localStorage.getItem(STORAGE.LINKS);
      app.state.links = rawLinks ? JSON.parse(rawLinks) : JSON.parse(JSON.stringify(DEFAULT_LINKS));

      // Carregar contrato
      const rawContract = localStorage.getItem(STORAGE.CONTRACT_CONFIG);
      app.state.contract = rawContract ? JSON.parse(rawContract) : JSON.parse(JSON.stringify(DEFAULT_CONTRACT));

      // Carregar exames
      const rawExams = localStorage.getItem(STORAGE.AUDIT_ITEMS);
      app.state.exams = rawExams ? JSON.parse(rawExams) : JSON.parse(JSON.stringify(DEFAULT_EXAMS));
    },

    saveLinks() {
      localStorage.setItem(STORAGE.LINKS, JSON.stringify(app.state.links));
    },

    saveExams() {
      localStorage.setItem(STORAGE.AUDIT_ITEMS, JSON.stringify(app.state.exams));
    },

    saveContract() {
      localStorage.setItem(STORAGE.CONTRACT_CONFIG, JSON.stringify(app.state.contract));
    }
  },

  router: {
    init() {
      window.addEventListener('hashchange', () => {
        this.resolveRoute();
      });
      this.resolveRoute();
    },

    resolveRoute() {
      const rawHash = window.location.hash.replace('#', '').trim();
      const validViews = ['landing', 'saude_links', 'auditoria_exames'];
      
      let targetView = 'landing';
      if (rawHash === 'saude') {
        targetView = 'saude_links'; // Compatibilidade com link anterior
      } else if (validViews.includes(rawHash)) {
        targetView = rawHash;
      }

      this.go(targetView, false);
    },

    go(view, updateHash = true) {
      app.state.view = view;
      if (updateHash) {
        window.location.hash = view;
      }
      app.ui.updateHeaderActiveState(view);
      app.render.view();
    }
  },

  ui: {
    navigate(view) {
      app.router.go(view, true);
    },

    // Apenas o botão da página em que o usuário está ganha fundo azul claro
    updateHeaderActiveState(activeView) {
      const tabs = [
        { id: 'nav-btn-landing', view: 'landing' },
        { id: 'nav-btn-saude_links', view: 'saude_links' },
        { id: 'nav-btn-auditoria_exames', view: 'auditoria_exames' }
      ];

      tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (!el) return;

        if (t.view === activeView) {
          // ESTADO SELECIONADO: FUNDO AZUL CLARO
          el.className = "nav-tab px-3.5 py-2 rounded-xl transition-all bg-sky-100 text-sky-950 font-extrabold shadow-sm";
        } else {
          // ESTADO INATIVO: SEM FUNDO CLARO
          el.className = "nav-tab px-3.5 py-2 rounded-xl transition-all text-white/90 hover:text-white hover:bg-white/10 font-medium";
        }
      });
    },

    toggleAuthModal(show) {
      const m = document.getElementById('modal-auth');
      const err = document.getElementById('auth-error-msg');
      if (err) err.classList.add('hidden');
      m.classList.toggle('hidden', !show);
      m.classList.toggle('flex', show);
      if (show) {
        const inp = document.getElementById('input-pass');
        inp.value = '';
        setTimeout(() => inp.focus(), 80);
      }
    }
  },

  render: {
    view() {
      const vp = document.getElementById('app-viewport');
      if (!vp) return;

      if (app.state.clockInterval) {
        clearInterval(app.state.clockInterval);
        app.state.clockInterval = null;
      }

      if (app.state.view === 'landing') {
        this.landing(vp);
      } else if (app.state.view === 'saude_links') {
        this.saudeLinks(vp);
      } else if (app.state.view === 'auditoria_exames') {
        this.auditoriaExames(vp);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    landing(el) {
      el.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-6 fade-in">
          <div class="mb-10 text-center">
            <div class="w-32 h-32 md:w-44 md:h-44 bg-white rounded-full shadow-2xl flex items-center justify-center p-4 mb-6 mx-auto border-4 border-slate-100">
              <img src="torres-rs-logo-300x139.webp" 
                   alt="Prefeitura de Torres" 
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" 
                   class="max-w-full h-auto object-contain">
              <svg class="w-16 h-16 text-sky-700 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 class="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight">Prefeitura Municipal de Torres</h1>
            <p class="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Estado do Rio Grande do Sul</p>
            <div class="h-1.5 w-24 bg-sky-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <!-- CARD CENTRAL DE ENTRADA NA SAÚDE -->
          <button onclick="app.ui.navigate('saude_links')" class="card-landing bg-white p-8 md:p-10 rounded-[3rem] shadow-xl flex flex-col items-center max-w-sm w-full group">
            <div class="w-20 h-20 bg-sky-50 text-sky-600 rounded-3xl flex items-center justify-center mb-6 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <h2 class="text-2xl font-black text-slate-800 mb-2">Secretaria da Saúde</h2>
            <p class="text-slate-500 font-medium text-center text-sm">Acesse a central de sistemas, auditoria de cotas e links úteis.</p>
            <div class="mt-8 px-6 py-2.5 bg-slate-100 rounded-full text-xs font-black text-slate-600 uppercase tracking-widest group-hover:bg-sky-100 group-hover:text-sky-800 transition-all">
              Clique para entrar
            </div>
          </button>
        </div>
      `;
    },

    saudeLinks(el) {
      el.innerHTML = `
        <!-- Barra de Identificação com Relógio em Tempo Real -->
        <div class="bg-slate-900 py-6 px-6 shadow-md border-b border-slate-800">
          <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-4">
              <button onclick="app.ui.navigate('landing')" class="p-2.5 hover:bg-white/10 rounded-2xl text-white transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              </button>
              <div>
                <h2 class="text-xl font-black text-white leading-tight">SECRETARIA DA SAÚDE</h2>
                <p class="text-sky-400 text-xs font-bold tracking-widest uppercase">Portal Integrado de Acessos</p>
              </div>
            </div>
            <div id="clock-display" class="text-right text-white">
              <p id="clock-time" class="text-2xl font-black leading-none font-mono"></p>
              <p id="clock-date" class="text-[11px] uppercase font-bold text-sky-400 mt-1"></p>
            </div>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in w-full">
          
          <!-- CARD DE DESTAQUE OBRIGATÓRIO: AUDITORIA DE EXAMES -->
          <div class="mb-10 bg-gradient-to-r from-sky-900 via-sky-950 to-indigo-950 text-white p-7 sm:p-9 rounded-[2.5rem] shadow-xl border border-sky-800/40 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <span class="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 text-[11px] font-extrabold uppercase rounded-full tracking-wider mb-2">
                Novo Módulo de Auditoria
              </span>
              <h3 class="text-2xl sm:text-3xl font-black">Auditoria e Gestão de Cotas de Exames (Empenhos)</h3>
              <p class="text-sky-200 text-sm mt-2">
                Conferência detalhada do Contrato nº ${app.state.contract.num} (Empenhos ${app.state.contract.empenhos}). Acompanhe saldos, faturados no período e alertas de esgotamento.
              </p>
            </div>
            <button onclick="app.ui.navigate('auditoria_exames')" class="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-2xl font-black text-xs sm:text-sm shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap">
              Acessar Auditoria de Cotas →
            </button>
          </div>

          <!-- TÍTULO DA SEÇÃO DE LINKS -->
          <div class="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
            <h3 class="text-base font-black text-slate-800 uppercase tracking-wider">Sistemas e Atalhos em Destaque</h3>
            ${app.state.isAdmin ? `<span class="text-xs text-amber-700 font-bold bg-amber-100 px-3 py-1 rounded-full">Modo Admin Habilitado</span>` : ''}
          </div>

          <!-- GRID COM OS ATALHOS EXATOS DO ARQUIVO -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            ${app.state.links.map(l => `
              <a href="${l.url}" target="_blank" rel="noopener noreferrer" 
                 class="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all group flex flex-col justify-between">
                <div>
                  <div class="w-12 h-12 bg-sky-50 text-sky-700 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-inner">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                  </div>
                  <h4 class="font-black text-slate-800 text-lg mb-1 group-hover:text-sky-700 transition">${l.title}</h4>
                  <p class="text-xs text-slate-500 font-medium leading-relaxed">${l.desc}</p>
                </div>
                <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600">
                  <span>Abrir Sistema</span>
                  <span class="group-hover:translate-x-1 transition">↗</span>
                </div>
              </a>
            `).join('')}
          </div>

        </div>
      `;

      this.startClock();
    },

    startClock() {
      const tick = () => {
        const dateEl = document.getElementById('clock-date');
        const timeEl = document.getElementById('clock-time');
        if (!dateEl || !timeEl) return;
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        timeEl.textContent = now.toLocaleTimeString('pt-BR');
      };
      tick();
      app.state.clockInterval = setInterval(tick, 1000);
    },

    auditoriaExames(el) {
      el.innerHTML = `
        <div class="max-w-[1700px] mx-auto px-4 sm:px-6 py-8 w-full fade-in">
          
          <!-- BANNER CONTRATUAL -->
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 print:border-none print:shadow-none print:p-0">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div class="flex items-center space-x-2">
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-extrabold bg-sky-100 text-sky-900">SMS / AUDITORIA DE CONTROLE INTERNO</span>
                  <span class="text-xs text-slate-500 font-semibold">Exercício 2026</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
                  Conferência de Execução de Cotas de Exames (Laboratório & Imagem)
                </h2>
                <div class="mt-2 text-xs text-slate-600 flex flex-wrap gap-x-6 gap-y-1">
                  <span><strong>Município:</strong> Torres/RS</span>
                  <span><strong>Contrato:</strong> nº <span id="label-contrato-num">${app.state.contract.num}</span></span>
                  <span><strong>Empenhos:</strong> <span id="label-empenhos">${app.state.contract.empenhos}</span></span>
                  <span><strong>Prestador Credenciado:</strong> <span id="label-prestador">${app.state.contract.prestador}</span></span>
                </div>
              </div>

              <!-- BOTÕES DE AÇÃO -->
              <div class="flex flex-wrap items-center gap-2 print:hidden">
                <button onclick="app.audit.exportCSV()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition inline-flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  Exportar (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition inline-flex items-center">
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                  Imprimir / PDF
                </button>
                ${app.state.isAdmin ? `
                  <button onclick="app.admin.openTabContratos()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition inline-flex items-center">
                    ✏️ Editar Contrato / Exames
                  </button>
                ` : ''}
                <button onclick="app.audit.resetDefaults()" class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-300 transition">
                  Restaurar Padrão
                </button>
              </div>
            </div>
          </div>

          <!-- CARDS DE KPIS -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Qtd. Total Contratada</span>
              <p id="kpi-total-empenhado" class="text-2xl font-black text-slate-800 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Total somado nos empenhos</span>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
              <span class="text-[11px] font-bold text-slate-500 uppercase">Faturado no Período</span>
              <p id="kpi-total-faturado" class="text-2xl font-black text-sky-700 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Execução no faturamento</span>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-xs border border-purple-200 bg-purple-50/50">
              <span class="text-[11px] font-bold text-purple-900 uppercase">Itens Esgotados</span>
              <p id="kpi-itens-esgotados" class="text-2xl font-black text-purple-700 mt-1">0</p>
              <span class="text-[10px] text-purple-600 font-medium">Consumo ≥ 100% ou saldo zerado</span>
            </div>
            <div class="bg-white p-4 rounded-2xl shadow-xs border border-red-200 bg-red-50/50">
              <span class="text-[11px] font-bold text-red-900 uppercase">Alerta Crítico (≥ 30%)</span>
              <p id="kpi-itens-criticos" class="text-2xl font-black text-red-700 mt-1">0</p>
              <span class="text-[10px] text-red-600 font-medium">Requer atenção orçamentária</span>
            </div>
          </div>

          <!-- BARRA DE FILTROS -->
          <div class="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
            <div class="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input type="text" id="filter-search" oninput="app.audit.applyFilters()" 
                     placeholder="Buscar por código TUSS/SUS, descrição do empenho ou prestador..." 
                     class="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none">
              
              <select id="filter-category" onchange="app.audit.applyFilters()" 
                      class="sm:w-52 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white">
                <option value="ALL">Todas as Categorias</option>
                <option value="Laboratorial">Laboratoriais</option>
                <option value="Imagem">Imagem / Diagnóstico</option>
              </select>
            </div>

            <label class="inline-flex items-center cursor-pointer select-none text-xs font-semibold text-slate-700">
              <input type="checkbox" id="filter-hide-zero" onchange="app.audit.applyFilters()" class="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300 mr-2">
              Ocultar procedimentos não faturados (Zera no período)
            </label>
          </div>

          <!-- TABELA DE AUDITORIA COM STICKY HEADER -->
          <div class="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div class="custom-scrollbar overflow-y-auto max-h-[640px] relative">
              <table id="audit-table" class="w-full text-left border-collapse text-xs">
                <thead class="sticky-table-head bg-slate-100 text-slate-700 uppercase font-extrabold text-[11px] shadow-sm">
                  <tr class="border-b border-slate-300">
                    <th class="py-3 px-3 text-center w-12">Item</th>
                    <th class="py-3 px-3 w-28">Categoria</th>
                    <th class="py-3 px-3 min-w-[220px]">Descrição no Empenho</th>
                    <th class="py-3 px-3 min-w-[220px]">Descrição / Cód. (Prestador)</th>
                    <th class="py-3 px-3 text-right w-24">Qtd. Emp.</th>
                    <th class="py-3 px-3 text-right w-28">Saldo Ant.</th>
                    <th class="py-3 px-3 text-right w-28 bg-sky-50/80 border-x border-sky-200">Faturado</th>
                    <th class="py-3 px-3 text-right w-24">Saldo Atual</th>
                    <th class="py-3 px-3 text-right w-24">% Cons.</th>
                    <th class="py-3 px-3 text-right w-24">% Rest.</th>
                    <th class="py-3 px-3 text-center w-32">Situação</th>
                  </tr>
                </thead>
                <tbody id="audit-table-body" class="divide-y divide-slate-200">
                  <!-- Gerado pelo app.audit.renderTable() -->
                </tbody>
              </table>
            </div>
            <div id="table-empty-msg" class="hidden p-8 text-center text-slate-400 text-sm font-medium">
              Nenhum procedimento localizado com os filtros selecionados.
            </div>
          </div>

        </div>
      `;

      app.audit.renderTable();
    }
  },

  audit: {
    calculate(item) {
      const saldoAnt = Number(item.saldoAnterior) || 0;
      const faturado = Number(item.faturado) || 0;
      const saldoAtual = saldoAnt - faturado;

      let percConsumo = 0;
      let percRestante = 0;

      if (saldoAnt > 0) {
        percConsumo = (faturado / saldoAnt) * 100;
        percRestante = (saldoAtual / saldoAnt) * 100;
      } else if (saldoAnt === 0 && faturado > 0) {
        percConsumo = 100;
        percRestante = 0;
      }

      // Regras Condicionais de Cores
      let style = {
        rowClass: 'bg-white hover:bg-slate-50',
        badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        label: 'Seguro'
      };

      if (faturado === 0) {
        style = {
          rowClass: 'bg-slate-50/80 text-slate-500',
          badgeClass: 'bg-slate-100 text-slate-600 border border-slate-300',
          label: 'Sem Movimento'
        };
      } else if (percConsumo >= 100 || saldoAtual <= 0) {
        style = {
          rowClass: 'bg-purple-100 text-purple-950 font-medium hover:bg-purple-200/80',
          badgeClass: 'bg-purple-200 text-purple-900 border border-purple-400 font-extrabold',
          label: 'Esgotado'
        };
      } else if (percConsumo >= 50) {
        style = {
          rowClass: 'bg-red-50 text-red-950 font-medium hover:bg-red-100/80',
          badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-bold',
          label: 'Crítico (≥50%)'
        };
      } else if (percConsumo >= 30) {
        style = {
          rowClass: 'bg-yellow-50 text-amber-950 hover:bg-yellow-100/80',
          badgeClass: 'bg-yellow-100 text-amber-900 border border-amber-300 font-bold',
          label: 'Alerta (≥30%)'
        };
      }

      return { saldoAtual, percConsumo, percRestante, style };
    },

    updateValue(id, field, value) {
      const parsed = Math.max(0, parseInt(value, 10) || 0);
      const target = app.state.exams.find(x => x.id === id);
      if (!target) return;

      target[field] = parsed;
      app.data.saveExams();
      this.renderTable();
    },

    applyFilters() {
      app.state.filters.search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
      app.state.filters.category = document.getElementById('filter-category')?.value || 'ALL';
      app.state.filters.hideZero = !!document.getElementById('filter-hide-zero')?.checked;
      this.renderTable();
    },

    renderTable() {
      const tbody = document.getElementById('audit-table-body');
      const empty = document.getElementById('table-empty-msg');
      if (!tbody) return;

      tbody.innerHTML = '';

      let sumEmpenhado = 0;
      let sumFaturado = 0;
      let countEsgotados = 0;
      let countCriticos = 0;

      const filtered = app.state.exams.filter(item => {
        const c = this.calculate(item);
        sumEmpenhado += Number(item.qtdEmpenho) || 0;
        sumFaturado += Number(item.faturado) || 0;

        if (c.percConsumo >= 100 || c.saldoAtual <= 0) countEsgotados++;
        else if (c.percConsumo >= 30) countCriticos++;

        const matchesSearch = !app.state.filters.search ||
          item.descEmpenho.toLowerCase().includes(app.state.filters.search) ||
          item.descPrestador.toLowerCase().includes(app.state.filters.search) ||
          String(item.item).includes(app.state.filters.search);

        const matchesCat = app.state.filters.category === 'ALL' || item.cat === app.state.filters.category;
        const matchesZero = !app.state.filters.hideZero || item.faturado > 0;

        return matchesSearch && matchesCat && matchesZero;
      });

      // Atualizar KPIs
      document.getElementById('kpi-total-empenhado').textContent = sumEmpenhado.toLocaleString('pt-BR');
      document.getElementById('kpi-total-faturado').textContent = sumFaturado.toLocaleString('pt-BR');
      document.getElementById('kpi-itens-esgotados').textContent = countEsgotados;
      document.getElementById('kpi-itens-criticos').textContent = countCriticos;

      if (filtered.length === 0) {
        empty.classList.remove('hidden');
      } else {
        empty.classList.add('hidden');
      }

      filtered.forEach(item => {
        const c = this.calculate(item);
        const tr = document.createElement('tr');
        tr.className = `border-b border-slate-200 transition ${c.style.rowClass}`;

        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center font-bold">${item.item}</td>
          <td class="py-2.5 px-3">
            <span class="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
              ${item.cat}
            </span>
          </td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
          <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${item.descPrestador}</td>
          <td class="py-2.5 px-3 text-right font-medium text-slate-600">${item.qtdEmpenho.toLocaleString('pt-BR')}</td>
          <td class="py-2.5 px-3 text-right">
            <input type="number" min="0" value="${item.saldoAnterior}" 
                   onchange="app.audit.updateValue(${item.id}, 'saldoAnterior', this.value)"
                   class="table-input w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white shadow-xs focus:ring-1 focus:ring-sky-500 font-semibold" />
          </td>
          <td class="py-2.5 px-3 text-right bg-sky-50/50 border-x border-sky-100">
            <input type="number" min="0" value="${item.faturado}" 
                   onchange="app.audit.updateValue(${item.id}, 'faturado', this.value)"
                   class="table-input w-20 text-right px-2 py-1 text-xs border border-sky-300 rounded-lg bg-white shadow-xs focus:ring-2 focus:ring-sky-500 font-bold text-sky-950" />
          </td>
          <td class="py-2.5 px-3 text-right font-black ${c.saldoAtual <= 0 ? 'text-red-700 font-black' : ''}">
            ${c.saldoAtual.toLocaleString('pt-BR')}
          </td>
          <td class="py-2.5 px-3 text-right font-mono font-bold">${c.percConsumo.toFixed(1)}%</td>
          <td class="py-2.5 px-3 text-right font-mono">${c.percRestante.toFixed(1)}%</td>
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${c.style.badgeClass}">
              ${c.style.label}
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },

    resetDefaults() {
      if (confirm("Deseja restaurar a base original dos procedimentos e dados do contrato? Modificações manuais serão perdidas.")) {
        app.state.exams = JSON.parse(JSON.stringify(DEFAULT_EXAMS));
        app.state.contract = JSON.parse(JSON.stringify(DEFAULT_CONTRACT));
        app.data.saveExams();
        app.data.saveContract();
        app.render.view();
      }
    },

    exportCSV() {
      const headers = ["Item", "Categoria", "Descricao_Empenho", "Descricao_Prestador", "Qtd_Empenho", "Saldo_Anterior", "Faturado", "Saldo_Atual", "Consumo_Perc", "Restante_Perc", "Situacao"];
      const rows = app.state.exams.map(item => {
        const c = this.calculate(item);
        return [
          item.item,
          `"${item.cat}"`,
          `"${item.descEmpenho.replace(/"/g, '""')}"`,
          `"${item.descPrestador.replace(/"/g, '""')}"`,
          item.qtdEmpenho,
          item.saldoAnterior,
          item.faturado,
          c.saldoAtual,
          `"${c.percConsumo.toFixed(2)}%"`,
          `"${c.percRestante.toFixed(2)}%"`,
          `"${c.style.label}"`
        ].join(";");
      });

      const csvString = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Auditoria_Contrato_${app.state.contract.num.replace(/\//g, '-')}_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },

  admin: {
    checkSession() {
      app.state.isAdmin = localStorage.getItem(STORAGE.ADMIN_SESSION) === 'true';
      this.updateAdminBadge();
    },

    updateAdminBadge() {
      const badge = document.getElementById('admin-badge-indicator');
      if (badge) {
        badge.classList.toggle('hidden', !app.state.isAdmin);
      }
    },

    toggleAuthOrOpen() {
      if (app.state.isAdmin) {
        this.openPanel();
      } else {
        app.ui.toggleAuthModal(true);
      }
    },

    verify() {
      const input = document.getElementById('input-pass');
      const err = document.getElementById('auth-error-msg');
      if (input.value === app.config.pass) {
        app.state.isAdmin = true;
        localStorage.setItem(STORAGE.ADMIN_SESSION, 'true');
        this.updateAdminBadge();
        app.ui.toggleAuthModal(false);
        this.openPanel();
      } else {
        err.classList.remove('hidden');
      }
      input.value = '';
    },

    logout() {
      app.state.isAdmin = false;
      localStorage.removeItem(STORAGE.ADMIN_SESSION);
      this.updateAdminBadge();
      this.exit();
      alert('Sessão administrativa encerrada.');
    },

    openPanel() {
      document.getElementById('admin-panel').classList.remove('hidden');
      this.switchTab('links');
      this.renderAdminLinksList();
      this.loadContractForm();
      this.renderAdminExamsList();
    },

    exit() {
      document.getElementById('admin-panel').classList.add('hidden');
      app.render.view();
    },

    switchTab(tab) {
      const tabLinks = document.getElementById('admin-tab-links');
      const tabContratos = document.getElementById('admin-tab-contratos');
      const btnLinks = document.getElementById('admin-tab-btn-links');
      const btnContratos = document.getElementById('admin-tab-btn-contratos');

      if (tab === 'links') {
        tabLinks.classList.remove('hidden');
        tabContratos.classList.add('hidden');
        btnLinks.className = "px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-xl bg-white text-sky-800 border-t-2 border-sky-600 shadow-xs";
        btnContratos.className = "px-5 py-3 font-semibold text-xs sm:text-sm rounded-t-xl text-slate-600 hover:bg-white/60";
      } else {
        tabLinks.classList.add('hidden');
        tabContratos.classList.remove('hidden');
        btnContratos.className = "px-5 py-3 font-extrabold text-xs sm:text-sm rounded-t-xl bg-white text-sky-800 border-t-2 border-sky-600 shadow-xs";
        btnLinks.className = "px-5 py-3 font-semibold text-xs sm:text-sm rounded-t-xl text-slate-600 hover:bg-white/60";
      }
    },

    openTabContratos() {
      this.openPanel();
      this.switchTab('contratos');
    },

    // --- Gestão de Links ---
    renderAdminLinksList() {
      const container = document.getElementById('admin-list-draggable');
      if (!container) return;

      container.innerHTML = app.state.links.map((l, index) => `
        <div draggable="true" data-id="${l.id}" data-index="${index}" 
             class="admin-item bg-white border border-slate-200 p-3.5 rounded-2xl flex items-center gap-3 transition hover:border-sky-400">
          <div class="cursor-grab text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10h10v2H7zm0-4h10v2H7zm0 8h10v2H7z"/></svg>
          </div>
          <div class="flex-grow cursor-pointer" onclick="app.admin.editLink(${l.id})">
            <span class="block font-bold text-slate-800 text-xs sm:text-sm">${l.title}</span>
            <span class="block text-[11px] text-slate-400 truncate max-w-sm sm:max-w-md">${l.url}</span>
          </div>
          <button onclick="app.admin.removeLink(${l.id})" class="text-rose-400 hover:text-rose-600 p-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `).join('');

      this.setupLinkDragEvents();
    },

    setupLinkDragEvents() {
      const items = document.querySelectorAll('.admin-item');
      let startIndex;
      items.forEach(item => {
        item.addEventListener('dragstart', () => {
          startIndex = +item.dataset.index;
          item.classList.add('dragging');
        });
        item.addEventListener('dragover', (e) => {
          e.preventDefault();
          item.classList.add('drag-over');
        });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', () => {
          const endIndex = +item.dataset.index;
          const moving = app.state.links.splice(startIndex, 1)[0];
          app.state.links.splice(endIndex, 0, moving);
          app.data.saveLinks();
          app.admin.renderAdminLinksList();
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
      });
    },

    saveLink() {
      const id = document.getElementById('edit-id').value;
      const title = document.getElementById('field-title').value.trim();
      const url = document.getElementById('field-url').value.trim();
      const desc = document.getElementById('field-desc').value.trim();

      if (!title || !url) {
        alert("Preencha título e URL.");
        return;
      }

      if (id) {
        const idx = app.state.links.findIndex(l => l.id == id);
        if (idx !== -1) {
          app.state.links[idx] = { ...app.state.links[idx], title, url, desc };
        }
      } else {
        app.state.links.push({ id: Date.now(), title, url, desc });
      }

      app.data.saveLinks();
      this.resetLinkForm();
      this.renderAdminLinksList();
    },

    editLink(id) {
      const l = app.state.links.find(x => x.id == id);
      if (!l) return;
      document.getElementById('edit-id').value = l.id;
      document.getElementById('field-title').value = l.title;
      document.getElementById('field-url').value = l.url;
      document.getElementById('field-desc').value = l.desc || '';
      document.getElementById('form-title-label').textContent = "Editando Atalho";
      document.getElementById('btn-save').textContent = "Atualizar Atalho";
      document.getElementById('btn-cancel-edit').classList.remove('hidden');
    },

    resetLinkForm() {
      document.getElementById('edit-id').value = '';
      document.getElementById('field-title').value = '';
      document.getElementById('field-url').value = '';
      document.getElementById('field-desc').value = '';
      document.getElementById('form-title-label').textContent = "Novo Atalho";
      document.getElementById('btn-save').textContent = "Salvar Link";
      document.getElementById('btn-cancel-edit').classList.add('hidden');
    },

    removeLink(id) {
      if (confirm("Excluir este atalho?")) {
        app.state.links = app.state.links.filter(l => l.id !== id);
        app.data.saveLinks();
        this.renderAdminLinksList();
      }
    },

    // --- Gestão Contratual e de Procedimentos de Exames ---
    loadContractForm() {
      document.getElementById('cfg-contract-num').value = app.state.contract.num;
      document.getElementById('cfg-empenhos').value = app.state.contract.empenhos;
      document.getElementById('cfg-prestador').value = app.state.contract.prestador;
    },

    saveContractConfig() {
      app.state.contract.num = document.getElementById('cfg-contract-num').value.trim();
      app.state.contract.empenhos = document.getElementById('cfg-empenhos').value.trim();
      app.state.contract.prestador = document.getElementById('cfg-prestador').value.trim();
      app.data.saveContract();
      alert("Dados do contrato atualizados com sucesso!");
    },

    renderAdminExamsList() {
      const tbody = document.getElementById('admin-exams-table-body');
      if (!tbody) return;

      tbody.innerHTML = app.state.exams.map(e => `
        <tr class="hover:bg-slate-50">
          <td class="p-3 text-center font-bold">${e.item}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold">${e.cat}</span></td>
          <td class="p-3 font-semibold text-slate-800">${e.descEmpenho}</td>
          <td class="p-3 text-right font-medium">${e.qtdEmpenho}</td>
          <td class="p-3 text-right">${e.saldoAnterior}</td>
          <td class="p-3 text-right font-bold text-sky-800">${e.faturado}</td>
          <td class="p-3 text-center">
            <button onclick="app.admin.editExam(${e.id})" class="text-sky-600 hover:text-sky-800 font-bold mr-2">Editar</button>
            <button onclick="app.admin.removeExam(${e.id})" class="text-rose-500 hover:text-rose-700 font-bold">Excluir</button>
          </td>
        </tr>
      `).join('');
    },

    saveExamItem() {
      const id = document.getElementById('edit-exam-id').value;
      const itemNum = parseInt(document.getElementById('exam-field-item').value, 10);
      const cat = document.getElementById('exam-field-cat').value;
      const descEmpenho = document.getElementById('exam-field-desc-empenho').value.trim();
      const descPrestador = document.getElementById('exam-field-desc-prestador').value.trim();
      const qtdEmpenho = parseInt(document.getElementById('exam-field-qtd').value, 10) || 0;
      const saldoAnterior = parseInt(document.getElementById('exam-field-saldo-ant').value, 10) || 0;
      const faturado = parseInt(document.getElementById('exam-field-faturado').value, 10) || 0;

      if (!itemNum || !descEmpenho) {
        alert("Preencha ao menos o número do item e a descrição do empenho.");
        return;
      }

      if (id) {
        const idx = app.state.exams.findIndex(x => x.id == id);
        if (idx !== -1) {
          app.state.exams[idx] = {
            ...app.state.exams[idx],
            item: itemNum,
            cat,
            descEmpenho,
            descPrestador: descPrestador || descEmpenho,
            qtdEmpenho,
            saldoAnterior,
            faturado
          };
        }
      } else {
        app.state.exams.push({
          id: Date.now(),
          item: itemNum,
          cat,
          descEmpenho,
          descPrestador: descPrestador || descEmpenho,
          qtdEmpenho,
          saldoAnterior,
          faturado
        });
      }

      // Ordena por número do item
      app.state.exams.sort((a, b) => a.item - b.item);

      app.data.saveExams();
      this.resetExamForm();
      this.renderAdminExamsList();
    },

    editExam(id) {
      const e = app.state.exams.find(x => x.id == id);
      if (!e) return;

      document.getElementById('edit-exam-id').value = e.id;
      document.getElementById('exam-field-item').value = e.item;
      document.getElementById('exam-field-cat').value = e.cat;
      document.getElementById('exam-field-desc-empenho').value = e.descEmpenho;
      document.getElementById('exam-field-desc-prestador').value = e.descPrestador;
      document.getElementById('exam-field-qtd').value = e.qtdEmpenho;
      document.getElementById('exam-field-saldo-ant').value = e.saldoAnterior;
      document.getElementById('exam-field-faturado').value = e.faturado;

      document.getElementById('exam-form-title').textContent = "Modificar Procedimento (Item " + e.item + ")";
      document.getElementById('btn-save-exam').textContent = "Atualizar Procedimento";
      document.getElementById('btn-cancel-exam').classList.remove('hidden');
    },

    resetExamForm() {
      document.getElementById('edit-exam-id').value = '';
      document.getElementById('exam-field-item').value = '';
      document.getElementById('exam-field-desc-empenho').value = '';
      document.getElementById('exam-field-desc-prestador').value = '';
      document.getElementById('exam-field-qtd').value = '';
      document.getElementById('exam-field-saldo-ant').value = '';
      document.getElementById('exam-field-faturado').value = '';
      document.getElementById('exam-form-title').textContent = "Cadastrar / Modificar Procedimento";
      document.getElementById('btn-save-exam').textContent = "Gravar Procedimento";
      document.getElementById('btn-cancel-exam').classList.add('hidden');
    },

    removeExam(id) {
      if (confirm("Excluir este procedimento de exame do contrato?")) {
        app.state.exams = app.state.exams.filter(x => x.id !== id);
        app.data.saveExams();
        this.renderAdminExamsList();
      }
    }
  }
};

// Inicialização automática
window.addEventListener('DOMContentLoaded', () => {
  app.init();
});

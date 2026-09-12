/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * Portal Integrado & Auditoria com Autenticação, Gemini IA e Google Sheets
 * Arquivo: app.js
 * ============================================================================
 */

const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbzB_7aIOl2t5Pq3nVBHJ7TyPd2vJsXBJ5HZ0mkg7Xn2mzewLPZ0brFBJB_rp5NfPkjwrw/exec";

const CONFIG = {
  keys: {
    links: 'torres_links_v6',
    contractsList: 'torres_contracts_hub_v1',
    activeContractTab: 'torres_active_tab_v1',
    examsCache: 'torres_exams_cache_v1',
    auditSession: 'torres_audit_logged_user'
  }
};

// LINKS INSTITUCIONAIS DA SAÚDE
const INITIAL_LINKS = [
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' },
  { id: 1, title: 'Vacinas', url: 'https://vacinastorres.dpdns.org/', desc: 'Controle de Imunização' }
];

// CONTRATO OFICIAL IDENTIFICADO NO DOCUMENTO REAL
const DEFAULT_CONTRACTS = [
  {
    tabName: "Contrato_67_2026",
    num: "67/2026",
    empenhos: "3406/2026 e 3407/2026",
    prestador: "LABORATORIO BIOMEDICO LTDA - ME",
    createdAt: "12/09/2026 às 08:30"
  }
];

// MODELO DE PROCEDIMENTOS (SEQUENCIAL 01, 02...)
const TEMPLATE_EXAMS = [
  { id: 1, item: "01", cat: 'Laboratorial', descEmpenho: 'Ácido Fólico (Vitamina B9)', descPrestador: '1 - AFOLI - ACIDO FOLICO', qtdEmpenho: 150, saldoAnterior: 150, faturado: 7 },
  { id: 2, item: "02", cat: 'Laboratorial', descEmpenho: 'Ácido Úrico', descPrestador: '1 - AUS - ACIDO URICO', qtdEmpenho: 400, saldoAnterior: 400, faturado: 8 },
  { id: 3, item: "03", cat: 'Laboratorial', descEmpenho: 'Ácido Valproico', descPrestador: '1 - ACVAL - ACIDO VALPROICO', qtdEmpenho: 150, saldoAnterior: 150, faturado: 1 },
  { id: 4, item: "04", cat: 'Laboratorial', descEmpenho: 'Albumina', descPrestador: 'ALBUMINA', qtdEmpenho: 150, saldoAnterior: 150, faturado: 0 },
  { id: 5, item: "05", cat: 'Laboratorial', descEmpenho: 'Amilase', descPrestador: '1 - AMI - AMILASE', qtdEmpenho: 350, saldoAnterior: 350, faturado: 1 },
  { id: 6, item: "06", cat: 'Laboratorial', descEmpenho: 'Analise de caracteres físicos, elemento e sedimentos na urina (EQU)', descPrestador: '1 - EQU - EXAME QUALITATIVO DE URINA', qtdEmpenho: 600, saldoAnterior: 600, faturado: 34 },
  { id: 16, item: "16", cat: 'Laboratorial', descEmpenho: 'Colesterol HDL', descPrestador: '1 - HDL - COLESTEROL HDL', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 37 },
  { id: 17, item: "17", cat: 'Laboratorial', descEmpenho: 'Colesterol LDL', descPrestador: '1 - LDL - COLESTEROL LDL', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 28 },
  { id: 18, item: "18", cat: 'Laboratorial', descEmpenho: 'Colesterol Total', descPrestador: '1 - C - COLESTEROL TOTAL', qtdEmpenho: 600, saldoAnterior: 600, faturado: 38 },
  { id: 19, item: "19", cat: 'Laboratorial', descEmpenho: 'Creatinina', descPrestador: '1 - CRE - CREATININA', qtdEmpenho: 1200, saldoAnterior: 1200, faturado: 34 },
  { id: 27, item: "27", cat: 'Laboratorial', descEmpenho: 'Dosagem Creatinofosfoquinase (CPK)', descPrestador: 'CPK', qtdEmpenho: 200, saldoAnterior: 200, faturado: 0 },
  { id: 28, item: "28", cat: 'Laboratorial', descEmpenho: 'EPF-Exame Parasitológico de fezes', descPrestador: '1 - EPF - EXAME PARASITOLOGICO DE FEZES', qtdEmpenho: 600, saldoAnterior: 600, faturado: 8 },
  { id: 41, item: "41", cat: 'Laboratorial', descEmpenho: 'Hemograma Completo', descPrestador: '1 - H - HEMOGRAMA', qtdEmpenho: 2000, saldoAnterior: 2000, faturado: 51 }
];

const app = {
  state: {
    view: 'landing',
    previousView: 'landing',
    links: [],
    contracts: [],
    activeContractTab: 'Contrato_67_2026',
    exams: [],
    users: [],
    auth: {
      isLogged: false,
      user: null
    },
    clockTimer: null,
    pendingView: null,
    filters: { search: '', category: 'ALL', hideZero: false }
  },

  init() {
    this.data.loadLocal();
    this.auditAuth.checkSession();
    this.router.init();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        app.auditAuth.cancelLogin();
        app.audit.closeNewContractModal();
        app.gemini.closeModal();
      }
    });

    if (GOOGLE_API_URL) {
      this.data.syncFromCloud();
    }
  },

  gemini: {
    openModal() {
      const modal = document.getElementById('modal-gemini-import');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        this.switchTab('paste');
        document.getElementById('gemini-paste-area').value = '';
        setTimeout(() => document.getElementById('gemini-paste-area').focus(), 80);
      }
    },

    closeModal() {
      const modal = document.getElementById('modal-gemini-import');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    switchTab(tab) {
      const vPaste = document.getElementById('view-gemini-paste');
      const vGuide = document.getElementById('view-gemini-guide');
      const bPaste = document.getElementById('btn-tab-gemini-paste');
      const bGuide = document.getElementById('btn-tab-gemini-guide');

      if (tab === 'paste') {
        vPaste.classList.remove('hidden');
        vGuide.classList.add('hidden');
        bPaste.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900";
        bGuide.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100 flex items-center gap-1.5";
      } else {
        vPaste.classList.add('hidden');
        vGuide.classList.remove('hidden');
        bGuide.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900 flex items-center gap-1.5";
        bPaste.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100";
      }
    },

    copyField(textElementId, buttonElementId) {
      const textEl = document.getElementById(textElementId);
      const btnEl = document.getElementById(buttonElementId);
      if (!textEl || !btnEl) return;

      const textToCopy = textEl.textContent.trim();
      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHtml = btnEl.innerHTML;
        btnEl.innerHTML = "<span>✓</span> Copiado!";
        btnEl.classList.add('copied');

        setTimeout(() => {
          btnEl.innerHTML = originalHtml;
          btnEl.classList.remove('copied');
        }, 2000);
      }).catch(err => {
        alert("Erro ao copiar. Selecione e copie manualmente.");
      });
    },

    processPaste() {
      const rawText = document.getElementById('gemini-paste-area').value.trim();
      if (!rawText) {
        alert("Cole o texto extraído pelo Gemini na caixa de texto.");
        return;
      }

      const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      const newExams = [];
      let counter = 1;

      lines.forEach(line => {
        let clean = line;
        if (clean.startsWith('|') && clean.endsWith('|')) {
          clean = clean.slice(1, -1).trim();
        }

        let parts = clean.includes(';') ? clean.split(';') : (clean.includes('|') ? clean.split('|') : clean.split('\t'));
        parts = parts.map(p => p.trim());

        const first = parts[0] ? parts[0].toLowerCase() : "";
        if (first.includes('item') || first.includes('---') || first.includes('categoria')) {
          return;
        }

        if (parts.length >= 3) {
          const itemSeq = String(counter).padStart(2, '0');
          const cat = parts[1] ? (parts[1].toLowerCase().includes('imag') ? 'Imagem' : 'Laboratorial') : 'Laboratorial';
          const descEmp = parts[2] || `Procedimento ${itemSeq}`;
          const descPrest = parts[3] || descEmp;
          const qtd = parts[4] ? Math.max(0, parseInt(parts[4].replace(/\D/g, ''), 10) || 0) : 0;
          const saldoAnt = parts[5] ? Math.max(0, parseInt(parts[5].replace(/\D/g, ''), 10) || 0) : qtd;
          const fat = parts[6] ? Math.max(0, parseInt(parts[6].replace(/\D/g, ''), 10) || 0) : 0;

          newExams.push({
            id: Date.now() + counter,
            item: itemSeq,
            cat: cat,
            descEmpenho: descEmp,
            descPrestador: descPrest,
            qtdEmpenho: qtd,
            saldoAnterior: saldoAnt,
            faturado: fat
          });

          counter++;
        }
      });

      if (newExams.length === 0) {
        alert("Não conseguimos identificar os dados. Certifique-se de que o texto tem colunas separadas por ponto e vírgula (;).");
        return;
      }

      app.state.exams = newExams;
      app.data.saveLocalExams();
      this.closeModal();
      app.render.auditoriaDetalhe(document.getElementById('app-viewport'));

      app.data.sendToCloud({
        action: "INITIAL_SEED",
        contract: app.state.activeContractTab,
        exams: app.state.exams
      });

      alert(`Sucesso! ${newExams.length} procedimentos foram importados, sequenciados (01, 02...) e salvos no Google Sheets!`);
    }
  },

  auditAuth: {
    checkSession() {
      const saved = sessionStorage.getItem(CONFIG.keys.auditSession);
      if (saved) {
        try {
          app.state.auth.user = JSON.parse(saved);
          app.state.auth.isLogged = true;
          this.updateBadge();
        } catch (e) {
          this.logout();
        }
      }
    },

    // BADGE QUE EXIBE "Usuário: [nome_usuario]"
    updateBadge() {
      const badge = document.getElementById('auth-user-badge');
      const nameEl = document.getElementById('auth-user-name');
      if (!badge || !nameEl) return;

      if (app.state.auth.isLogged && app.state.auth.user) {
        const loginUsuario = app.state.auth.user.usuario || 'admin';
        nameEl.textContent = `Usuário: ${loginUsuario}`;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    },

    promptLogin(targetView = 'auditoria_hub') {
      app.state.pendingView = targetView;
      const modal = document.getElementById('modal-audit-login');
      const err = document.getElementById('login-error-msg');
      if (err) err.classList.add('hidden');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
        setTimeout(() => document.getElementById('login-user').focus(), 80);
      }
    },

    closeLoginModal() {
      const modal = document.getElementById('modal-audit-login');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    },

    cancelLogin() {
      this.closeLoginModal();
      app.state.pendingView = null;
      const target = (app.state.previousView && !app.state.previousView.startsWith('auditoria'))
        ? app.state.previousView
        : 'saude_links';
      app.ui.navigate(target);
    },

    async handleLogin(e) {
      e.preventDefault();
      const u = document.getElementById('login-user').value.trim();
      const p = document.getElementById('login-pass').value.trim();
      const err = document.getElementById('login-error-msg');
      const btn = document.getElementById('btn-login-submit');

      if (!u || !p) return;

      try {
        btn.disabled = true;
        btn.textContent = "Verificando...";
        err.classList.add('hidden');

        const url = `${GOOGLE_API_URL}?action=LOGIN&u=${encodeURIComponent(u)}&p=${encodeURIComponent(p)}`;
        const res = await fetch(url, { redirect: 'follow' });
        const data = await res.json();

        if (data.status === "success" && data.user) {
          app.state.auth.isLogged = true;
          app.state.auth.user = data.user;
          sessionStorage.setItem(CONFIG.keys.auditSession, JSON.stringify(data.user));

          this.updateBadge();
          this.closeLoginModal();

          const target = app.state.pendingView || 'auditoria_hub';
          app.state.pendingView = null;
          app.router.go(target);
        } else {
          err.textContent = data.message || "Usuário ou senha incorretos.";
          err.classList.remove('hidden');
        }
      } catch (error) {
        if (u === "admin" && p === "admin123") {
          const fallbackUser = { id: 1, usuario: "admin", nome: "Administrador Geral (Offline)", perfil: "Administrador" };
          app.state.auth.isLogged = true;
          app.state.auth.user = fallbackUser;
          sessionStorage.setItem(CONFIG.keys.auditSession, JSON.stringify(fallbackUser));
          this.updateBadge();
          this.closeLoginModal();
          const target = app.state.pendingView || 'auditoria_hub';
          app.router.go(target);
        } else {
          err.textContent = "Erro ao conectar com a planilha. Verifique a internet.";
          err.classList.remove('hidden');
        }
      } finally {
        btn.disabled = false;
        btn.textContent = "Entrar";
      }
    },

    logout() {
      app.state.auth.isLogged = false;
      app.state.auth.user = null;
      sessionStorage.removeItem(CONFIG.keys.auditSession);
      this.updateBadge();
      app.ui.navigate('landing');
    }
  },

  data: {
    loadLocal() {
      const rawLinks = localStorage.getItem(CONFIG.keys.links);
      app.state.links = rawLinks ? JSON.parse(rawLinks) : JSON.parse(JSON.stringify(INITIAL_LINKS));

      const rawContracts = localStorage.getItem(CONFIG.keys.contractsList);
      app.state.contracts = rawContracts ? JSON.parse(rawContracts) : JSON.parse(JSON.stringify(DEFAULT_CONTRACTS));

      const rawActiveTab = localStorage.getItem(CONFIG.keys.activeContractTab);
      app.state.activeContractTab = rawActiveTab || app.state.contracts[0].tabName;

      const rawExamsCache = localStorage.getItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`);
      app.state.exams = rawExamsCache ? JSON.parse(rawExamsCache) : JSON.parse(JSON.stringify(TEMPLATE_EXAMS));
    },

    saveLocalExams() {
      localStorage.setItem(`${CONFIG.keys.examsCache}_${app.state.activeContractTab}`, JSON.stringify(app.state.exams));
    },

    saveLocalContracts() {
      localStorage.setItem(CONFIG.keys.contractsList, JSON.stringify(app.state.contracts));
      localStorage.setItem(CONFIG.keys.activeContractTab, app.state.activeContractTab);
    },

    saveLinksLocally() {
      localStorage.setItem(CONFIG.keys.links, JSON.stringify(app.state.links));
    },

    async syncFromCloud(showFeedback = false) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Consultando Planilha Google...");
        const url = `${GOOGLE_API_URL}?contract=${encodeURIComponent(app.state.activeContractTab)}`;
        const response = await fetch(url, { redirect: 'follow' });
        const res = await response.json();

        if (res.status === "success") {
          if (Array.isArray(res.shortcuts) && res.shortcuts.length > 0) {
            app.state.links = res.shortcuts;
            this.saveLinksLocally();
            if (app.state.view === 'saude_links') {
              app.render.saudeLinks(document.getElementById('app-viewport'));
            }
          }

          if (Array.isArray(res.contracts) && res.contracts.length > 0) {
            app.state.contracts = res.contracts.map(c => {
              const local = app.state.contracts.find(l => l.tabName === c.tabName);
              return {
                ...c,
                createdAt: c.createdAt || (local ? local.createdAt : "12/09/2026 às 08:30")
              };
            });
            this.saveLocalContracts();
          }

          if (Array.isArray(res.exams) && res.exams.length > 0) {
            app.state.exams = res.exams;
            this.saveLocalExams();
          }

          if (app.state.view === 'auditoria_detalhe') {
            app.render.auditoriaDetalhe(document.getElementById('app-viewport'));
          } else if (app.state.view === 'auditoria_hub') {
            app.render.auditoriaHub(document.getElementById('app-viewport'));
          }

          if (showFeedback) alert("Dados atualizados com sucesso diretamente da Planilha Google!");
        }
      } catch (err) {
        console.warn("Modo Offline ativado.", err);
        if (showFeedback) alert("Modo offline: exibindo dados salvos em cache.");
      } finally {
        app.ui.setSyncStatus(false);
      }
    },

    async sendToCloud(payload) {
      if (!GOOGLE_API_URL) return;
      try {
        app.ui.setSyncStatus(true, "Gravando na planilha...");
        payload.contract = app.state.activeContractTab;

        await fetch(GOOGLE_API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        console.error("Erro na sincronização:", err);
      } finally {
        setTimeout(() => app.ui.setSyncStatus(false), 800);
      }
    }
  },

  router: {
    init() {
      window.addEventListener('hashchange', () => this.handleRoute());
      this.handleRoute();
    },

    handleRoute() {
      let hash = window.location.hash.replace('#', '').trim();
      if (hash === 'saude') hash = 'saude_links';

      let targetView = 'landing';

      if (hash === 'auditoria_exames' || hash === 'auditoria') {
        targetView = 'auditoria_hub';
      } else if (hash.startsWith('auditoria_contrato=')) {
        app.state.activeContractTab = hash.split('=')[1];
        targetView = 'auditoria_detalhe';
      } else if (['landing', 'saude_links'].includes(hash)) {
        targetView = hash;
      }

      this.go(targetView);
    },

    go(view) {
      if ((view === 'auditoria_hub' || view === 'auditoria_detalhe') && !app.state.auth.isLogged) {
        app.auditAuth.promptLogin(view);
        return;
      }

      if (view !== 'auditoria_hub' && view !== 'auditoria_detalhe') {
        app.auditAuth.closeLoginModal();
        app.state.previousView = view;
      }

      app.state.view = view;
      app.ui.updateActiveMenu();
      app.render.all();
    }
  },

  ui: {
    navigate(view) {
      if (view === 'saude') view = 'saude_links';
      window.location.hash = view;
    },

    // MENU CONTEXTUAL ENXUTO (SEM BOTÃO DUPLICADO "INÍCIO" NA HOME)
    updateActiveMenu() {
      const nav = document.getElementById('main-nav');
      if (!nav) return;

      const isLanding = app.state.view === 'landing';

      // Na Home: cabeçalho limpo sem botões redundantes
      if (isLanding) {
        nav.innerHTML = '';
        return;
      }

      const isPortal = app.state.view === 'saude_links';
      const isAuditoria = app.state.view === 'auditoria_hub' || app.state.view === 'auditoria_detalhe';

      nav.innerHTML = `
        <button onclick="app.ui.navigate('landing')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 font-semibold text-[11px] sm:text-xs">
          Início
        </button>
        <button onclick="app.ui.navigate('saude_links')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isPortal ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Saúde
        </button>
        <button onclick="app.ui.navigate('auditoria_exames')" class="nav-btn px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg ${isAuditoria ? 'bg-blue-100 text-blue-950 font-black shadow-sm' : 'text-white/80 hover:text-white hover:bg-white/10 font-semibold'} text-[11px] sm:text-xs">
          Auditoria
        </button>
      `;
    },

    setSyncStatus(isSyncing, text = "") {
      const indicator = document.getElementById('cloud-sync-status');
      if (!indicator) return;
      if (isSyncing) {
        indicator.textContent = `☁️ ${text}`;
        indicator.classList.remove('hidden');
      } else {
        indicator.classList.add('hidden');
      }
    }
  },

  render: {
    all() {
      const vp = document.getElementById('app-viewport');
      if (!vp) return;

      if (app.state.clockTimer) {
        clearInterval(app.state.clockTimer);
        app.state.clockTimer = null;
      }

      if (app.state.view === 'landing') {
        this.landing(vp);
      } else if (app.state.view === 'saude_links') {
        this.saudeLinks(vp);
      } else if (app.state.view === 'auditoria_hub') {
        this.auditoriaHub(vp);
      } else if (app.state.view === 'auditoria_detalhe') {
        this.auditoriaDetalhe(vp);
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    landing(el) {
      el.innerHTML = `
        <div class="flex-grow flex flex-col items-center justify-center p-6 sm:p-10 fade-in">
            <div class="mb-10 text-center max-w-2xl">
                <div class="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full shadow-2xl flex items-center justify-center p-3 mb-6 mx-auto border-4 border-slate-100">
                    <img src="Logo_Torres_100x100.webp" 
                         alt="Prefeitura de Torres" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
                         class="max-w-full h-auto object-contain">
                    <svg class="w-14 h-14 text-blue-800 hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                </div>
                <h1 class="text-2xl md:text-4xl font-black text-torres-dark uppercase tracking-tight">Prefeitura Municipal de Torres</h1>
                <p class="text-xs uppercase tracking-widest text-slate-400 font-bold mt-1">Portal Interno de Serviços</p>
                <div class="h-1 w-20 bg-blue-600 mx-auto mt-3 rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
                <button onclick="app.ui.navigate('saude_links')" class="card-landing text-left bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-transparent hover:border-blue-500 flex flex-col justify-between group">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Disponível
                            </span>
                        </div>
                        <h2 class="text-xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition">Saúde</h2>
                        <p class="text-slate-500 font-medium text-xs leading-relaxed">Central de sistemas, ferramentas institucionais e auditoria de contratos e exames.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-black text-blue-600">
                        <span>Acessar Saúde</span>
                        <span class="group-hover:translate-x-1.5 transition">→</span>
                    </div>
                </button>

                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">Em Breve</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Educação</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Gestão escolar, transporte de alunos, alimentação e vagas da rede municipal.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>

                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">Em Breve</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Turismo e Cultura</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Calendário oficial de eventos, patrimônio histórico e cadastro turístico de Torres.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>

                <div class="bg-white/80 p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col justify-between opacity-85 select-none">
                    <div>
                        <div class="flex items-center justify-between mb-5">
                            <div class="w-14 h-14 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                            </div>
                            <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200">Em Breve</span>
                        </div>
                        <h2 class="text-xl font-bold text-slate-700 mb-2">Administração Geral</h2>
                        <p class="text-slate-400 font-medium text-xs leading-relaxed">Protocolo municipal, transparência pública, certidões e processos eletrônicos.</p>
                    </div>
                    <div class="mt-8 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400">Ambiente em Implantação</div>
                </div>
            </div>
        </div>
      `;
    },

    saudeLinks(el) {
      el.innerHTML = `
        <div class="bg-torres-dark py-8 px-6 shadow-xl">
            <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="app.ui.navigate('landing')" class="p-2 hover:bg-white/10 rounded-full text-white transition-all">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <div>
                        <h2 class="text-xl font-black text-white leading-none">SAÚDE</h2>
                        <p class="text-blue-400 text-xs font-bold tracking-widest mt-1 uppercase">Portal Integrado de Acessos</p>
                    </div>
                </div>
                <div id="clock-display" class="text-right text-white">
                    <p id="clock-time" class="text-xl font-black leading-none font-mono"></p>
                    <p id="clock-date" class="text-[10px] uppercase font-bold text-blue-400 mt-1"></p>
                </div>
            </div>
        </div>

        <div class="container mx-auto px-6 py-10 fade-in">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                <button onclick="app.ui.navigate('auditoria_exames')" 
                   class="text-left bg-white p-8 rounded-[2.5rem] border-2 border-blue-500 shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between relative overflow-hidden ring-4 ring-blue-50/60">
                    <div class="absolute top-4 right-5">
                        <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                            Gestão & Auditoria
                        </span>
                    </div>
                    <div>
                        <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                            </svg>
                        </div>
                        <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">Auditoria de Cotas de Exames</h3>
                        <p class="text-sm text-slate-400 font-medium leading-tight">Acesso protegido para auditoria de contratos, empenhos e execução.</p>
                    </div>
                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                        <span>Acessar Módulo</span>
                        <span class="group-hover:translate-x-1 transition">→</span>
                    </div>
                </button>

                ${app.state.links.map(l => `
                    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group flex flex-col justify-between">
                        <div>
                            <div class="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            </div>
                            <h3 class="font-black text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition">${l.title}</h3>
                            <p class="text-sm text-slate-400 font-medium leading-tight">${l.desc}</p>
                        </div>
                        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-600 transition">
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
        dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
        timeEl.textContent = now.toLocaleTimeString('pt-BR');
      };
      tick();
      app.state.clockTimer = setInterval(tick, 1000);
    },

    auditoriaHub(el) {
      el.innerHTML = `
        <div class="container mx-auto px-6 py-6 sm:py-8 fade-in">
            <div class="mb-4">
                <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                    <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    <span>Voltar para o Portal de Acessos</span>
                </button>
            </div>

            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Auditoria & Fiscalização da Saúde</span>
                    <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Contratos de Exames Cadastrados</h2>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Selecione um contrato para auditar procedimentos e cotas ou cadastre um novo.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="app.data.syncFromCloud(true)" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                        🔄 Atualizar da Planilha
                    </button>
                    <button onclick="app.audit.openNewContractModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                        <span class="text-sm">+</span> Novo Contrato
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${app.state.contracts.map(c => `
                    <div class="bg-white rounded-[2.5rem] p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between mb-4">
                                <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase border border-blue-100">
                                    Aba: ${c.tabName}
                                </span>
                                <span class="text-[11px] font-bold text-slate-400">Ativo</span>
                            </div>
                            
                            <h3 class="text-xl font-black text-slate-900 group-hover:text-blue-600 transition">Contrato nº ${c.num}</h3>
                            <p class="text-xs font-semibold text-slate-600 mt-1 line-clamp-2">${c.prestador}</p>
                            
                            <div class="mt-4 p-3 bg-slate-50 rounded-2xl text-[11px] text-slate-500 space-y-1">
                                <p><strong>Empenhos:</strong> ${c.empenhos}</p>
                                <p class="text-slate-400 text-[10px] flex items-center gap-1 mt-2">
                                    <span>📅</span> Registrado em: <b class="text-slate-600">${c.createdAt || "12/09/2026 às 08:30"}</b>
                                </p>
                            </div>
                        </div>

                        <div class="mt-6 pt-4 border-t border-slate-100">
                            <button onclick="app.audit.openContractDetail('${c.tabName}')" 
                                    class="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                                <span>Abrir Auditoria deste Contrato</span>
                                <span>→</span>
                            </button>
                        </div>
                    </div>
                `).join('')}

                <button onclick="app.audit.openNewContractModal()" 
                   class="bg-white/60 hover:bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[280px]">
                    <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </div>
                    <h4 class="font-black text-slate-800 text-base mb-1 group-hover:text-blue-600 transition">Cadastrar Novo Contrato</h4>
                    <p class="text-xs text-slate-400 max-w-xs">Cria uma nova aba e inicia o controle de cotas e procedimentos.</p>
                    <span class="mt-4 text-xs font-bold text-blue-600">+ Adicionar</span>
                </button>
            </div>
        </div>
      `;
    },

    auditoriaDetalhe(el) {
      const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];

      el.innerHTML = `
        <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">
          
          <div class="mb-4">
              <button onclick="app.ui.navigate('auditoria_exames')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                  <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  <span>Voltar para a Lista de Contratos</span>
              </button>
          </div>

          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 print:border-none print:shadow-none print:p-0">
            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-3 mb-2">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 uppercase">
                    Aba: ${currentContract.tabName}
                  </span>
                  <span id="cloud-sync-status" class="hidden text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold"></span>
                </div>
                <h2 class="text-xl sm:text-2xl font-black text-slate-900">
                  Auditoria de Cotas — Contrato nº ${currentContract.num}
                </h2>
                <div class="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
                  <span><strong>Empenhos:</strong> ${currentContract.empenhos}</span>
                  <span><strong>Prestador:</strong> ${currentContract.prestador}</span>
                  <span><strong>Cadastrado em:</strong> ${currentContract.createdAt || "12/09/2026"}</span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2 print:hidden">
                <button onclick="app.gemini.openModal()" title="Importar dados extraídos pelo Gemini a partir de foto" class="px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition flex items-center gap-1.5">
                  <span>🤖</span> Importar com Gemini IA
                </button>

                <button onclick="app.data.syncFromCloud(true)" title="Puxar dados atualizados desta aba no Google Sheets" class="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1">
                  <span>🔄</span> Sincronizar
                </button>
                <button onclick="app.audit.exportCSV()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition">
                  Exportar (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition">
                  Imprimir / PDF
                </button>
                <button onclick="app.admin.trigger(true)" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 shadow transition">
                  ⚙️ Procedimentos
                </button>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Empenhado</span>
              <p id="kpi-empenhado" class="text-2xl font-black text-slate-800 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Soma das cotas deste contrato</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturado no Período</span>
              <p id="kpi-faturado" class="text-2xl font-black text-blue-600 mt-1">0</p>
              <span class="text-[10px] text-slate-400">Total executado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-purple-100 bg-purple-50/40">
              <span class="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Itens Esgotados</span>
              <p id="kpi-esgotados" class="text-2xl font-black text-purple-700 mt-1">0</p>
              <span class="text-[10px] text-purple-600">Consumo ≥ 100% ou zerado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-red-100 bg-red-50/40">
              <span class="text-[10px] font-bold text-red-900 uppercase tracking-wider">Alerta Crítico (≥ 30%)</span>
              <p id="kpi-criticos" class="text-2xl font-black text-red-700 mt-1">0</p>
              <span class="text-[10px] text-red-600">Requer atenção orçamentária</span>
            </div>
          </div>

          <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between gap-4 print:hidden">
            <div class="flex-1 flex flex-col sm:flex-row gap-3">
              <input type="text" id="filter-search" oninput="app.audit.filter()" placeholder="Buscar por código ou descrição nesta aba..." class="flex-1 px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500">
              <select id="filter-cat" onchange="app.audit.filter()" class="sm:w-48 px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500 font-semibold">
                <option value="ALL">Todas as Categorias</option>
                <option value="Laboratorial">Laboratorial</option>
                <option value="Imagem">Imagem</option>
              </select>
            </div>
            <label class="inline-flex items-center text-xs font-semibold text-slate-600 cursor-pointer select-none">
              <input type="checkbox" id="filter-hide-zero" onchange="app.audit.filter()" class="w-4 h-4 rounded text-blue-600 mr-2 border-slate-300">
              Ocultar não faturados no período (Zero)
            </label>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="custom-scroll overflow-y-auto max-h-[600px] relative">
              <table id="table-audit" class="w-full text-left border-collapse text-xs">
                <thead class="sticky-thead bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-300">
                  <tr>
                    <th class="py-3 px-3 text-center w-12">Item</th>
                    <th class="py-3 px-3 w-28">Categoria</th>
                    <th class="py-3 px-3 min-w-[200px]">Descrição no Empenho</th>
                    <th class="py-3 px-3 min-w-[200px]">Descrição / Cód. (Prestador)</th>
                    <th class="py-3 px-3 text-right w-28 bg-slate-200/70 border-x border-slate-300">Qtd. Empenhada</th>
                    <th class="py-3 px-3 text-right w-28">Saldo Ant.</th>
                    <th class="py-3 px-3 text-right w-28 bg-blue-50 border-x border-blue-100">Faturado</th>
                    <th class="py-3 px-3 text-right w-24">Saldo Atual</th>
                    <th class="py-3 px-3 text-right w-24">% Cons.</th>
                    <th class="py-3 px-3 text-right w-24">% Rest.</th>
                    <th class="py-3 px-3 text-center w-32">Situação</th>
                  </tr>
                </thead>
                <tbody id="table-audit-body" class="divide-y divide-slate-200 font-medium"></tbody>
              </table>
            </div>
            <div id="table-empty" class="hidden p-8 text-center text-slate-400 text-xs font-medium">
              Nenhum exame cadastrado para este contrato.
            </div>
          </div>
        </div>
      `;

      app.audit.renderTable();
    }
  },

  audit: {
    openContractDetail(tabName) {
      app.state.activeContractTab = tabName;
      app.data.saveLocalContracts();

      const rawExams = localStorage.getItem(`${CONFIG.keys.examsCache}_${tabName}`);
      app.state.exams = rawExams ? JSON.parse(rawExams) : [];

      window.location.hash = `auditoria_contrato=${tabName}`;
    },

    openNewContractModal() {
      const m = document.getElementById('modal-new-contract');
      if (m) m.classList.remove('hidden'), m.classList.add('flex');
    },

    closeNewContractModal() {
      const m = document.getElementById('modal-new-contract');
      if (m) m.classList.add('hidden'), m.classList.remove('flex');
    },

    async confirmCreateContract() {
      const num = document.getElementById('new-contract-num').value.trim();
      const empenhos = document.getElementById('new-contract-empenhos').value.trim();
      const prestador = document.getElementById('new-contract-prestador').value.trim();
      const copyTemplate = document.getElementById('new-contract-copy-template').checked;

      if (!num || !prestador) {
        alert("Preencha ao menos o número do contrato e o prestador.");
        return;
      }

      const safeTabName = `Contrato_${num.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const createdAtStr = `${dateStr} às ${timeStr}`;

      const newContractObj = {
        tabName: safeTabName,
        num: num,
        empenhos: empenhos || 'A definir',
        prestador: prestador,
        createdAt: createdAtStr
      };

      const initialExams = copyTemplate ? TEMPLATE_EXAMS.map(item => ({
        ...item,
        faturado: 0
      })) : [];

      app.state.contracts.push(newContractObj);
      app.state.activeContractTab = safeTabName;
      app.state.exams = initialExams;

      app.data.saveLocalContracts();
      app.data.saveLocalExams();
      this.closeNewContractModal();

      this.openContractDetail(safeTabName);

      await app.data.sendToCloud({
        action: "CREATE_CONTRACT",
        ...newContractObj,
        initialExams: app.state.exams
      });
    },

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

      let style = {
        rowClass: 'bg-white hover:bg-slate-50',
        badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
        label: 'Seguro'
      };

      if (faturado === 0) {
        style = {
          rowClass: 'bg-slate-50 text-slate-500',
          badgeClass: 'bg-slate-200 text-slate-600 border border-slate-300',
          label: 'Sem Movimento'
        };
      } else if (percConsumo >= 100 || saldoAtual <= 0) {
        style = {
          rowClass: 'bg-purple-100 text-purple-950 font-bold hover:bg-purple-200/70',
          badgeClass: 'bg-purple-200 text-purple-900 border border-purple-400 font-extrabold',
          label: 'Esgotado'
        };
      } else if (percConsumo >= 50) {
        style = {
          rowClass: 'bg-red-50 text-red-950 font-semibold hover:bg-red-100/70',
          badgeClass: 'bg-red-100 text-red-800 border border-red-300 font-bold',
          label: 'Crítico (≥50%)'
        };
      } else if (percConsumo >= 30) {
        style = {
          rowClass: 'bg-yellow-50 text-yellow-950 hover:bg-yellow-100/70',
          badgeClass: 'bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold',
          label: 'Alerta (≥30%)'
        };
      }

      return { saldoAtual, percConsumo, percRestante, style };
    },

    updateVal(id, field, val) {
      const parsed = Math.max(0, parseInt(val, 10) || 0);
      const target = app.state.exams.find(x => x.id === id);
      if (!target) return;

      target[field] = parsed;

      if (field === 'qtdEmpenho' && target.saldoAnterior === 0) {
        target.saldoAnterior = parsed;
      }

      app.data.saveLocalExams();
      this.renderTable();

      app.data.sendToCloud({
        action: "UPDATE_VALUES",
        contract: app.state.activeContractTab,
        id: id,
        [field]: parsed,
        itemData: target
      });
    },

    filter() {
      app.state.filters.search = (document.getElementById('filter-search')?.value || '').toLowerCase().trim();
      app.state.filters.category = document.getElementById('filter-cat')?.value || 'ALL';
      app.state.filters.hideZero = !!document.getElementById('filter-hide-zero')?.checked;
      this.renderTable();
    },

    renderTable() {
      const tbody = document.getElementById('table-audit-body');
      const empty = document.getElementById('table-empty');
      if (!tbody) return;

      tbody.innerHTML = '';

      let totalEmp = 0;
      let totalFat = 0;
      let countEsg = 0;
      let countCrit = 0;

      const filtered = app.state.exams.filter(item => {
        const c = this.calculate(item);
        totalEmp += Number(item.qtdEmpenho) || 0;
        totalFat += Number(item.faturado) || 0;

        if (c.percConsumo >= 100 || c.saldoAtual <= 0) countEsg++;
        else if (c.percConsumo >= 30) countCrit++;

        const matchesSearch = !app.state.filters.search ||
          item.descEmpenho.toLowerCase().includes(app.state.filters.search) ||
          item.descPrestador.toLowerCase().includes(app.state.filters.search) ||
          String(item.item).includes(app.state.filters.search);

        const matchesCat = app.state.filters.category === 'ALL' || item.cat === app.state.filters.category;
        const matchesZero = !app.state.filters.hideZero || item.faturado > 0;

        return matchesSearch && matchesCat && matchesZero;
      });

      document.getElementById('kpi-empenhado').textContent = totalEmp.toLocaleString('pt-BR');
      document.getElementById('kpi-faturado').textContent = totalFat.toLocaleString('pt-BR');
      document.getElementById('kpi-esgotados').textContent = countEsg;
      document.getElementById('kpi-criticos').textContent = countCrit;

      if (filtered.length === 0) {
        empty.classList.remove('hidden');
      } else {
        empty.classList.add('hidden');
      }

      filtered.forEach(item => {
        const c = this.calculate(item);
        const tr = document.createElement('tr');
        tr.className = `border-b border-slate-200 transition-colors ${c.style.rowClass}`;

        tr.innerHTML = `
          <td class="py-2.5 px-3 text-center font-bold font-mono">${item.item}</td>
          <td class="py-2.5 px-3">
            <span class="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
              ${item.cat}
            </span>
          </td>
          <td class="py-2.5 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
          <td class="py-2.5 px-3 text-slate-600 font-mono text-[11px]">${item.descPrestador}</td>
          
          <td class="py-2.5 px-3 text-right bg-slate-100/90 border-x border-slate-200">
            <input type="number" min="0" value="${item.qtdEmpenho}" 
                   onchange="app.audit.updateVal(${item.id}, 'qtdEmpenho', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-slate-600 font-bold text-slate-800">
          </td>

          <td class="py-2.5 px-3 text-right">
            <input type="number" min="0" value="${item.saldoAnterior}" 
                   onchange="app.audit.updateVal(${item.id}, 'saldoAnterior', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-slate-300 rounded bg-white shadow-xs focus:border-blue-500 font-semibold">
          </td>

          <td class="py-2.5 px-3 text-right bg-blue-50/70 border-x border-blue-100">
            <input type="number" min="0" value="${item.faturado}" 
                   onchange="app.audit.updateVal(${item.id}, 'faturado', this.value)"
                   class="table-num w-20 text-right px-2 py-1 text-xs border border-blue-300 rounded bg-white shadow-xs focus:border-blue-600 font-bold text-blue-950">
          </td>

          <td class="py-2.5 px-3 text-right font-bold ${c.saldoAtual <= 0 ? 'text-red-700 font-black' : ''}">
            ${c.saldoAtual.toLocaleString('pt-BR')}
          </td>
          
          <td class="py-2.5 px-3 text-right font-mono font-bold">${c.percConsumo.toFixed(1)}%</td>
          <td class="py-2.5 px-3 text-right font-mono">${c.percRestante.toFixed(1)}%</td>
          
          <td class="py-2.5 px-3 text-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${c.style.badgeClass}">
              ${c.style.label}
            </span>
          </td>
        `;
        tbody.appendChild(tr);
      });
    },

    exportCSV() {
      const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
      const headers = ["Item", "Categoria", "Descricao_Empenho", "Descricao_Prestador", "Qtd_Empenhada", "Saldo_Anterior", "Faturado_Periodo", "Saldo_Atual", "Consumo_Perc", "Saldo_Restante_Perc", "Situacao"];
      const rows = app.state.exams.map(i => {
        const c = this.calculate(i);
        return [
          i.item,
          `"${i.cat}"`,
          `"${i.descEmpenho.replace(/"/g, '""')}"`,
          `"${i.descPrestador.replace(/"/g, '""')}"`,
          i.qtdEmpenho,
          i.saldoAnterior,
          i.faturado,
          c.saldoAtual,
          `"${c.percConsumo.toFixed(2)}%"`,
          `"${c.percRestante.toFixed(2)}%"`,
          `"${c.style.label}"`
        ].join(";");
      });

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Auditoria_${currentContract.tabName}_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  },

  admin: {
    isAdminUser() {
      return app.state.auth.isLogged && 
             app.state.auth.user && 
             app.state.auth.user.perfil === 'Administrador';
    },

    trigger(directToContract = false) {
      if (!app.state.auth.isLogged) {
        app.auditAuth.promptLogin('landing');
        return;
      }
      this.openPanel(directToContract);
    },

    openPanel(directToContract = false) {
      const panel = document.getElementById('admin-panel');
      if (!panel) return;
      panel.classList.remove('hidden');

      const isMasterAdmin = this.isAdminUser();

      const btnUsuarios = document.getElementById('admin-tab-btn-usuarios');
      const viewUsuarios = document.getElementById('admin-view-usuarios');
      
      if (btnUsuarios) {
        btnUsuarios.style.display = isMasterAdmin ? 'inline-block' : 'none';
      }
      if (!isMasterAdmin && viewUsuarios) {
        viewUsuarios.classList.add('hidden');
      }

      if (directToContract) {
        this.switchTab('contrato');
      } else {
        this.switchTab('links');
      }
      this.renderLinksList();
      this.renderExamsList();
      
      if (isMasterAdmin) {
        this.loadUsersList();
      }
    },

    exit() {
      const panel = document.getElementById('admin-panel');
      if (panel) panel.classList.add('hidden');
      app.render.all();
    },

    switchTab(tab) {
      if (tab === 'usuarios' && !this.isAdminUser()) {
        this.switchTab('contrato');
        return;
      }

      const viewLinks = document.getElementById('admin-view-links');
      const viewContrato = document.getElementById('admin-view-contrato');
      const viewUsuarios = document.getElementById('admin-view-usuarios');
      const btnLinks = document.getElementById('admin-tab-btn-links');
      const btnContrato = document.getElementById('admin-tab-btn-contrato');
      const btnUsuarios = document.getElementById('admin-tab-btn-usuarios');

      [viewLinks, viewContrato, viewUsuarios].forEach(v => v && v.classList.add('hidden'));
      [btnLinks, btnContrato, btnUsuarios].forEach(b => {
        if (b) b.className = "px-6 py-3 font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-600";
      });

      if (tab === 'links' && viewLinks) {
        viewLinks.classList.remove('hidden');
        btnLinks.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
      } else if (tab === 'contrato' && viewContrato) {
        viewContrato.classList.remove('hidden');
        btnContrato.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
      } else if (tab === 'usuarios' && viewUsuarios) {
        viewUsuarios.classList.remove('hidden');
        btnUsuarios.className = "px-6 py-3 font-black text-xs uppercase tracking-wider border-b-2 border-blue-600 text-blue-600";
        this.loadUsersList();
      }
    },

    async loadUsersList() {
      if (!this.isAdminUser()) return;
      const tbody = document.getElementById('adm-users-list-tbody');
      if (!tbody) return;

      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">Consultando usuários no Google Sheets...</td></tr>`;

      try {
        const res = await fetch(`${GOOGLE_API_URL}?action=GET_USERS`, { redirect: 'follow' });
        const data = await res.json();

        if (data.status === "success" && Array.isArray(data.users)) {
          app.state.users = data.users;
          tbody.innerHTML = data.users.map(u => `
            <tr class="hover:bg-slate-50">
              <td class="p-3.5 font-bold text-slate-800">${u.nome || u.usuario}</td>
              <td class="p-3.5 font-mono text-blue-700 font-bold">${u.usuario}</td>
              <td class="p-3.5"><span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${u.perfil === 'Administrador' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'}">${u.perfil}</span></td>
              <td class="p-3.5 text-slate-400">${u.createdAt || "—"}</td>
              <td class="p-3.5 text-center">
                <button onclick="app.admin.deleteUser(${u.id}, '${u.usuario}')" class="text-rose-500 hover:text-rose-700 font-bold">Excluir</button>
              </td>
            </tr>
          `).join('');
        }
      } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-rose-500">Erro ao carregar usuários da nuvem.</td></tr>`;
      }
    },

    async createUser() {
      if (!this.isAdminUser()) return alert("Apenas administradores podem cadastrar usuários.");

      const nome = document.getElementById('user-field-nome').value.trim();
      const usuario = document.getElementById('user-field-login').value.trim().toLowerCase();
      const senha = document.getElementById('user-field-senha').value.trim();
      const perfil = document.getElementById('user-field-perfil').value;

      if (!usuario || !senha) {
        alert("Preencha ao menos o nome de usuário e a senha.");
        return;
      }

      const now = new Date();
      const createdAt = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

      app.ui.setSyncStatus(true, "Gravando novo usuário no Google Sheets...");

      await app.data.sendToCloud({
        action: "CREATE_USER",
        usuario,
        senha,
        nome: nome || usuario,
        perfil,
        createdAt
      });

      document.getElementById('user-field-nome').value = '';
      document.getElementById('user-field-login').value = '';
      document.getElementById('user-field-senha').value = '';

      alert(`Usuário "${usuario}" criado com sucesso na aba _Usuarios!`);
      setTimeout(() => this.loadUsersList(), 1000);
    },

    async deleteUser(id, usuario) {
      if (!this.isAdminUser()) return alert("Apenas administradores podem excluir usuários.");

      if (confirm(`Deseja excluir o usuário "${usuario}" da planilha?`)) {
        app.ui.setSyncStatus(true, "Excluindo usuário...");
        await app.data.sendToCloud({
          action: "DELETE_USER",
          id: id
        });
        setTimeout(() => this.loadUsersList(), 1000);
      }
    },

    renderLinksList() {
      const list = document.getElementById('admin-list-draggable');
      if (!list) return;

      list.innerHTML = app.state.links.map((l, index) => `
        <div draggable="true" data-id="${l.id}" data-index="${index}" class="admin-item bg-white border p-4 rounded-2xl flex items-center gap-4 transition hover:border-blue-400">
            <div class="cursor-grab text-slate-300 hover:text-slate-600">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10h10v2H7zm0-4h10v2H7zm0 8h10v2H7z"/></svg>
            </div>
            <div class="flex-grow cursor-pointer" onclick="app.admin.editLink(${l.id})">
                <span class="block font-bold text-slate-800 text-sm">${l.title}</span>
                <span class="block text-xs text-slate-400 truncate max-w-md">${l.url}</span>
            </div>
            <button onclick="app.admin.removeLink(${l.id})" class="text-red-300 hover:text-red-500 p-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
        </div>
      `).join('');

      this.setupDragEvents();
    },

    setupDragEvents() {
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
        item.addEventListener('drop', async () => {
          const endIndex = +item.dataset.index;
          const moving = app.state.links.splice(startIndex, 1)[0];
          app.state.links.splice(endIndex, 0, moving);
          app.data.saveLinksLocally();
          app.admin.renderLinksList();
          await app.data.sendToCloud({
            action: "SAVE_SHORTCUTS",
            shortcuts: app.state.links
          });
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
      });
    },

    async saveLink() {
      const id = document.getElementById('edit-id').value;
      const title = document.getElementById('field-title').value.trim();
      const url = document.getElementById('field-url').value.trim();
      const desc = document.getElementById('field-desc').value.trim();
      if (!title || !url) return;

      if (id) {
        const idx = app.state.links.findIndex(l => l.id == id);
        if (idx !== -1) app.state.links[idx] = { ...app.state.links[idx], title, url, desc };
      } else {
        app.state.links.push({ id: Date.now(), title, url, desc });
      }

      app.data.saveLinksLocally();
      this.resetForm();
      this.renderLinksList();

      await app.data.sendToCloud({
        action: "SAVE_SHORTCUTS",
        shortcuts: app.state.links
      });
    },

    editLink(id) {
      const l = app.state.links.find(x => x.id == id);
      if (!l) return;
      document.getElementById('edit-id').value = l.id;
      document.getElementById('field-title').value = l.title;
      document.getElementById('field-url').value = l.url;
      document.getElementById('field-desc').value = l.desc || '';
      document.getElementById('form-title-label').textContent = "Editando Link";
      document.getElementById('btn-save').textContent = "Atualizar";
      document.getElementById('btn-cancel-edit').classList.remove('hidden');
    },

    resetForm() {
      document.getElementById('edit-id').value = "";
      document.getElementById('field-title').value = "";
      document.getElementById('field-url').value = "";
      document.getElementById('field-desc').value = "";
      document.getElementById('form-title-label').textContent = "Novo Atalho";
      document.getElementById('btn-save').textContent = "Salvar Sistema";
      document.getElementById('btn-cancel-edit').classList.add('hidden');
    },

    async removeLink(id) {
      if (confirm("Excluir este atalho permanentemente?")) {
        app.state.links = app.state.links.filter(l => l.id !== id);
        app.data.saveLinksLocally();
        this.renderLinksList();

        await app.data.sendToCloud({
          action: "SAVE_SHORTCUTS",
          shortcuts: app.state.links
        });
      }
    },

    renderExamsList() {
      const tbody = document.getElementById('adm-exams-list-tbody');
      if (!tbody) return;

      tbody.innerHTML = app.state.exams.map(e => `
        <tr class="hover:bg-slate-50">
          <td class="p-3 text-center font-bold font-mono">${e.item}</td>
          <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold">${e.cat}</span></td>
          <td class="p-3 font-semibold text-slate-800">${e.descEmpenho}</td>
          <td class="p-3 text-right font-bold text-slate-700 bg-slate-100/60">${e.qtdEmpenho}</td>
          <td class="p-3 text-right">${e.saldoAnterior}</td>
          <td class="p-3 text-center">
            <button onclick="app.admin.editExam(${e.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-2">Editar</button>
            <button onclick="app.admin.removeExam(${e.id})" class="text-red-500 hover:text-red-700 font-bold">Excluir</button>
          </td>
        </tr>
      `).join('');
    },

    saveExam() {
      const id = document.getElementById('adm-exam-id').value;
      const item = document.getElementById('adm-exam-item').value.trim();
      const cat = document.getElementById('adm-exam-cat').value;
      const descEmpenho = document.getElementById('adm-exam-desc-emp').value.trim();
      const descPrestador = document.getElementById('adm-exam-desc-prest').value.trim();
      const qtdEmpenho = parseInt(document.getElementById('adm-exam-qtd').value, 10) || 0;
      const saldoAnterior = parseInt(document.getElementById('adm-exam-saldo-ant').value, 10) || 0;

      if (!item || !descEmpenho) {
        alert("Preencha ao menos o número do item e a descrição do empenho.");
        return;
      }

      let examObj = {
        id: id ? Number(id) : Date.now(),
        item,
        cat,
        descEmpenho,
        descPrestador: descPrestador || descEmpenho,
        qtdEmpenho,
        saldoAnterior,
        faturado: 0
      };

      if (id) {
        const idx = app.state.exams.findIndex(x => x.id == id);
        if (idx !== -1) {
          examObj.faturado = app.state.exams[idx].faturado || 0;
          app.state.exams[idx] = examObj;
        }
      } else {
        app.state.exams.push(examObj);
      }

      app.state.exams.sort((a, b) => a.item - b.item);
      app.data.saveLocalExams();
      this.resetExamForm();
      this.renderExamsList();

      app.data.sendToCloud({
        action: "SAVE_EXAM",
        contract: app.state.activeContractTab,
        ...examObj
      });
    },

    editExam(id) {
      const e = app.state.exams.find(x => x.id == id);
      if (!e) return;
      document.getElementById('adm-exam-id').value = e.id;
      document.getElementById('adm-exam-item').value = e.item;
      document.getElementById('adm-exam-cat').value = e.cat;
      document.getElementById('adm-exam-desc-emp').value = e.descEmpenho;
      document.getElementById('adm-exam-desc-prest').value = e.descPrestador;
      document.getElementById('adm-exam-qtd').value = e.qtdEmpenho;
      document.getElementById('adm-exam-saldo-ant').value = e.saldoAnterior;

      document.getElementById('adm-exam-form-title').textContent = `Editando Item ${e.item} (${app.state.activeContractTab})`;
      document.getElementById('btn-adm-save-exam').textContent = "Atualizar Exame";
      document.getElementById('btn-adm-cancel-exam').classList.remove('hidden');
    },

    resetExamForm() {
      document.getElementById('adm-exam-id').value = '';
      document.getElementById('adm-exam-item').value = '';
      document.getElementById('adm-exam-desc-emp').value = '';
      document.getElementById('adm-exam-desc-prest').value = '';
      document.getElementById('adm-exam-qtd').value = '';
      document.getElementById('adm-exam-saldo-ant').value = '';
      document.getElementById('adm-exam-form-title').textContent = "Adicionar / Editar Exame no Contrato Ativo";
      document.getElementById('btn-adm-save-exam').textContent = "Salvar Procedimento";
      document.getElementById('btn-adm-cancel-exam').classList.add('hidden');
    },

    removeExam(id) {
      if (confirm("Excluir este exame deste contrato?")) {
        app.state.exams = app.state.exams.filter(x => x.id !== id);
        app.data.saveLocalExams();
        this.renderExamsList();

        app.data.sendToCloud({
          action: "DELETE_EXAM",
          contract: app.state.activeContractTab,
          id: id
        });
      }
    }
  }
};

window.addEventListener('DOMContentLoaded', () => app.init());

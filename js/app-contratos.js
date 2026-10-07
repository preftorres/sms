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
    if (statusRegistro === "Disponível") {
      return { label: "Espaço Vazio", badgeClass: "bg-slate-100 text-slate-500 border border-slate-300", isUrgente: false, isDisponivel: true };
    }
    if (statusRegistro === "Previsto") {
      return { label: "Em Elaboração", badgeClass: "bg-purple-100 text-purple-700 font-bold", isUrgente: false, isPrevisto: true };
    }
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

  // BASE OFICIAL DOS 34 CONTRATOS E ESPAÇOS FÍSICOS DO MURAL DA SECRETARIA DA SAÚDE
  MURAL_AUDIT_DATA: [
    // --- QUADRO 1: MURAL PAREDE AZUL (Posições 1 a 21) ---
    { id: 1, empresa: "MEDENF IVOTI SERVIÇOS MÉDICOS E DE ENFERMAGEM", numeroCtt: "344/2025", prazoVencimento: "Prorrogado até 26/09/2027", dataVencimentoIso: "2027-09-26", valorContrato: 257664.00, fiscal: "FRAN", status: "Ativo", objeto: "Enfermagem e Procedimentos Clínicos (MED ENF)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prorrogação anotada à caneta no mural: 26/09/2027" },
    { id: 2, empresa: "PRECISÃO TRATAMENTO DE ÁGUA LTDA", numeroCtt: "297/2025", prazoVencimento: "Prorrogado até 30/09/2027", dataVencimentoIso: "2027-09-30", valorContrato: 7734.00, fiscal: "LASIER", status: "Ativo", objeto: "Tratamento de Água nas Unidades (PRESCISÃO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prorrogação à caneta até 30/09/2027; fiscal Lasier com anotação no mural" },
    { id: 3, empresa: "ELO SERVIÇOS DE SAÚDE LTDA", numeroCtt: "377/2024", prazoVencimento: "12 Meses até 04/10/2026", dataVencimentoIso: "2026-10-04", valorContrato: 3747715.20, fiscal: "FRAN", status: "Ativo", objeto: "Gestão Médica Hospitalar (ELO SERVIÇOS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 04/10/2026 destacado no mural" },
    { id: 4, empresa: "R. DIMER EMPREENDIMENTOS IMOBILIARIOS LTDA", numeroCtt: "539/2025", prazoVencimento: "12 Meses até 23/12/2026", dataVencimentoIso: "2026-12-23", valorContrato: 93600.00, fiscal: "NAIARA", status: "Ativo", objeto: "Locação Imóvel TEACULHE (R DIMER)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Aluguel TEACULHE confirmado no mural: Venc 23/12/2026" },
    { id: 5, empresa: "SILVIO FARIAS ALVES", numeroCtt: "203/2021", prazoVencimento: "12 Meses até 19/10/2026", dataVencimentoIso: "2026-10-19", valorContrato: 49663.20, fiscal: "LASIER", status: "Ativo", objeto: "Locação de Imóvel Vigilância (SILVIO ALUGUEL VIGILÂNCIA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Aluguel Vigilância; fiscal Lasier com anotação no mural" },
    { id: 6, empresa: "JVS CENTRO TERAPÊUTICO LTDA", numeroCtt: "142/2023", prazoVencimento: "12 Meses até 03/11/2026", dataVencimentoIso: "2026-11-03", valorContrato: 107016.00, fiscal: "NAIARA", status: "Ativo", objeto: "Terapias Integradas e Multidisciplinares (JVS PLENO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 03/11/2026 destacado no mural" },
    { id: 7, empresa: "AMPLAMAIS SERVIÇOS MÉDICOS LTDA", numeroCtt: "390/2025", prazoVencimento: "12 Meses até 03/11/2026", dataVencimentoIso: "2026-11-03", valorContrato: 30684.06, fiscal: "SANDRO", status: "Ativo", objeto: "Serviços Médicos Especializados (AMPLA MAIS EXAMES)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 03/11/2026 destacado no mural" },
    { id: 8, empresa: "CARLOS DOS SANTOS TEIXEIRA", numeroCtt: "04/2023", prazoVencimento: "12 Meses até 04/01/2027", dataVencimentoIso: "2027-01-04", valorContrato: 180000.00, fiscal: "NAIARA", status: "Ativo", objeto: "Locação Imóvel SAMU (CARLOS ALUGUEL SAMU)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Aluguel SAMU confirmado no mural: Venc 04/01/2027" },
    { id: 9, empresa: "DELTA SOLUÇÕES EM INFORMÁTICA LTDA", numeroCtt: "14/2024", prazoVencimento: "12 Meses até 22/01/2027", dataVencimentoIso: "2027-01-22", valorContrato: 1074209.92, fiscal: "PREFEITURA", status: "Ativo", objeto: "Sistemas e Gestão de TI (DELTA INFORMÁTICA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 22/01/2027 confirmado no mural" },
    { id: 10, empresa: "TECPRINTERS TECNOLOGIA DE IMPRESSÃO LTDA", numeroCtt: "29/2026", prazoVencimento: "12 Meses até 10/02/2027", dataVencimentoIso: "2027-02-10", valorContrato: 73200.00, fiscal: "PREFEITURA", status: "Ativo", objeto: "Outsourcing de Impressoras (TEC PRINTERS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Fiscal PREFEITURA confirmado no mural" },
    { id: 11, empresa: "IBG INDUSTRIA BRASILEIRA DE GASES LTDA", numeroCtt: "77/2024", prazoVencimento: "12 Meses até 22/02/2027", dataVencimentoIso: "2027-02-22", valorContrato: 46800.00, fiscal: "ADRI", status: "Ativo", objeto: "Fornecimento de Oxigênio Medicinal (IBG OXIGÊNIO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 22/02/2027 confirmado no mural" },
    { id: 12, empresa: "INSTITUTO DE AMPARO AO EXCEPCIONAL - INAMEX", numeroCtt: "125/2024", prazoVencimento: "12 Meses até 18/03/2027", dataVencimentoIso: "2027-03-18", valorContrato: 56337.48, fiscal: "NAIARA", status: "Ativo", objeto: "Acolhimento e Assistência Especial (INAMEX)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 18/03/2027 confirmado no mural" },
    { id: 13, empresa: "ONE GESTÃO E SERVIÇOS LTDA", numeroCtt: "149/2026", prazoVencimento: "12 Meses até 04/05/2027", dataVencimentoIso: "2027-05-04", valorContrato: 240240.00, fiscal: "NAIARA", status: "Ativo", objeto: "Serviços Especializados de Apoio (ONE GESTÃO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 04/05/2027 confirmado no mural" },
    { id: 14, empresa: "INTEGRALIDADE MÉDICA LTDA", numeroCtt: "151/2026", prazoVencimento: "12 Meses até 04/05/2027", dataVencimentoIso: "2027-05-04", valorContrato: 1367024.00, fiscal: "FRAN", status: "Ativo", objeto: "Plantões Médicos de Urgência (INTEGRALIDADE MÉDICA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 04/05/2027 confirmado no mural" },
    { id: 15, empresa: "HIDRAMACO PEÇAS E ACESSÓRIOS LTDA", numeroCtt: "274/2026", prazoVencimento: "12 Meses até 22/07/2027", dataVencimentoIso: "2027-07-22", valorContrato: 90240.46, fiscal: "SANDRO", status: "Ativo", objeto: "Peças e Reposição Mecânica (HIDRAMACO SULCAR)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Anotação à mão no mural: CTT 390/2026 - Venc: 04/09/2027" },
    { id: 16, empresa: "ELO SERVIÇOS DE SAÚDE LTDA", numeroCtt: "297/2025", prazoVencimento: "12 Meses até 28/08/2027", dataVencimentoIso: "2027-08-28", valorContrato: 1026110.34, fiscal: "NAIARA", status: "Ativo", objeto: "Serviços Médicos Ambulatoriais (ELO SERVIÇOS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 28/08/2027 confirmado no mural" },
    { id: 17, empresa: "AMBIENTUUS TECNOLOGIA AMBIENTAL", numeroCtt: "264/2023", prazoVencimento: "12 Meses até 30/08/2027", dataVencimentoIso: "2027-08-30", valorContrato: 36720.00, fiscal: "ADRI", status: "Ativo", objeto: "Tratamento de Resíduos Hospitalares (AMBIENTUSS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vigência confirmada no mural físico até 30/08/2027" },
    { id: 18, empresa: "HENGER COMÉRCIO E SERVIÇOS LTDA", numeroCtt: "166/2026", prazoVencimento: "36 Meses até 05/05/2029", dataVencimentoIso: "2029-05-05", valorContrato: 90000.00, fiscal: "ADRI", status: "Ativo", objeto: "Manutenção Predial Continuada (HENGER)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 05/05/2029 confirmado no mural" },
    { id: 19, empresa: "LABORATÓRIO DE ANÁLISES CLÍNICAS", numeroCtt: "43/2024", prazoVencimento: "Chamamento 210/26 até 03/09/2027", dataVencimentoIso: "2027-09-03", valorContrato: 129163.00, fiscal: "PREFEITURA", status: "Ativo", objeto: "Credenciamento de Exames Laboratoriais (LABORATÓRIO ANALISE)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Termo de Credenciamento 43/2024 afixado no mural" },
    { id: 20, empresa: "[ESPAÇO VAZIO - PAINEL MURAL]", numeroCtt: "S/N", prazoVencimento: "Espaço vago no mural físico", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Disponível", objeto: "Nicho vago no painel da Secretaria", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Espaço reservado vago no mural físico" },
    { id: 21, empresa: "[ESPAÇO VAZIO - PAINEL MURAL]", numeroCtt: "S/N", prazoVencimento: "Espaço vago no mural físico", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Disponível", objeto: "Nicho vago no painel da Secretaria", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Espaço reservado vago no mural físico" },

    // --- QUADRO 2: QUADRO BRANCO (Posições 22 a 34) ---
    { id: 22, empresa: "SIMSAUDE SERVIÇOS SA", numeroCtt: "342/2025", prazoVencimento: "12 Meses até 16/11/2026", dataVencimentoIso: "2026-11-16", valorContrato: 828960.00, fiscal: "ADRI", status: "Ativo", objeto: "Consultas e Atendimentos Médicos (SIM SAÚDE)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 16/11/2026 destacado no mural" },
    { id: 23, empresa: "SILVANO TUPINAMBA DELFIM", numeroCtt: "345/2023", prazoVencimento: "12 Meses até 21/11/2026", dataVencimentoIso: "2026-11-21", valorContrato: 48000.00, fiscal: "NAIARA", status: "Ativo", objeto: "Locação Imóvel Especialidades (SILVANO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Aluguel Especialidades confirmado no mural: Venc 21/11/2026" },
    { id: 24, empresa: "LUMIAR HEALTH BUILDERS EQUIP HOSP LTDA", numeroCtt: "303/2025", prazoVencimento: "12 Meses até 26/11/2026", dataVencimentoIso: "2026-11-26", valorContrato: 135700.00, fiscal: "FRAN", status: "Ativo", objeto: "Oxigenoterapia Domiciliar (LUMIAR OXIGENOTERAPIA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Nº CTT atribuído: 303/2025 conforme mural" },
    { id: 25, empresa: "TRANSALVA EMERGÊNCIAS MÉDICAS LTDA", numeroCtt: "442/2025", prazoVencimento: "12 Meses até 08/12/2026", dataVencimentoIso: "2026-12-08", valorContrato: 199800.05, fiscal: "NAIARA", status: "Ativo", objeto: "Ambulâncias de Suporte Avançado (TRANSALVA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 08/12/2026 destacado no mural" },
    { id: 26, empresa: "DANIEL CARDOSO MAGNUS", numeroCtt: "195/2026", prazoVencimento: "12 Meses até 01/06/2027", dataVencimentoIso: "2027-06-01", valorContrato: 19800.00, fiscal: "LASIER", status: "Ativo", objeto: "Aplicação BTI Controle de Vetores (DANIEL APLICAÇÃO BTI)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 01/06/2027 confirmado no mural" },
    { id: 27, empresa: "VIAÇÃO OURO E PRATA SA", numeroCtt: "231/2026", prazoVencimento: "12 Meses até 30/06/2027", dataVencimentoIso: "2027-06-30", valorContrato: 1355940.00, fiscal: "SANDRO", status: "Ativo", objeto: "Passagens TFD (OURO E PRATA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Nº CTT 231/2026 confirmado no mural" },
    { id: 28, empresa: "K & S EMPREENDIMENTOS IMOBILIARIOS LTDA", numeroCtt: "258/2026", prazoVencimento: "12 Meses até 15/07/2027", dataVencimentoIso: "2027-07-15", valorContrato: 96000.00, fiscal: "NAIARA", status: "Ativo", objeto: "Locação de Imóvel para Fisioterapia (KS ALUGUEL FISIO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Nº CTT 258/2026 confirmado no mural" },
    { id: 29, empresa: "ULTRA AIR COMÉRCIO DE GASES INDUSTRIAIS", numeroCtt: "232/2025", prazoVencimento: "12 meses até 17/07/2027", dataVencimentoIso: "2027-07-17", valorContrato: 52266.50, fiscal: "ADRI", status: "Ativo", objeto: "Gases Medicinais e Ar Comprimido (ULTRA AIR)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 17/07/2027 confirmado no mural" },
    { id: 30, empresa: "SOSSEG (EDUCAÇÃO)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Serviços de Educação / Apoio à Saúde", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato" },
    { id: 31, empresa: "CRISTO REI (CLÍNICA)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Serviços e Consultas Clínicas", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato" },
    { id: 32, empresa: "IB SAÚDE (HOSPITAL)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Gestão e Atendimento Hospitalar", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato" },
    { id: 33, empresa: "APAE", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Assistência e Atendimento Especializado", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato" },
    { id: 34, empresa: "[ESPAÇO VAZIO - PAINEL MURAL]", numeroCtt: "S/N", prazoVencimento: "Espaço vago no mural físico", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Disponível", objeto: "Nicho vago no painel da Secretaria", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Espaço reservado vago no mural físico" }
  ],

  occupySlot(id) {
    this.openEditModal(id);
  },

  async syncFromMuralData(forcePrompt = true) {
    if (forcePrompt) {
      const ok = confirm("Deseja sincronizar o painel com os 34 contratos e espaços físicos das fotos do mural da Secretaria de Saúde?\n\nIsso alinhará perfeitamente os 27 contratos vigentes, os 4 em elaboração e os 3 espaços disponíveis do mural.");
      if (!ok) return;
    }

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Sincronizando com Mural",
        subtitle: "Auditando os 34 contratos e espaços das fotos da Secretaria",
        step1: "Organizando os 34 slots físicos do mural",
        step2: "Atualizando base no Google Sheets",
        step3: "Atualizando semáforo e mural visual",
        icon: "📋"
      });
    }

    const muralList = JSON.parse(JSON.stringify(this.MURAL_AUDIT_DATA));
    app.state.panelContracts = muralList;
    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(muralList);
    }

    muralList.forEach(c => {
      if (c.fiscal && c.fiscal !== 'PREFEITURA') {
        const fiscais = this.getFiscais();
        if (!fiscais.includes(c.fiscal.toUpperCase())) {
          fiscais.push(c.fiscal.toUpperCase());
          this.saveFiscais(fiscais);
        }
      }
    });

    try {
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(2);
      const res = await app.data.sendToCloud({
        action: "SYNC_MURAL_CONTRATOS",
        currentUser: (app.state.auth && app.state.auth.user && app.state.auth.user.usuario) || 'admin'
      });
      if (res && Array.isArray(res.panelContracts) && res.panelContracts.length > 0) {
        app.state.panelContracts = res.panelContracts;
        if (app.data && app.data.saveLocalPanelContracts) {
          app.data.saveLocalPanelContracts(res.panelContracts);
        }
      }
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast("Painel de contratos 100% alinhado com as fotos do mural (34 posições)!", "success", "Mural Físico");
    } catch(err) {
      console.warn("Sincronização em nuvem pendente, atualizado no cache local:", err);
      app.ui.toast("Painel atualizado no navegador com os 34 contratos do mural!", "info", "Mural Físico");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
      const viewport = document.getElementById('app-viewport');
      if (viewport && app.state.currentView === 'contratos_hub') {
        app.render.contratosHub(viewport);
      }
    }
  },

  ensureMuralSync() {
    const list = app.state.panelContracts || [];
    const c1 = list.find(c => c.id === 1);
    const precisaSync = list.length !== 34 || !c1 || c1.numeroCtt !== '344/2025';

    if (precisaSync) {
      this.syncFromMuralData(false);
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
          } else if (filterType === 'PREVISTOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap bg-purple-600 text-white shadow-xs";
          } else if (filterType === 'ARQUIVADOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-600 text-white shadow-xs";
          } else if (filterType === 'MURAL') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap bg-blue-600 text-white shadow-xs";
          } else {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-slate-900 text-white shadow-xs";
          }
        } else {
          if (filterType === 'CRITICOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap bg-rose-100 text-rose-800 hover:bg-rose-200";
          } else if (filterType === 'ATENCAO') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-amber-100 text-amber-800 hover:bg-amber-200";
          } else if (filterType === 'PREVISTOS') {
            btn.className = "px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap bg-purple-100 text-purple-800 hover:bg-purple-200";
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
      countEl.textContent = `Exibindo ${list.length} de ${total} posições do mural`;
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
      if (app.state.panelContractsFilter === 'MURAL') matchStatus = true;
      else if (app.state.panelContractsFilter === 'ATIVOS') matchStatus = c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'CRITICOS') matchStatus = semaforo.isUrgente && c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'ATENCAO') matchStatus = semaforo.label.includes('Atenção') && c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'PREVISTOS') matchStatus = c.status === 'Previsto' || c.status === 'Disponível';
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

    // RENDERIZAÇÃO DE ESPAÇO VAGO NO MURAL FÍSICO
    if (c.status === 'Disponível') {
      return `
        <div class="bg-slate-50/70 rounded-[2rem] p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col justify-between group relative cursor-pointer" onclick="${app.permissions.can('panel_edit') ? `app.contratos.occupySlot(${c.id})` : ''}">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600">
                        Posição #${c.id} • Vago
                    </span>
                    <span class="text-xs text-slate-400 group-hover:text-blue-600 font-bold">Mural Físico</span>
                </div>
                <h3 class="text-sm font-black text-slate-700 group-hover:text-blue-700 transition leading-snug">
                    ⚪ Espaço Disponível
                </h3>
                <span class="block text-xs font-mono font-bold text-slate-400 mt-1">Sem contrato afixado</span>
                <p class="text-[11px] text-slate-400 italic mt-3">${c.objeto || 'Nicho vazio delimitado no painel da Secretaria.'}</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                ${app.permissions.can('panel_edit') ? `
                  <button onclick="event.stopPropagation(); app.contratos.occupySlot(${c.id})" class="text-[11px] font-black text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:underline">
                      + Cadastrar neste Espaço
                  </button>
                ` : '<span class="text-[11px] text-slate-400">Espaço vago</span>'}
                <span class="text-xs text-slate-300 group-hover:text-blue-500">📋</span>
            </div>
        </div>
      `;
    }

    // RENDERIZAÇÃO DE CONTRATO PREVISTO (FOLHA AFIXADA EM ELABORAÇÃO)
    if (c.status === 'Previsto') {
      return `
        <div class="bg-purple-50/40 rounded-[2rem] p-5 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col justify-between group relative">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 font-bold">
                        Posição #${c.id} • Folha Afixada
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-purple-100 font-mono text-[9px] font-black text-purple-800">
                        EM ELABORAÇÃO
                    </span>
                </div>
                <h3 class="text-sm font-black text-purple-950 group-hover:text-purple-700 transition leading-snug" title="${c.empresa}">
                    ${c.empresa}
                </h3>
                <span class="block text-xs font-mono font-bold text-purple-600 mt-1">CTT: ${c.numeroCtt}</span>
                <div class="mt-3 p-3 bg-white/90 rounded-xl space-y-1 text-xs border border-purple-100">
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold text-[10px] uppercase">Situação:</span>
                        <span class="font-bold text-purple-900 text-xs">${c.prazoVencimento}</span>
                    </div>
                </div>
                ${c.objeto ? `<p class="text-[11px] text-purple-900/80 italic mt-2 line-clamp-2">${c.objeto}</p>` : ''}
                ${c.observacao ? `
                  <div class="mt-2.5 p-2 bg-purple-100/60 border border-purple-200 rounded-xl text-[10px] text-purple-900 leading-snug">
                    📝 ${c.observacao}
                  </div>
                ` : ''}
            </div>
            <div class="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-xs">
                ${app.permissions.can('panel_edit') ? `
                  <button onclick="app.contratos.openEditModal(${c.id})" class="text-[11px] font-black text-purple-700 hover:text-purple-900 flex items-center gap-1">
                      ✏️ Preencher Dados Formais
                  </button>
                ` : '<span></span>'}
            </div>
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-[2rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group relative ${isArch ? 'opacity-70 bg-slate-50' : ''}">
          <div>
              <!-- TOPO DO CARD: SEMÁFORO E FISCAL -->
              <div class="flex items-center justify-between gap-1.5 mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sem.badgeClass}">
                      ${sem.label}
                  </span>
                  <div class="flex items-center gap-1">
                      <span class="text-[9px] font-bold text-slate-400">#${c.id}</span>
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-black text-slate-700">
                          FISCAL: ${c.fiscal}
                      </span>
                  </div>
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

    if (c.status === 'Disponível') {
      return `
        <tr class="hover:bg-slate-50 bg-slate-50/50">
            <td class="p-3.5 font-bold text-slate-400 italic">
                <div>⚪ ${c.empresa} (Posição #${c.id})</div>
            </td>
            <td class="p-3.5 font-mono text-slate-400 font-bold">-</td>
            <td class="p-3.5 text-right font-bold text-slate-400">-</td>
            <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-slate-200 font-bold text-[10px] text-slate-500">VAGO</span></td>
            <td class="p-3.5 text-slate-400 text-xs">${c.prazoVencimento}</td>
            <td class="p-3.5 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-300">Espaço Vazio</span>
            </td>
            <td class="p-3.5 text-center whitespace-nowrap print:hidden">
                ${app.permissions.can('panel_edit') ? `<button onclick="app.contratos.occupySlot(${c.id})" class="text-blue-600 hover:text-blue-800 font-bold text-xs" title="Preencher">+ Preencher</button>` : ''}
            </td>
        </tr>
      `;
    }

    if (c.status === 'Previsto') {
      return `
        <tr class="hover:bg-purple-50/50 bg-purple-50/20">
            <td class="p-3.5 font-bold text-purple-950">
                <div>${c.empresa} (Posição #${c.id})</div>
                ${c.observacao ? `<div class="text-[10px] text-purple-700 font-semibold italic mt-0.5">📝 ${c.observacao}</div>` : ''}
            </td>
            <td class="p-3.5 font-mono text-purple-600 font-bold">${c.numeroCtt}</td>
            <td class="p-3.5 text-right font-bold text-slate-400">A Definir</td>
            <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-purple-100 font-bold text-[10px] text-purple-800">${c.fiscal}</span></td>
            <td class="p-3.5 text-purple-800 text-xs">${c.prazoVencimento}</td>
            <td class="p-3.5 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-700">Em Elaboração</span>
            </td>
            <td class="p-3.5 text-center whitespace-nowrap print:hidden">
                ${app.permissions.can('panel_edit') ? `<button onclick="app.contratos.openEditModal(${c.id})" class="text-purple-700 hover:text-purple-900 font-bold text-xs" title="Editar">✏️ Formalizar</button>` : ''}
            </td>
        </tr>
      `;
    }

    return `
      <tr class="hover:bg-slate-50">
          <td class="p-3.5 font-bold text-slate-900">
              <div class="flex items-center gap-1.5">
                  <span class="text-[10px] text-slate-400 font-mono">#${c.id}</span>
                  <span>${c.empresa}</span>
              </div>
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
  if (app.contratos && app.contratos.ensureMuralSync) {
    app.contratos.ensureMuralSync();
  }

  // Define filtro padrão como 'MURAL' se não estiver definido
  if (!app.state.panelContractsFilter) {
    app.state.panelContractsFilter = 'MURAL';
  }

  const allContracts = app.state.panelContracts || [];
  const activeContracts = allContracts.filter(c => c.status === 'Ativo');
  const previstosList = allContracts.filter(c => c.status === 'Previsto' || c.status === 'Disponível');
  const criticosList = activeContracts.filter(c => {
    const s = app.contratos.calculateStatus(c.dataVencimentoIso, c.status);
    return s.isUrgente;
  });
  const atencaoList = activeContracts.filter(c => {
    const s = app.contratos.calculateStatus(c.dataVencimentoIso, c.status);
    return s.label.includes('Atenção');
  });
  
  // CÁLCULOS DOS KPIS SOLICITADOS
  const totalPosicoesMural = allContracts.length;
  const totalAtivos = activeContracts.length;
  const montanteGlobal = activeContracts.reduce((acc, c) => acc + (c.valorContrato || 0), 0);
  const valorMedio = totalAtivos > 0 ? (montanteGlobal / totalAtivos) : 0;
  
  // MAIOR CONTRATO
  let maiorContrato = { valorContrato: 0, empresa: "Nenhum", numeroCtt: "" };
  activeContracts.forEach(c => {
    if (c.valorContrato > maiorContrato.valorContrato) maiorContrato = c;
  });

  const filteredList = app.contratos.getFilteredList();
  const isCardsMode = (app.state.panelViewMode || 'CARDS') === 'CARDS';
  const currFilter = app.state.panelContractsFilter || 'MURAL';

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
                <p class="text-xs sm:text-sm text-slate-500 mt-1">Mural visual de monitoramento de vigências (34 posições físicas), semáforo de alerta e previsão orçamentária.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="app.contratos.syncFromMuralData(true)" title="Reconciliar com as fotos do mural físico da Secretaria de Saúde" class="px-3.5 py-2 rounded-xl text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 shadow-sm transition flex items-center gap-1.5">
                    🔄 Sincronizar com Mural (34)
                </button>
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
            <!-- 1. TOTAL DE POSIÇÕES NO MURAL -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mural Físico de Contratos</span>
                <p class="text-2xl font-black text-slate-900 mt-1">${totalPosicoesMural} Posições</p>
                <span class="text-[10px] text-slate-500 font-semibold">${totalAtivos} ativos vigentes • ${previstosList.length} previstos/vagos</span>
            </div>

            <!-- 2. VALOR MÉDIO -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Valor Médio (Vigentes)</span>
                <p class="text-xl sm:text-2xl font-black text-blue-700 mt-1">R$ ${valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-slate-400">Média por ajuste formal ativo</span>
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
                <button data-panel-filter="MURAL" onclick="app.contratos.setFilter('MURAL')" class="px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${currFilter === 'MURAL' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    🖼️ Mural Completo (${totalPosicoesMural})
                </button>
                <button data-panel-filter="ATIVOS" onclick="app.contratos.setFilter('ATIVOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${currFilter === 'ATIVOS' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                    Ativos Vigentes (${totalAtivos})
                </button>
                <button data-panel-filter="CRITICOS" onclick="app.contratos.setFilter('CRITICOS')" class="px-3 py-1.5 rounded-xl text-xs font-black transition whitespace-nowrap ${currFilter === 'CRITICOS' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}">
                    🔴 Críticos (${criticosList.length})
                </button>
                <button data-panel-filter="ATENCAO" onclick="app.contratos.setFilter('ATENCAO')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${currFilter === 'ATENCAO' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}">
                    🟡 Atenção (${atencaoList.length})
                </button>
                <button data-panel-filter="PREVISTOS" onclick="app.contratos.setFilter('PREVISTOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${currFilter === 'PREVISTOS' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'}">
                    📝 Previstos / Vagos (${previstosList.length})
                </button>
                <button data-panel-filter="ARQUIVADOS" onclick="app.contratos.setFilter('ARQUIVADOS')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${currFilter === 'ARQUIVADOS' ? 'bg-slate-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}">
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
            <span id="panel-filtered-count">Exibindo ${filteredList.length} de ${allContracts.length} posições do mural</span>
        </div>

        <!-- CONTEÚDO DINÂMICO (MURAL DE CARDS OU TABELA ANALÍTICA) -->
        <div id="painel-contratos-content">
            ${app.contratos.renderContentHtml()}
        </div>

    </div>
  `;
};

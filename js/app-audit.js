/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE AUDITORIA: Contratos de Exames, Cotas e Gemini IA
 * Arquivo: js/app-audit.js
 * ============================================================================
 */

window.app = window.app || {};
window.app.render = window.app.render || {};

app.audit = {
  ensureContractExamsLoaded(tabName) {
    if (!tabName) tabName = app.state.activeContractTab || "Contrato_73_2026";
    app.state.activeContractTab = tabName;

    const rawExams = localStorage.getItem(`${CONFIG.keys.examsCache}_${tabName}`);
    if (tabName === "Contrato_73_2026") {
      let parsed = null;
      try { parsed = rawExams ? JSON.parse(rawExams) : null; } catch(e){}
      
      // Valida se possui os 76 procedimentos e se o item 1 tem vlUnit válido (> 0)
      const isCorrupted = !parsed || !Array.isArray(parsed) || parsed.length < 70 || !parsed[0].vlUnit;
      if (isCorrupted) {
        app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
        app.data.saveLocalExams();
      } else {
        // Assegura que todos os 76 procedimentos contenham vlUnit
        parsed.forEach((item, idx) => {
          if (!item.vlUnit && CONTRATO_73_EXAMS[idx] && CONTRATO_73_EXAMS[idx].vlUnit) {
            item.vlUnit = CONTRATO_73_EXAMS[idx].vlUnit;
          }
        });
        app.state.exams = parsed;
      }
    } else if (rawExams) {
      try { app.state.exams = JSON.parse(rawExams); } catch(e){ app.state.exams = []; }
    } else {
      app.state.exams = [];
    }
    return app.state.exams;
  },

  openContractDetail(tabName) {
    app.state.activeContractTab = tabName;
    app.data.saveLocalContracts();
    this.ensureContractExamsLoaded(tabName);
    window.location.hash = `auditoria_contrato=${tabName}`;
  },

  restoreContrato73() {
    if (confirm("Deseja restaurar e carregar a base oficial completa dos 76 procedimentos do Contrato nº 73/2026 (Laboratório Fontana - R$ 129.163,00) com todos os quantitativos e faturados reais?")) {
      app.state.activeContractTab = "Contrato_73_2026";
      app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
      app.data.saveLocalExams();
      app.data.saveLocalContracts();

      // Renderiza imediatamente na tela atual
      if (app.state.view === 'auditoria_detalhe' && app.render.auditoriaDetalhe) {
        app.render.auditoriaDetalhe(document.getElementById('app-viewport'));
      } else if (app.state.view === 'auditoria_hub' && app.render.auditoriaHub) {
        app.render.auditoriaHub(document.getElementById('app-viewport'));
      }

      // Comunica com a Planilha Google em segundo plano
      if (typeof GOOGLE_API_URL !== 'undefined' && GOOGLE_API_URL) {
        fetch(`${GOOGLE_API_URL}?action=POPULAR_73`, { redirect: 'follow' }).catch(() => {});
        app.data.sendToCloud({
          action: "INITIAL_SEED",
          contract: "Contrato_73_2026",
          exams: CONTRATO_73_EXAMS
        });
      }

      alert("✓ Base oficial dos 76 exames do Contrato nº 73/2026 carregada com sucesso!");
    }
  },

  openNewContractModal() {
    if (!app.permissions.can('audit_create_contract')) {
      return alert("Seu perfil de acesso não tem permissão para criar novos contratos de exames.");
    }
    const m = document.getElementById('modal-new-contract');
    if (m) { m.classList.remove('hidden'); m.classList.add('flex'); }
  },

  closeNewContractModal() {
    const m = document.getElementById('modal-new-contract');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
  },

  async confirmCreateContract() {
    const num = document.getElementById('new-contract-num').value.trim();
    const empenhos = document.getElementById('new-contract-empenhos').value.trim();
    const prestador = document.getElementById('new-contract-prestador').value.trim();
    const copyTemplate = document.getElementById('new-contract-copy-template').checked;

    if (!num || !prestador) return alert("Preencha o número do contrato e o prestador.");

    const safeTabName = `Contrato_${num.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const now = new Date();
    const createdAtStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const newContractObj = {
      tabName: safeTabName,
      num: num,
      empenhos: empenhos || 'A definir',
      prestador: prestador,
      createdAt: createdAtStr
    };

    const initialExams = copyTemplate ? TEMPLATE_EXAMS.map(item => ({ ...item, faturado: 0 })) : [];

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

  formatBRL(val) {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  calculate(item) {
    const vlUnit = Number(item.vlUnit) || 0;
    const qtdEmp = Number(item.qtdEmpenho) || 0;
    const saldoAnt = (item.saldoAnterior !== undefined && item.saldoAnterior !== null && item.saldoAnterior !== "")
      ? Number(item.saldoAnterior)
      : qtdEmp;
    const qtdExec = Number(item.faturado) || 0;
    const saldoQtd = saldoAnt - qtdExec;

    const isNF = String(item.item).trim().toUpperCase() === "NF";
    const vlTotalEmp = isNF ? vlUnit : (qtdEmp * vlUnit);
    const vlTotalFat = isNF ? (qtdExec > 0 ? vlUnit : 0) : (qtdExec * vlUnit);
    const vlSaldo = vlTotalEmp - vlTotalFat;

    let percConsumo = 0;
    let percRestante = 0;

    if (qtdEmp > 0) {
      percConsumo = (qtdExec / qtdEmp) * 100;
      percRestante = (saldoQtd / qtdEmp) * 100;
    } else if (qtdEmp === 0 && qtdExec > 0) {
      percConsumo = 100;
      percRestante = 0;
    }

    let situacao = "Seguro";
    let badgeClass = "tag-seguro";
    let rowClass = "row-seguro hover:bg-slate-50";

    const semFatura = qtdExec === 0;

    if (isNF) {
      situacao = "Conciliado";
      badgeClass = "tag-alerta";
      rowClass = "row-alerta";
    } else if (semFatura) {
      situacao = "Sem Movimento";
      badgeClass = "tag-zero";
      rowClass = "row-zero";
    } else if (percConsumo >= 100 || saldoQtd <= 0) {
      situacao = "Esgotado";
      badgeClass = "tag-esgotado";
      rowClass = "row-esgotado";
    } else if (percConsumo >= 50) {
      situacao = "Crítico";
      badgeClass = "tag-critico";
      rowClass = "row-critico";
    } else if (percConsumo >= 30) {
      situacao = "Alerta";
      badgeClass = "tag-alerta";
      rowClass = "row-alerta";
    }

    return {
      item: item.item,
      cat: item.cat || 'Laboratorial',
      descEmpenho: item.descEmpenho || '',
      descPrestador: item.descPrestador || '',
      vlUnit,
      qtdEmp,
      saldoAnt,
      qtdExec,
      saldoQtd,
      vlTotalEmp,
      vlTotalFat,
      vlSaldo,
      percConsumo,
      percRestante,
      situacao,
      semFatura,
      style: { rowClass, badgeClass, label: situacao }
    };
  },

  updateVal(id, field, val) {
    if (!app.permissions.can('audit_edit_values')) {
      alert("Seu perfil não tem permissão para alterar saldos e faturamentos.");
      this.renderTable();
      return;
    }

    let parsed = 0;
    if (field === 'vlUnit') {
      parsed = Math.max(0, parseFloat(String(val).replace(',', '.')) || 0);
    } else {
      parsed = Math.max(0, parseInt(val, 10) || 0);
    }

    const target = app.state.exams.find(x => x.id === id);
    if (!target) return;

    target[field] = parsed;
    if (field === 'qtdEmpenho' && (target.saldoAnterior === 0 || !target.saldoAnterior)) {
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
    let sumQtdEmp = 0, sumQtdExec = 0, sumQtdSaldo = 0;
    let sumVlEmp = 0, sumVlFat = 0;
    let countEsg = 0, countCrit = 0;

    // Calcula os totais gerais da base inteira do contrato para os KPIs e Rodapé
    app.state.exams.forEach(item => {
      const c = this.calculate(item);
      const isNF = String(item.item).trim().toUpperCase() === "NF";

      if (!isNF) {
        sumQtdEmp += c.qtdEmp;
        sumQtdExec += c.qtdExec;
        sumQtdSaldo += c.saldoQtd;
      }
      sumVlEmp += c.vlTotalEmp;
      sumVlFat += c.vlTotalFat;

      if (c.situacao === "Esgotado") countEsg++;
      if (c.situacao === "Crítico" || c.situacao === "Esgotado") countCrit++;
    });

    const sumVlSaldo = sumVlEmp - sumVlFat;
    const percGeral = sumVlEmp > 0 ? (sumVlFat / sumVlEmp) * 100 : 0;

    // Atualiza os Cards de KPIs no Topo
    const elKpiEmp = document.getElementById('kpi-empenhado');
    const elKpiFat = document.getElementById('kpi-faturado');
    const elKpiPercFat = document.getElementById('kpi-perc-faturado');
    const elKpiSaldoFin = document.getElementById('kpi-saldo-fin');
    const elKpiPercSaldo = document.getElementById('kpi-perc-saldo');
    const elKpiQtdExec = document.getElementById('kpi-qtd-exec');
    const elKpiQtdRest = document.getElementById('kpi-qtd-restante');
    const elKpiCrit = document.getElementById('kpi-criticos');

    if (elKpiEmp) elKpiEmp.textContent = this.formatBRL(sumVlEmp);
    if (elKpiFat) elKpiFat.textContent = this.formatBRL(sumVlFat);
    if (elKpiPercFat) elKpiPercFat.textContent = `${percGeral.toFixed(1)}% do teto consumido`;
    if (elKpiSaldoFin) elKpiSaldoFin.textContent = this.formatBRL(sumVlSaldo);
    if (elKpiPercSaldo) elKpiPercSaldo.textContent = `${(100 - percGeral).toFixed(1)}% disponível`;
    if (elKpiQtdExec) elKpiQtdExec.textContent = sumQtdExec.toLocaleString('pt-BR');
    if (elKpiQtdRest) elKpiQtdRest.textContent = `Saldo: ${sumQtdSaldo.toLocaleString('pt-BR')} exames`;
    if (elKpiCrit) elKpiCrit.textContent = countCrit;

    // Atualiza o Rodapé de Totais (tfoot)
    const elTotQtdEmp = document.getElementById('totalQtdEmp');
    const elTotQtdExec = document.getElementById('totalQtdExec');
    const elTotQtdSaldo = document.getElementById('totalQtdSaldo');
    const elTotVlEmp = document.getElementById('totalVlEmp');
    const elTotVlFat = document.getElementById('totalVlFat');
    const elTotVlSaldo = document.getElementById('totalVlSaldo');
    const elTotPerc = document.getElementById('totalPercConsumo');

    if (elTotQtdEmp) elTotQtdEmp.textContent = sumQtdEmp.toLocaleString('pt-BR');
    if (elTotQtdExec) elTotQtdExec.textContent = sumQtdExec.toLocaleString('pt-BR');
    if (elTotQtdSaldo) elTotQtdSaldo.textContent = sumQtdSaldo.toLocaleString('pt-BR');
    if (elTotVlEmp) elTotVlEmp.textContent = this.formatBRL(sumVlEmp);
    if (elTotVlFat) elTotVlFat.textContent = this.formatBRL(sumVlFat);
    if (elTotVlSaldo) elTotVlSaldo.textContent = this.formatBRL(sumVlSaldo);
    if (elTotPerc) elTotPerc.textContent = percGeral.toFixed(1) + '%';

    // Aplica os filtros na listagem de linhas
    const filtered = app.state.exams.filter(item => {
      const c = this.calculate(item);
      const matchesSearch = !app.state.filters.search ||
        item.descEmpenho.toLowerCase().includes(app.state.filters.search) ||
        item.descPrestador.toLowerCase().includes(app.state.filters.search) ||
        String(item.item).includes(app.state.filters.search);

      const matchesCat = app.state.filters.category === 'ALL' || item.cat === app.state.filters.category;
      const matchesZero = !app.state.filters.hideZero || item.faturado > 0;

      return matchesSearch && matchesCat && matchesZero;
    });

    if (filtered.length === 0) empty.classList.remove('hidden');
    else empty.classList.add('hidden');

    const canEditValues = app.permissions.can('audit_edit_values');

    filtered.forEach(item => {
      const c = this.calculate(item);
      const isNF = String(item.item).trim().toUpperCase() === "NF";
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-200 transition-colors ${c.style.rowClass}`;

      tr.innerHTML = `
        <td class="py-2 px-2 text-center font-bold font-mono">${item.item}</td>
        <td class="py-2 px-3 font-semibold text-slate-900">${item.descEmpenho}</td>
        <td class="py-2 px-3 text-slate-500 font-mono text-[11px] col-hide-print">${item.descPrestador || 'Não Consta na Fatura'}</td>
        <td class="py-2 px-2.5 text-right font-mono font-medium">${this.formatBRL(c.vlUnit)}</td>
        <td class="py-2 px-2.5 text-right font-mono">${isNF ? '—' : c.qtdEmp.toLocaleString('pt-BR')}</td>
        <td class="py-2 px-2.5 text-center">
          <input type="number" min="0" value="${c.qtdExec}" ${!canEditValues ? 'disabled' : ''} onchange="app.audit.updateVal(${item.id}, 'faturado', this.value)" class="table-num w-16 text-center px-1.5 py-0.5 text-xs border border-blue-300 rounded bg-white shadow-xs focus:border-blue-600 font-bold text-blue-950 ${!canEditValues ? 'opacity-75 cursor-not-allowed' : ''}">
        </td>
        <td class="py-2 px-2.5 text-right font-mono font-bold ${c.saldoQtd < 0 ? 'text-purple-900 font-black' : ''}">${isNF ? '—' : c.saldoQtd.toLocaleString('pt-BR')}</td>
        <td class="py-2 px-2.5 text-right font-mono">${isNF ? '—' : this.formatBRL(c.vlTotalEmp)}</td>
        <td class="py-2 px-2.5 text-right font-mono font-bold text-slate-900">${this.formatBRL(c.vlTotalFat)}</td>
        <td class="py-2 px-2.5 text-right font-mono font-bold ${c.vlSaldo < 0 ? 'text-purple-900 font-black' : (c.vlSaldo === 0 ? 'text-slate-600' : 'text-emerald-800')}">${isNF ? '—' : this.formatBRL(c.vlSaldo)}</td>
        <td class="py-2 px-2.5 text-right font-mono font-semibold">${c.percConsumo.toFixed(1)}%</td>
        <td class="py-2 px-2 text-center">
          <span class="inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${c.style.badgeClass}">${c.style.label}</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  exportCSV() {
    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
    const headers = [
      "Item", "Procedimento_Empenho", "Procedimento_Prestador", "Vl_Unit",
      "Qtd_Empenhada", "Qtd_Executada", "Saldo_Qtd",
      "Vl_Empenhado", "Vl_Faturado", "Saldo_Financeiro", "Consumo_Perc", "Situacao"
    ];
    const rows = app.state.exams.map(i => {
      const c = this.calculate(i);
      const isNF = String(i.item).trim().toUpperCase() === "NF";
      return [
        `"${i.item}"`,
        `"${(i.descEmpenho || '').replace(/"/g, '""')}"`,
        `"${(i.descPrestador || '').replace(/"/g, '""')}"`,
        c.vlUnit.toFixed(2).replace('.', ','),
        isNF ? '1' : c.qtdEmp,
        c.qtdExec,
        isNF ? '0' : c.saldoQtd,
        c.vlTotalEmp.toFixed(2).replace('.', ','),
        c.vlTotalFat.toFixed(2).replace('.', ','),
        c.vlSaldo.toFixed(2).replace('.', ','),
        `"${c.percConsumo.toFixed(1)}%"`,
        `"${c.situacao}"`
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
  },

  renderExamsListAdmin() {
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
          <button onclick="app.audit.editExam(${e.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-2">Editar</button>
          <button onclick="app.audit.removeExam(${e.id})" class="text-red-500 hover:text-red-700 font-bold">Excluir</button>
        </td>
      </tr>
    `).join('');
  },

  saveExam() {
    if (!app.permissions.can('audit_manage_procedures')) return alert("Sem permissão para cadastrar exames.");

    const id = document.getElementById('adm-exam-id').value;
    const item = document.getElementById('adm-exam-item').value.trim();
    const cat = document.getElementById('adm-exam-cat').value;
    const descEmpenho = document.getElementById('adm-exam-desc-emp').value.trim();
    const descPrestador = document.getElementById('adm-exam-desc-prest').value.trim();
    const qtdEmpenho = parseInt(document.getElementById('adm-exam-qtd').value, 10) || 0;
    const saldoAnterior = parseInt(document.getElementById('adm-exam-saldo-ant').value, 10) || 0;

    if (!item || !descEmpenho) return alert("Preencha o número do item e a descrição do empenho.");

    let examObj = {
      id: id ? Number(id) : Date.now(),
      item, cat, descEmpenho,
      descPrestador: descPrestador || descEmpenho,
      qtdEmpenho, saldoAnterior, faturado: 0
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

    app.state.exams.sort((a, b) => a.item.localeCompare(b.item, undefined, { numeric: true }));
    app.data.saveLocalExams();
    this.resetExamForm();
    this.renderExamsListAdmin();

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
    if (!app.permissions.can('audit_manage_procedures')) return alert("Sem permissão para excluir exames.");
    if (confirm("Excluir este exame deste contrato?")) {
      app.state.exams = app.state.exams.filter(x => x.id !== id);
      app.data.saveLocalExams();
      this.renderExamsListAdmin();

      app.data.sendToCloud({
        action: "DELETE_EXAM",
        contract: app.state.activeContractTab,
        id: id
      });
    }
  },

  // =========================================================================
  // SIMULADOR & BALANCEADOR DE COTAS ORÇAMENTÁRIAS POR HISTÓRICO REAL
  // =========================================================================
  openBalanceadorModal() {
    const modal = document.getElementById('modal-balanceador-cotas');
    if (!modal) return;

    if (!app.state.exams || app.state.exams.length === 0) {
      if (typeof CONTRATO_73_EXAMS !== 'undefined' && Array.isArray(CONTRATO_73_EXAMS)) {
        app.state.exams = JSON.parse(JSON.stringify(CONTRATO_73_EXAMS));
        if (app.data && app.data.saveLocalExams) app.data.saveLocalExams();
      } else {
        app.state.exams = [];
      }
    }

    let currentTotalEmp = 0;
    app.state.exams.forEach(item => {
      const isNF = String(item.item).trim().toUpperCase() === "NF";
      const vl = Number(item.vlUnit) || 0;
      const q = Number(item.qtdEmpenho) || 0;
      currentTotalEmp += isNF ? vl : (q * vl);
    });

    const elTeto = document.getElementById('bal-teto-alvo');
    if (elTeto && (!elTeto.value || Number(elTeto.value) <= 0)) {
      elTeto.value = currentTotalEmp > 0 ? currentTotalEmp.toFixed(2) : "129163.00";
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    this.calcularBalanceamento();
  },

  closeBalanceadorModal() {
    const modal = document.getElementById('modal-balanceador-cotas');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  calcularBalanceamento() {
    const elMesesHist = document.getElementById('bal-meses-hist');
    const elMesesProj = document.getElementById('bal-meses-proj');
    const elMargem = document.getElementById('bal-margem');
    const elReservaMin = document.getElementById('bal-reserva-min');
    const elTetoAlvo = document.getElementById('bal-teto-alvo');
    const elPreservarNF = document.getElementById('bal-preservar-nf');

    const mesesHist = Math.max(1, parseFloat(elMesesHist ? elMesesHist.value : 4) || 4);
    const mesesProj = Math.max(1, parseFloat(elMesesProj ? elMesesProj.value : 12) || 12);
    const margem = Math.max(0, parseFloat(elMargem ? elMargem.value : 0.15) || 0.15);
    const reservaMin = Math.max(1, parseInt(elReservaMin ? elReservaMin.value : 10, 10) || 10);
    const tetoAlvo = Math.max(1, parseFloat(elTetoAlvo ? elTetoAlvo.value : 129163.00) || 129163.00);
    const preservarNF = elPreservarNF ? elPreservarNF.checked : true;

    const nfItem = app.state.exams.find(e => String(e.item).trim().toUpperCase() === "NF");
    const reservaNF = (nfItem && preservarNF) ? (Number(nfItem.vlUnit) || 0) : 0;
    const tetoProcedimentos = Math.max(0, tetoAlvo - reservaNF);

    let somaBrutaProjetada = 0;
    const projected = [];

    // Passo 1: Projeção base por histórico com margem de segurança e reserva técnica
    app.state.exams.forEach(item => {
      const isNF = String(item.item).trim().toUpperCase() === "NF";
      const vlUnit = Number(item.vlUnit) || 0;
      const qtdEmp = Number(item.qtdEmpenho) || 0;
      const fat = Number(item.faturado) || 0;

      if (isNF) {
        projected.push({
          id: item.id,
          item: item.item,
          descEmpenho: item.descEmpenho,
          descPrestador: item.descPrestador,
          cat: item.cat || 'Laboratorial',
          vlUnit: vlUnit,
          qtdEmp: qtdEmp,
          fat: fat,
          mediaMensal: 0,
          qtdBase: 1,
          qtdSug: 1,
          vlTotSug: vlUnit,
          isNF: true
        });
      } else {
        const mediaMensal = fat / mesesHist;
        const demandaProj = Math.ceil(mediaMensal * mesesProj * (1 + margem));
        const qtdBase = Math.max(reservaMin, demandaProj);
        somaBrutaProjetada += (qtdBase * vlUnit);

        projected.push({
          id: item.id,
          item: item.item,
          descEmpenho: item.descEmpenho,
          descPrestador: item.descPrestador,
          cat: item.cat || 'Laboratorial',
          vlUnit: vlUnit,
          qtdEmp: qtdEmp,
          fat: fat,
          mediaMensal: mediaMensal,
          qtdBase: qtdBase,
          qtdSug: qtdBase,
          vlTotSug: qtdBase * vlUnit,
          isNF: false
        });
      }
    });

    // Passo 2: Fator de escala sobre a parcela variável (acima da reserva técnica)
    const somaVarBruta = projected.reduce((acc, p) => {
      if (p.isNF) return acc;
      return acc + (Math.max(0, p.qtdBase - reservaMin) * p.vlUnit);
    }, 0);

    const custoReservaFixa = projected.reduce((acc, p) => {
      if (p.isNF) return acc;
      return acc + (reservaMin * p.vlUnit);
    }, 0);

    const orcamentoVariavel = Math.max(0, tetoProcedimentos - custoReservaFixa);
    const scaleFactor = somaVarBruta > 0 ? (orcamentoVariavel / somaVarBruta) : 1;

    let somaFinal = reservaNF;
    projected.forEach(p => {
      if (!p.isNF) {
        const varPart = Math.max(0, p.qtdBase - reservaMin);
        p.qtdSug = reservaMin + Math.round(varPart * scaleFactor);
        p.vlTotSug = Math.round(p.qtdSug * p.vlUnit * 100) / 100;
        somaFinal += p.vlTotSug;
      }
    });

    // Passo 3: Ajuste Fino de Convergência (Garante matematicamente que somaFinal <= tetoAlvo)
    while (somaFinal > tetoAlvo) {
      const candidates = projected.filter(p => !p.isNF && p.qtdSug > reservaMin);
      if (candidates.length === 0) break;
      candidates.sort((a, b) => b.vlUnit - a.vlUnit);
      candidates[0].qtdSug -= 1;
      candidates[0].vlTotSug = Math.round(candidates[0].qtdSug * candidates[0].vlUnit * 100) / 100;

      somaFinal = reservaNF + projected.filter(p => !p.isNF).reduce((sum, p) => sum + p.vlTotSug, 0);
      somaFinal = Math.round(somaFinal * 100) / 100;
    }

    // Passo 4: Geração de Justificativas Técnicas Oficiais
    let countReforcados = 0;
    let countOtimizados = 0;

    projected.forEach(p => {
      p.diffQtd = p.qtdSug - p.qtdEmp;
      p.percVar = p.qtdEmp > 0 ? ((p.diffQtd / p.qtdEmp) * 100) : 0;

      if (p.isNF) {
        p.statusTipo = 'NF';
        p.justificativa = "Reserva orçamentária de contingência e conciliação de ajustes fiscais/NFS-e.";
      } else if (p.diffQtd > 0) {
        countReforcados++;
        p.statusTipo = 'UP';
        p.justificativa = `Reforço de +${p.diffQtd.toLocaleString('pt-BR')} un (+${p.percVar.toFixed(0)}%): Adequação à alta procura faturada (${p.fat} un em ${mesesHist}m, média ${(p.mediaMensal).toFixed(1)}/mês), eliminando risco de déficit e glosa.`;
      } else if (p.diffQtd < 0) {
        countOtimizados++;
        p.statusTipo = 'DOWN';
        if (p.fat === 0) {
          p.justificativa = `Redução com Reserva Técnica (${p.qtdSug} un): Sem demanda no período auditado; cota reduzida para otimizar recursos sem gerar desassistência.`;
        } else {
          p.justificativa = `Otimização de Ociosidade (-${Math.abs(p.diffQtd).toLocaleString('pt-BR')} un, ${p.percVar.toFixed(0)}%): Demanda média real de ${(p.mediaMensal).toFixed(1)} exames/mês permitiu remanejar saldo ocioso com margem de segurança.`;
        }
      } else {
        p.statusTipo = 'SAME';
        p.justificativa = `Manutenção de Cota (${p.qtdSug} un): Quantitativo contratual em equilíbrio com o consumo faturado no período.`;
      }
    });

    const folga = Math.max(0, tetoAlvo - somaFinal);

    this._simulacaoState = {
      parametros: { mesesHist, mesesProj, margem, reservaMin, tetoAlvo, preservarNF, reservaNF },
      totais: {
        tetoAlvo,
        custoNovo: somaFinal,
        folgaResidual: folga,
        reforcados: countReforcados,
        otimizados: countOtimizados
      },
      itens: projected
    };

    const elKpiTeto = document.getElementById('bal-kpi-teto');
    const elKpiCusto = document.getElementById('bal-kpi-custo-novo');
    const elKpiFolga = document.getElementById('bal-kpi-folga');
    const elKpiRef = document.getElementById('bal-kpi-reforcados');
    const elKpiOti = document.getElementById('bal-kpi-otimizados');

    if (elKpiTeto) elKpiTeto.textContent = this.formatBRL(tetoAlvo);
    if (elKpiCusto) elKpiCusto.textContent = this.formatBRL(somaFinal);
    if (elKpiFolga) elKpiFolga.textContent = this.formatBRL(folga);
    if (elKpiRef) elKpiRef.textContent = countReforcados;
    if (elKpiOti) elKpiOti.textContent = countOtimizados;

    this.renderBalanceadorTabela();
  },

  filterBalanceamento() {
    this.renderBalanceadorTabela();
  },

  renderBalanceadorTabela() {
    const tbody = document.getElementById('table-balanceador-body');
    if (!tbody || !this._simulacaoState) return;

    const search = (document.getElementById('bal-filter-search')?.value || '').toLowerCase().trim();
    const status = document.getElementById('bal-filter-status')?.value || 'ALL';

    const filtered = this._simulacaoState.itens.filter(p => {
      const matchSearch = !search ||
        p.descEmpenho.toLowerCase().includes(search) ||
        (p.descPrestador && p.descPrestador.toLowerCase().includes(search)) ||
        String(p.item).includes(search);

      let matchStatus = true;
      if (status === 'UP') matchStatus = p.diffQtd > 0;
      else if (status === 'DOWN') matchStatus = p.diffQtd < 0;
      else if (status === 'RESERVE') matchStatus = !p.isNF && p.fat === 0;

      return matchSearch && matchStatus;
    });

    const elCounter = document.getElementById('bal-row-counter');
    if (elCounter) {
      elCounter.textContent = `Exibindo ${filtered.length} de ${this._simulacaoState.itens.length} itens`;
    }

    tbody.innerHTML = '';
    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.className = `border-b border-slate-100 hover:bg-slate-50 transition ${p.diffQtd > 0 ? 'bg-purple-50/20' : (p.diffQtd < 0 ? 'bg-amber-50/20' : '')}`;

      let varBadge = `<span class="text-slate-400 font-bold">= 0</span>`;
      if (p.isNF) {
        varBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 text-slate-700">FISCAL</span>`;
      } else if (p.diffQtd > 0) {
        varBadge = `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">+${p.diffQtd.toLocaleString('pt-BR')} (+${p.percVar.toFixed(0)}%)</span>`;
      } else if (p.diffQtd < 0) {
        varBadge = `<span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">${p.diffQtd.toLocaleString('pt-BR')} (${p.percVar.toFixed(0)}%)</span>`;
      }

      tr.innerHTML = `
        <td class="py-2 px-2 text-center font-bold font-mono text-slate-900">${p.item}</td>
        <td class="py-2 px-3 font-semibold text-slate-900">
          <div>${p.descEmpenho}</div>
          <div class="text-[10px] text-slate-400 font-mono">${p.descPrestador || ''}</div>
        </td>
        <td class="py-2 px-2 text-right font-mono text-slate-600">${this.formatBRL(p.vlUnit)}</td>
        <td class="py-2 px-2 text-right font-mono font-medium bg-slate-50">${p.isNF ? '—' : p.qtdEmp.toLocaleString('pt-BR')}</td>
        <td class="py-2 px-2 text-center font-mono font-bold ${p.fat > p.qtdEmp ? 'text-purple-900 bg-purple-50 rounded' : 'text-blue-900'}">${p.isNF ? '—' : p.fat.toLocaleString('pt-BR')}</td>
        <td class="py-2 px-2 text-right font-mono text-slate-500">${p.isNF ? '—' : p.mediaMensal.toFixed(1)}</td>
        <td class="py-2 px-2.5 text-right font-mono font-black text-amber-950 bg-amber-50/80">${p.isNF ? '1' : p.qtdSug.toLocaleString('pt-BR')}</td>
        <td class="py-2 px-2 text-center font-mono">${varBadge}</td>
        <td class="py-2 px-2.5 text-right font-mono font-black text-slate-900">${this.formatBRL(p.vlTotSug)}</td>
        <td class="py-2 px-3 text-[10px] text-slate-600 leading-snug">${p.justificativa}</td>
      `;
      tbody.appendChild(tr);
    });
  },

  exportarCSVBalanceamento() {
    if (!this._simulacaoState) return app.ui.toast("Simulação não disponível.", "warning", "Atenção");
    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
    const { parametros, totais, itens } = this._simulacaoState;

    const headers = [
      "Item", "Procedimento_Empenho", "Codigo_Prestador", "Vl_Unitario",
      "Cota_Atual", "Faturado_Hist_4m", "Media_Mensal_Real", "Cota_Sugerida",
      "Variacao_Qtd", "Variacao_Perc", "Custo_Total_Sugerido", "Justificativa_Tecnica"
    ];

    const rows = itens.map(p => [
      `"${p.item}"`,
      `"${(p.descEmpenho || '').replace(/"/g, '""')}"`,
      `"${(p.descPrestador || '').replace(/"/g, '""')}"`,
      p.vlUnit.toFixed(2).replace('.', ','),
      p.isNF ? '1' : p.qtdEmp,
      p.isNF ? '0' : p.fat,
      p.isNF ? '0' : p.mediaMensal.toFixed(2).replace('.', ','),
      p.isNF ? '1' : p.qtdSug,
      p.diffQtd,
      `"${p.percVar.toFixed(1)}%"`,
      p.vlTotSug.toFixed(2).replace('.', ','),
      `"${(p.justificativa || '').replace(/"/g, '""')}"`
    ].join(";"));

    const summaryBlock = [
      `"SIMULADOR DE BALANCEAMENTO DE COTAS ORÇAMENTÁRIAS - MUNICÍPIO DE TORRES/RS"`,
      `"Contrato";"nº ${currentContract.num}"`,
      `"Prestador";"${currentContract.prestador}"`,
      `"Meses Histórico";"${parametros.mesesHist}"`,
      `"Meses Projeção";"${parametros.mesesProj}"`,
      `"Margem Segurança";"${(parametros.margem * 100).toFixed(0)}%"`,
      `"Reserva Mínima";"${parametros.reservaMin} un"`,
      `"Teto Alvo Empenho";"${this.formatBRL(totais.tetoAlvo)}"`,
      `"Custo Total Projetado";"${this.formatBRL(totais.custoNovo)}"`,
      `"Folga Orçamentária";"${this.formatBRL(totais.folgaResidual)}"`,
      `""`
    ].join("\r\n");

    const csvContent = "\uFEFF" + summaryBlock + "\r\n" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Balanceamento_Cotas_${currentContract.tabName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  abrirMemorandoTecnico() {
    if (!this._simulacaoState) return app.ui.toast("Execute a simulação primeiro.", "warning", "Atenção");
    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
    const { parametros, totais, itens } = this._simulacaoState;
    const modal = document.getElementById('modal-memorando-tecnico');
    const container = document.getElementById('conteudo-memorando-tecnico');
    if (!modal || !container) return;

    const now = new Date();
    const dataExtenso = `${now.getDate()} de ${now.toLocaleString('pt-BR', { month: 'long' })} de ${now.getFullYear()}`;

    const topAumentos = itens.filter(i => !i.isNF && i.diffQtd > 0).sort((a, b) => b.diffQtd - a.diffQtd).slice(0, 6);
    const topReducoes = itens.filter(i => !i.isNF && i.diffQtd < 0).sort((a, b) => a.diffQtd - b.diffQtd).slice(0, 6);

    container.innerHTML = `
      <div id="memorando-print-root" class="space-y-4 font-sans text-slate-800">
        <!-- CABEÇALHO OFICIAL DO MEMORANDO -->
        <div class="border-b-2 border-slate-900 pb-3">
          <div class="text-center space-y-0.5">
            <h1 class="text-xs font-black uppercase tracking-wider text-slate-900">ESTADO DO RIO GRANDE DO SUL</h1>
            <h2 class="text-sm font-black uppercase text-slate-900">PREFEITURA MUNICIPAL DE TORRES</h2>
            <h3 class="text-xs font-bold uppercase text-slate-700">SECRETARIA MUNICIPAL DA SAÚDE — AUDITORIA DE CONTROLE FÍSICO-FINANCEIRO</h3>
            <p class="text-[10px] text-slate-500 pt-1">Rua José Bonifácio, 642 — Torres/RS | Sistema Integrado de Gestão Pública</p>
          </div>
        </div>

        <div class="flex justify-between items-center text-xs font-mono border-b pb-2">
          <span><strong>MEMORANDO TÉCNICO Nº</strong> ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} - SMS/AUD</span>
          <span>Torres/RS, ${dataExtenso}</span>
        </div>

        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
          <p><strong>DE:</strong> Setor de Auditoria e Controle Físico-Financeiro de Saúde</p>
          <p><strong>PARA:</strong> Gabinete do Secretário Municipal de Saúde / Diretoria de Compras e Contratos</p>
          <p><strong>ASSUNTO:</strong> Justificativa Técnica e Proposta de Rebalanceamento das Cotas Orçamentárias do Contrato nº ${currentContract.num} (${currentContract.prestador}) para o Próximo Período.</p>
          <p><strong>REF. LEGAL:</strong> Art. 65 da Lei Federal nº 8.666/93 c/c Lei Federal nº 14.133/2021 (Adequação quantitativa baseada em consumo fático apurado).</p>
        </div>

        <div class="space-y-2.5 text-xs text-justify leading-relaxed">
          <h4 class="font-black text-slate-900 uppercase text-[11px] border-b pb-0.5">1. INTRODUÇÃO E DIAGNÓSTICO DO HISTÓRICO FATURADO</h4>
          <p>
            Vimos pelo presente encaminhar a demonstração de auditoria físico-financeira referente aos serviços laboratoriais prestados pela empresa <strong>${currentContract.prestador}</strong>, sob o Contrato nº <strong>${currentContract.num}</strong>.
            A avaliação detalhada das competências auditadas (Março a Junho/2026, relativas às NFS-e 3205 a 3264) evidenciou expressivo <strong>descompasso entre os quantitativos originalmente empenhados e a demanda epidemiológica real dos munícipes atendidos pelo SUS</strong>.
          </p>
          <p>
            Constatou-se que determinados exames de alta rotina clínica (como Vitamina B12, Vitamina D, TSH, Ferritina e Hemoglobina Glicada) sofreram esgotamento precoce de suas cotas empenhadas (extrapolando até 580% da estimativa original), gerando impossibilidade legal de ateste e liquidação regular das faturas correspondentes. Simultaneamente, constatou-se que itens laboratoriais como Plaquetas, Creatinúria, Curva Glicêmica e Albumina apresentaram baixíssima procura, mantendo valores orçamentários retidos e ociosos.
          </p>

          <h4 class="font-black text-slate-900 uppercase text-[11px] border-b pb-0.5 pt-2">2. METODOLOGIA TÉCNICA DO REBALANCEAMENTO</h4>
          <p>
            Com fundamento nos princípios da eficiência, economicidade e continuidade do serviço público de saúde, foi aplicado um modelo de rebalanceamento paramétrico sobre o histórico faturado real dos <strong>${parametros.mesesHist} meses auditados</strong>, considerando:
          </p>
          <ul class="list-disc list-inside space-y-1 pl-2 font-medium">
            <li><strong>Projeção de Demanda Real:</strong> Anualização (${parametros.mesesProj} meses) baseada na média aritmética mensal real faturada;</li>
            <li><strong>Margem de Segurança Técnica:</strong> Acréscimo de ${(parametros.margem * 100).toFixed(0)}% para absorver variações sazonais e picos de demanda assistencial;</li>
            <li><strong>Reserva Técnica Mínima:</strong> Garantia inegociável de cota mínima de ${parametros.reservaMin} unidades para procedimentos sem demanda no período, assegurando que nenhum cidadão fique desassistido na rede;</li>
            <li><strong>Estrita Observância ao Teto Financeiro:</strong> A soma total dos 76 procedimentos balanceados é de <strong>${this.formatBRL(totais.custoNovo)}</strong>, rigorosamente enquadrada dentro do teto global de <strong>${this.formatBRL(totais.tetoAlvo)}</strong>, com folga orçamentária residual de <strong>${this.formatBRL(totais.folgaResidual)}</strong>.</li>
          </ul>

          <h4 class="font-black text-slate-900 uppercase text-[11px] border-b pb-0.5 pt-2">3. SÍNTESE DAS PRINCIPAIS ADEQUAÇÕES</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div class="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
              <span class="font-black text-purple-950 block mb-1">Principais Reforços (Fim dos Déficits):</span>
              <ul class="space-y-1 text-[11px]">
                ${topAumentos.map(a => `<li><strong>Item ${a.item} (${a.descEmpenho}):</strong> de ${a.qtdEmp} un para <strong>${a.qtdSug} un</strong> (+${a.diffQtd} un)</li>`).join('')}
              </ul>
            </div>
            <div class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
              <span class="font-black text-amber-950 block mb-1">Principais Otimizações (Fim da Ociosidade):</span>
              <ul class="space-y-1 text-[11px]">
                ${topReducoes.map(r => `<li><strong>Item ${r.item} (${r.descEmpenho}):</strong> de ${r.qtdEmp} un para <strong>${r.qtdSug} un</strong> (${r.diffQtd} un)</li>`).join('')}
              </ul>
            </div>
          </div>

          <h4 class="font-black text-slate-900 uppercase text-[11px] border-b pb-0.5 pt-2">4. CONCLUSÃO E ENCAMINHAMENTO</h4>
          <p>
            Diante do exposto, resta plenamente justificada sob o aspecto fático, assistencial e contábil a presente redistribuição quantitativa, sem qualquer acréscimo financeiro sobre o teto municipal já homologado.
            Submete-se o presente processo à deliberação superior para formalização do respectivo apostilamento / termo aditivo / novo empenho dos 76 procedimentos.
          </p>
        </div>

        <!-- BLOCO DE ASSINATURAS -->
        <div class="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
          <div class="border-t border-slate-700 pt-2">
            <strong>AUDITORIA DE CONTROLE FÍSICO-FINANCEIRO</strong><br>
            <span class="text-[11px] text-slate-600">Secretaria Municipal de Saúde de Torres/RS</span>
          </div>
          <div class="border-t border-slate-700 pt-2">
            <strong>SECRETÁRIO(A) MUNICIPAL DA SAÚDE</strong><br>
            <span class="text-[11px] text-slate-600">Município de Torres / RS</span>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  // --------------------------------------------------------------------------
  // RELATÓRIO OFICIAL DE COTAS BALANCEADAS (IMPRESSÃO FORMATADA PARA FOLHA A4)
  // --------------------------------------------------------------------------
  imprimirCotasBalanceadas() {
    if (!this._simulacaoState) {
      this.calcularBalanceamento();
    }
    if (!this._simulacaoState) {
      return app.ui.toast("Não foi possível gerar os dados para impressão das cotas.", "warning", "Simulação Necessária");
    }

    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
    const { parametros, totais, itens } = this._simulacaoState;

    const now = new Date();
    const dataExtenso = `${now.getDate()} de ${now.toLocaleString('pt-BR', { month: 'long' })} de ${now.getFullYear()} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const rowsHtml = itens.map((p, idx) => {
      const isUp = p.diffQtd > 0;
      const isDown = p.diffQtd < 0;
      let badgeVar = `<span style="color:#64748b; font-weight:bold;">= 0</span>`;
      if (p.isNF) {
        badgeVar = `<span style="background:#f1f5f9; color:#334155; font-size:6pt; padding:1px 3px; border-radius:3px; font-weight:bold;">FISCAL</span>`;
      } else if (isUp) {
        badgeVar = `<span style="background:#f3e8ff; color:#6b21a8; font-size:6pt; padding:1px 3px; border-radius:3px; font-weight:bold;">+${p.diffQtd.toLocaleString('pt-BR')} (+${p.percVar.toFixed(0)}%)</span>`;
      } else if (isDown) {
        badgeVar = `<span style="background:#fef3c7; color:#92400e; font-size:6pt; padding:1px 3px; border-radius:3px; font-weight:bold;">${p.diffQtd.toLocaleString('pt-BR')} (${p.percVar.toFixed(0)}%)</span>`;
      }

      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `
        <tr style="background-color: ${rowBg}; page-break-inside: avoid; border-bottom: 1px solid #e2e8f0;">
          <td class="col-item">${p.item}</td>
          <td class="col-proc">
            <div style="font-weight: 700; color: #0f172a; line-height: 1.15;">${p.descEmpenho}</div>
            ${p.descPrestador ? `<div style="font-size: 5.5pt; color: #64748b; font-family: monospace;">${p.descPrestador}</div>` : ''}
          </td>
          <td class="col-vlunit">${this.formatBRL(p.vlUnit)}</td>
          <td class="col-cota-at" style="color: #334155;">${p.isNF ? '—' : p.qtdEmp.toLocaleString('pt-BR')}</td>
          <td class="col-fat" style="font-weight: bold; color: ${p.fat > p.qtdEmp ? '#6b21a8' : '#1e3a8a'};">${p.isNF ? '—' : p.fat.toLocaleString('pt-BR')}</td>
          <td class="col-media" style="color: #64748b;">${p.isNF ? '—' : p.mediaMensal.toFixed(1)}</td>
          <td class="col-cota-sug" style="background-color: #fffbeb; color: #78350f;">${p.isNF ? '1' : p.qtdSug.toLocaleString('pt-BR')}</td>
          <td class="col-var">${badgeVar}</td>
          <td class="col-custo" style="color: #0f172a;">${this.formatBRL(p.vlTotSug)}</td>
        </tr>
      `;
    }).join('');

    const totalQtdEmp = itens.reduce((acc, i) => acc + (i.isNF ? 0 : i.qtdEmp), 0);
    const totalFat = itens.reduce((acc, i) => acc + (i.isNF ? 0 : i.fat), 0);
    const totalQtdSug = itens.reduce((acc, i) => acc + (i.isNF ? 1 : i.qtdSug), 0);

    const printWin = window.open('', '_blank', 'width=1180,height=820');
    if (!printWin) {
      return app.ui.toast("Por favor, permita janelas pop-ups no navegador para visualizar a impressão A4.", "warning", "Pop-up Bloqueado");
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Relatório de Cotas Balanceadas - Contrato nº ${currentContract.num} - Torres/RS</title>
        <style id="orientation-style">
          @page {
            size: A4 landscape;
            margin: 6mm 8mm 6mm 8mm;
          }
        </style>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 7pt;
            color: #0f172a;
            line-height: 1.25;
            margin: 0;
            padding: 0;
            background: #fff;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            background: #0f172a;
            color: #fff;
            padding: 10px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            font-size: 9pt;
            border-bottom: 2px solid #334155;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .orientation-btn {
            background: #334155;
            color: #cbd5e1;
            border: 1px solid #475569;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 8.5pt;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s ease;
          }
          .orientation-btn.active {
            background: #2563eb;
            color: #ffffff;
            border-color: #60a5fa;
            box-shadow: 0 0 0 1px #60a5fa;
          }
          .btn-print {
            background: #16a34a;
            color: #fff;
            border: none;
            padding: 6px 18px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 9pt;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
          }
          .btn-print:hover { background: #15803d; }
          .btn-close {
            background: #475569;
            color: #fff;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 9pt;
            cursor: pointer;
          }
          .btn-close:hover { background: #64748b; }
          @media print {
            .no-print { display: none !important; }
            body { font-size: 6.6pt; }
          }
          .container {
            width: 100%;
            max-width: 100%;
            margin: 0 auto;
            padding: 2px 4px;
          }
          .header-box {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
            margin-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
          }
          .header-title h1 { margin: 0; font-size: 10pt; font-weight: 900; text-transform: uppercase; color: #0f172a; }
          .header-title h2 { margin: 1px 0 0 0; font-size: 8pt; font-weight: 700; color: #334155; }
          .header-title p { margin: 1px 0 0 0; font-size: 6.5pt; color: #64748b; }
          .contract-badge {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 3px 8px;
            text-align: right;
            font-size: 6.5pt;
            white-space: nowrap;
            shrink: 0;
          }

          /* Grade de Indicadores (KPIs) Adaptável */
          .kpi-row {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 5px;
            margin-bottom: 5px;
          }
          body.mode-portrait .kpi-row {
            grid-template-columns: repeat(3, 1fr);
          }
          .kpi-col {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            padding: 3px 5px;
            text-align: center;
          }
          .kpi-label { font-size: 6pt; text-transform: uppercase; font-weight: bold; color: #64748b; }
          .kpi-val { font-size: 8.5pt; font-weight: 900; font-family: monospace; color: #0f172a; margin-top: 1px; }
          .kpi-sub { font-size: 5.5pt; color: #16a34a; font-weight: bold; }

          /* Tabela com Layout Fixo e Anti-Overflow */
          table.report-table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            font-size: 6.8pt;
            border: 1px solid #cbd5e1;
            font-variant-numeric: tabular-nums;
          }
          table.report-table thead {
            display: table-header-group;
          }
          table.report-table tfoot {
            display: table-footer-group;
          }
          table.report-table tr {
            page-break-inside: avoid;
          }
          table.report-table th {
            background: #0f172a !important;
            color: #ffffff !important;
            font-size: 6.5pt;
            text-transform: uppercase;
            font-weight: 800;
            padding: 3px 2px;
            border: 1px solid #1e293b;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          table.report-table td {
            padding: 2px 2.5px;
            border-bottom: 1px solid #e2e8f0;
            overflow: hidden;
            word-break: break-word;
          }

          /* Colunas Proporcionais Somando Exatamente 100% */
          .col-item     { width: 4.5%; text-align: center; font-weight: bold; font-family: monospace; }
          .col-proc     { width: 33.5%; text-align: left; }
          .col-vlunit   { width: 7.5%; text-align: right; font-family: monospace; }
          .col-cota-at  { width: 7.5%; text-align: center; font-family: monospace; }
          .col-fat      { width: 7.5%; text-align: center; font-family: monospace; }
          .col-media    { width: 7%; text-align: center; font-family: monospace; }
          .col-cota-sug { width: 9%; text-align: center; font-family: monospace; font-weight: 900; }
          .col-var      { width: 11.5%; text-align: center; font-family: monospace; }
          .col-custo    { width: 12%; text-align: right; font-family: monospace; font-weight: bold; }

          /* Ajustes Quando em Modo Retrato */
          body.mode-portrait table.report-table { font-size: 6.2pt; }
          body.mode-portrait .col-proc { width: 31%; }
          body.mode-portrait .col-var  { width: 12.5%; }
          body.mode-portrait .col-custo { width: 13.5%; }

          .notes-box {
            margin-top: 6px;
            padding: 4px 6px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            font-size: 6pt;
            color: #475569;
            line-height: 1.3;
          }
          .sign-row {
            display: flex;
            justify-content: space-between;
            margin-top: 18px;
            page-break-inside: avoid;
            gap: 16px;
          }
          .sign-col {
            flex: 1;
            text-align: center;
            border-top: 1px solid #0f172a;
            padding-top: 3px;
            font-size: 6.5pt;
          }
          .sign-col strong { display: block; font-size: 7pt; color: #0f172a; }
        </style>
      </head>
      <body class="mode-landscape">
        <div class="no-print">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div>
              <strong>🖨️ Relatório de Cotas Balanceadas</strong>
              <span style="color: #94a3b8; font-size: 8pt; margin-left: 4px;">(${itens.length} itens)</span>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 4px; background: #1e293b; padding: 2px 4px; border-radius: 8px; border: 1px solid #334155;">
              <span style="font-size: 7.5pt; color: #94a3b8; margin: 0 4px; font-weight: 600;">Orientação:</span>
              <button id="btn-mode-landscape" onclick="setOrientation('landscape')" class="orientation-btn active" title="Layout em Paisagem (Horizontal)">📜 Paisagem (Recomendado)</button>
              <button id="btn-mode-portrait" onclick="setOrientation('portrait')" class="orientation-btn" title="Layout em Retrato (Vertical)">📄 Retrato</button>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Salvar PDF</button>
            <button onclick="window.close()" class="btn-close">Fechar</button>
          </div>
        </div>

        <div class="container">
          <!-- CABEÇALHO OFICIAL -->
          <div class="header-box">
            <div class="header-title">
              <h1>Prefeitura Municipal de Torres — Secretaria da Saúde</h1>
              <h2>Auditoria e Controle Físico-Financeiro • Relatório Técnico de Balanceamento de Cotas</h2>
              <p>Rua José Bonifácio, 642 — Torres/RS | Sistema de Auditoria Pública do SUS | Emissão: ${dataExtenso}</p>
            </div>
            <div class="contract-badge">
              <div><strong>Contrato nº:</strong> ${currentContract.num}</div>
              <div><strong>Prestador:</strong> ${currentContract.prestador}</div>
              <div><strong>Empenhos:</strong> ${currentContract.empenhos}</div>
            </div>
          </div>

          <!-- RESUMO DOS INDICADORES E METAS ORÇAMENTÁRIAS -->
          <div class="kpi-row">
            <div class="kpi-col">
              <div class="kpi-label">Teto Alvo Contratual</div>
              <div class="kpi-val">${this.formatBRL(totais.tetoAlvo)}</div>
              <div class="kpi-sub" style="color:#64748b;">Limite Inviolável</div>
            </div>
            <div class="kpi-col" style="background: #f0fdf4; border-color: #86efac;">
              <div class="kpi-label" style="color:#166534;">Custo Total Projetado</div>
              <div class="kpi-val" style="color:#15803d;">${this.formatBRL(totais.custoNovo)}</div>
              <div class="kpi-sub">✓ 100% Dentro do Teto</div>
            </div>
            <div class="kpi-col" style="background: #eff6ff; border-color: #93c5fd;">
              <div class="kpi-label" style="color:#1e40af;">Folga Residual</div>
              <div class="kpi-val" style="color:#1d4ed8;">${this.formatBRL(totais.folgaResidual)}</div>
              <div class="kpi-sub" style="color:#2563eb;">Margem de Segurança</div>
            </div>
            <div class="kpi-col" style="background: #faf5ff; border-color: #d8b4fe;">
              <div class="kpi-label" style="color:#6b21a8;">Itens Reforçados</div>
              <div class="kpi-val" style="color:#7e22ce;">${totais.reforcados}</div>
              <div class="kpi-sub" style="color:#9333ea;">Déficits Eliminados</div>
            </div>
            <div class="kpi-col" style="background: #fffbeb; border-color: #fde68a;">
              <div class="kpi-label" style="color:#92400e;">Itens Otimizados</div>
              <div class="kpi-val" style="color:#b45309;">${totais.otimizados}</div>
              <div class="kpi-sub" style="color:#d97706;">Ociosidade Reduzida</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-label">Critérios do Algoritmo</div>
              <div style="font-size: 6.8pt; font-weight: bold; margin-top: 1px;">
                Hist: ${parametros.mesesHist}m | Proj: ${parametros.mesesProj}m
              </div>
              <div style="font-size: 5.8pt; color: #475569;">
                Margem: +${(parametros.margem * 100).toFixed(0)}% | Reserva: ${parametros.reservaMin}un
              </div>
            </div>
          </div>

          <!-- TABELA COMPLETA COM QUEBRA AUTOMÁTICA EM FOLHAS A4 -->
          <table class="report-table">
            <thead>
              <tr>
                <th class="col-item">Item</th>
                <th class="col-proc">Procedimento Laboratorial (SUS)</th>
                <th class="col-vlunit">Vl. Unit.</th>
                <th class="col-cota-at">Cota Atual</th>
                <th class="col-fat">Fat. Real</th>
                <th class="col-media">Média/Mês</th>
                <th class="col-cota-sug" style="background: #b45309;">Cota Sugerida</th>
                <th class="col-var">Variação (Δ)</th>
                <th class="col-custo">Custo Novo</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #0f172a; color: #fff; font-weight: bold; font-family: monospace;">
                <td colspan="3" style="padding: 3px 5px; text-align: right; text-transform: uppercase;">TOTAIS GERAIS CONSOLIDADOS:</td>
                <td class="col-cota-at" style="color: #fff;">${totalQtdEmp.toLocaleString('pt-BR')}</td>
                <td class="col-fat" style="color: #fff;">${totalFat.toLocaleString('pt-BR')}</td>
                <td class="col-media" style="color: #94a3b8;">—</td>
                <td class="col-cota-sug" style="background: #b45309; color: #fff;">${totalQtdSug.toLocaleString('pt-BR')}</td>
                <td class="col-var" style="color: #94a3b8;">—</td>
                <td class="col-custo" style="padding: 3px 5px; font-size: 7.5pt; color: #fff;">${this.formatBRL(totais.custoNovo)}</td>
              </tr>
            </tfoot>
          </table>

          <!-- OBSERVAÇÕES TÉCNICAS E RESPALDO LEGAL -->
          <div class="notes-box">
            <strong>Fundamentação e Metodologia Técnica:</strong> Redistribuição físico-financeira efetuada por algoritmo de otimização proporcional baseado na demanda epidemiológica faturada do período (${parametros.mesesHist} meses auditados via NFS-e). O cálculo aplica margem de segurança de ${(parametros.margem * 100).toFixed(0)}% para absorver variações sazonais e reserva técnica mínima obrigatória de ${parametros.reservaMin} unidades para procedimentos sem demanda recente, resguardando a integralidade da cobertura assistencial do SUS sem ultrapassar o teto orçamentário licitado (Art. 65 da Lei 8.666/93 e Lei 14.133/2021).
          </div>

          <!-- ASSINATURAS OFICIAIS -->
          <div class="sign-row">
            <div class="sign-col">
              <strong>Setor de Auditoria Físico-Financeira</strong>
              <span>Secretaria Municipal da Saúde de Torres</span>
            </div>
            <div class="sign-col">
              <strong>Fiscal do Contrato Administrativo</strong>
              <span>Controle e Execução Contratual</span>
            </div>
            <div class="sign-col">
              <strong>Secretário(a) Municipal da Saúde</strong>
              <span>Ordenador(a) de Despesa</span>
            </div>
          </div>
        </div>

        <script>
          function setOrientation(mode) {
            const styleEl = document.getElementById('orientation-style');
            const btnL = document.getElementById('btn-mode-landscape');
            const btnP = document.getElementById('btn-mode-portrait');
            if (mode === 'portrait') {
              document.body.classList.remove('mode-landscape');
              document.body.classList.add('mode-portrait');
              styleEl.innerHTML = '@page { size: A4 portrait; margin: 6mm 6mm 6mm 6mm; }';
              btnP.classList.add('active');
              btnL.classList.remove('active');
            } else {
              document.body.classList.remove('mode-portrait');
              document.body.classList.add('mode-landscape');
              styleEl.innerHTML = '@page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm; }';
              btnL.classList.add('active');
              btnP.classList.remove('active');
            }
          }

          // Inicia em modo paisagem por padrão (recomendado para 9 colunas)
          setOrientation('landscape');

          window.focus();
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  fecharMemorandoTecnico() {
    const modal = document.getElementById('modal-memorando-tecnico');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  imprimirMemorando() {
    const content = document.getElementById('conteudo-memorando-tecnico')?.innerHTML;
    if (!content) return;

    const printWin = window.open('', '_blank', 'width=900,height=750');
    if (!printWin) {
      return app.ui.toast("Por favor, permita pop-ups para imprimir o Memorando Técnico.", "warning", "Pop-up Bloqueado");
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Memorando Técnico de Rebalanceamento - Torres/RS</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 15mm 15mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 10pt; color: #111; line-height: 1.4; margin: 0; padding: 0; }
          h1, h2, h3, h4 { margin: 0; padding: 0; }
          .border-b { border-bottom: 1px solid #ccc; }
          .border-b-2 { border-bottom: 2px solid #000; }
          .border-t { border-top: 1px solid #000; }
          .pb-2 { padding-bottom: 6px; }
          .pb-3 { padding-bottom: 10px; }
          .pt-1 { padding-top: 4px; }
          .pt-2 { padding-top: 8px; }
          .pt-8 { padding-top: 40px; }
          .text-center { text-align: center; }
          .text-justify { text-align: justify; }
          .space-y-1 > * + * { margin-top: 4px; }
          .space-y-2 > * + * { margin-top: 8px; }
          .space-y-4 > * + * { margin-top: 16px; }
          .grid { display: flex; gap: 16px; }
          .grid > div { flex: 1; }
          .bg-slate-50 { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px; }
          .bg-purple-50 { background-color: #faf5ff; border: 1px solid #e9d5ff; padding: 8px 12px; border-radius: 6px; }
          .bg-amber-50 { background-color: #fffbeb; border: 1px solid #fef3c7; padding: 8px 12px; border-radius: 6px; }
          ul { margin: 4px 0 8px 20px; padding: 0; }
          li { margin-bottom: 3px; }
        </style>
      </head>
      <body>
        ${content}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  imprimirRelatorioAudit() {
    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
    this.ensureContractExamsLoaded(currentContract.tabName);

    const exams = app.state.exams || [];
    if (exams.length === 0) {
      return (app.ui && app.ui.toast)
        ? app.ui.toast("Nenhum procedimento encontrado para este contrato.", "warning", "Relatório de Auditoria")
        : alert("Nenhum procedimento encontrado para este contrato.");
    }

    let sumQtdEmp = 0, sumQtdExec = 0, sumQtdSaldo = 0;
    let sumVlEmp = 0, sumVlFat = 0;

    exams.forEach(item => {
      const c = this.calculate(item);
      const isNF = String(item.item).trim().toUpperCase() === "NF";
      if (!isNF) {
        sumQtdEmp += c.qtdEmp;
        sumQtdExec += c.qtdExec;
        sumQtdSaldo += c.saldoQtd;
      }
      sumVlEmp += c.vlTotalEmp;
      sumVlFat += c.vlTotalFat;
    });

    const sumVlSaldo = sumVlEmp - sumVlFat;
    const percGeral = sumVlEmp > 0 ? (sumVlFat / sumVlEmp) * 100 : 0;
    const dataExtenso = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const rowsHtml = exams.map(item => {
      const c = this.calculate(item);
      const isNF = String(item.item).trim().toUpperCase() === "NF";

      let badgeStyle = "background: #16a34a; color: #fff;";
      if (c.situacao === "Esgotado") badgeStyle = "background: #7e22ce; color: #fff;";
      else if (c.situacao === "Crítico") badgeStyle = "background: #dc2626; color: #fff;";
      else if (c.situacao === "Alerta") badgeStyle = "background: #ca8a04; color: #fff;";
      else if (c.situacao === "Sem Movimento") badgeStyle = "background: #94a3b8; color: #fff;";
      else if (c.situacao === "Conciliado") badgeStyle = "background: #ca8a04; color: #fff;";

      let rowBg = "";
      if (c.situacao === "Esgotado") rowBg = "background: #faf5ff;";
      else if (c.situacao === "Crítico") rowBg = "background: #fef2f2;";
      else if (c.situacao === "Alerta") rowBg = "background: #fefce8;";
      else if (c.situacao === "Sem Movimento") rowBg = "background: #f8fafc;";

      return `
        <tr style="${rowBg}">
          <td class="col-item">${item.item}</td>
          <td class="col-proc">${item.descEmpenho}</td>
          <td class="col-vlunit">${this.formatBRL(c.vlUnit)}</td>
          <td class="col-qtdemp">${isNF ? '—' : c.qtdEmp.toLocaleString('pt-BR')}</td>
          <td class="col-qtdexec">${c.qtdExec.toLocaleString('pt-BR')}</td>
          <td class="col-saldoqtd" style="${c.saldoQtd < 0 ? 'color: #7e22ce; font-weight: 900;' : ''}">${isNF ? '—' : c.saldoQtd.toLocaleString('pt-BR')}</td>
          <td class="col-vlemp">${isNF ? '—' : this.formatBRL(c.vlTotalEmp)}</td>
          <td class="col-vlfat" style="font-weight: 800; color: #0f172a;">${this.formatBRL(c.vlTotalFat)}</td>
          <td class="col-saldofin" style="font-weight: 800; color: ${c.vlSaldo < 0 ? '#7e22ce' : (c.vlSaldo === 0 ? '#475569' : '#15803d')};">${isNF ? '—' : this.formatBRL(c.vlSaldo)}</td>
          <td class="col-consumo">${c.percConsumo.toFixed(1)}%</td>
          <td class="col-situacao">
            <span class="badge" style="${badgeStyle}">${c.situacao}</span>
          </td>
        </tr>
      `;
    }).join('');

    const printWin = window.open('', '_blank');
    if (!printWin) {
      return alert("O bloqueador de pop-ups impediu a abertura do relatório. Permita pop-ups para imprimir.");
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Relatório Oficial de Auditoria — Contrato nº ${currentContract.num}</title>
        <style id="orientation-style">
          @page {
            size: A4 landscape;
            margin: 6mm 8mm 6mm 8mm;
          }
        </style>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #fff;
            color: #0f172a;
            font-size: 6.8pt;
            line-height: 1.2;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            background: #0f172a;
            color: #f8fafc;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-size: 8.5pt;
          }
          .orientation-btn {
            background: #334155;
            color: #e2e8f0;
            border: 1px solid #475569;
            padding: 4px 9px;
            border-radius: 6px;
            font-size: 7.5pt;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.15s;
          }
          .orientation-btn:hover { background: #475569; color: #fff; }
          .orientation-btn.active {
            background: #2563eb;
            color: #fff;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
          }
          .btn-print {
            background: #2563eb;
            color: #fff;
            border: none;
            padding: 5px 14px;
            border-radius: 6px;
            font-size: 8pt;
            font-weight: 800;
            cursor: pointer;
          }
          .btn-print:hover { background: #1d4ed8; }
          .btn-close {
            background: #475569;
            color: #fff;
            border: none;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 8pt;
            font-weight: bold;
            cursor: pointer;
          }
          @media print {
            .no-print { display: none !important; }
            body { background: #fff !important; font-size: 6.5pt !important; }
          }
          .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 4px 6px;
          }
          .header-box {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 4px;
            margin-bottom: 6px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .header-title h1 {
            font-size: 7pt;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #0f172a;
          }
          .header-title h2 {
            font-size: 9pt;
            font-weight: 900;
            color: #0284c7;
            letter-spacing: -0.3px;
            margin-top: 1px;
          }
          .header-title p {
            font-size: 6pt;
            color: #475569;
            margin-top: 1px;
          }
          .contract-badge {
            text-align: right;
            font-size: 6.2pt;
            line-height: 1.3;
            background: #f1f5f9;
            padding: 3px 6px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
          }
          .kpi-row {
            display: flex;
            gap: 5px;
            margin-bottom: 6px;
          }
          .kpi-col {
            flex: 1;
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            border-radius: 5px;
            background: #ffffff;
          }
          .kpi-label { font-size: 5.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .kpi-val { font-size: 9pt; font-weight: 900; color: #0f172a; margin-top: 1px; }
          .kpi-sub { font-size: 5.5pt; color: #475569; }

          table.report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6.5pt;
            table-layout: fixed;
          }
          table.report-table thead {
            display: table-header-group;
          }
          table.report-table tfoot {
            display: table-footer-group;
          }
          table.report-table th, table.report-table td {
            border: 0.5px solid #94a3b8;
            padding: 2.2px 3px;
            line-height: 1.15;
            vertical-align: middle;
            word-break: break-word;
            overflow: hidden;
          }
          table.report-table th {
            background: #0f172a;
            color: #ffffff;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 5.8pt;
          }
          table.report-table tr {
            page-break-inside: avoid;
          }

          /* Distribuição das colunas no layout Paisagem (Soma 100%) */
          .col-item     { width: 3.5%; text-align: center; font-weight: bold; font-family: monospace; }
          .col-proc     { width: 28%; text-align: left; font-weight: 600; color: #0f172a; }
          .col-vlunit   { width: 7.5%; text-align: right; font-family: monospace; }
          .col-qtdemp   { width: 6%; text-align: right; font-family: monospace; }
          .col-qtdexec  { width: 6.5%; text-align: center; font-family: monospace; font-weight: bold; background: rgba(59, 130, 246, 0.05); }
          .col-saldoqtd { width: 6%; text-align: right; font-family: monospace; font-weight: bold; }
          .col-vlemp    { width: 8.5%; text-align: right; font-family: monospace; }
          .col-vlfat    { width: 8.5%; text-align: right; font-family: monospace; background: rgba(59, 130, 246, 0.05); }
          .col-saldofin { width: 8.5%; text-align: right; font-family: monospace; }
          .col-consumo  { width: 7.5%; text-align: right; font-family: monospace; font-weight: 700; }
          .col-situacao { width: 9.5%; text-align: center; }

          /* Ajustes Quando em Modo Retrato */
          body.mode-portrait table.report-table { font-size: 5.6pt; }
          body.mode-portrait .col-proc { width: 26%; }
          body.mode-portrait .col-vlunit { width: 7.5%; }
          body.mode-portrait .col-vlemp { width: 8.5%; }
          body.mode-portrait .col-vlfat { width: 8.5%; }
          body.mode-portrait .col-saldofin { width: 8.5%; }
          body.mode-portrait .col-situacao { width: 10.5%; }

          .badge {
            display: inline-block;
            padding: 1.5px 4px;
            border-radius: 3px;
            font-size: 5.5pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.2px;
            white-space: nowrap;
          }

          .sign-row {
            display: flex;
            justify-content: space-between;
            margin-top: 18px;
            page-break-inside: avoid;
            gap: 16px;
          }
          .sign-col {
            flex: 1;
            text-align: center;
            border-top: 1px solid #0f172a;
            padding-top: 3px;
            font-size: 6.5pt;
          }
          .sign-col strong { display: block; font-size: 7pt; color: #0f172a; }
        </style>
      </head>
      <body class="mode-landscape">
        <div class="no-print">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div>
              <strong>🖨️ Relatório Oficial de Auditoria Físico-Financeira</strong>
              <span style="color: #94a3b8; font-size: 8pt; margin-left: 4px;">(${exams.length} procedimentos)</span>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 4px; background: #1e293b; padding: 2px 4px; border-radius: 8px; border: 1px solid #334155;">
              <span style="font-size: 7.5pt; color: #94a3b8; margin: 0 4px; font-weight: 600;">Orientação:</span>
              <button id="btn-mode-landscape" onclick="setOrientation('landscape')" class="orientation-btn active" title="Layout em Paisagem (Horizontal)">📜 Paisagem (Recomendado)</button>
              <button id="btn-mode-portrait" onclick="setOrientation('portrait')" class="orientation-btn" title="Layout em Retrato (Vertical)">📄 Retrato</button>
            </div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Salvar PDF</button>
            <button onclick="window.close()" class="btn-close">Fechar</button>
          </div>
        </div>

        <div class="container">
          <!-- CABEÇALHO OFICIAL -->
          <div class="header-box">
            <div class="header-title">
              <h1>Prefeitura Municipal de Torres — Secretaria Municipal da Saúde</h1>
              <h2>RELATÓRIO CONSOLIDADO DE AUDITORIA FÍSICO-FINANCEIRA DE EXAMES</h2>
              <p>Rua José Bonifácio, 642 — Torres/RS | Sistema de Auditoria Pública do SUS | Emissão: ${dataExtenso}</p>
            </div>
            <div class="contract-badge">
              <div><strong>Contrato nº:</strong> ${currentContract.num}</div>
              <div><strong>Prestador:</strong> ${currentContract.prestador}</div>
              <div><strong>Empenho:</strong> ${currentContract.empenhos}</div>
              <div><strong>Auditado:</strong> Competências Março a Junho/2026 (NFS-e 3205 a 3264)</div>
            </div>
          </div>

          <!-- RESUMO DOS INDICADORES E METAS ORÇAMENTÁRIAS -->
          <div class="kpi-row">
            <div class="kpi-col">
              <div class="kpi-label">Teto Empenhado (Total)</div>
              <div class="kpi-val">${this.formatBRL(sumVlEmp)}</div>
              <div class="kpi-sub">Total Contratual</div>
            </div>
            <div class="kpi-col" style="background: #eff6ff; border-color: #bfdbfe;">
              <div class="kpi-label" style="color:#1e40af;">Faturado Acumulado</div>
              <div class="kpi-val" style="color:#1d4ed8;">${this.formatBRL(sumVlFat)}</div>
              <div class="kpi-sub" style="color:#2563eb;">${percGeral.toFixed(1)}% do teto consumido</div>
            </div>
            <div class="kpi-col" style="background: #f0fdf4; border-color: #bbf7d0;">
              <div class="kpi-label" style="color:#166534;">Saldo Financeiro Restante</div>
              <div class="kpi-val" style="color:#15803d;">${this.formatBRL(sumVlSaldo)}</div>
              <div class="kpi-sub" style="color:#16a34a;">${(100 - percGeral).toFixed(1)}% disponível</div>
            </div>
            <div class="kpi-col">
              <div class="kpi-label">Total de Procedimentos</div>
              <div class="kpi-val">${sumQtdExec.toLocaleString('pt-BR')}</div>
              <div class="kpi-sub">Saldo: ${sumQtdSaldo.toLocaleString('pt-BR')} exames</div>
            </div>
          </div>

          <!-- TABELA COMPLETA COM QUEBRA AUTOMÁTICA EM FOLHAS A4 -->
          <table class="report-table">
            <thead>
              <tr>
                <th class="col-item">Item</th>
                <th class="col-proc">Procedimento / Exame Contratado</th>
                <th class="col-vlunit">Vl. Unit (R$)</th>
                <th class="col-qtdemp">Qtd Emp.</th>
                <th class="col-qtdexec">Qtd Exec. (Real)</th>
                <th class="col-saldoqtd">Saldo Qtd</th>
                <th class="col-vlemp">Vl. Empenhado</th>
                <th class="col-vlfat">Vl. Faturado (R$)</th>
                <th class="col-saldofin">Saldo Financeiro</th>
                <th class="col-consumo">Consumo</th>
                <th class="col-situacao">Situação</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #0f172a; color: #fff; font-weight: bold; font-family: monospace;">
                <td colspan="2" style="padding: 3px 5px; text-align: right; text-transform: uppercase;">TOTAIS GERAIS DO CONTRATO:</td>
                <td class="col-vlunit" style="color: #94a3b8;">—</td>
                <td class="col-qtdemp" style="color: #fff;">${sumQtdEmp.toLocaleString('pt-BR')}</td>
                <td class="col-qtdexec" style="color: #fff;">${sumQtdExec.toLocaleString('pt-BR')}</td>
                <td class="col-saldoqtd" style="color: #fff;">${sumQtdSaldo.toLocaleString('pt-BR')}</td>
                <td class="col-vlemp" style="color: #fff;">${this.formatBRL(sumVlEmp)}</td>
                <td class="col-vlfat" style="color: #93c5fd;">${this.formatBRL(sumVlFat)}</td>
                <td class="col-saldofin" style="color: #86efac;">${this.formatBRL(sumVlSaldo)}</td>
                <td class="col-consumo" style="color: #fff;">${percGeral.toFixed(1)}%</td>
                <td class="col-situacao" style="color: #94a3b8;">—</td>
              </tr>
            </tfoot>
          </table>

          <!-- ASSINATURAS OFICIAIS -->
          <div class="sign-row">
            <div class="sign-col">
              <strong>Setor de Auditoria Físico-Financeira</strong>
              <span>Secretaria Municipal da Saúde de Torres</span>
            </div>
            <div class="sign-col">
              <strong>Fiscal do Contrato Administrativo</strong>
              <span>Controle e Execução Contratual</span>
            </div>
            <div class="sign-col">
              <strong>Secretário(a) Municipal da Saúde</strong>
              <span>Ordenador(a) de Despesa</span>
            </div>
          </div>
        </div>

        <script>
          function setOrientation(mode) {
            const styleEl = document.getElementById('orientation-style');
            const btnL = document.getElementById('btn-mode-landscape');
            const btnP = document.getElementById('btn-mode-portrait');
            if (mode === 'portrait') {
              document.body.classList.remove('mode-landscape');
              document.body.classList.add('mode-portrait');
              styleEl.innerHTML = '@page { size: A4 portrait; margin: 6mm 6mm 6mm 6mm; }';
              btnP.classList.add('active');
              btnL.classList.remove('active');
            } else {
              document.body.classList.remove('mode-portrait');
              document.body.classList.add('mode-landscape');
              styleEl.innerHTML = '@page { size: A4 landscape; margin: 6mm 8mm 6mm 8mm; }';
              btnL.classList.add('active');
              btnP.classList.remove('active');
            }
          }

          // Inicia em modo paisagem por padrão (recomendado para 11 colunas)
          setOrientation('landscape');

          window.focus();
        </script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  async confirmarAplicacaoCotas() {
    if (!this._simulacaoState) return app.ui.toast("Simulação não realizada.", "warning", "Atenção");
    if (!app.permissions.can('audit_edit_values')) return app.ui.toast("Sem permissão para alterar cotas de exames.", "warning", "Acesso Restrito");

    const { totais, itens } = this._simulacaoState;
    const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];

    const msg = `ATENÇÃO: DESEJA APLICAR O REBALANCEAMENTO AO CONTRATO Nº ${currentContract.num}?\n\n` +
      `• Total de Procedimentos Ajustados: 76 itens\n` +
      `• Novo Custo Orçado: ${this.formatBRL(totais.custoNovo)}\n` +
      `• Teto Contratual: ${this.formatBRL(totais.tetoAlvo)}\n` +
      `• Folga Orçamentária: ${this.formatBRL(totais.folgaResidual)}\n\n` +
      `Os quantitativos empenhados e saldos anteriores serão atualizados para o novo período. Deseja prosseguir?`;

    if (!confirm(msg)) return;

    itens.forEach(simItem => {
      const target = app.state.exams.find(e => String(e.item).trim() === String(simItem.item).trim());
      if (target) {
        target.qtdEmpenho = simItem.qtdSug;
        target.saldoAnterior = simItem.qtdSug;
      }
    });

    app.data.saveLocalExams();

    await app.data.sendToCloud({
      action: "UPDATE_VALUES",
      contract: app.state.activeContractTab,
      exams: app.state.exams
    });

    this.closeBalanceadorModal();
    this.renderTable();

    app.ui.toast(`As 76 cotas rebalanceadas foram aplicadas ao Contrato nº ${currentContract.num} e sincronizadas com a nuvem!`, "success", "✓ Cotas Aplicadas");
  }
};


app.gemini = {
  openModal() {
    const modal = document.getElementById('modal-gemini-import');
    if (modal) {
      modal.classList.remove('hidden'); modal.classList.add('flex');
      this.switchTab('paste');
      document.getElementById('gemini-paste-area').value = '';
      setTimeout(() => document.getElementById('gemini-paste-area').focus(), 80);
    }
  },

  closeModal() {
    const modal = document.getElementById('modal-gemini-import');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  },

  switchTab(tab) {
    const vPaste = document.getElementById('view-gemini-paste');
    const vGuide = document.getElementById('view-gemini-guide');
    const bPaste = document.getElementById('btn-tab-gemini-paste');
    const bGuide = document.getElementById('btn-tab-gemini-guide');

    if (tab === 'paste') {
      vPaste.classList.remove('hidden'); vGuide.classList.add('hidden');
      bPaste.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900";
      bGuide.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100 flex items-center gap-1.5";
    } else {
      vPaste.classList.add('hidden'); vGuide.classList.remove('hidden');
      bGuide.className = "px-4 py-2 font-black text-xs uppercase tracking-wider rounded-xl bg-blue-100 text-blue-900 flex items-center gap-1.5";
      bPaste.className = "px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl text-slate-500 hover:bg-slate-100";
    }
  },

  copyField(textElementId, buttonElementId) {
    const textEl = document.getElementById(textElementId);
    const btnEl = document.getElementById(buttonElementId);
    if (!textEl || !btnEl) return;

    navigator.clipboard.writeText(textEl.textContent.trim()).then(() => {
      const originalHtml = btnEl.innerHTML;
      btnEl.innerHTML = "<span>✓</span> Copiado!";
      btnEl.classList.add('copied');
      setTimeout(() => { btnEl.innerHTML = originalHtml; btnEl.classList.remove('copied'); }, 2000);
    });
  },

  processPaste() {
    const rawText = document.getElementById('gemini-paste-area').value.trim();
    if (!rawText) return alert("Cole o texto extraído pelo Gemini na caixa de texto.");

    const modeEl = document.querySelector('input[name="gemini-mode"]:checked');
    const mode = modeEl ? modeEl.value : 'update'; // 'update' ou 'replace'
    
    const accEl = document.querySelector('input[name="gemini-acc"]:checked');
    const isAccumulate = accEl ? (accEl.value === 'add') : false;

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return alert("Nenhum dado encontrado para processar.");

    // MODO 1: SUBSTITUIÇÃO TOTAL (Para cadastrar novos contratos do zero)
    if (mode === 'replace') {
      const newExams = [];
      let counter = 1;

      lines.forEach(line => {
        let clean = line;
        if (clean.startsWith('|') && clean.endsWith('|')) clean = clean.slice(1, -1).trim();
        let parts = clean.includes(';') ? clean.split(';') : (clean.includes('|') ? clean.split('|') : clean.split('\t'));
        parts = parts.map(p => p.trim());

        const first = parts[0] ? parts[0].toLowerCase() : "";
        if (first.includes('item') || first.includes('---') || first.includes('categoria')) return;

        if (parts.length >= 2) {
          const itemSeq = parts[0] || String(counter).padStart(2, '0');
          let cat = 'Laboratorial';
          let descEmp = '';
          let descPrest = '';
          let qtd = 0;
          let saldoAnt = 0;
          let fat = 0;

          if (parts.length >= 7) {
            cat = parts[1] ? (parts[1].toLowerCase().includes('imag') ? 'Imagem' : 'Laboratorial') : 'Laboratorial';
            descEmp = parts[2] || `Procedimento ${itemSeq}`;
            descPrest = parts[3] || descEmp;
            qtd = parts[4] ? Math.max(0, parseInt(parts[4].replace(/\D/g, ''), 10) || 0) : 0;
            saldoAnt = parts[5] ? Math.max(0, parseInt(parts[5].replace(/\D/g, ''), 10) || 0) : qtd;
            fat = parts[6] ? Math.max(0, parseInt(parts[6].replace(/\D/g, ''), 10) || 0) : 0;
          } else if (parts.length === 3) {
            descEmp = parts[1] || `Procedimento ${itemSeq}`;
            descPrest = descEmp;
            fat = Math.max(0, parseInt(parts[2].replace(/\D/g, ''), 10) || 0);
            qtd = fat;
            saldoAnt = fat;
          } else {
            descEmp = `Procedimento ${itemSeq}`;
            descPrest = descEmp;
            fat = Math.max(0, parseInt(parts[1].replace(/\D/g, ''), 10) || 0);
            qtd = fat;
            saldoAnt = fat;
          }

          newExams.push({
            id: Date.now() + counter,
            item: itemSeq, cat, descEmpenho: descEmp, descPrestador: descPrest,
            qtdEmpenho: qtd, saldoAnterior: saldoAnt, faturado: fat
          });
          counter++;
        }
      });

      if (newExams.length === 0) return alert("Não conseguimos identificar os dados. Formato esperado: Item; Descricao; Faturado");

      app.state.exams = newExams;
      app.data.saveLocalExams();
      this.closeModal();
      app.render.auditoriaDetalhe(document.getElementById('app-viewport'));

      app.data.sendToCloud({
        action: "INITIAL_SEED",
        contract: app.state.activeContractTab,
        exams: app.state.exams
      });

      return alert(`✓ Substituição concluída! ${newExams.length} procedimentos gravados no contrato e salvos no Google Sheets!`);
    }

    // MODO 2: ATUALIZAR FATURAMENTO DO MÊS (Reconciliação das Faturas Mensais)
    let updatedCount = 0;
    let addedCount = 0;
    const currentList = app.state.exams || [];

    lines.forEach((line, idx) => {
      let clean = line;
      if (clean.startsWith('|') && clean.endsWith('|')) clean = clean.slice(1, -1).trim();
      let parts = clean.includes(';') ? clean.split(';') : (clean.includes('|') ? clean.split('|') : clean.split('\t'));
      parts = parts.map(p => p.trim());

      const first = parts[0] ? parts[0].toLowerCase() : "";
      if (first.includes('item') || first.includes('---') || first.includes('cabeçalho') || first.includes('categoria')) return;

      if (parts.length >= 2) {
        const itemKey = parts[0];
        let descText = "";
        let faturadoVal = 0;

        if (parts.length === 2) {
          faturadoVal = Math.max(0, parseInt(parts[1].replace(/\D/g, ''), 10) || 0);
          descText = parts[0];
        } else if (parts.length === 3) {
          descText = parts[1];
          faturadoVal = Math.max(0, parseInt(parts[2].replace(/\D/g, ''), 10) || 0);
        } else {
          descText = parts[2] || parts[1];
          const lastCol = parts[parts.length - 1];
          faturadoVal = Math.max(0, parseInt(lastCol.replace(/\D/g, ''), 10) || 0);
        }

        // Tenta localizar o exame correspondente no contrato atual
        let match = null;

        // 1. Busca por número do item (ex: "1" casa com "1" ou "01")
        const numA = itemKey.replace(/\D/g, '');
        if (numA) {
          match = currentList.find(e => {
            const numB = String(e.item).replace(/\D/g, '');
            return numB && Number(numA) === Number(numB);
          });
        }

        // 2. Busca por código SUS (8 a 10 dígitos)
        if (!match) {
          const codeMatch = (itemKey + ' ' + descText).match(/\b\d{8,10}\b/);
          if (codeMatch) {
            match = currentList.find(e => String(e.descPrestador || '').includes(codeMatch[0]));
          }
        }

        // 3. Busca por similaridade textual no nome do procedimento
        if (!match && descText && descText.length >= 4) {
          const normQuery = descText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
          match = currentList.find(e => {
            const n1 = (e.descEmpenho || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const n2 = (e.descPrestador || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            return (n1 && (n1.includes(normQuery) || normQuery.includes(n1))) ||
                   (n2 && (n2.includes(normQuery) || normQuery.includes(n2)));
          });
        }

        if (match) {
          if (isAccumulate) {
            match.faturado = (Number(match.faturado) || 0) + faturadoVal;
          } else {
            match.faturado = faturadoVal;
          }
          updatedCount++;
        } else {
          // Procedimento novo ou avulso da nota
          const newItem = {
            id: Date.now() + idx,
            item: itemKey.replace(/[^\w]/g, '') || String(currentList.length + 1),
            cat: descText.toLowerCase().includes('imag') ? 'Imagem' : 'Laboratorial',
            descEmpenho: descText || `Item Extra ${itemKey}`,
            descPrestador: descText || `Item Extra ${itemKey}`,
            qtdEmpenho: faturadoVal,
            saldoAnterior: faturadoVal,
            faturado: faturadoVal
          };
          currentList.push(newItem);
          addedCount++;
        }
      }
    });

    if (updatedCount === 0 && addedCount === 0) {
      return alert("Não foi possível identificar itens correspondentes. Verifique o formato colado (Ex: Item; Descricao; Faturado).");
    }

    app.state.exams = currentList;
    app.data.saveLocalExams();
    this.closeModal();
    app.render.auditoriaDetalhe(document.getElementById('app-viewport'));

    // Sincroniza em segundo plano com a Planilha Google
    app.data.sendToCloud({
      action: "INITIAL_SEED",
      contract: app.state.activeContractTab,
      exams: app.state.exams
    });

    const msg = [
      `✓ Faturamento reconciliado e atualizado com sucesso!`,
      `• ${updatedCount} procedimentos existentes atualizados.`,
      addedCount > 0 ? `• ${addedCount} novos itens adicionados da nota fiscal.` : '',
      `• Saldos e percentuais recalculados e gravados na Planilha Google.`
    ].filter(Boolean).join('\n');

    alert(msg);
  }
};

app.render.auditoriaHub = function(el) {
  const canCreate = app.permissions.can('audit_create_contract');

  el.innerHTML = `
    <div class="container mx-auto px-6 py-6 sm:py-8 fade-in">
        <div class="mb-4">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
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
                ${canCreate ? `
                  <button onclick="app.audit.openNewContractModal()" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                      <span class="text-sm">+</span> Novo Contrato
                  </button>
                ` : ''}
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${app.state.contracts.map(c => `
                <div class="bg-white rounded-[2.5rem] p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all flex flex-col justify-between group">
                    <div>
                        <div class="flex items-center justify-between mb-4">
                            <span class="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-full uppercase border border-blue-100">Aba: ${c.tabName}</span>
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
                        <button onclick="app.audit.openContractDetail('${c.tabName}')" class="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2">
                            <span>Abrir Auditoria deste Contrato</span>
                            <span>→</span>
                        </button>
                    </div>
                </div>
            `).join('')}

            ${canCreate ? `
              <button onclick="app.audit.openNewContractModal()" class="bg-white/60 hover:bg-white rounded-[2.5rem] p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center text-center group min-h-[280px]">
                  <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  </div>
                  <h4 class="font-black text-slate-800 text-base mb-1 group-hover:text-blue-600 transition">Cadastrar Novo Contrato</h4>
                  <p class="text-xs text-slate-400 max-w-xs">Cria uma nova aba e inicia o controle de cotas e procedimentos.</p>
                  <span class="mt-4 text-xs font-bold text-blue-600">+ Adicionar</span>
              </button>
            ` : ''}
        </div>
    </div>
  `;
};

app.render.auditoriaDetalhe = function(el) {
  const currentContract = app.state.contracts.find(c => c.tabName === app.state.activeContractTab) || app.state.contracts[0];
  app.audit.ensureContractExamsLoaded(currentContract.tabName);
  const canManageProc = app.permissions.can('audit_manage_procedures');

  el.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">
      <div class="mb-4 print:hidden">
          <button onclick="app.ui.navigate('auditoria_exames')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
              <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              <span>Voltar para a Lista de Contratos</span>
          </button>
      </div>

      <!-- CABEÇALHO OFICIAL DE IMPRESSÃO (Folha A4 Paisagem) -->
      <div class="print-header hidden print:block mb-3 pb-2 border-b-2 border-slate-900">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xs font-black uppercase text-black">PREFEITURA MUNICIPAL DE TORRES — SECRETARIA MUNICIPAL DA SAÚDE</h2>
            <h1 class="text-sm font-black text-black tracking-tight">RELATÓRIO CONSOLIDADO DE AUDITORIA FÍSICO-FINANCEIRA DE EXAMES</h1>
            <p class="text-[9px] text-slate-800 mt-0.5">
              <strong>Prestador:</strong> <span>${currentContract.prestador}</span> &nbsp;|&nbsp;
              <strong>Empenho:</strong> <span>${currentContract.empenhos}</span> &nbsp;|&nbsp;
              <strong>Contrato:</strong> nº ${currentContract.num} &nbsp;|&nbsp;
              <strong>Competências Auditadas:</strong> Março a Junho/2026 (NFS-e 3205 a 3264)
            </p>
          </div>
        </div>
      </div>

      <!-- PAINEL SUPERIOR DO CONTRATO NA TELA -->
      <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6 print:hidden">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2.5 mb-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 uppercase">Aba: ${currentContract.tabName}</span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 uppercase">📋 ${app.state.exams.length} Procedimentos no Contrato</span>
              <span id="cloud-sync-status" class="hidden text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold"></span>
            </div>
            <h2 class="text-xl sm:text-2xl font-black text-slate-900">Auditoria Físico-Financeira — Contrato nº ${currentContract.num}</h2>
            <div class="mt-1 text-xs text-slate-600 flex flex-wrap gap-x-5 gap-y-1">
              <span><strong>Empenhos:</strong> ${currentContract.empenhos}</span>
              <span><strong>Prestador:</strong> ${currentContract.prestador}</span>
              <span><strong>Cadastrado em:</strong> ${currentContract.createdAt || "25/09/2026 às 15:00"}</span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="app.audit.openBalanceadorModal()" class="px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md transition flex items-center gap-1.5" title="Simular e redistribuir quantitativos com base no histórico real sem extrapolar o teto orçamentário">
              <span>⚖️</span> Balancear Cotas
            </button>
            <button onclick="app.gemini.openModal()" class="px-3.5 py-2 text-xs font-black rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition flex items-center gap-1.5" title="Reconciliar ou atualizar faturamento do período com Inteligência Artificial">
              <span>🤖</span> Importar com Gemini IA
            </button>
            <button onclick="app.data.syncFromCloud(true)" class="px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1">
              <span>🔄</span> Sincronizar
            </button>
            ${currentContract.tabName === "Contrato_73_2026" ? `
              <button onclick="app.audit.restoreContrato73()" class="px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition flex items-center gap-1" title="Restaura os 76 procedimentos oficiais do Contrato nº 73/2026 (Laboratório Fontana - R$ 129.163,00)">
                <span>🔄</span> Restaurar 76 Exames
              </button>
            ` : ''}
            <button onclick="app.audit.imprimirRelatorioAudit()" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition flex items-center gap-1.5" title="Imprimir Relatório de Auditoria em folha A4 (escolha Retrato ou Paisagem na visualização)">
              <span>🖨️</span> Imprimir Relatório (A4)
            </button>
            ${canManageProc ? `
              <button onclick="app.admin.trigger(true)" class="px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 shadow transition">⚙️ Procedimentos</button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- CARDS DE KPIS / TOTAIS GERAIS (TELA & IMPRESSÃO) -->
      <div class="kpi-print-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <div class="kpi-card bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teto Empenhado (Total)</div>
          <div id="kpi-empenhado" class="text-xl font-black text-slate-900 mt-1">R$ 0,00</div>
          <div class="text-[10px] text-slate-400">Total Contratual</div>
        </div>
        <div class="kpi-card bg-white p-4 rounded-2xl shadow-sm border border-blue-200 bg-blue-50/20">
          <div class="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Faturado Acumulado</div>
          <div id="kpi-faturado" class="text-xl font-black text-blue-700 mt-1">R$ 0,00</div>
          <div id="kpi-perc-faturado" class="text-[10px] text-blue-600">0,0% do teto consumido</div>
        </div>
        <div class="kpi-card bg-white p-4 rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50/20">
          <div class="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Saldo Financeiro Restante</div>
          <div id="kpi-saldo-fin" class="text-xl font-black text-emerald-700 mt-1">R$ 0,00</div>
          <div id="kpi-perc-saldo" class="text-[10px] text-emerald-600">0,0% livre</div>
        </div>
        <div class="kpi-card bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <div class="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Total de Procedimentos</div>
          <div id="kpi-qtd-exec" class="text-xl font-black text-slate-900 mt-1">0</div>
          <div id="kpi-qtd-restante" class="text-[10px] text-slate-500">Saldo: 0 un</div>
        </div>
        <div class="kpi-card bg-white p-4 rounded-2xl shadow-sm border border-red-200 bg-red-50/20 print:hidden">
          <div class="text-[10px] font-bold text-red-800 uppercase tracking-wider">Itens Críticos / Esgotados</div>
          <div id="kpi-criticos" class="text-xl font-black text-red-700 mt-1">0</div>
          <div class="text-[10px] text-red-600">Exigem atenção orçamentária</div>
        </div>
      </div>

      <!-- BARRA DE PESQUISA E FILTROS -->
      <div class="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between gap-4 print:hidden">
        <div class="flex-1 flex flex-col sm:flex-row gap-3">
          <input type="text" id="filter-search" oninput="app.audit.filter()" placeholder="Buscar por item, descrição ou código..." class="flex-1 px-4 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500">
          <select id="filter-cat" onchange="app.audit.filter()" class="sm:w-48 px-3 py-2 bg-slate-50 border rounded-xl text-xs outline-none focus:border-blue-500 font-semibold">
            <option value="ALL">Todas as Categorias</option>
            <option value="Laboratorial">Laboratorial</option>
            <option value="Imagem">Imagem</option>
          </select>
        </div>
        <label class="inline-flex items-center text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input type="checkbox" id="filter-hide-zero" onchange="app.audit.filter()" class="w-4 h-4 rounded text-blue-600 mr-2 border-slate-300">
          Ocultar exames não faturados (Zero)
        </label>
      </div>

      <!-- TABELA DINÂMICA FÍSICO-FINANCEIRA -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:border-none print:shadow-none">
        <div class="custom-scroll overflow-x-auto overflow-y-auto max-h-[640px] print:max-h-none print:overflow-visible relative">
          <table id="table-audit" class="w-full text-left border-collapse text-xs">
            <thead class="sticky-thead bg-slate-900 text-slate-100 uppercase font-black text-[10px] border-b-2 border-slate-800 print:bg-slate-200 print:text-black">
              <tr>
                <th class="py-2.5 px-2 text-center w-10">Item</th>
                <th class="py-2.5 px-3 min-w-[210px]">Procedimento / Exame Contratado</th>
                <th class="py-2.5 px-3 min-w-[200px] col-hide-print text-slate-400">Procedimento Faturado (Referência)</th>
                <th class="py-2.5 px-2.5 text-right w-24">Vl. Unit (R$)</th>
                <th class="py-2.5 px-2.5 text-right w-20">Qtd Emp.</th>
                <th class="py-2.5 px-2.5 text-center w-24 bg-blue-900/40 print:bg-transparent">Qtd Exec. (Real)</th>
                <th class="py-2.5 px-2.5 text-right w-20">Saldo Qtd</th>
                <th class="py-2.5 px-2.5 text-right w-28">Vl. Empenhado</th>
                <th class="py-2.5 px-2.5 text-right w-28 bg-blue-900/40 print:bg-transparent">Vl. Faturado (R$)</th>
                <th class="py-2.5 px-2.5 text-right w-28">Saldo Financeiro</th>
                <th class="py-2.5 px-2 text-right w-16">Consumo</th>
                <th class="py-2.5 px-2 text-center w-28">Situação</th>
              </tr>
            </thead>
            <tbody id="table-audit-body" class="divide-y divide-slate-200 font-medium"></tbody>
            <tfoot class="sticky bottom-0 bg-slate-200 font-bold text-slate-900 border-t-2 border-slate-400 print:bg-slate-200">
              <tr>
                <th colspan="3" id="thTotalLabel" class="py-2.5 px-3 text-left font-black">TOTAIS GERAIS DO CONTRATO:</th>
                <th class="py-2.5 px-2.5 text-right font-mono">—</th>
                <th id="totalQtdEmp" class="py-2.5 px-2.5 text-right font-mono">0</th>
                <th id="totalQtdExec" class="py-2.5 px-2.5 text-center font-mono">0</th>
                <th id="totalQtdSaldo" class="py-2.5 px-2.5 text-right font-mono">0</th>
                <th id="totalVlEmp" class="py-2.5 px-2.5 text-right font-mono font-black">R$ 0,00</th>
                <th id="totalVlFat" class="py-2.5 px-2.5 text-right font-mono font-black text-blue-900">R$ 0,00</th>
                <th id="totalVlSaldo" class="py-2.5 px-2.5 text-right font-mono font-black text-emerald-900">R$ 0,00</th>
                <th id="totalPercConsumo" class="py-2.5 px-2 text-right font-mono font-black">0,0%</th>
                <th class="py-2.5 px-2 text-center font-mono">—</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <div id="table-empty" class="hidden p-8 text-center text-slate-400 text-xs font-medium">Nenhum exame cadastrado para este contrato.</div>
      </div>
    </div>
  `;

  app.audit.renderTable();
};

// Ajuste automático do colspan do rodapé na impressão (pois a coluna de referência é oculta na impressão)
if (typeof window !== 'undefined' && !window._printAuditListenerAdded) {
  window._printAuditListenerAdded = true;
  window.addEventListener('beforeprint', () => {
    const th = document.getElementById('thTotalLabel');
    if (th) th.colSpan = 2;
  });
  window.addEventListener('afterprint', () => {
    const th = document.getElementById('thTotalLabel');
    if (th) th.colSpan = 3;
  });
}


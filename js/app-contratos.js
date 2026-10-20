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
  // PARSER UNIVERSAL DE DATAS (SUPORTA ISO, BR DD/MM/YYYY, DATA JS E DATAS EM TEXTO)
  parseAnyDate(val) {
    if (!val && val !== 0) return null;
    if (val instanceof Date) {
      if (!isNaN(val.getTime())) return new Date(val.getFullYear(), val.getMonth(), val.getDate());
      return null;
    }
    const s = String(val).trim();
    if (!s || s === 'S/N' || s === 'Em Aberto') return null;

    // 1. Padrão ISO YYYY-MM-DD
    const matchIso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (matchIso) {
      const y = parseInt(matchIso[1], 10);
      const m = parseInt(matchIso[2], 10) - 1;
      const d = parseInt(matchIso[3], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }

    // 2. Padrão BR DD/MM/YYYY no início
    const matchBr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchBr) {
      const d = parseInt(matchBr[1], 10);
      const m = parseInt(matchBr[2], 10) - 1;
      const y = parseInt(matchBr[3], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }

    // 3. Qualquer DD/MM/YYYY inserido em texto (ex: "Prorrogado até 26/09/2027" ou "12 Meses até 04/10/2026")
    const matchAnyBr = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (matchAnyBr) {
      const d = parseInt(matchAnyBr[1], 10);
      const m = parseInt(matchAnyBr[2], 10) - 1;
      const y = parseInt(matchAnyBr[3], 10);
      const dt = new Date(y, m, d);
      if (!isNaN(dt.getTime())) return dt;
    }

    // 4. Fallback Date.parse
    const parsed = new Date(s);
    if (!isNaN(parsed.getTime())) {
      return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }
    return null;
  },

  formatDateBr(dt) {
    if (!dt) return "";
    const d = this.parseAnyDate(dt);
    if (!d) return "";
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
  },

  formatDateIso(dt) {
    if (!dt) return "";
    const d = this.parseAnyDate(dt);
    if (!d) return "";
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${ano}-${mes}-${dia}`;
  },

  // FORMATA NÚMERO DE CONTRATO (BLINDAGEM CONTRA CONVERSÃO AUTOMÁTICA EM DATA DO SHEETS/JS)
  formatCttNumber(val) {
    if (!val && val !== 0) return "";
    if (val instanceof Date) {
      if (isNaN(val.getTime())) return "";
      const m = String(val.getMonth() + 1).padStart(2, '0');
      const y = val.getFullYear();
      return `${m}/${y}`;
    }
    const s = String(val).trim();
    if (s.includes("GMT") || (s.includes("00:00:00") && isNaN(Number(s)))) {
      const dt = new Date(s);
      if (!isNaN(dt.getTime())) {
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const y = dt.getFullYear();
        return `${m}/${y}`;
      }
    }
    return s;
  },

  // DETERMINA A DATA EFETIVA PARA NOTIFICAÇÕES E BANDEIRA DE COR
  // Regra do Usuário: Se 'Prazo de Renovação / Adição de contrato' estiver preenchido
  // (indicado pelo prefixo "Renovação:"), deve ser considerado para a notificação e
  // bandeira com a cor; caso contrário, utiliza o campo 'Vencimento do Contrato'.
  isRenovacaoPrazo(prazoStr) {
    const s = String(prazoStr || '').trim().toLowerCase();
    return s.startsWith('renovação:') || s.startsWith('renovacao:') || s.startsWith('adição:') || s.startsWith('adicao:');
  },

  getEffectiveDate(contract) {
    if (!contract) return null;

    const prazo = String(contract.prazoVencimento || '').trim();

    // Somente sobrescreve o Vencimento do Contrato se houver um Prazo de Renovação / Adição explícito
    if (this.isRenovacaoPrazo(prazo)) {
      // 1. Tenta extrair data explícita contida na renovação (ex: "Renovação: Até 30/09/2027" ou "Renovação: 12 Meses até 03/11/2027")
      const dtPrazo = this.parseAnyDate(prazo);
      if (dtPrazo) return dtPrazo;

      // 2. Se for um período em meses sem data final explícita
      const matchMeses = prazo.match(/(\d+)\s*m[eê]s/i);
      if (matchMeses) {
        const qtdMeses = parseInt(matchMeses[1], 10);
        const base = this.parseAnyDate(contract.dataVencimentoIso) || new Date();
        return new Date(base.getFullYear(), base.getMonth() + qtdMeses, base.getDate());
      }
    }

    // Caso contrário (Não Informado), utiliza sempre "Vencimento do Contrato"
    return this.parseAnyDate(contract.dataVencimentoIso);
  },

  // CALCULA O SEMÁFORO DE VENCIMENTOS COM BASE NA DATA ATUAL E NA REGRA DE PRIORIDADE
  calculateStatus(contractOrDate, statusRegistro, prazoVencimento) {
    let status = statusRegistro;
    let targetDate = null;

    if (typeof contractOrDate === 'object' && contractOrDate !== null && !(contractOrDate instanceof Date)) {
      status = contractOrDate.status;
      targetDate = this.getEffectiveDate(contractOrDate);
    } else {
      if (prazoVencimento) {
        targetDate = this.getEffectiveDate({ dataVencimentoIso: contractOrDate, prazoVencimento: prazoVencimento });
      } else {
        targetDate = this.parseAnyDate(contractOrDate);
      }
    }

    if (status === "Disponível") {
      return { label: "Espaço Vazio", badgeClass: "bg-slate-100 text-slate-500 border border-slate-300", isUrgente: false, isDisponivel: true, dias: null };
    }
    if (status === "Previsto") {
      return { label: "Em Elaboração", badgeClass: "bg-purple-100 text-purple-700 font-bold", isUrgente: false, isPrevisto: true, dias: null };
    }
    if (status === "Arquivado") {
      return { label: "Arquivado", badgeClass: "semaforo-arquivado", isUrgente: false, dias: null };
    }

    if (!targetDate || isNaN(targetDate.getTime())) {
      return { label: "Sem Data", badgeClass: "semaforo-atencao", isUrgente: false, dias: null };
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const venc = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    venc.setHours(0, 0, 0, 0);

    const diffTempo = venc.getTime() - hoje.getTime();
    const diasRestantes = Math.round(diffTempo / (1000 * 60 * 60 * 24));

    if (isNaN(diasRestantes)) {
      return { label: "Sem Data", badgeClass: "semaforo-atencao", isUrgente: false, dias: null };
    }

    if (diasRestantes < 0) {
      return { label: `Vencido há ${Math.abs(diasRestantes)} dias`, badgeClass: "semaforo-critico", isUrgente: true, dias: diasRestantes, dataEfetiva: venc };
    } else if (diasRestantes <= 30) {
      return { label: `Vence em ${diasRestantes} dias!`, badgeClass: "semaforo-critico", isUrgente: true, dias: diasRestantes, dataEfetiva: venc };
    } else if (diasRestantes <= 90) {
      return { label: `Atenção: ${diasRestantes} dias`, badgeClass: "semaforo-atencao", isUrgente: false, dias: diasRestantes, dataEfetiva: venc };
    } else {
      return { label: `Vigente (${diasRestantes} dias)`, badgeClass: "semaforo-vigente", isUrgente: false, dias: diasRestantes, dataEfetiva: venc };
    }
  },

  // BASE OFICIAL DOS CONTRATOS DO PAINEL DA SECRETARIA DA SAÚDE (ATUALIZADA COM TODAS AS EDIÇÕES MANUAIS ATÉ 19/10/2026)
  MURAL_AUDIT_DATA: [
    // --- QUADRO 1: MURAL PAREDE AZUL (Posições 1 a 19) ---
    { id: 1, empresa: "MEDENF IVOTI SERVIÇOS MÉDICOS E DE ENFERMAGEM", numeroCtt: "344/2025", prazoVencimento: "", dataVencimentoIso: "2027-09-26", valorContrato: 257664.00, fiscal: "FRAN", status: "Ativo", objeto: "Enfermagem", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "", linkContrato: "" },
    { id: 2, empresa: "PRECISÃO TRATAMENTO DE ÁGUA LTDA", numeroCtt: "297/2025", prazoVencimento: "", dataVencimentoIso: "2027-09-30", valorContrato: 7734.00, fiscal: "LASIER", status: "Ativo", objeto: "Tratamento de Água nas Unidades (PRESCISÃO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prorrogação à caneta até 30/09/2027; fiscal Lasier com anotação no mural", linkContrato: "" },
    { id: 3, empresa: "ELO SERVIÇOS DE SAÚDE LTDA", numeroCtt: "377/2024", prazoVencimento: "", dataVencimentoIso: "2027-10-04", valorContrato: 3747715.20, fiscal: "FRAN", status: "Ativo", objeto: "Gestão Médica Hospitalar (ELO SERVIÇOS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prestação de serviços médicos Clinico Geral (Atenção Básica) e Diretor Técnico - Média e Alta Complexidade.\nProcesso 18496/2026", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:13167_109" },
    { id: 4, empresa: "R. DIMER EMPREENDIMENTOS IMOBILIARIOS LTDA", numeroCtt: "539/2025", prazoVencimento: "", dataVencimentoIso: "2026-12-23", valorContrato: 93600.00, fiscal: "FERNANDA", status: "Ativo", objeto: "Locação de imóvel urbano destinado à instalação do Programa TEAcolhe RS", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "[diego em 15/10/2026 às 11:17]: Aluguel de R$7.800 menos 4,8% de IR ou R$ 7.425,60 pago todo o dia 22.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:16053_109" },
    { id: 5, empresa: "SILVIO FARIAS ALVES", numeroCtt: "203/2021", prazoVencimento: "", dataVencimentoIso: "2026-10-19", valorContrato: 49663.20, fiscal: "LASIER", status: "Arquivado", objeto: "LOCAÇÃO DE UM IMÓVEL. PARA USO DA VIGILÂNCIA SANITÁRIA E AMBIENTAL", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "[diego em 15/10/2026 às 10:50]: Aluguel Vigilância; fiscal Sandro. Pago para Silvano Tupinambá.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:9000_109" },
    { id: 6, empresa: "JVS CENTRO TERAPÊUTICO LTDA", numeroCtt: "142/2023", prazoVencimento: "", dataVencimentoIso: "2026-11-03", valorContrato: 107016.00, fiscal: "NAIARA", status: "Ativo", objeto: "Terapias Integradas e Multidisciplinares (JVS PLENO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "A Naiara está responsável por esta situação. Ela informou a Fernanda, no dia 16/10, que faltam os orçamentos. No entanto, como este caso é por Ordem Judicial, o paciente não sairá da clínica mesmo que o contrato vença.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:10141_109" },
    { id: 7, empresa: "AMPLAMAIS SERVIÇOS MÉDICOS LTDA", numeroCtt: "390/2025", prazoVencimento: "", dataVencimentoIso: "2026-11-03", valorContrato: 30684.06, fiscal: "SANDRO", status: "Ativo", objeto: "Serviços Médicos Especializados (AMPLA MAIS EXAMES)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Verifiquei a situação do contrato com a Vivian Réus e a renovação não será realizada. O motivo é que a empresa presta serviços de exames de imagem, área que atualmente conta com um credenciamento próprio de empresas.\nAlém disso, a Vivian informou que a empresa Ampla Mais é de Xangri-lá e já possui um empenho vigente.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15631_109" },
    { id: 8, empresa: "CARLOS DOS SANTOS TEIXEIRA", numeroCtt: "04/2023", prazoVencimento: "", dataVencimentoIso: "2027-01-04", valorContrato: 180000.00, fiscal: "FERNANDA", status: "Ativo", objeto: "LOCAÇÃO DE UM IMÓVEL, PARA USO DA SAMU E ASSISTÊNCIA FARMACÊUTICA", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Aluguel para pagamento a partir do dia 05 de cada mês no valor bruto de R$15.550,00 menos 4,8% de IR, portanto R$14.803,60\n\nEndereço: Rua Coronel Pacheco, 784 - Torres / RS\n\nEmpenhos:\n8/2025 valor de R$90.000,00\n14/2026 valor de R$186.600,00\n\nProcesso Administrativo:  759/2026", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:9928_109" },
    { id: 9, empresa: "DELTA SOLUÇÕES EM INFORMÁTICA LTDA", numeroCtt: "14/2024", prazoVencimento: "", dataVencimentoIso: "2027-01-22", valorContrato: 1074209.92, fiscal: "PREFEITURA", status: "Ativo", objeto: "Sistemas e Gestão de TI (DELTA INFORMÁTICA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:11552_109", isCompartilhado: true, cotaSaude: 107420.99 },
    { id: 10, empresa: "TECPRINTERS TECNOLOGIA DE IMPRESSÃO LTDA", numeroCtt: "29/2026", prazoVencimento: "", dataVencimentoIso: "2027-02-10", valorContrato: 73200.00, fiscal: "PREFEITURA", status: "Ativo", objeto: "Outsourcing de Impressoras (TEC PRINTERS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Fiscal PREFEITURA confirmado no mural", linkContrato: "" },
    { id: 11, empresa: "IBG INDUSTRIA BRASILEIRA DE GASES LTDA", numeroCtt: "77/2024", prazoVencimento: "", dataVencimentoIso: "2027-02-22", valorContrato: 46800.00, fiscal: "ADRI", status: "Ativo", objeto: "Fornecimento de Oxigênio Medicinal (IBG OXIGÊNIO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:11831_109" },
    { id: 12, empresa: "INSTITUTO DE AMPARO AO EXCEPCIONAL - INAMEX", numeroCtt: "125/2024", prazoVencimento: "", dataVencimentoIso: "2027-03-18", valorContrato: 56337.48, fiscal: "NAIARA", status: "Ativo", objeto: "Acolhimento e Assistência Especial (INAMEX)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "INTERNAÇÃO COMPULSÓRIA EM CLINICA TERAPÊUTICA", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:12015_109" },
    { id: 13, empresa: "ONE GESTÃO E SERVIÇOS LTDA", numeroCtt: "149/2026", prazoVencimento: "", dataVencimentoIso: "2027-05-04", valorContrato: 240240.00, fiscal: "NAIARA", status: "Ativo", objeto: "Serviços Especializados de Apoio (ONE GESTÃO)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 04/05/2027 confirmado no mural", linkContrato: "" },
    { id: 14, empresa: "INTEGRALIDADE MÉDICA LTDA", numeroCtt: "151/2026", prazoVencimento: "", dataVencimentoIso: "2027-05-04", valorContrato: 1367024.00, fiscal: "FRAN", status: "Ativo", objeto: "Plantões Médicos de Urgência (INTEGRALIDADE MÉDICA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prestação de serviços especializados em Pediatria (Atenção Básica) e Médico Traumatologista/Ortopedista", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17067_109" },
    { id: 15, empresa: "HIDRAMACO PEÇAS E ACESSÓRIOS LTDA", numeroCtt: "274/2026", prazoVencimento: "", dataVencimentoIso: "2027-07-22", valorContrato: 90240.46, fiscal: "SANDRO", status: "Ativo", objeto: "Peças e Reposição Mecânica (HIDRAMACO SULCAR)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17646_109" },
    { id: 16, empresa: "ELO SERVIÇOS DE SAÚDE LTDA", numeroCtt: "297/2025", prazoVencimento: "", dataVencimentoIso: "2027-08-28", valorContrato: 1026110.34, fiscal: "NAIARA", status: "Ativo", objeto: "Serviços Médicos Ambulatoriais (ELO SERVIÇOS)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Prestação de serviços médicos de Clínico Geral, Psiquiatra.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15118_109" },
    { id: 17, empresa: "AMBIENTUUS TECNOLOGIA AMBIENTAL", numeroCtt: "264/2023", prazoVencimento: "", dataVencimentoIso: "2027-08-30", valorContrato: 36720.00, fiscal: "ADRI", status: "Ativo", objeto: "CONTRATAÇÃO DE EMPRESA ESPECIALIZADA PARA PRESTAÇÃO DE SERVIÇOS - Tratamento de Resíduos Hospitalares", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Renovação número 740098\n\nDiversos empenhos, ver contratação no link!", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:10386_109" },
    { id: 18, empresa: "HENGER COMÉRCIO E SERVIÇOS LTDA", numeroCtt: "166/2026", prazoVencimento: "", dataVencimentoIso: "2029-05-05", valorContrato: 90000.00, fiscal: "ADRI", status: "Ativo", objeto: "Manutenção Predial Continuada (HENGER)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "EMPRESA ESPECIALIZADA PARA LOCAÇÃO DE GERADOR DE ENERGIA ELÉTRICA", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17133_109" },
    { id: 19, empresa: "LABORATÓRIO DE ANÁLISES CLÍNICAS", numeroCtt: "43/2024", prazoVencimento: "", dataVencimentoIso: "2027-09-03", valorContrato: 129163.00, fiscal: "PREFEITURA", status: "Ativo", objeto: "Credenciamento de Exames Laboratoriais (LABORATÓRIO ANALISE)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Termo de Credenciamento 43/2024 afixado no mural", linkContrato: "" },

    // --- QUADRO 2: QUADRO BRANCO (Posições 22 a 33) ---
    { id: 22, empresa: "SIMSAUDE SERVIÇOS SA", numeroCtt: "342/2025", prazoVencimento: "", dataVencimentoIso: "2026-11-16", valorContrato: 828960.00, fiscal: "ADRI", status: "Ativo", objeto: "Consultas e Atendimentos Médicos (SIM SAÚDE)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Processo Administrativo de Renovação: 20709/2026 - Está na PGM", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15847_109" },
    { id: 23, empresa: "SILVANO TUPINAMBA DELFIM", numeroCtt: "345/2023", prazoVencimento: "", dataVencimentoIso: "2026-11-21", valorContrato: 48000.00, fiscal: "FERNANDA", status: "Ativo", objeto: "Locação de um imóvel Comercial localizado na Rua General Firmino Paim nº936 na cidade de Torres RS. próximo ao Posto de Saúde e a três quadras do Hospital Nsrª dos Navegantes", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "[diego em 15/10/2026 às 11:00]: Clínica de Especialidades. Pago para SILVANO TUPINAMBA DELFIM HERNANDORENA RAMOS | [diego em 15/10/2026 às 11:02]", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:10558_109" },
    { id: 24, empresa: "LUMIAR HEALTH BUILDERS EQUIP HOSP LTDA", numeroCtt: "303/2025", prazoVencimento: "", dataVencimentoIso: "2026-11-26", valorContrato: 135700.00, fiscal: "FRAN", status: "Ativo", objeto: "Oxigenoterapia Domiciliar (LUMIAR OXIGENOTERAPIA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Nº CTT atribuído: 303/2025 conforme mural", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15635_109" },
    { id: 25, empresa: "TRANSALVA EMERGÊNCIAS MÉDICAS LTDA", numeroCtt: "442/2025", prazoVencimento: "", dataVencimentoIso: "2026-12-08", valorContrato: 199800.05, fiscal: "NAIARA", status: "Ativo", objeto: "Ambulâncias de Suporte Avançado (TRANSALVA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 08/12/2026 destacado no mural", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15777_109" },
    { id: 26, empresa: "DANIEL CARDOSO MAGNUS", numeroCtt: "195/2026", prazoVencimento: "", dataVencimentoIso: "2027-06-01", valorContrato: 19800.00, fiscal: "LASIER", status: "Ativo", objeto: "Aplicação BTI Controle de Vetores (DANIEL APLICAÇÃO BTI)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Serviço de mão de obra para aplicação de Larvicida", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17356_109" },
    { id: 27, empresa: "VIAÇÃO OURO E PRATA SA", numeroCtt: "231/2026", prazoVencimento: "", dataVencimentoIso: "2027-06-30", valorContrato: 1355940.00, fiscal: "SANDRO", status: "Ativo", objeto: "Passagens TFD (OURO E PRATA)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Nº CTT 231/2026 confirmado no mural", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17513_109" },
    { id: 28, empresa: "K & S EMPREENDIMENTOS IMOBILIARIOS LTDA", numeroCtt: "258/2026", prazoVencimento: "", dataVencimentoIso: "2027-07-15", valorContrato: 96000.00, fiscal: "NAIARA", status: "Ativo", objeto: "Locação de imóvel destinado ao funcionamento da Clínica Municipal de Fisioterapia da Secretaria Municipal de Saúde de Torres/RS. situado na Avenida Benjamin Constant. nº 594. Bairro Praia Grande. Período de 60 (sessenta) meses.", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "[diego em 15/10/2026 às 11:39]: Aluguel pago todo dia 14 do mês no valor bruto de R$8.000,00 menos 4,8% de IR, portanto R$7.616.\n\nEmpenho(s):\n11009/2026 de R$ 48.000,00", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:17630_109" },
    { id: 29, empresa: "ULTRA AIR COMÉRCIO DE GASES INDUSTRIAIS", numeroCtt: "232/2025", prazoVencimento: "", dataVencimentoIso: "2027-07-17", valorContrato: 52266.50, fiscal: "ADRI", status: "Ativo", objeto: "Gases Medicinais e Ar Comprimido (ULTRA AIR)", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Vencimento 17/07/2027 confirmado no mural", linkContrato: "" },
    { id: 30, empresa: "SOSSEG (EDUCAÇÃO)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Arquivado", objeto: "Serviços de Educação / Apoio à Saúde", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato", linkContrato: "" },
    { id: 31, empresa: "CRISTO REI (CLÍNICA)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Serviços e Consultas Clínicas", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato", linkContrato: "" },
    { id: 32, empresa: "IB SAÚDE (HOSPITAL)", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Previsto", objeto: "Gestão e Atendimento Hospitalar", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato", linkContrato: "" },
    { id: 33, empresa: "APAE", numeroCtt: "Em Aberto", prazoVencimento: "Em fase de contratação", dataVencimentoIso: "", valorContrato: 0, fiscal: "PREFEITURA", status: "Arquivado", objeto: "Assistência e Atendimento Especializado", criadoEm: "07/10/2026", criadoPor: "admin", observacao: "Folha afixada no mural reservada para novo contrato", linkContrato: "" },
    { id: 34, empresa: "AMPLAMAIS SERVIÇOS MÉDICOS LTDA", numeroCtt: "400/2025", prazoVencimento: "", dataVencimentoIso: "2026-11-12", valorContrato: 70962.20, fiscal: "SANDRO", status: "Ativo", objeto: "Serviços de Exames por Imagem e Diagnósticos", criadoEm: "09/10/2026", criadoPor: "admin", observacao: "Verifiquei a situação do contrato com a Vivian Réus e a renovação não será realizada. O motivo é que a empresa presta serviços de exames de imagem, área que atualmente conta com um credenciamento próprio de empresas.\nAlém disso, a Vivian informou que a empresa Ampla Mais é de Xangri-lá e já possui um empenho vigente.", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:15641_109", isCompartilhado: false, cotaSaude: 70962.20 },
    { id: 35, empresa: "AMPLAMAIS SERVIÇOS MÉDICOS LTDA", numeroCtt: "432/2026", prazoVencimento: "", dataVencimentoIso: "2027-09-18", valorContrato: 40080.60, fiscal: "SANDRO", status: "Ativo", objeto: "Exames de Ultrassonografia/Ecografia Mamária com extensão axilar", criadoEm: "09/10/2026", criadoPor: "admin", observacao: "Pregão 329/2025 - Processo 20402/2026 - Portaria 306/2026", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:18180_109", isCompartilhado: false, cotaSaude: 40080.60 },
    { id: 36, empresa: "NILDIESEL RETÍFICA DE MOTORES LTDA", numeroCtt: "171/2026", prazoVencimento: "", dataVencimentoIso: "2027-05-08", valorContrato: 331978.43, fiscal: "JANICE", status: "Ativo", objeto: "Manutenção Preventiva e Corretiva para Frota Linha Pesada (NILDIESEL)", criadoEm: "09/10/2026", criadoPor: "admin", observacao: "[admin em 09/10/2026 às 13:02]: Pregão 50/2025 - Processo 9.225/2026. Fiscal Janice (Portaria 132/2025)", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:16352_109", isCompartilhado: false, cotaSaude: 331978.43 },
    { id: 1792181801134, empresa: "SILVIO FARIAS ALVES", numeroCtt: "463/2026", prazoVencimento: "", dataVencimentoIso: "2027-10-20", valorContrato: 59400.00, fiscal: "SANDRO", status: "Ativo", objeto: "Locação de um imóvel. para uso da Vigilância Sanitária e Ambiental - Secretaria de Saúde - localizado na Rua Alexandrino de Alencar. nº640. na cidade de Torres RS. próximo ao Hospital Nossa Srª dos Navegantes.", criadoEm: "16/10/2026 às 17:16", criadoPor: "diego", observacao: "Empenho 17050, com data de 14/10/2026\nValor Unitário (mensalidade): R$ 4.950,00", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:18486_109" },
    { id: 1792416195061, empresa: "ELO SERVIÇOS DE SAÚDE LTDA", numeroCtt: "160/2025", prazoVencimento: "Renovação: 12 Meses até 28/04/2027", dataVencimentoIso: "2026-04-28", valorContrato: 395154.00, fiscal: "ADRI", status: "Ativo", objeto: "- Prestação de Serviços Médicos Clínico Geral 600 R$ 168,79\n- PSIQUIATRA (COM RQE) 1200 R$ 244,90", criadoEm: "19/10/2026 às 10:23", criadoPor: "diego", observacao: "Renovação nº 687246 em 28/04/2026", linkContrato: "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:14377_109" }
  ],

  occupySlot(id) {
    this.openEditModal(id);
  },

  async syncFromMuralData(forcePrompt = true) {
    if (forcePrompt) {
      const ok = confirm("Deseja sincronizar o painel com os contratos oficiais da Secretaria de Saúde?\n\nIsso preservará todos os contratos e alterações manuais realizadas.");
      if (!ok) return;
    }

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: "Sincronizando com Mural",
        subtitle: "Auditando os contratos da Secretaria",
        step1: "Organizando os contratos oficiais do painel",
        step2: "Atualizando base de dados",
        step3: "Atualizando semáforo e mural visual",
        icon: "📋"
      });
    }

    // Preserva contratos customizados criados pelo usuário
    const customContracts = (app.state.panelContracts || []).filter(c => c && !this.MURAL_AUDIT_DATA.some(m => m.id === c.id));
    const muralList = JSON.parse(JSON.stringify(this.MURAL_AUDIT_DATA));
    const mergedList = [...customContracts, ...muralList];
    app.state.panelContracts = mergedList;
    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(mergedList);
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
        // Garantir que nenhum contrato vazio ou com status Disponível persista
        const limpo = res.panelContracts.filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);
        // Preserva contratos customizados locais
        const unsynced = (app.state.panelContracts || []).filter(c => c && !limpo.some(l => l.id === c.id));
        app.state.panelContracts = [...unsynced, ...limpo];
        if (app.data && app.data.saveLocalPanelContracts) {
          app.data.saveLocalPanelContracts(app.state.panelContracts);
        }
      }
      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast("Painel de contratos alinhado com o mural!", "success", "Mural Físico");
    } catch(err) {
      console.warn("Sincronização em nuvem pendente, atualizado no cache local:", err);
      app.ui.toast("Painel atualizado no navegador!", "info", "Mural Físico");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
      const viewport = document.getElementById('app-viewport');
      if (viewport && app.state.currentView === 'contratos_hub') {
        app.render.contratosHub(viewport);
      }
    }
  },

  ensureMuralSync() {
    let list = app.state.panelContracts || [];

    // Limpeza de contratos com status "Disponível", "ESPAÇO VAZIO" ou sem empresa
    const antesCount = list.length;
    list = list.filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);
    let modificado = list.length !== antesCount;
    const contractsToRepairInCloud = [];

    // Higienização automática contra coerção de número de contrato em data e limpeza de prazos legados "12 Meses até..."
    list.forEach(c => {
      const formatado = this.formatCttNumber(c.numeroCtt);
      if (formatado !== c.numeroCtt) {
        c.numeroCtt = formatado;
        modificado = true;
      }
      // Preservar renovação explícita do contrato 160/2025 (ELO SERVIÇOS - Renovação nº 687246 em 28/04/2026 até 28/04/2027)
      if ((Number(c.id) === 1792416195061 || String(c.numeroCtt) === '160/2025') && c.prazoVencimento && !this.isRenovacaoPrazo(c.prazoVencimento)) {
        c.prazoVencimento = `Renovação: ${c.prazoVencimento}`;
        contractsToRepairInCloud.push(c);
        modificado = true;
      } else if (c.status !== 'Previsto' && c.prazoVencimento && !this.isRenovacaoPrazo(c.prazoVencimento)) {
        const dtPrazo = this.parseAnyDate(c.prazoVencimento);
        const dtVenc = this.parseAnyDate(c.dataVencimentoIso);
        // Se foi empurrado em +12 meses acidentalmente ao salvar observação/link, agenda reparo silencioso na planilha
        if (dtPrazo && dtVenc && this.formatDateIso(dtPrazo) !== this.formatDateIso(dtVenc)) {
          contractsToRepairInCloud.push(c);
        }
        c.prazoVencimento = "";
        modificado = true;
      }
      if (c.id === 8 && !c.linkContrato) {
        c.linkContrato = "https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/104:109:9928_109";
        modificado = true;
      }
      if (c.id === 9 && c.isCompartilhado === undefined) {
        c.isCompartilhado = true;
        c.cotaSaude = c.cotaSaude || 107420.99;
        modificado = true;
      }
    });

    // Garante que os contratos oficiais 34, 35, 36, 463/2026 e 160/2025 estejam presentes na lista
    [34, 35, 36, 1792181801134, 1792416195061].forEach(targetId => {
      const jaExiste = list.some(c => c && (c.id === targetId || (c.numeroCtt && this.MURAL_AUDIT_DATA.find(m => m.id === targetId)?.numeroCtt === c.numeroCtt)));
      if (!jaExiste) {
        const itemMural = this.MURAL_AUDIT_DATA.find(m => m.id === targetId);
        if (itemMural) {
          list.push(JSON.parse(JSON.stringify(itemMural)));
          modificado = true;
        }
      }
    });

    // Se o banco local estiver completamente vazio, inicializa a partir dos dados padrão
    if (list.length === 0) {
      list = JSON.parse(JSON.stringify(this.MURAL_AUDIT_DATA));
      modificado = true;
    }

    app.state.panelContracts = list;
    if (modificado && app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(list);
    }

    // Repara silenciosamente na planilha qualquer contrato cujo prazo tenha sido somado +12 meses pelo bug antigo ao editar observação
    if (contractsToRepairInCloud.length > 0 && app.data && app.data.sendToCloud) {
      contractsToRepairInCloud.forEach(c => {
        const repairKey = `torres_repaired_prazo_${c.id}_v1`;
        if (!sessionStorage.getItem(repairKey)) {
          sessionStorage.setItem(repairKey, '1');
          app.data.sendToCloud({
            action: "UPDATE_PANEL_CONTRACT",
            contract: c,
            detalhes: `Contrato nº ${c.numeroCtt} (${c.empresa}) [ID:${c.id}] | Prazo de Renovação / Adição restaurado para Não Informado (preservando Vencimento original)`
          }).catch(() => {});
        }
      });
    }
  },

  DEFAULT_FISCAIS: ["ADRI", "FERNANDA", "FRAN", "JANICE", "LASIER", "NAIARA", "NÃO INFORMADO", "PREFEITURA", "SANDRO"],

  getFiscais() {
    let list = null;
    try {
      const raw = localStorage.getItem('torres_fiscais_v1');
      if (raw) list = JSON.parse(raw);
    } catch(e) {}
    if (!Array.isArray(list)) {
      list = [...this.DEFAULT_FISCAIS];
    }
    if (app.state.panelContracts && Array.isArray(app.state.panelContracts)) {
      app.state.panelContracts.forEach(c => {
        if (c.fiscal && c.status !== 'Disponível') {
          const fUpper = String(c.fiscal).trim().toUpperCase();
          if (fUpper && !list.includes(fUpper)) list.push(fUpper);
        }
      });
    }
    if (!list.includes("PREFEITURA")) list.push("PREFEITURA");
    if (!list.includes("NÃO INFORMADO")) list.push("NÃO INFORMADO");
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

    // Atualiza também o outro select se estiver na tela
    const otherTargetId = targetId === 'panel-new-fiscal' ? 'panel-edit-fiscal' : 'panel-new-fiscal';
    const otherEl = document.getElementById(otherTargetId);
    if (otherEl) this.populateFiscalSelect(otherEl, otherEl.value);

    // Atualiza o select do filtro no topo
    const hubFilterSelect = document.getElementById('panel-contratos-fiscal-select');
    if (hubFilterSelect) {
      const currVal = app.state.panelFiscalFilter || 'TODOS';
      hubFilterSelect.innerHTML = `
        <option value="TODOS" ${currVal === 'TODOS' ? 'selected' : ''}>Todos os Fiscais</option>
        ${list.map(f => `<option value="${f}" ${currVal === f ? 'selected' : ''}>${f}</option>`).join('')}
      `;
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
    const fiscal = String(selectEl.value || '').trim().toUpperCase();
    if (!fiscal) return;

    if (fiscal === "PREFEITURA" || fiscal === "NÃO INFORMADO") {
      return app.ui.toast(`A opção padrão institucional '${fiscal}' não pode ser excluída.`, "warning", "Ação Não Permitida");
    }

    // 1. CHECAGEM OBRIGATÓRIA: Verificar se o fiscal está vinculado a contratos
    const contratos = app.state.panelContracts || [];
    const vinculados = contratos.filter(c => {
      if (c.status === 'Disponível') return false;
      const fCtt = String(c.fiscal || '').trim().toUpperCase();
      return fCtt === fiscal;
    });

    if (vinculados.length > 0) {
      // Abre janela/modal informativa exibindo os contratos vinculados e como proceder
      this.openFiscalVinculadoModal(fiscal, vinculados);
      return;
    }

    // 2. Se NÃO houver contratos vinculados, confirma e remove
    if (!confirm(`O fiscal "${fiscal}" não possui nenhum contrato vinculado.\n\nDeseja realmente removê-lo da lista de fiscais?`)) {
      return;
    }

    let list = this.getFiscais().filter(f => f !== fiscal);
    this.saveFiscais(list);

    // Atualiza o select atual
    this.populateFiscalSelect(selectEl, list[0] || 'PREFEITURA');

    // Atualiza o outro select se estiver aberto
    const otherSelectId = selectId === 'panel-new-fiscal' ? 'panel-edit-fiscal' : 'panel-new-fiscal';
    const otherEl = document.getElementById(otherSelectId);
    if (otherEl) {
      const otherVal = otherEl.value === fiscal ? (list[0] || 'PREFEITURA') : otherEl.value;
      this.populateFiscalSelect(otherEl, otherVal);
    }

    // Atualiza o filtro de fiscal na barra do Hub
    const hubFilter = document.getElementById('panel-contratos-fiscal-select');
    if (hubFilter) {
      const currHubVal = app.state.panelFiscalFilter || 'TODOS';
      hubFilter.innerHTML = `
        <option value="TODOS" ${currHubVal === 'TODOS' ? 'selected' : ''}>Todos os Fiscais</option>
        ${list.map(f => `<option value="${f}" ${currHubVal === f ? 'selected' : ''}>${f}</option>`).join('')}
      `;
      if (currHubVal === fiscal) {
        this.setFiscal('TODOS');
      }
    }

    app.ui.toast(`Fiscal "${fiscal}" removido com sucesso.`, "info", "Fiscais");
  },

  openFiscalVinculadoModal(fiscal, vinculados) {
    const m = document.getElementById('modal-fiscal-vinculado');
    const nomeEl = document.getElementById('modal-fiscal-vinculado-nome');
    const qtdEl = document.getElementById('modal-fiscal-vinculado-qtd');
    const listaEl = document.getElementById('modal-fiscal-vinculado-lista');

    if (!m) {
      const nomes = vinculados.map(c => `• CTT ${this.formatCttNumber(c.numeroCtt)} - ${c.empresa}`).join('\n');
      alert(`O fiscal "${fiscal}" não pode ser excluído porque está vinculado a ${vinculados.length} contrato(s):\n\n${nomes}\n\nPara excluí-lo, primeiro altere o fiscal responsável desses contratos.`);
      return;
    }

    if (nomeEl) nomeEl.textContent = fiscal;
    if (qtdEl) qtdEl.textContent = `${vinculados.length} contrato${vinculados.length > 1 ? 's' : ''}`;

    if (listaEl) {
      listaEl.innerHTML = vinculados.map(c => `
        <div class="py-2 first:pt-0">
          <div class="flex items-center justify-between gap-1">
            <span class="font-bold text-slate-900 text-xs truncate max-w-[240px]" title="${c.empresa}">${c.empresa}</span>
            <span class="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 font-mono text-[10px] font-black text-blue-700 shrink-0">
              CTT ${this.formatCttNumber(c.numeroCtt)}
            </span>
          </div>
          <div class="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
            <span>${c.objeto ? (c.objeto.length > 40 ? c.objeto.slice(0, 40) + '...' : c.objeto) : 'Serviço'}</span>
            <span class="font-semibold text-slate-700">${c.dataVencimentoIso ? 'Venc: ' + this.formatDateBr(c.dataVencimentoIso) : (c.prazoVencimento || '-')}</span>
          </div>
        </div>
      `).join('');
    }

    m.classList.remove('hidden');
    m.classList.add('flex');
  },

  closeFiscalVinculadoModal() {
    const m = document.getElementById('modal-fiscal-vinculado');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  },

  cleanObservacao(text) {
    if (!text) return '';
    return String(text)
      .replace(/^\[\s*[^\]]+?\s+em\s+\d{1,2}\/\d{1,2}\/\d{4}[^\]]*?\]\s*:?\s*/gi, '')
      .replace(/\s*\|\s*\[\s*[^\]]+?\s+em\s+\d{1,2}\/\d{1,2}\/\d{4}[^\]]*?\]\s*$/gi, '')
      .replace(/\[\s*[^\]]+?\s+em\s+\d{1,2}\/\d{1,2}\/\d{4}[^\]]*?\]\s*:?/gi, '')
      .trim();
  },

  extractLegacyRubricas(text) {
    if (!text) return [];
    const str = String(text).trim();
    if (!str) return [];

    const rubricaRegex = /\[\s*([^\]]+?)\s+em\s+(\d{1,2}\/\d{1,2}\/\d{4}[^\]]*?)\s*\]/gi;
    const matches = [];
    let m;
    while ((m = rubricaRegex.exec(str)) !== null) {
      matches.push({
        usuario: m[1].trim(),
        dataHora: m[2].trim().replace(/\s+s\s+/i, ' às '),
        startIndex: m.index,
        endIndex: rubricaRegex.lastIndex
      });
    }

    if (matches.length === 0) return [];

    const entries = [];
    for (let i = 0; i < matches.length; i++) {
      const cur = matches[i];
      let noteText = '';

      if (matches.length === 1) {
        const before = str.slice(0, cur.startIndex).replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();
        const after = str.slice(cur.endIndex).replace(/^:\s*/, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();
        noteText = after || before;
      } else {
        if (i === 0) {
          noteText = str.slice(cur.endIndex, matches[1].startIndex).replace(/^:\s*/, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();
        } else {
          const textBefore = str.slice(matches[i - 1].endIndex, cur.startIndex).replace(/^:\s*/, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();
          const textAfter = (i < matches.length - 1)
            ? str.slice(cur.endIndex, matches[i + 1].startIndex).replace(/^:\s*/, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim()
            : str.slice(cur.endIndex).replace(/^:\s*/, '').replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();
          noteText = textAfter || textBefore;
        }
      }

      noteText = noteText.replace(/^\|\s*/, '').replace(/\s*\|\s*$/, '').trim();

      entries.push({
        usuario: cur.usuario,
        dataHora: cur.dataHora,
        modulo: "Contratos LDO",
        acao: "Edição Anterior (Legado)",
        detalhes: noteText ? `Apontamento em observação: "${noteText}"` : "Assinatura de alteração registrada no histórico do contrato",
        nota: noteText,
        tipo: "legacy"
      });
    }

    return entries;
  },

  applyRubrica(novoTexto) {
    return this.cleanObservacao(novoTexto);
  },

  // CONTROLES DE PRAZO DE RENOVAÇÃO / ADIÇÃO DE CONTRATO (PERÍODO EM MESES OU DATA ESPECÍFICA - SEM CAMPO LIVRE)
  setupPrazoControls(prefix, initialPrazoVal, baseDateVal) {
    const prazo = String(initialPrazoVal || '').trim();
    const dateInput = document.getElementById(`panel-${prefix}-prazo-data-input`);
    const mesesSelect = document.getElementById(`panel-${prefix}-prazo-meses-select`);
    const mesesCustom = document.getElementById(`panel-${prefix}-prazo-meses-custom`);
    const customWrap = document.getElementById(`panel-${prefix}-prazo-meses-custom-wrap`);
    const hiddenTxt = document.getElementById(`panel-${prefix}-prazo-txt`);

    if (customWrap) customWrap.classList.add('hidden');
    if (mesesCustom) mesesCustom.value = '';

    // Somente ativa "Período (Meses)" ou "Data Específica" se houver uma Renovação/Adição explícita.
    // Textos legados do mural ("12 Meses até ...") abrem como "Não Informado" (NONE) para preservar a data de Vencimento do Contrato.
    if (!this.isRenovacaoPrazo(prazo)) {
      this.onPrazoTypeChange(prefix, 'NONE');
      if (dateInput) dateInput.value = '';
      if (hiddenTxt) hiddenTxt.value = '';
      return;
    }

    // 1. Tentar detectar se é data explícita (sem palavra meses)
    const dt = this.parseAnyDate(prazo);
    const hasMesesWord = /m[eê]s/i.test(prazo);

    if (dt && !hasMesesWord) {
      this.onPrazoTypeChange(prefix, 'DATA');
      if (dateInput) {
        dateInput.value = this.formatDateIso(dt);
      }
      this.onPrazoDateInputChange(prefix);
      return;
    }

    // 2. Tentar detectar se é período em meses
    const matchMeses = prazo.match(/(\d+)\s*m[eê]s/i);
    if (matchMeses) {
      this.onPrazoTypeChange(prefix, 'MESES');
      const qtd = matchMeses[1];
      const standardOpts = ["6", "12", "24", "36", "48", "60"];
      if (standardOpts.includes(qtd)) {
        if (mesesSelect) mesesSelect.value = qtd;
        if (customWrap) customWrap.classList.add('hidden');
      } else {
        if (mesesSelect) mesesSelect.value = 'OUTRO';
        if (customWrap) customWrap.classList.remove('hidden');
        if (mesesCustom) mesesCustom.value = qtd;
      }
      this.onPrazoMesesSelectChange(prefix);
      return;
    }

    // Fallback: se houver data em string mista
    if (dt) {
      this.onPrazoTypeChange(prefix, 'DATA');
      if (dateInput) dateInput.value = this.formatDateIso(dt);
      this.onPrazoDateInputChange(prefix);
    } else {
      this.onPrazoTypeChange(prefix, 'NONE');
    }
  },

  onPrazoTypeChange(prefix, type) {
    const lblNone = document.getElementById(`lbl-${prefix}-prazo-none`);
    const lblMeses = document.getElementById(`lbl-${prefix}-prazo-meses`);
    const lblData = document.getElementById(`lbl-${prefix}-prazo-data`);

    const noneInfo = document.getElementById(`panel-${prefix}-prazo-none-info`);
    const mesesWrap = document.getElementById(`panel-${prefix}-prazo-meses-wrap`);
    const dataWrap = document.getElementById(`panel-${prefix}-prazo-data-wrap`);

    const radioNone = document.querySelector(`input[name="panel-${prefix}-prazo-type"][value="NONE"]`);
    const radioMeses = document.querySelector(`input[name="panel-${prefix}-prazo-type"][value="MESES"]`);
    const radioData = document.querySelector(`input[name="panel-${prefix}-prazo-type"][value="DATA"]`);

    const activeClass = prefix === 'edit'
      ? "cursor-pointer py-1.5 rounded-lg transition bg-white text-amber-800 shadow-xs"
      : "cursor-pointer py-1.5 rounded-lg transition bg-white text-blue-700 shadow-xs";
    const inactiveClass = "cursor-pointer py-1.5 rounded-lg transition text-slate-600 hover:text-slate-900";

    if (lblNone) lblNone.className = (type === 'NONE') ? activeClass : inactiveClass;
    if (lblMeses) lblMeses.className = (type === 'MESES') ? activeClass : inactiveClass;
    if (lblData) lblData.className = (type === 'DATA') ? activeClass : inactiveClass;

    if (radioNone) radioNone.checked = (type === 'NONE');
    if (radioMeses) radioMeses.checked = (type === 'MESES');
    if (radioData) radioData.checked = (type === 'DATA');

    if (noneInfo) noneInfo.classList.toggle('hidden', type !== 'NONE');
    if (mesesWrap) mesesWrap.classList.toggle('hidden', type !== 'MESES');
    if (dataWrap) dataWrap.classList.toggle('hidden', type !== 'DATA');

    if (type === 'NONE') {
      const hiddenTxt = document.getElementById(`panel-${prefix}-prazo-txt`);
      if (hiddenTxt) hiddenTxt.value = '';
    } else if (type === 'MESES') {
      this.onPrazoMesesSelectChange(prefix);
    } else if (type === 'DATA') {
      this.onPrazoDateInputChange(prefix);
    }
  },

  onPrazoMesesSelectChange(prefix) {
    const select = document.getElementById(`panel-${prefix}-prazo-meses-select`);
    const customWrap = document.getElementById(`panel-${prefix}-prazo-meses-custom-wrap`);
    const customInput = document.getElementById(`panel-${prefix}-prazo-meses-custom`);
    const preview = document.getElementById(`panel-${prefix}-prazo-meses-preview`);
    const hiddenTxt = document.getElementById(`panel-${prefix}-prazo-txt`);

    if (!select) return;

    let qtd = select.value;
    if (qtd === 'OUTRO') {
      if (customWrap) customWrap.classList.remove('hidden');
      qtd = customInput ? (parseInt(customInput.value, 10) || 12) : 12;
    } else {
      if (customWrap) customWrap.classList.add('hidden');
      qtd = parseInt(qtd, 10) || 12;
    }

    const baseInput = document.getElementById(`panel-${prefix}-venc-iso`);
    const baseDate = (baseInput && this.parseAnyDate(baseInput.value)) || new Date();
    const resultDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + qtd, baseDate.getDate());
    const formattedDate = this.formatDateBr(resultDate);

    const txtValue = `Renovação: ${qtd} Meses até ${formattedDate}`;
    if (hiddenTxt) hiddenTxt.value = txtValue;

    if (preview) {
      preview.innerHTML = `📅 Renovação/Adição de <strong>+${qtd} meses</strong>: novo vencimento em <strong>${formattedDate}</strong> (considerado no semáforo)`;
    }
  },

  onPrazoCustomMonthsInput(prefix) {
    this.onPrazoMesesSelectChange(prefix);
  },

  onPrazoDateInputChange(prefix) {
    const dateInput = document.getElementById(`panel-${prefix}-prazo-data-input`);
    const preview = document.getElementById(`panel-${prefix}-prazo-data-preview`);
    const hiddenTxt = document.getElementById(`panel-${prefix}-prazo-txt`);

    if (!dateInput) return;
    const val = dateInput.value;
    if (!val) {
      if (hiddenTxt) hiddenTxt.value = '';
      if (preview) preview.innerHTML = 'Selecione uma data para o término da renovação / adição de contrato.';
      return;
    }

    const dt = this.parseAnyDate(val);
    if (!dt) {
      if (hiddenTxt) hiddenTxt.value = '';
      if (preview) preview.innerHTML = 'Data inválida.';
      return;
    }

    const formatted = this.formatDateBr(dt);
    const txtValue = `Renovação: Até ${formatted}`;
    if (hiddenTxt) hiddenTxt.value = txtValue;
    if (preview) {
      preview.innerHTML = `📅 Renovação/Adição com vencimento em: <strong>${formatted}</strong> (considerado no semáforo)`;
    }
  },

  onDateChange(prefix) {
    // Quando a data de vencimento do contrato muda, se o prazo for MESES, atualiza a projeção
    const radioMeses = document.querySelector(`input[name="panel-${prefix}-prazo-type"][value="MESES"]`);
    if (radioMeses && radioMeses.checked) {
      this.onPrazoMesesSelectChange(prefix);
    }
  },

  onLinkInput(prefix) {
    const input = document.getElementById(`panel-${prefix}-link`);
    const btn = document.getElementById(`panel-${prefix}-link-preview`);
    if (!input || !btn) return;
    const url = input.value.trim();
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      btn.href = url;
      btn.classList.remove('hidden');
    } else {
      btn.href = '#';
      btn.classList.add('hidden');
    }
  },

  onLinkPaste(prefix) {
    this.onLinkInput(prefix);
    const input = document.getElementById(`panel-${prefix}-link`);
    if (!input) return;
    const url = input.value.trim();
    if (this.parseBethaUrl(url)) {
      this.importFromBethaLink(prefix);
    }
  },

  // --------------------------------------------------------------------------
  // IMPORTAÇÃO AUTOMÁTICA VIA PORTAL DA TRANSPARÊNCIA (BETHA CLOUD)
  // --------------------------------------------------------------------------
  parseBethaUrl(url) {
    if (!url || typeof url !== 'string') return null;
    const match = url.trim().match(/transparencia\.betha\.cloud\/#\/([^/]+)\/consulta\/(\d+)\/detalhe\/([^\s?#]+)/i);
    if (!match) return null;
    return {
      portalId: decodeURIComponent(match[1]),
      consultaId: match[2],
      detalheId: decodeURIComponent(match[3])
    };
  },

  getBethaAnonymousToken() {
    if (this._bethaTokenCache && this._bethaTokenCache.expiresAt > Date.now()) {
      return Promise.resolve(this._bethaTokenCache.token);
    }
    return new Promise((resolve, reject) => {
      const cbName = '__bethaAuthCb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const script = document.createElement('script');
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('Tempo limite excedido ao autenticar no Portal da Transparência Betha.'));
      }, 10000);

      function cleanup() {
        clearTimeout(timeout);
        try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[cbName] = (data) => {
        cleanup();
        if (data && data.accessToken) {
          const ttl = (parseInt(data.expiresIn, 10) || 3000) * 1000;
          this._bethaTokenCache = {
            token: data.accessToken,
            expiresAt: Date.now() + ttl - 60000
          };
          resolve(data.accessToken);
        } else {
          reject(new Error('Não foi possível obter token anônimo do Portal Betha.'));
        }
      };

      script.onerror = () => {
        cleanup();
        reject(new Error('Falha de conexão com o servidor de autenticação do Portal Betha.'));
      };

      script.src = `https://plataforma-oauth.betha.cloud/auth/oauth2/authorize?client_id=91a97459-f1d8-4b29-b5fa-2e51d1692623&response_type=token&redirect_uri=https://transparencia.betha.cloud/auth-callback.html&scope=transparencia.public&silent=true&access_mode=anonymous&callback=${cbName}`;
      document.body.appendChild(script);
    });
  },

  setImportStatus(prefix, type, message) {
    const el = document.getElementById(`panel-${prefix}-import-status`);
    if (!el) return;
    if (!message) {
      el.className = 'hidden mt-2.5 text-[11px] font-semibold rounded-xl px-3 py-2 border';
      el.innerHTML = '';
      return;
    }
    const styles = {
      loading: 'bg-blue-100/80 border-blue-300 text-blue-900',
      success: 'bg-emerald-50 border-emerald-300 text-emerald-900',
      warning: 'bg-amber-50 border-amber-300 text-amber-900',
      error: 'bg-rose-50 border-rose-300 text-rose-900'
    };
    el.className = `mt-2.5 text-[11px] font-semibold rounded-xl px-3 py-2 border flex items-start gap-2 transition-all ${styles[type] || styles.loading}`;
    el.innerHTML = message;
  },

  async importFromBethaLink(prefix = 'new') {
    const input = document.getElementById(`panel-${prefix}-link`);
    const btn = document.getElementById(`btn-import-betha-${prefix}`);
    if (!input) return;

    const url = input.value.trim();
    if (!url) {
      this.setImportStatus(prefix, 'warning', '<span>⚠️</span><span>Cole o link do contrato no campo acima para importar os dados automaticamente.</span>');
      input.focus();
      return;
    }

    const parsed = this.parseBethaUrl(url);
    if (!parsed) {
      this.setImportStatus(prefix, 'error', '<span>❌</span><span>Formato de link não reconhecido. Use um link de detalhe de contrato do Portal da Transparência Betha (ex.: <code>https://transparencia.betha.cloud/#/6qw94oPr_CfMG4vEdtL7rw==/consulta/82342/detalhe/...</code>).</span>');
      return;
    }

    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="animate-spin inline-block">⏳</span><span>Buscando...</span>';
    }
    this.setImportStatus(prefix, 'loading', '<span class="animate-spin inline-block">🔄</span><span>Conectando ao Portal da Transparência Betha e extraindo dados do contrato...</span>');

    try {
      const token = await this.getBethaAnonymousToken();
      const appContext = btoa(JSON.stringify({ portal: parsed.portalId }));
      const apiUrl = `https://api.transparencia.betha.cloud/transparencia/api/busca/${parsed.consultaId}/detalhes/${encodeURIComponent(parsed.detalheId)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'App-Context': appContext
        }
      });

      if (!response.ok) {
        throw new Error(`O Portal da Transparência retornou status HTTP ${response.status}.`);
      }

      const data = await response.json();
      if (!data || (!data.nomeContratado && !data.numero)) {
        throw new Error('Os dados do contrato não foram encontrados neste link.');
      }

      // 1. Empresa / Razão Social
      const empresa = String(data.nomeContratado || '').trim();
      const empEl = document.getElementById(`panel-${prefix}-empresa`);
      if (empEl && empresa) empEl.value = empresa;

      // 2. Número e Ano do Contrato
      const numCtt = String(data.numero || '').replace(/[^0-9]/g, '').slice(0, 5);
      const anoCtt = String(data.ano || new Date().getFullYear()).trim();
      const numEl = document.getElementById(`panel-${prefix}-ctt-num`);
      if (numEl && numCtt) numEl.value = numCtt;
      const anoEl = document.getElementById(`panel-${prefix}-ctt-ano`);
      if (anoEl && anoCtt) this.populateYearSelect(anoEl, anoCtt);

      // 3. Fiscal do Contrato (trata contratos sem fiscal ou associa ao primeiro nome cadastrado)
      const rawFiscal = String(data.fiscal || '').trim().toUpperCase();
      const fiscalEl = document.getElementById(`panel-${prefix}-fiscal`);
      const isFiscalAusente = !rawFiscal || /^(-|s\/f|n[aã]o\s*informado|sem\s*fiscal|null|undefined)$/i.test(rawFiscal);
      let fiscalSelecionado = 'NÃO INFORMADO';
      if (!isFiscalAusente) {
        const firstWord = rawFiscal.split(/\s+/)[0];
        const fiscaisList = this.getFiscais();
        const matchFiscal = fiscaisList.find(f => rawFiscal === f || rawFiscal.startsWith(f + ' ') || f === firstWord);
        fiscalSelecionado = matchFiscal || firstWord;
      }
      if (fiscalEl) {
        this.populateFiscalSelect(fiscalEl, fiscalSelecionado);
      }

      // 4. Valor Total do Contrato (prioriza valorFinal atualizado ou valorInicial)
      const valorNum = Number(data.valorFinal ?? data.valorInicial ?? 0);
      const valorEl = document.getElementById(`panel-${prefix}-valor`);
      if (valorEl && valorNum > 0) {
        valorEl.value = this.formatCurrency(valorNum);
      }

      // 5. Data de Vencimento (dataVigenciaFinal ou dataVencimento)
      const rawVenc = data.dataVigenciaFinal || data.dataVencimento || '';
      const vencIso = this.formatDateIso(rawVenc);
      const vencEl = document.getElementById(`panel-${prefix}-venc-iso`);
      if (vencEl && vencIso) {
        vencEl.value = vencIso;
      }

      // 6. Prazo de Renovação / Adição de Contrato (mantém padrão data exata para respeitar o vencimento real)
      this.setupPrazoControls(prefix, '', vencIso);

      // 7. Objeto / Descrição dos Itens do Contrato (limita aos 3 primeiros itens quando a lista for extensa, ex.: laboratórios)
      const MAX_ITENS_RESUMO = 3;
      let objetoBase = String(data.objetoContratacao || '').trim();
      if (objetoBase.length > 260) {
        objetoBase = objetoBase.slice(0, 260).trim() + '...';
      }

      const itensList = Array.isArray(data.itens) ? data.itens : [];
      let objetoStr = objetoBase;

      if (itensList.length > 0) {
        const formatarDetalheItem = (it) => {
          const qtd = (it.quantidade !== undefined && it.quantidade !== null && it.quantidade !== '')
            ? Number(it.quantidade).toLocaleString('pt-BR')
            : '';
          const un = String(it.unidadeMedida || '').trim();
          const vlrUnit = (it.valorUnitario !== undefined && it.valorUnitario !== null && it.valorUnitario !== '')
            ? this.formatCurrency(it.valorUnitario)
            : '';
          if (!qtd && !vlrUnit) return '';
          return `${qtd}${un ? ' ' + un : ''}${vlrUnit ? (qtd ? ' × ' : '') + vlrUnit : ''}`;
        };

        const descricoesUnicas = Array.from(new Set(itensList.map(it => String(it.descricao || '').trim()).filter(Boolean)));

        // Caso especial: poucos itens (até 3) que compartilham exatamente a mesma descrição (ex.: TRANSALVA com 2 cotas do mesmo serviço)
        if (itensList.length <= MAX_ITENS_RESUMO && descricoesUnicas.length === 1) {
          let descUnica = descricoesUnicas[0];
          if (descUnica.length > 260) descUnica = descUnica.slice(0, 260).trim() + '...';
          const resumos = itensList.map(formatarDetalheItem).filter(Boolean);
          const detalheQtd = resumos.length > 0 ? ` (${resumos.join(' + ')})` : '';
          if (!objetoBase) {
            objetoStr = `${descUnica}${detalheQtd}`;
          } else if (!objetoBase.toLowerCase().includes(descUnica.toLowerCase().slice(0, 25))) {
            objetoStr = `${objetoBase} — ${descUnica}${detalheQtd}`;
          } else {
            objetoStr = `${objetoBase}${detalheQtd}`;
          }
        } else {
          // Lista de múltiplos itens distintos ou listas extensas (ex.: laboratórios com 70+ exames): exibe apenas os 3 primeiros
          const primeirosItens = itensList.slice(0, MAX_ITENS_RESUMO).map((it, idx) => {
            let desc = String(it.descricao || `Item ${idx + 1}`).trim().replace(/\s+/g, ' ');
            if (desc.length > 160) desc = desc.slice(0, 160).trim() + '...';
            const det = formatarDetalheItem(it);
            return `- ${desc}${det ? ` (${det})` : ''}`;
          });

          const restantes = itensList.length - MAX_ITENS_RESUMO;
          if (restantes > 0) {
            primeirosItens.push(`... e mais ${restantes} ${restantes === 1 ? 'item' : 'itens'} — veja a relação completa pelo link do contrato.`);
          }

          const blocoItens = primeirosItens.join('\n');
          if (!objetoBase) {
            objetoStr = blocoItens;
          } else if (itensList.length === 1 && objetoBase.toLowerCase().includes(String(itensList[0].descricao || '').trim().toLowerCase().slice(0, 25))) {
            const detUnico = formatarDetalheItem(itensList[0]);
            objetoStr = `${objetoBase}${detUnico ? ` (${detUnico})` : ''}`;
          } else {
            objetoStr = `${objetoBase}\n${blocoItens}`;
          }
        }
      } else if (objetoStr.length > 500) {
        objetoStr = objetoStr.slice(0, 500).trim() + '... (veja a descrição completa pelo link do contrato)';
      }

      const objEl = document.getElementById(`panel-${prefix}-objeto`);
      if (objEl && objetoStr) objEl.value = objetoStr;

      // 8. Observações / Detalhes complementares (Processo, Licitação, Empenhos vinculados, Vigência inicial)
      const obsParts = [];
      if (data.modalidadeLicitacao && data.numeroLicitacao) {
        obsParts.push(`${data.modalidadeLicitacao} nº ${data.numeroLicitacao}/${data.anoLicitacao || ''}`);
      } else if (data.numeroProcesso) {
        obsParts.push(`Processo nº ${data.numeroProcesso}/${data.anoProcesso || ''}`);
      }
      if (data.dataAssinatura || data.dataVigenciaInicial) {
        const dtIni = this.formatDateBr(this.formatDateIso(data.dataVigenciaInicial || data.dataAssinatura));
        if (dtIni) obsParts.push(`Início: ${dtIni}`);
      }
      const empenhosList = Array.isArray(data.empenhos) ? data.empenhos : [];
      if (empenhosList.length > 0) {
        const empStrs = empenhosList.slice(0, 4).map(emp => {
          const nEmp = emp.numero ? `${emp.numero}/${emp.ano || ''}` : '';
          const vEmp = emp.valor ? this.formatCurrency(emp.valor) : '';
          return `Emp. ${nEmp}${vEmp ? ' (' + vEmp + ')' : ''}`;
        });
        const empRestantes = empenhosList.length - 4;
        const empTexto = empRestantes > 0
          ? `${empStrs.join(', ')} e mais ${empRestantes} empenho(s) (ver pelo link)`
          : empStrs.join(', ');
        obsParts.push(empTexto);
      }
      const obsEl = document.getElementById(`panel-${prefix}-observacao`);
      if (obsEl && obsParts.length > 0 && !obsEl.value.trim()) {
        obsEl.value = obsParts.join(' • ');
      }

      // 9. Recalcular previsão LDO / LOA automaticamente com base no valor e vencimento importados
      this.onValorContratoInput(prefix);

      const cttLabel = numCtt ? `${numCtt}/${anoCtt}` : 'identificado';
      const empCount = empenhosList.length;
      const itensCount = itensList.length;
      const valorFmt = valorNum > 0 ? this.formatCurrency(valorNum) : 'R$ 0,00';
      const vencFmt = this.formatDateBr(vencIso) || 'Não informado';
      const resumoItensBanner = itensCount > MAX_ITENS_RESUMO
        ? ` • <b>${itensCount} itens</b> (listados os 3 primeiros)`
        : (itensCount > 0 ? ` • ${itensCount} ${itensCount === 1 ? 'item' : 'itens'}` : '');
      const resumoFiscalBanner = isFiscalAusente ? ` • Fiscal: <b>Não informado no portal</b>` : ` • Fiscal: <b>${fiscalSelecionado}</b>`;
      this.setImportStatus(
        prefix,
        'success',
        `<span>✅</span><div><strong>Contrato ${cttLabel} importado com sucesso!</strong><br><span class="font-normal">Contratado: <b>${empresa || 'N/I'}</b> • Valor: <b>${valorFmt}</b> • Vencimento: <b>${vencFmt}</b>${resumoFiscalBanner}${resumoItensBanner}${empCount > 0 ? ` • ${empCount} empenho(s)` : ''}. Confira os dados abaixo e clique em Salvar Contrato.</span></div>`
      );
      if (app.ui && app.ui.toast) {
        app.ui.toast(`Dados do Contrato ${cttLabel} preenchidos automaticamente!`, 'success', 'Importação Betha');
      }
    } catch (err) {
      console.error('Erro ao importar link Betha:', err);
      const rawMsg = String((err && err.message) || '');
      let msgPt = 'Não foi possível comunicar com o Portal da Transparência Betha no momento.';
      if (/tempo limite|status HTTP|não foram encontrados|token anônimo|servidor de autenticação/i.test(rawMsg)) {
        msgPt = rawMsg;
      } else if (/failed to fetch|network|load failed/i.test(rawMsg)) {
        msgPt = 'Falha de conexão com a internet ou bloqueio de rede ao consultar o Portal da Transparência.';
      } else if (rawMsg) {
        msgPt = 'Ocorreu uma falha interna ao processar os dados retornados pelo Portal da Transparência.';
      }
      this.setImportStatus(
        prefix,
        'error',
        `<span>❌</span><span>Não foi possível importar os dados automaticamente: ${msgPt} Você ainda pode preencher os campos manualmente.</span>`
      );
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalBtnHtml || '<span>⚡</span><span>Buscar e Preencher</span>';
      }
    }
  },

  // --------------------------------------------------------------------------
  // GESTÃO DE COTAÇÃO & DIVISÃO ORÇAMENTÁRIA (LDO / LOA)
  // --------------------------------------------------------------------------
  getContractBudget(c) {
    if (!c) return { valorGlobal: 0, cotaSaude: 0, exercicioAtual: 0, exercicioSeguinte: 0, isCompartilhado: false, anoAtual: 2026, anoSeguinte: 2027 };
    const valorGlobal = Number(c.valorContrato || 0);
    const isCompartilhado = !!c.isCompartilhado;
    let cotaSaude = (c.cotaSaude !== undefined && c.cotaSaude !== null && c.cotaSaude !== '') ? Number(c.cotaSaude) : valorGlobal;
    if (!isCompartilhado) cotaSaude = valorGlobal;

    let exAtual = (c.exercicioAtual !== undefined && c.exercicioAtual !== null && c.exercicioAtual !== '') ? Number(c.exercicioAtual) : null;
    let exSeguinte = (c.exercicioSeguinte !== undefined && c.exercicioSeguinte !== null && c.exercicioSeguinte !== '') ? Number(c.exercicioSeguinte) : null;

    if (exAtual === null || exSeguinte === null) {
      const suggested = this.calculateEstimatedPartition(cotaSaude, c.dataVencimentoIso, c.prazoVencimento);
      if (exAtual === null) exAtual = suggested.atual;
      if (exSeguinte === null) exSeguinte = suggested.seguinte;
    }

    return {
      valorGlobal,
      cotaSaude,
      exercicioAtual: exAtual,
      exercicioSeguinte: exSeguinte,
      isCompartilhado,
      anoAtual: c.anoAtual || 2026,
      anoSeguinte: c.anoSeguinte || 2027
    };
  },

  calculateEstimatedPartition(totalVal, dataVencIso, prazoTxt = '') {
    const val = Number(totalVal || 0);
    if (!val || val <= 0) return { atual: 0, seguinte: 0 };

    const dtVenc = this.getEffectiveDate({ dataVencimentoIso: dataVencIso, prazoVencimento: prazoTxt }) || this.parseAnyDate(dataVencIso);
    if (!dtVenc) {
      return { atual: val, seguinte: 0 };
    }

    const yearVenc = dtVenc.getFullYear();
    const monthVenc = dtVenc.getMonth() + 1;

    if (yearVenc <= 2026) {
      return { atual: val, seguinte: 0 };
    }

    if (yearVenc === 2027) {
      const monthsIn2027 = Math.min(12, Math.max(1, monthVenc));
      const monthsIn2026 = 12 - monthsIn2027;
      const val2026 = Math.round((val * (monthsIn2026 / 12)) * 100) / 100;
      const val2027 = Math.round((val - val2026) * 100) / 100;
      return { atual: val2026, seguinte: val2027 };
    }

    // Para contratos plurianuais (2028 em diante)
    const val2026 = Math.round((val / 2) * 100) / 100;
    return { atual: val2026, seguinte: Math.round((val - val2026) * 100) / 100 };
  },

  formatCurrency(val) {
    if (val === null || val === undefined || val === '') return '';
    const num = Number(val);
    if (isNaN(num)) return '';
    return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  parseCurrency(val) {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    let str = String(val).replace(/R\$\s*/gi, '').trim();
    if (str.includes('.') && str.includes(',')) {
      str = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
      str = str.replace(',', '.');
    } else if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        str = str.replace(/\./g, '');
      }
    }
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  },

  handleCurrencyInput(el) {
    if (!el) return;
    const cursor = el.selectionStart;
    const oldVal = el.value || '';
    const oldLen = oldVal.length;

    let str = oldVal.replace(/^R\$\s*/i, '');
    let intPart = '';
    let decPart = '';
    let hasComma = false;

    if (str.includes(',')) {
      hasComma = true;
      const parts = str.split(',');
      intPart = parts[0].replace(/\D/g, '');
      decPart = parts.slice(1).join('').replace(/\D/g, '').slice(0, 2);
    } else if (str.includes('.') && (str.indexOf('.') === str.lastIndexOf('.')) && (str.length - str.indexOf('.') <= 3) && !str.includes(',')) {
      hasComma = true;
      const parts = str.split('.');
      intPart = parts[0].replace(/\D/g, '');
      decPart = parts[1].replace(/\D/g, '').slice(0, 2);
    } else {
      intPart = str.replace(/\D/g, '');
    }

    if (!intPart && !decPart && !hasComma) {
      el.value = '';
      return;
    }

    const intFormatted = intPart ? Number(intPart).toLocaleString('pt-BR') : (hasComma ? '0' : '');
    let formatted = '';
    if (hasComma) {
      formatted = `R$ ${intFormatted},${decPart}`;
    } else if (intFormatted) {
      formatted = `R$ ${intFormatted}`;
    }

    el.value = formatted;

    const diff = formatted.length - oldLen;
    const newPos = Math.max(0, Math.min(formatted.length, (cursor || 0) + diff));
    try {
      el.setSelectionRange(newPos, newPos);
    } catch(e) {}
  },

  handleCurrencyBlur(el) {
    if (!el || !el.value) return;
    const num = this.parseCurrency(el.value);
    if (num > 0) {
      el.value = this.formatCurrency(num);
    } else if (el.value.trim() !== '') {
      el.value = '';
    }
  },

  onValorContratoInput(prefix) {
    const valorGlobal = this.parseCurrency(document.getElementById(`panel-${prefix}-valor`)?.value) || 0;
    const chk = document.getElementById(`panel-${prefix}-is-compartilhado`);
    const cotaInp = document.getElementById(`panel-${prefix}-cota-saude`);

    if (chk && !chk.checked && cotaInp) {
      cotaInp.value = valorGlobal > 0 ? this.formatCurrency(valorGlobal) : '';
    }
    this.autoSuggestPartition(prefix, false);
    this.onBudgetPartitionInput(prefix);
  },

  onCompartilhadoChange(prefix) {
    const chk = document.getElementById(`panel-${prefix}-is-compartilhado`);
    const cotaInp = document.getElementById(`panel-${prefix}-cota-saude`);
    const hint = document.getElementById(`panel-${prefix}-cota-saude-hint`);
    const valorGlobal = this.parseCurrency(document.getElementById(`panel-${prefix}-valor`)?.value) || 0;
    const isComp = chk && chk.checked;

    if (hint) {
      if (isComp) {
        hint.innerHTML = '<span class="text-blue-600 font-bold">🌐 Compartilhado:</span> informe apenas a parcela da Secretaria da Saúde.';
      } else {
        hint.textContent = '100% da Saúde (igual ao valor global do contrato)';
      }
    }

    if (!isComp && cotaInp) {
      cotaInp.value = valorGlobal > 0 ? this.formatCurrency(valorGlobal) : '';
    }

    this.onBudgetPartitionInput(prefix);
  },

  onCotaSaudeInput(prefix) {
    this.onBudgetPartitionInput(prefix);
  },

  autoSuggestPartition(prefix, forceOverwrite = true) {
    const chk = document.getElementById(`panel-${prefix}-is-compartilhado`);
    const isComp = chk && chk.checked;
    const valorGlobal = this.parseCurrency(document.getElementById(`panel-${prefix}-valor`)?.value) || 0;
    let cotaSaude = this.parseCurrency(document.getElementById(`panel-${prefix}-cota-saude`)?.value);
    if (!isComp || isNaN(cotaSaude) || cotaSaude <= 0) cotaSaude = valorGlobal;

    const vencIso = document.getElementById(`panel-${prefix}-venc-iso`)?.value;
    const prazoTxt = document.getElementById(`panel-${prefix}-prazo-txt`)?.value || '';

    const exAtualEl = document.getElementById(`panel-${prefix}-ex-atual`);
    const exSeguinteEl = document.getElementById(`panel-${prefix}-ex-seguinte`);

    if (forceOverwrite || (!exAtualEl?.value && !exSeguinteEl?.value)) {
      const part = this.calculateEstimatedPartition(cotaSaude, vencIso, prazoTxt);
      if (exAtualEl) exAtualEl.value = part.atual > 0 ? this.formatCurrency(part.atual) : (cotaSaude > 0 ? this.formatCurrency(cotaSaude) : '');
      if (exSeguinteEl) exSeguinteEl.value = part.seguinte >= 0 ? this.formatCurrency(part.seguinte) : this.formatCurrency(0);
    }

    this.onBudgetPartitionInput(prefix);
  },

  onBudgetPartitionInput(prefix) {
    const chk = document.getElementById(`panel-${prefix}-is-compartilhado`);
    const isComp = chk && chk.checked;
    const valorGlobal = this.parseCurrency(document.getElementById(`panel-${prefix}-valor`)?.value) || 0;
    let cotaSaude = this.parseCurrency(document.getElementById(`panel-${prefix}-cota-saude`)?.value);
    if (!isComp || isNaN(cotaSaude) || cotaSaude <= 0) cotaSaude = valorGlobal;

    const exAtual = this.parseCurrency(document.getElementById(`panel-${prefix}-ex-atual`)?.value) || 0;
    const exSeguinte = this.parseCurrency(document.getElementById(`panel-${prefix}-ex-seguinte`)?.value) || 0;
    const sum = Math.round((exAtual + exSeguinte) * 100) / 100;

    const fb = document.getElementById(`panel-${prefix}-budget-feedback`);
    if (!fb) return;

    if (cotaSaude <= 0) {
      fb.innerHTML = '<span class="text-slate-400">Preencha o valor do contrato para calcular as cotas anuais.</span>';
      return;
    }

    const diff = Math.round((sum - cotaSaude) * 100) / 100;
    if (Math.abs(diff) < 0.05) {
      fb.innerHTML = `<span class="text-emerald-700 font-bold flex items-center gap-1"><span>✓</span> Soma dos exercícios: R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (100% da cota da Saúde conferida)</span>`;
    } else if (diff < 0) {
      fb.innerHTML = `<span class="text-amber-700 font-bold flex items-center gap-1"><span>⚠️</span> Soma dos exercícios: R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Faltam R$ ${Math.abs(diff).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para totalizar R$ ${cotaSaude.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>`;
    } else {
      fb.innerHTML = `<span class="text-rose-700 font-bold flex items-center gap-1"><span>⚠️</span> Soma dos exercícios: R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (Excede em R$ ${diff.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a cota da Saúde de R$ ${cotaSaude.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</span>`;
    }
  },

  openNewModal() {
    if (!app.permissions.can('panel_create')) return app.ui.toast("Sem permissão para cadastrar contratos no painel.", "warning", "Acesso Restrito");
    const m = document.getElementById('modal-novo-painel-contrato');
    if (m) {
      m.classList.remove('hidden'); m.classList.add('flex');
      document.getElementById('panel-new-empresa').value = '';
      document.getElementById('panel-new-ctt-num').value = '';
      this.populateYearSelect(document.getElementById('panel-new-ctt-ano'), 2026);
      this.populateFiscalSelect(document.getElementById('panel-new-fiscal'), 'NÃO INFORMADO');
      document.getElementById('panel-new-valor').value = '';
      document.getElementById('panel-new-venc-iso').value = '';
      this.setupPrazoControls('new', '', '');
      document.getElementById('panel-new-objeto').value = '';
      document.getElementById('panel-new-observacao').value = '';
      const linkInp = document.getElementById('panel-new-link');
      if (linkInp) linkInp.value = '';
      this.onLinkInput('new');
      this.setImportStatus('new', null, '');

      // Campos de Cotação LDO / LOA
      const chkComp = document.getElementById('panel-new-is-compartilhado');
      if (chkComp) chkComp.checked = false;
      const cotaEl = document.getElementById('panel-new-cota-saude');
      if (cotaEl) cotaEl.value = '';
      const exAtualEl = document.getElementById('panel-new-ex-atual');
      if (exAtualEl) exAtualEl.value = '';
      const exSeguinteEl = document.getElementById('panel-new-ex-seguinte');
      if (exSeguinteEl) exSeguinteEl.value = '';
      this.onCompartilhadoChange('new');

      setTimeout(() => {
        const focusTarget = document.getElementById('panel-new-link') || document.getElementById('panel-new-empresa');
        if (focusTarget) focusTarget.focus();
      }, 80);
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
    const valor = this.parseCurrency(document.getElementById('panel-new-valor').value) || 0;
    const rawDataIso = document.getElementById('panel-new-venc-iso').value;
    const dataIso = this.formatDateIso(rawDataIso);
    const fiscal = document.getElementById('panel-new-fiscal').value.toUpperCase();
    const prazoTxt = document.getElementById('panel-new-prazo-txt').value.trim();
    const objeto = document.getElementById('panel-new-objeto').value.trim();
    const obsTxt = document.getElementById('panel-new-observacao').value.trim();
    const linkEl = document.getElementById('panel-new-link');
    const linkContrato = linkEl ? linkEl.value.trim() : '';

    if (!empresa || !numCtt || !dataIso) return app.ui.toast("Preencha ao menos Empresa, Nº do Contrato e Vencimento.", "warning", "Campos Obrigatórios");

    const numeroCtt = `${numCtt}/${anoCtt}`;
    const now = new Date();
    const criadoEm = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const criadoPor = (app.state.auth.user && app.state.auth.user.usuario) || 'admin';
    const observacao = this.cleanObservacao(obsTxt);

    // LDO / LOA
    const isCompartilhado = document.getElementById('panel-new-is-compartilhado')?.checked || false;
    let cotaSaude = this.parseCurrency(document.getElementById('panel-new-cota-saude')?.value);
    if (!isCompartilhado || isNaN(cotaSaude) || cotaSaude <= 0) {
      cotaSaude = valor;
    }
    const exAtual = this.parseCurrency(document.getElementById('panel-new-ex-atual')?.value);
    const exSeguinte = this.parseCurrency(document.getElementById('panel-new-ex-seguinte')?.value);
    const part = this.calculateEstimatedPartition(cotaSaude, dataIso, prazoTxt);
    const exercicioAtual = !isNaN(exAtual) && exAtual >= 0 ? exAtual : part.atual;
    const exercicioSeguinte = !isNaN(exSeguinte) && exSeguinte >= 0 ? exSeguinte : part.seguinte;

    const newObj = {
      id: Date.now(), empresa, numeroCtt, prazoVencimento: prazoTxt,
      dataVencimentoIso: dataIso, valorContrato: valor, fiscal,
      status: "Ativo", objeto, criadoEm, criadoPor, observacao, linkContrato,
      isCompartilhado, cotaSaude, exercicioAtual, exercicioSeguinte,
      anoAtual: 2026, anoSeguinte: 2027
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
    const cttFormatado = this.formatCttNumber(item.numeroCtt);
    if (String(cttFormatado).includes('/')) {
      const parts = String(cttFormatado).split('/');
      num = parts[0].replace(/[^0-9]/g, '').slice(0, 5);
      ano = parts[1].trim() || '2026';
    } else {
      num = String(cttFormatado).replace(/[^0-9]/g, '').slice(0, 5);
    }
    document.getElementById('panel-edit-ctt-num').value = num;
    this.populateYearSelect(document.getElementById('panel-edit-ctt-ano'), ano);
    this.populateFiscalSelect(document.getElementById('panel-edit-fiscal'), item.fiscal);

    document.getElementById('panel-edit-valor').value = item.valorContrato > 0 ? this.formatCurrency(item.valorContrato) : '';
    document.getElementById('panel-edit-venc-iso').value = this.formatDateIso(item.dataVencimentoIso);
    this.setupPrazoControls('edit', item.prazoVencimento, item.dataVencimentoIso);
    document.getElementById('panel-edit-objeto').value = item.objeto || '';
    
    const obsEl = document.getElementById('panel-edit-observacao');
    if (obsEl) obsEl.value = this.cleanObservacao(item.observacao || '');

    const linkEl = document.getElementById('panel-edit-link');
    if (linkEl) linkEl.value = item.linkContrato || '';
    this.onLinkInput('edit');
    this.setImportStatus('edit', null, '');

    // Campos de Cotação LDO / LOA
    const budget = this.getContractBudget(item);
    const chkComp = document.getElementById('panel-edit-is-compartilhado');
    if (chkComp) chkComp.checked = budget.isCompartilhado;
    const cotaEl = document.getElementById('panel-edit-cota-saude');
    if (cotaEl) cotaEl.value = budget.cotaSaude > 0 ? this.formatCurrency(budget.cotaSaude) : '';
    const exAtualEl = document.getElementById('panel-edit-ex-atual');
    if (exAtualEl) exAtualEl.value = budget.exercicioAtual > 0 ? this.formatCurrency(budget.exercicioAtual) : '';
    const exSeguinteEl = document.getElementById('panel-edit-ex-seguinte');
    if (exSeguinteEl) exSeguinteEl.value = budget.exercicioSeguinte >= 0 ? this.formatCurrency(budget.exercicioSeguinte) : '';
    this.onCompartilhadoChange('edit');
    this.onBudgetPartitionInput('edit');

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
    const newObs = this.cleanObservacao(document.getElementById('panel-edit-observacao').value);
    const linkEl = document.getElementById('panel-edit-link');
    const newLink = linkEl ? linkEl.value.trim() : '';

    const newEmpresa = document.getElementById('panel-edit-empresa').value.trim();
    const newNumCtt = `${numCtt}/${anoCtt}`;
    const newValor = this.parseCurrency(document.getElementById('panel-edit-valor').value) || 0;
    const newVencIso = this.formatDateIso(document.getElementById('panel-edit-venc-iso').value);
    const newFiscal = document.getElementById('panel-edit-fiscal').value.toUpperCase();
    const newPrazo = document.getElementById('panel-edit-prazo-txt').value.trim();
    const newObjeto = document.getElementById('panel-edit-objeto').value.trim();

    // LDO / LOA
    const isCompartilhado = document.getElementById('panel-edit-is-compartilhado')?.checked || false;
    let cotaSaude = this.parseCurrency(document.getElementById('panel-edit-cota-saude')?.value);
    if (!isCompartilhado || isNaN(cotaSaude) || cotaSaude <= 0) {
      cotaSaude = newValor;
    }
    const exAtual = this.parseCurrency(document.getElementById('panel-edit-ex-atual')?.value);
    const exSeguinte = this.parseCurrency(document.getElementById('panel-edit-ex-seguinte')?.value);
    const part = this.calculateEstimatedPartition(cotaSaude, newVencIso, newPrazo);
    const exercicioAtual = !isNaN(exAtual) && exAtual >= 0 ? exAtual : part.atual;
    const exercicioSeguinte = !isNaN(exSeguinte) && exSeguinte >= 0 ? exSeguinte : part.seguinte;

    // Detectar alterações específicas para o log de auditoria permanente
    const changes = [];
    if (item.empresa !== newEmpresa) changes.push(`Empresa: "${item.empresa}" ➔ "${newEmpresa}"`);
    if (item.numeroCtt !== newNumCtt) changes.push(`Nº Contrato: ${item.numeroCtt} ➔ ${newNumCtt}`);
    if (Math.abs(Number(item.valorContrato || 0) - newValor) > 0.001) {
      changes.push(`Valor: ${this.formatCurrency(item.valorContrato)} ➔ ${this.formatCurrency(newValor)}`);
    }
    if (item.fiscal !== newFiscal) changes.push(`Fiscal: ${item.fiscal || '(vazio)'} ➔ ${newFiscal}`);
    if (item.dataVencimentoIso !== newVencIso) {
      const dtAnt = item.dataVencimentoIso ? this.formatDateBr(this.parseAnyDate(item.dataVencimentoIso)) : '(vazio)';
      const dtNova = newVencIso ? this.formatDateBr(this.parseAnyDate(newVencIso)) : '(vazio)';
      changes.push(`Vencimento: ${dtAnt} ➔ ${dtNova}`);
    }
    if ((item.prazoVencimento || '') !== newPrazo) {
      changes.push(`Prazo de Renovação / Adição de contrato: "${item.prazoVencimento || 'Não Informado'}" ➔ "${newPrazo || 'Não Informado'}"`);
    }
    if ((item.objeto || '').trim() !== newObjeto) {
      const objResumo = newObjeto.length > 50 ? newObjeto.slice(0, 50) + '...' : newObjeto;
      changes.push(`Objeto: "${objResumo}"`);
    }
    if (this.cleanObservacao(item.observacao || '') !== newObs) {
      const obsResumo = newObs.length > 60 ? newObs.slice(0, 60) + '...' : newObs;
      changes.push(obsResumo ? `Observação: "${obsResumo}"` : `Observação limpa/removida`);
    }
    if ((item.linkContrato || '').trim() !== newLink) changes.push(`Link oficial atualizado`);
    if (item.isCompartilhado !== isCompartilhado || Math.abs(Number(item.cotaSaude || 0) - cotaSaude) > 0.001) {
      changes.push(`Cota Saúde (LDO): ${this.formatCurrency(item.cotaSaude || item.valorContrato)} ➔ ${this.formatCurrency(cotaSaude)}`);
    }

    const detalhesStr = changes.length > 0
      ? `Contrato nº ${newNumCtt} (${newEmpresa}) [ID:${item.id}] | ` + changes.join(' | ')
      : `Contrato nº ${newNumCtt} (${newEmpresa}) [ID:${item.id}] | Dados confirmados sem alteração`;

    item.empresa = newEmpresa;
    item.numeroCtt = newNumCtt;
    item.valorContrato = newValor;
    item.dataVencimentoIso = newVencIso;
    item.fiscal = newFiscal;
    item.prazoVencimento = newPrazo;
    item.objeto = newObjeto;
    item.observacao = newObs;
    item.linkContrato = newLink;
    item.isCompartilhado = isCompartilhado;
    item.cotaSaude = cotaSaude;
    item.exercicioAtual = exercicioAtual;
    item.exercicioSeguinte = exercicioSeguinte;
    item.anoAtual = 2026;
    item.anoSeguinte = 2027;

    // Registra imediatamente no histórico de auditoria local em memória para consulta instantânea
    const now = new Date();
    const dataHoraStr = `${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
    if (!app.state.auditLogs) app.state.auditLogs = [];
    app.state.auditLogs.unshift({
      id: Date.now(),
      dataHora: dataHoraStr,
      usuario: currentUser,
      modulo: "Contratos LDO",
      acao: "Editar Contrato",
      detalhes: detalhesStr,
      registroId: newNumCtt
    });

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
        contract: item,
        detalhes: detalhesStr
      });

      // Grava o diff detalhado na trilha de auditoria permanente da planilha
      if (changes.length > 0) {
        await app.data.sendToCloud({
          action: "RECORD_AUDIT_LOG",
          currentUser: currentUser,
          modulo: "Contratos LDO",
          acao: "Editar Contrato",
          detalhes: detalhesStr,
          registroId: newNumCtt
        });
      }

      if (app.ui && app.ui.advanceLoading) app.ui.advanceLoading(3);
      app.ui.toast("Contrato atualizado com sucesso!", "success", "Painel de Contratos");
    } catch(err) {
      console.error(err);
      app.ui.toast("Erro ao sincronizar com a planilha.", "danger", "Erro");
    } finally {
      if (app.ui && app.ui.hideLoading) app.ui.hideLoading();
    }
  },

  // --------------------------------------------------------------------------
  // MODAL E TRILHA DE HISTÓRICO DE ALTERAÇÕES DO CONTRATO
  // --------------------------------------------------------------------------
  currentHistoryContractId: null,

  async openContractHistoryModal(targetId) {
    let id = targetId;
    if (!id) {
      const editIdEl = document.getElementById('panel-edit-id');
      if (editIdEl && editIdEl.value) id = Number(editIdEl.value);
    }
    const item = (app.state.panelContracts || []).find(c => Number(c.id) === Number(id));
    if (!item) return app.ui.toast("Selecione um contrato para visualizar as alterações.", "warning", "Histórico");

    this.currentHistoryContractId = item.id;

    const subEl = document.getElementById('hist-ctt-subtitulo');
    if (subEl) {
      subEl.textContent = `Contrato nº ${item.numeroCtt || 'S/N'} — ${item.empresa || 'Sem Razão Social'}`;
    }

    const listEl = document.getElementById('hist-ctt-lista');
    if (listEl) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-slate-400 text-xs">
          <div class="w-8 h-8 mx-auto mb-2 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          Carregando histórico do contrato da planilha central...
        </div>
      `;
    }

    const modal = document.getElementById('modal-historico-alteracoes-contrato');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    // Busca automática e imediata dos logs mais recentes diretamente na planilha
    if (app.data && app.data.fetchAuditLogs) {
      try {
        const freshLogs = await app.data.fetchAuditLogs(500);
        if (freshLogs && Array.isArray(freshLogs) && freshLogs.length > 0) {
          // Mescla inteligente: preserva diffs estruturados locais recentes que ainda não desceram da planilha
          const existingKeys = new Set(freshLogs.map(l => `${l.usuario}_${l.dataHora}_${l.detalhes}`));
          const localOnly = (app.state.auditLogs || []).filter(l => !existingKeys.has(`${l.usuario}_${l.dataHora}_${l.detalhes}`));
          app.state.auditLogs = [...localOnly, ...freshLogs];
        }
      } catch (err) {
        console.error("Erro ao carregar logs da planilha:", err);
      }
    }

    await this.renderContractHistory(item);
  },

  closeContractHistoryModal() {
    const modal = document.getElementById('modal-historico-alteracoes-contrato');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  isLogMatchingContract(l, item) {
    if (!l || !item) return false;

    // 1. O módulo deve ser referente a contratos
    const mod = String(l.modulo || '').toLowerCase();
    if (!mod.includes('contrato')) return false;

    const idStr = String(item.id || '').trim();
    const rawNum = String(item.numeroCtt || '').trim();
    const det = String(l.detalhes || '').trim();
    const detLower = det.toLowerCase();

    // Normalizar registroId do log (inclusive se o Google Sheets converteu '04/2023' para Date string)
    let reg = String(l.registroId || '').trim();
    if (reg.includes('GMT') || (reg.includes('00:00:00') && isNaN(Number(reg)))) {
      const parsedDt = new Date(reg);
      if (!isNaN(parsedDt.getTime())) {
        const mm = String(parsedDt.getMonth() + 1).padStart(2, '0');
        const yyyy = parsedDt.getFullYear();
        reg = `${mm}/${yyyy}`;
      }
    }

    // 2. Correspondência direta por registroId ou marcador de ID interno
    if (idStr && (reg === idStr || det.includes(`[ID:${idStr}]`))) {
      return true;
    }

    // Palavras-chave significativas da empresa do contrato aberto para desambiguação
    const empRaw = String(item.empresa || '').toLowerCase();
    const empKeywords = empRaw
      .replace(/[^a-z0-9áéíóúâêîôûãõç]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4 && !['ltda', 'eireli', 'servicos', 'serviços', 'comercio', 'comércio', 'associacao', 'associação', 'instituto', 'empresa', 'prefeitura', 'municipal'].includes(w));

    const matchesEmpresa = empKeywords.length > 0 && empKeywords.some(kw => detLower.includes(kw));

    const isGenericNum = !rawNum || /^(s\/?n|em\s*aberto|sem\s*n[uú]mero|-)$/i.test(rawNum);

    if (!isGenericNum) {
      let numPattern;
      let regPatternMatches = false;

      if (rawNum.includes('/')) {
        const parts = rawNum.split('/');
        const p1 = parseInt(parts[0], 10);
        const p2 = parts[1].trim();
        if (!isNaN(p1) && p2) {
          numPattern = `0*${p1}\\/${p2}`;
          const regParts = reg.split('/');
          if (regParts.length === 2 && parseInt(regParts[0], 10) === p1 && regParts[1].trim() === p2) {
            regPatternMatches = true;
          }
        } else {
          numPattern = rawNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
      } else {
        const p = parseInt(rawNum, 10);
        if (!isNaN(p)) {
          numPattern = `0*${p}\\b`;
          if (parseInt(reg, 10) === p) regPatternMatches = true;
        } else {
          numPattern = rawNum.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
      }

      if (!regPatternMatches && reg.toLowerCase() === rawNum.toLowerCase()) {
        regPatternMatches = true;
      }

      // Regex para identificar menção expressa a este contrato nos detalhes:
      // Ex: "Contrato nº 04/2023", "Contrato nº 4/2023", "Contrato 539/2025"
      const cttRegex = new RegExp(`(?:contrato\\s*(?:n[ºo.]?\\s*)?)${numPattern}(?!\\d)`, 'i');
      const matchesNumInDet = cttRegex.test(det);

      if (regPatternMatches || matchesNumInDet) {
        // Desambiguação para casos onde outro contrato tenha o mesmo número (ex: 297/2025):
        if (empKeywords.length > 0 && (det.includes(' - ') || det.includes('('))) {
          if (!matchesEmpresa) {
            const otherCtt = (app.state.panelContracts || []).find(c => c.id !== item.id && c.numeroCtt === item.numeroCtt);
            if (otherCtt) {
              const otherEmp = String(otherCtt.empresa || '').toLowerCase();
              const otherKw = otherEmp.replace(/[^a-z0-9áéíóúâêîôûãõç]/g, ' ').split(/\s+/).filter(w => w.length >= 4);
              if (otherKw.some(kw => detLower.includes(kw))) {
                return false;
              }
            }
          }
        }
        return true;
      }
    } else {
      // Contrato em aberto ou sem número: vincula rigorosamente pelo nome da empresa
      if (matchesEmpresa && (detLower.includes('aberto') || detLower.includes('s/n') || detLower.includes('cadastrar') || detLower.includes('contrato'))) {
        return true;
      }
    }

    return false;
  },

  async renderContractHistory(item) {
    const listEl = document.getElementById('hist-ctt-lista');
    if (!listEl) return;

    const matchedLogs = (app.state.auditLogs || []).filter(l => this.isLogMatchingContract(l, item));
    const legacyEntries = this.extractLegacyRubricas(item.observacao);

    const allEntries = [];
    const usedLegacyIndices = new Set();

    // 1. Processar logs de auditoria da planilha
    matchedLogs.forEach(l => {
      let detalhesText = l.detalhes || '';
      const isStructuredDiff = detalhesText.includes(' | ');

      // Se for um log antigo sem diff estruturado (ex: "Contrato nº ... - Empresa (Venc: )")
      if (!isStructuredDiff && (detalhesText.startsWith('Contrato nº') || detalhesText.startsWith('Contrato '))) {
        // Tenta associar com uma rubrica legada correspondente pela data/hora
        const logDt = String(l.dataHora || '');
        let matchedLegacyIdx = -1;

        legacyEntries.forEach((leg, idx) => {
          if (usedLegacyIndices.has(idx)) return;
          if (leg.usuario.toLowerCase() === (l.usuario || '').toLowerCase()) {
            const legDt = String(leg.dataHora || '');
            if (legDt.slice(0, 10) === logDt.slice(0, 10)) {
              const legHora = (legDt.match(/(\d{1,2}:\d{2})/) || [])[1];
              const logHora = (logDt.match(/(\d{1,2}:\d{2})/) || [])[1];
              if (legHora && logHora && legHora === logHora) {
                matchedLegacyIdx = idx;
              } else if (matchedLegacyIdx === -1) {
                matchedLegacyIdx = idx;
              }
            }
          }
        });

        if (matchedLegacyIdx !== -1) {
          usedLegacyIndices.add(matchedLegacyIdx);
          const matchedLeg = legacyEntries[matchedLegacyIdx];
          detalhesText = matchedLeg.nota
            ? `Apontamento em observação: "${matchedLeg.nota}"`
            : matchedLeg.detalhes;
        }
      }

      allEntries.push({
        id: l.id,
        dataHora: l.dataHora || '—',
        usuario: l.usuario || 'sistema',
        acao: l.acao || 'Alteração',
        detalhes: detalhesText,
        tipo: 'audit'
      });
    });

    // 2. Adicionar rubricas legadas que não tenham sido associadas a logs da planilha
    legacyEntries.forEach((leg, idx) => {
      if (!usedLegacyIndices.has(idx)) {
        allEntries.push({
          id: 'legacy_' + Math.random(),
          dataHora: leg.dataHora,
          usuario: leg.usuario,
          acao: leg.acao,
          detalhes: leg.detalhes,
          tipo: 'legacy'
        });
      }
    });

    // 3. Ordenação cronológica decrescente (mais recentes primeiro)
    allEntries.sort((a, b) => {
      const parseDt = (str) => {
        if (!str || str === '—') return 0;
        const m = String(str).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+às\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
        if (m) {
          return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]), Number(m[4] || 0), Number(m[5] || 0), Number(m[6] || 0)).getTime();
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? 0 : d.getTime();
      };
      return parseDt(b.dataHora) - parseDt(a.dataHora);
    });

    // 4. Se houver apontamentos em observação ou diffs estruturados, elimina logs vagos redundantes
    const displayEntries = [];
    allEntries.forEach(entry => {
      const isVagueOldLog = !entry.detalhes.includes(' | ') && 
                            !entry.detalhes.startsWith('Apontamento em observação:') &&
                            (entry.detalhes.startsWith('Contrato nº') || entry.detalhes.startsWith('Contrato '));
      
      if (isVagueOldLog) {
        // Se já existe entrada detalhada (apontamento ou diff) no mesmo dia pelo mesmo usuário, descarta o log vago
        const hasSpecificSameDay = allEntries.some(other => 
          other !== entry &&
          other.usuario.toLowerCase() === entry.usuario.toLowerCase() &&
          other.dataHora.slice(0, 10) === entry.dataHora.slice(0, 10) &&
          (other.detalhes.includes(' | ') || other.detalhes.startsWith('Apontamento em observação:'))
        );
        if (hasSpecificSameDay) return;

        // Se já existe um log vago registrado no mesmo dia pelo mesmo usuário, ignora duplicações em sequência
        const alreadyHasVague = displayEntries.some(d => 
          d.usuario.toLowerCase() === entry.usuario.toLowerCase() &&
          d.dataHora.slice(0, 10) === entry.dataHora.slice(0, 10)
        );
        if (!alreadyHasVague) {
          displayEntries.push(entry);
        }
      } else {
        displayEntries.push(entry);
      }
    });

    if (displayEntries.length === 0) {
      listEl.innerHTML = `
        <div class="text-center py-10 px-4 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
          <div class="text-2xl mb-1.5">📜</div>
          <h5 class="text-xs font-bold text-slate-700">Nenhuma alteração registrada para este contrato</h5>
          <p class="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">As modificações salvas a partir de agora serão registradas de forma detalhada nesta janela com data, hora, usuário e campos alterados.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = displayEntries.map(entry => {
      return `
        <div class="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200/80 transition space-y-2.5">
          <!-- O que foi modificado (campos e valores) -->
          <div>
            ${this.renderHistoryDetails(entry.detalhes, entry.acao, entry.tipo)}
          </div>

          <!-- Rodapé do card: Usuário responsável e Data/Horário -->
          <div class="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <span class="text-slate-400">👤</span> ${entry.usuario}
            </span>
            <span class="text-slate-400 font-medium flex items-center gap-1 whitespace-nowrap">
              <span>🕒</span> ${entry.dataHora}
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  renderHistoryDetails(detalhes, acao, tipo) {
    if (!detalhes) return '<span class="text-slate-400 italic">Atualização de dados confirmada</span>';

    // 1. Apontamento em observação prévia
    if (detalhes.startsWith('Apontamento em observação:')) {
      const nota = detalhes.replace(/^Apontamento em observação:\s*/, '').replace(/^"|"$/g, '').trim();
      return `
        <div class="space-y-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md inline-block">💬 Apontamento da Observação</span>
          <div class="text-slate-700 text-xs bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed font-medium whitespace-pre-line">${nota}</div>
        </div>
      `;
    }

    // 2. Novo log com diff de campos separados por " | "
    const cleanDet = detalhes.replace(/\s*\[ID:\d+\]/gi, '');
    if (cleanDet.includes(' | ')) {
      const parts = cleanDet.split(' | ');
      // parts[0] é a identificação do contrato (já presente no topo do modal)
      const fieldChanges = parts.slice(1);

      if (fieldChanges.length === 0 || (fieldChanges.length === 1 && fieldChanges[0].includes('sem alteração'))) {
        return `
          <div class="flex items-center gap-1.5 text-slate-500 text-xs font-medium bg-white p-2.5 rounded-xl border border-slate-200/60">
            <span class="text-emerald-500 font-bold">✓</span>
            <span>Edição confirmada sem alteração de valores ou vigência</span>
          </div>
        `;
      }

      return `
        <div class="space-y-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Campos modificados:</span>
          <div class="space-y-1">
            ${fieldChanges.map(change => {
              if (change.includes(' ➔ ')) {
                const sepIdx = change.indexOf(': ');
                if (sepIdx !== -1) {
                  const campo = change.substring(0, sepIdx);
                  const transicao = change.substring(sepIdx + 2);
                  return `
                    <div class="flex items-start gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 text-xs">
                      <span class="font-bold text-slate-700 whitespace-nowrap">${campo}:</span>
                      <span class="text-blue-700 font-semibold">${transicao}</span>
                    </div>
                  `;
                }
              }
              return `
                <div class="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 text-xs text-slate-700 font-medium">
                  <span class="text-blue-500 font-bold">•</span>
                  <span>${change}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    // 3. Cadastrar Contrato
    const acaoLower = String(acao || '').toLowerCase();
    if (acaoLower.includes('cadastrar') || acaoLower.includes('criar')) {
      return `
        <div class="flex items-center gap-2 text-emerald-800 text-xs font-semibold bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
          <span>✨</span>
          <span>Contrato cadastrado no mural institucional</span>
        </div>
      `;
    }

    // 4. Arquivar / Desarquivar
    if (acaoLower.includes('arquivar')) {
      const isArquivado = detalhes.toLowerCase().includes('marcado como arquivado');
      return `
        <div class="flex items-center gap-2 text-amber-800 text-xs font-semibold bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
          <span>📁</span>
          <span>${isArquivado ? 'Contrato arquivado' : 'Contrato desarquivado (reativado no painel ativo)'}</span>
        </div>
      `;
    }

    // 5. Excluir
    if (acaoLower.includes('excluir')) {
      return `
        <div class="flex items-center gap-2 text-rose-800 text-xs font-semibold bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl">
          <span>🗑️</span>
          <span>Contrato excluído do painel</span>
        </div>
      `;
    }

    // 6. Logs antigos da planilha sem diff estruturado
    // Ex: "Contrato nº 258/2026 - K & S EMPREENDIMENTOS IMOBILIARIOS LTDA (Venc: 60 Meses até 15/07/2032)"
    // Ex: "Contrato nº 171/2026 - NILDIESEL RETÍFICA DE MOTORES LTDA (R$ 331.978,43)"
    if (cleanDet.startsWith('Contrato nº') || cleanDet.startsWith('Contrato ')) {
      const matchParen = cleanDet.match(/\(([^)]+)\)\s*$/);
      if (matchParen) {
        const info = matchParen[1].trim();
        if (info.startsWith('Venc:')) {
          const vencVal = info.replace(/^Venc:\s*/, '').trim();
          if (vencVal) {
            return `
              <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/60 text-xs">
                <span class="font-bold text-slate-700">📅 Vigência/Vencimento:</span>
                <span class="text-blue-700 font-semibold">${vencVal}</span>
              </div>
            `;
          }
        } else if (info.startsWith('R$')) {
          return `
            <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/60 text-xs">
              <span class="font-bold text-slate-700">💰 Valor do Contrato:</span>
              <span class="text-blue-700 font-semibold">${info}</span>
            </div>
          `;
        } else if (info) {
          return `
            <div class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200/60 text-xs">
              <span class="text-blue-500 font-bold">•</span>
              <span class="text-slate-700 font-medium">${info}</span>
            </div>
          `;
        }
      }

      return `
        <div class="flex items-center gap-2 text-slate-600 text-xs bg-white px-3 py-2 rounded-xl border border-slate-200/60 font-medium">
          <span class="text-blue-500 font-bold">✓</span>
          <span>Confirmação cadastral na planilha central</span>
        </div>
      `;
    }

    return `<div class="text-slate-700 text-xs bg-white px-3 py-2 rounded-xl border border-slate-200/60 font-medium">${cleanDet}</div>`;
  },

  // ARQUIVAR / DESARQUIVAR (PRESERVAÇÃO DO HISTÓRICO LDO)
  async toggleArchive(id) {
    if (!app.permissions.can('panel_archive')) return app.ui.toast("Sem permissão para arquivar contratos.", "warning", "Acesso Restrito");
    const item = (app.state.panelContracts || []).find(c => c.id === id);
    if (!item) return;

    let novoStatus;
    if (item.status === "Arquivado") {
      novoStatus = item._statusOriginal || (item.dataVencimentoIso ? "Ativo" : (item.numeroCtt === "Em Aberto" ? "Previsto" : "Ativo"));
    } else {
      item._statusOriginal = item.status;
      novoStatus = "Arquivado";
    }
    item.status = novoStatus;

    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(app.state.panelContracts);
    }
    app.render.contratosHub(document.getElementById('app-viewport'));

    if (app.ui && app.ui.showLoading) {
      app.ui.showLoading({
        title: novoStatus === "Arquivado" ? "Arquivando Contrato" : "Desarquivando Contrato",
        subtitle: "Atualizando status na base",
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
    const isPrevisto = item.status === 'Previsto' || String(item.numeroCtt).toLowerCase().includes('aberto');
    const inputEl = document.getElementById('panel-delete-typed-ctt');

    document.getElementById('panel-delete-target-id').value = item.id;
    document.getElementById('panel-delete-expected-ctt').textContent = item.numeroCtt || `ID #${item.id}`;
    if (inputEl) {
      inputEl.value = '';
      inputEl.placeholder = isPrevisto ? 'Digite "Em Aberto" para confirmar...' : 'Digite exatamente o número CTT...';
    }
    document.getElementById('panel-delete-error-msg').classList.add('hidden');

    document.getElementById('panel-delete-preview-empresa').textContent = item.empresa;
    document.getElementById('panel-delete-preview-valor').textContent = item.valorContrato > 0
      ? `R$ ${item.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : (isPrevisto ? 'Em Fase de Elaboração / A Definir' : 'R$ 0,00');
    document.getElementById('panel-delete-preview-fiscal').textContent = item.fiscal || 'PREFEITURA';

    const m = document.getElementById('modal-excluir-painel-contrato');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
      setTimeout(() => inputEl && inputEl.focus(), 80);
    }
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

    const normalize = (s) => String(s || '').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const typedNorm = normalize(typed);
    const expectedNorm = normalize(target.numeroCtt);
    const isIdMatch = typedNorm === String(target.id) || typedNorm === `#${target.id}`;
    const isOpenContract = expectedNorm.includes('aberto') || expectedNorm === 's/n' || !expectedNorm || target.status === 'Previsto';
    const isOpenContractTyped = typedNorm === 'em aberto' || typedNorm === 'emaberto' || typedNorm === 'aberto';

    const isValid = typedNorm === expectedNorm || isIdMatch || (isOpenContract && isOpenContractTyped);

    if (!isValid) {
      errEl.textContent = `Confirmação incorreta! Você digitou "${typed}", mas o esperado é "${target.numeroCtt}".`;
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
    const selectFilter = document.getElementById('panel-contratos-filter-select');
    if (selectFilter) {
      selectFilter.value = f;
    }
    this.updateContent();
  },

  setFiscal(fiscal) {
    app.state.panelFiscalFilter = fiscal;
    this.updateContent();
  },

  setSort(mode) {
    app.state.panelSort = mode || 'ALFABETICA_ASC';
    this.updateContent();
  },

  getSortLabel(mode) {
    const labels = {
      'ALFABETICA_ASC': 'Alfabética (A-Z)',
      'ALFABETICA_DESC': 'Alfabética (Z-A)',
      'VENCIMENTO_ASC': 'Vencimento (Mais próximos)',
      'VENCIMENTO_DESC': 'Vencimento (Mais distantes)',
      'VALOR_DESC': 'Maior Valor (R$)',
      'VALOR_ASC': 'Menor Valor (R$)',
      'NUMERO_CTT': 'Nº do Contrato',
      'POSICAO_MURAL': 'Posição no Mural'
    };
    return labels[mode] || 'Alfabética (A-Z)';
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
      const currSort = app.state.panelSort || 'ALFABETICA_ASC';
      countEl.textContent = `Exibindo ${list.length} de ${total} contratos do mural • Ordenado por: ${this.getSortLabel(currSort)}`;
    }
  },

  getFilteredList() {
    let list = (app.state.panelContracts || []).filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);

    const normalize = (str) => String(str || '')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    const filtered = list.filter(c => {
      const semaforo = this.calculateStatus(c);

      // Filtro Status / Semáforo
      let matchStatus = true;
      if (app.state.panelContractsFilter === 'MURAL') matchStatus = true;
      else if (app.state.panelContractsFilter === 'ATIVOS') matchStatus = c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'COMPARTILHADOS') matchStatus = !!c.isCompartilhado && c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'CRITICOS') matchStatus = semaforo.isUrgente && c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'ATENCAO') matchStatus = semaforo.label.includes('Atenção') && c.status === 'Ativo';
      else if (app.state.panelContractsFilter === 'PREVISTOS') matchStatus = c.status === 'Previsto';
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

    // ORDENAMENTO MULTI-CRITÉRIO (PADRÃO INSTITUCIONAL: ALFABÉTICA A-Z)
    const sortMode = app.state.panelSort || 'ALFABETICA_ASC';

    filtered.sort((a, b) => {
      // 1. Alfabética (A-Z)
      if (sortMode === 'ALFABETICA_ASC') {
        const empA = (a.empresa || '').replace(/^\[.*?\]\s*/, '');
        const empB = (b.empresa || '').replace(/^\[.*?\]\s*/, '');
        return empA.localeCompare(empB, 'pt-BR', { sensitivity: 'base' });
      }

      // 2. Alfabética (Z-A)
      if (sortMode === 'ALFABETICA_DESC') {
        const empA = (a.empresa || '').replace(/^\[.*?\]\s*/, '');
        const empB = (b.empresa || '').replace(/^\[.*?\]\s*/, '');
        return empB.localeCompare(empA, 'pt-BR', { sensitivity: 'base' });
      }

      // 3. Data de Vencimento (mais próximos / urgentes primeiro)
      if (sortMode === 'VENCIMENTO_ASC') {
        const dtA = this.getEffectiveDate(a) || this.parseAnyDate(a.dataVencimentoIso);
        const dtB = this.getEffectiveDate(b) || this.parseAnyDate(b.dataVencimentoIso);
        const tA = dtA ? dtA.getTime() : 9999999999999;
        const tB = dtB ? dtB.getTime() : 9999999999999;
        if (tA !== tB) return tA - tB;
        return (a.id || 0) - (b.id || 0);
      }

      // 4. Data de Vencimento (mais distantes primeiro)
      if (sortMode === 'VENCIMENTO_DESC') {
        const dtA = this.getEffectiveDate(a) || this.parseAnyDate(a.dataVencimentoIso);
        const dtB = this.getEffectiveDate(b) || this.parseAnyDate(b.dataVencimentoIso);
        const tA = dtA ? dtA.getTime() : -1;
        const tB = dtB ? dtB.getTime() : -1;
        if (tA !== tB) return tB - tA;
        return (a.id || 0) - (b.id || 0);
      }

      // 5. Maior Valor (R$)
      if (sortMode === 'VALOR_DESC') {
        const vA = Number(a.valorContrato) || 0;
        const vB = Number(b.valorContrato) || 0;
        if (vB !== vA) return vB - vA;
        return (a.id || 0) - (b.id || 0);
      }

      // 6. Menor Valor (R$)
      if (sortMode === 'VALOR_ASC') {
        const vA = Number(a.valorContrato) || 0;
        const vB = Number(b.valorContrato) || 0;
        if (vA !== vB) return vA - vB;
        return (a.id || 0) - (b.id || 0);
      }

      // 7. Nº do Contrato
      if (sortMode === 'NUMERO_CTT') {
        const cttA = String(a.numeroCtt || '');
        const cttB = String(b.numeroCtt || '');
        return cttA.localeCompare(cttB, 'pt-BR', { numeric: true });
      }

      // 8. Posição no Mural (#1 a #34)
      if (sortMode === 'POSICAO_MURAL') {
        return (a.id || 0) - (b.id || 0);
      }

      return 0;
    });

    return filtered;
  },

  renderCard(c) {
    const sem = this.calculateStatus(c);
    const isArch = c.status === 'Arquivado';
    const budget = this.getContractBudget(c);

    // RENDERIZAÇÃO DE ESPAÇO VAGO NO MURAL FÍSICO
    if (c.status === 'Disponível') {
      return `
        <div class="bg-slate-50/70 rounded-[2rem] p-5 border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/30 transition-all flex flex-col justify-between group relative cursor-pointer" onclick="${app.permissions.can('panel_edit') ? `app.contratos.occupySlot(${c.id})` : ''}">
            <div>
                <div class="flex items-center justify-between mb-3">
                    <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-600">
                        Espaço Vago
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
                        Folha Afixada
                    </span>
                    <span class="px-2 py-0.5 rounded-md bg-purple-100 font-mono text-[9px] font-black text-purple-800">
                        EM ELABORAÇÃO
                    </span>
                </div>
                <h3 class="text-sm font-black text-purple-950 group-hover:text-purple-700 transition leading-snug" title="${c.empresa}">
                    ${c.empresa}
                </h3>
                <span class="block text-xs font-mono font-bold text-purple-600 mt-1">CTT: ${this.formatCttNumber(c.numeroCtt)}</span>
                <div class="mt-3 p-3 bg-white/90 rounded-xl space-y-1 text-xs border border-purple-100">
                    <div class="flex justify-between">
                        <span class="text-slate-400 font-bold text-[10px] uppercase">Situação:</span>
                        <span class="font-bold text-purple-900 text-xs">${c.prazoVencimento}</span>
                    </div>
                </div>
                ${c.objeto ? `<p class="text-[11px] text-purple-900/80 italic mt-2 line-clamp-2">${c.objeto}</p>` : ''}
                ${this.cleanObservacao(c.observacao) ? `
                  <div class="mt-2.5 p-2 bg-purple-100/60 border border-purple-200 rounded-xl text-[10px] text-purple-900 leading-snug">
                    <div class="flex items-center justify-between mb-0.5">
                      <span class="font-bold">📝 Observação:</span>
                      <button type="button" onclick="event.stopPropagation(); app.contratos.openContractHistoryModal(${c.id})" class="text-[9px] font-bold text-purple-700 hover:underline">📜 Alterações</button>
                    </div>
                    <span>${this.cleanObservacao(c.observacao)}</span>
                  </div>
                ` : ''}
                ${c.linkContrato ? `
                  <div class="mt-2.5">
                    <a href="${c.linkContrato}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-200 transition shadow-2xs group/link" title="Abrir página oficial do contrato">
                      <span>🔗</span>
                      <span class="group-hover/link:underline">Ver no Portal Betha</span>
                      <span class="text-[10px] text-purple-500">↗</span>
                    </a>
                  </div>
                ` : ''}
            </div>
            <div class="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-between text-xs">
                ${app.permissions.can('panel_archive') ? `
                  <button onclick="app.contratos.toggleArchive(${c.id})" class="text-[11px] font-bold text-purple-700/80 hover:text-purple-950">
                      ${isArch ? '↩️ Desarquivar' : '📁 Arquivar'}
                  </button>
                ` : '<span></span>'}

                <div class="flex items-center gap-1.5">
                    ${app.permissions.can('panel_edit') ? `
                      <button onclick="app.contratos.openEditModal(${c.id})" title="Preencher / Formalizar Dados Formais" class="p-1.5 hover:bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] flex items-center gap-1">
                          ✏️ Preencher Dados Formais
                      </button>
                    ` : ''}
                    ${app.admin.isAdminUser() ? `
                      <button onclick="app.contratos.openDeleteModal(${c.id})" title="Excluir Definitivo (Administrador)" class="p-1.5 hover:bg-rose-50 text-rose-500 hover:text-rose-700 rounded-lg font-bold">
                          🗑️
                      </button>
                    ` : ''}
                </div>
            </div>
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-[2rem] p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between group relative ${isArch ? 'opacity-70 bg-slate-50' : ''}">
          <div>
              <!-- TOPO DO CARD: SEMÁFORO, BADGE COMPARTILHADO E FISCAL -->
              <div class="flex items-center justify-between gap-1.5 mb-3">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${sem.badgeClass}">
                        ${sem.label}
                    </span>
                    ${budget.isCompartilhado ? `
                      <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200" title="Contrato Compartilhado com outras secretarias">
                          🌐 Compartilhado
                      </span>
                    ` : ''}
                  </div>
                  <div class="flex items-center gap-1">
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[10px] font-black text-slate-700">
                          FISCAL: ${c.fiscal}
                      </span>
                  </div>
              </div>

              <!-- NOME DA EMPRESA E NÚMERO DO CONTRATO -->
              <h3 class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2" title="${c.empresa}">
                  ${c.empresa}
              </h3>
              <span class="block text-xs font-mono font-bold text-blue-600 mt-1">CTT: ${this.formatCttNumber(c.numeroCtt)}</span>

              <!-- DADOS FINANCEIROS E PRAZO -->
              <div class="mt-3 p-3 bg-slate-50 rounded-xl space-y-2 text-xs">
                  <div class="flex justify-between items-center">
                      <span class="text-slate-400 font-bold text-[10px] uppercase">${budget.isCompartilhado ? 'Global (Prefeitura):' : 'Valor Contrato:'}</span>
                      <span class="font-black text-slate-900 text-xs">R$ ${c.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  ${budget.isCompartilhado ? `
                    <div class="flex justify-between items-center bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-200">
                        <span class="font-black text-[10px] uppercase tracking-wide text-blue-800 flex items-center gap-1">
                            <span>🏛️</span> Cota da Saúde:
                        </span>
                        <span class="font-black text-blue-900 text-xs">R$ ${budget.cotaSaude.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  ` : ''}

                  <!-- DIVISÃO POR EXERCÍCIO LDO / LOA -->
                  <div class="pt-1.5 border-t border-slate-200/70">
                      <div class="flex justify-between items-center mb-1">
                          <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Cota por Exercício:</span>
                          <span class="text-[9px] font-bold text-slate-500">LDO / LOA</span>
                      </div>
                      <div class="grid grid-cols-2 gap-1.5 text-[10px]">
                          <div class="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                              <span class="text-slate-400 block font-bold text-[9px] uppercase">2026 (Vigente):</span>
                              <span class="font-black text-slate-800">R$ ${budget.exercicioAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div class="bg-white p-1.5 rounded-lg border border-slate-200 shadow-2xs">
                              <span class="text-slate-400 block font-bold text-[9px] uppercase">2027 (LOA):</span>
                              <span class="font-black text-emerald-700">R$ ${budget.exercicioSeguinte.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                      </div>
                  </div>

              <div class="flex justify-between items-center pt-0.5">
                  <span class="text-slate-400 font-bold text-[10px] uppercase">Vencimento CTT:</span>
                  <span class="font-bold text-slate-800 text-xs">${this.formatDateBr(c.dataVencimentoIso) || 'Não informado'}</span>
              </div>
              ${this.isRenovacaoPrazo(c.prazoVencimento) ? `
              <div class="flex justify-between items-center pt-0.5 text-blue-700">
                  <span class="font-bold text-[10px] uppercase">Renovação / Adição:</span>
                  <span class="font-black text-[11px]">${c.prazoVencimento.replace(/^(Renova[çc][ãa]o|Adi[çc][ãa]o|Prorroga[çc][ãa]o)\s*:\s*/i, '')}</span>
              </div>
              ` : ''}
          </div>

          <!-- VÍNCULO COM EMPENHOS DO CONTRATO -->
          ${(() => {
            const linkedEmps = (app.empenhos && typeof app.empenhos.getEmpenhosByContract === 'function')
              ? app.empenhos.getEmpenhosByContract(c)
              : [];
            if (linkedEmps.length === 0) return '';
            const totalEmp = linkedEmps.reduce((acc, e) => acc + (Number(e.valorTotal) || 0), 0);
            const usadoEmp = linkedEmps.reduce((acc, e) => acc + (Number(e.valorUsado) || 0), 0);
            const saldoEmp = Math.max(0, totalEmp - usadoEmp);
            const cttFormatted = this.formatCttNumber(c.numeroCtt);
            return `
              <div onclick="event.stopPropagation(); app.empenhos.filterByContract('${String(cttFormatted).replace(/'/g, "\\'")}')" class="mt-2.5 p-2.5 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 group/emp" title="Clique para ver os empenhos deste contrato">
                <div class="min-w-0">
                  <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                    <span>💳</span> ${linkedEmps.length} Empenho${linkedEmps.length > 1 ? 's' : ''} (${linkedEmps.map(e => e.numeroEmpenho).join(', ')})
                  </span>
                  <span class="text-[11px] font-black text-emerald-700 block mt-0.5">
                    Saldo Restante: R$ ${saldoEmp.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <span class="text-[10px] font-black text-emerald-700 group-hover/emp:translate-x-0.5 transition shrink-0">Ver →</span>
              </div>
            `;
          })()}

          <!-- LINK OFICIAL DO CONTRATO NA PREFEITURA / BETHA CLOUD -->
          ${c.linkContrato ? `
            <div class="mt-2.5">
              <a href="${c.linkContrato}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/90 transition shadow-2xs group/link" title="Abrir página oficial do contrato na Prefeitura / Betha Transparência">
                <span>🔗</span>
                <span class="group-hover/link:underline">Contrato na Prefeitura (Betha)</span>
                <span class="text-[10px] text-blue-400">↗</span>
              </a>
            </div>
          ` : ''}

          ${c.objeto ? `<p class="text-[11px] text-slate-500 italic mt-2 line-clamp-2">${c.objeto}</p>` : ''}

          <!-- OBSERVAÇÃO INSTITUCIONAL -->
          ${this.cleanObservacao(c.observacao) ? `
            <div class="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-snug">
              <div class="flex items-center justify-between mb-0.5">
                <span class="font-black text-[10px] text-amber-800 uppercase tracking-wide flex items-center gap-1">
                  📝 Observação:
                </span>
                <button type="button" onclick="event.stopPropagation(); app.contratos.openContractHistoryModal(${c.id})" class="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-0.5">
                  <span>📜 Alterações</span>
                </button>
              </div>
              <span class="break-words line-clamp-3" title="${this.cleanObservacao(c.observacao)}">${this.cleanObservacao(c.observacao)}</span>
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
              <button type="button" onclick="app.empenhos.filterByContract('${String(this.formatCttNumber(c.numeroCtt)).replace(/'/g, "\\'")}')" title="Ver ou Cadastrar Empenhos deste Contrato" class="p-1.5 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg font-bold">
                💳
              </button>
              <button type="button" onclick="app.contratos.openContractHistoryModal(${c.id})" title="Ver Histórico de Alterações" class="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-700 rounded-lg font-bold">
                📜
              </button>
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
    const sem = this.calculateStatus(c);
    const budget = this.getContractBudget(c);

    if (c.status === 'Disponível') {
      return `
        <tr class="hover:bg-slate-50 bg-slate-50/50">
            <td class="p-3.5 font-bold text-slate-400 italic">
                <div>⚪ ${c.empresa}</div>
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
                <div>${c.empresa}</div>
                ${c.linkContrato ? `
                  <div class="mt-1">
                    <a href="${c.linkContrato}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900 hover:underline" title="Abrir página oficial do contrato">
                      <span>🔗 Ver no Portal Betha</span>
                      <span class="text-[9px]">↗</span>
                    </a>
                  </div>
                ` : ''}
                ${this.cleanObservacao(c.observacao) ? `<div class="text-[10px] text-purple-700 font-semibold italic mt-0.5">📝 ${this.cleanObservacao(c.observacao)}</div>` : ''}
            </td>
            <td class="p-3.5 font-mono text-purple-600 font-bold">${this.formatCttNumber(c.numeroCtt)}</td>
            <td class="p-3.5 text-right font-bold text-slate-400">A Definir</td>
            <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-purple-100 font-bold text-[10px] text-purple-800">${c.fiscal}</span></td>
            <td class="p-3.5 text-purple-800 text-xs">${c.prazoVencimento}</td>
            <td class="p-3.5 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-100 text-purple-700">Em Elaboração</span>
            </td>
            <td class="p-3.5 text-center whitespace-nowrap print:hidden">
                <button onclick="app.contratos.openContractHistoryModal(${c.id})" class="text-purple-600 hover:text-purple-900 font-bold mr-1.5 text-xs" title="Ver Histórico de Alterações">📜</button>
                ${app.permissions.can('panel_edit') ? `<button onclick="app.contratos.openEditModal(${c.id})" class="text-purple-700 hover:text-purple-900 font-bold text-xs mr-1.5" title="Preencher / Formalizar">✏️</button>` : ''}
                ${app.permissions.can('panel_archive') ? `<button onclick="app.contratos.toggleArchive(${c.id})" class="text-purple-600 hover:text-purple-900 font-bold mr-1.5" title="Arquivar">📁</button>` : ''}
                ${app.admin.isAdminUser() ? `<button onclick="app.contratos.openDeleteModal(${c.id})" class="text-rose-500 hover:text-rose-700 font-bold" title="Excluir Definitivo (Administrador)">🗑️</button>` : ''}
            </td>
        </tr>
      `;
    }

    return `
      <tr class="hover:bg-slate-50">
          <td class="p-3.5 font-bold text-slate-900">
              <div class="flex items-center gap-1.5 flex-wrap">
                  <span>${c.empresa}</span>
                  ${budget.isCompartilhado ? `
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200" title="Contrato compartilhado">🌐 Compartilhado</span>
                  ` : ''}
              </div>
              ${c.linkContrato ? `
                <div class="mt-1">
                  <a href="${c.linkContrato}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline" title="Abrir página oficial do contrato na Prefeitura / Betha Cloud">
                    <span>🔗 Ver no Portal Betha</span>
                    <span class="text-[9px]">↗</span>
                  </a>
                </div>
              ` : ''}
              ${this.cleanObservacao(c.observacao) ? `<div class="text-[10px] text-amber-800 font-semibold italic mt-0.5 max-w-sm truncate" title="${this.cleanObservacao(c.observacao)}">📝 ${this.cleanObservacao(c.observacao)}</div>` : ''}
          </td>
          <td class="p-3.5 font-mono text-blue-700 font-bold">${this.formatCttNumber(c.numeroCtt)}</td>
          <td class="p-3.5 text-right font-black text-slate-900">
              <div>R$ ${c.valorContrato.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              ${budget.isCompartilhado ? `
                <div class="text-[10px] text-blue-700 font-black">Cota SMS: R$ ${budget.cotaSaude.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              ` : ''}
              <div class="text-[9px] text-slate-500 font-bold mt-0.5 whitespace-nowrap">
                2026: R$ ${budget.exercicioAtual.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} | 2027: R$ ${budget.exercicioSeguinte.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
              </div>
          </td>
          <td class="p-3.5"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">${c.fiscal}</span></td>
          <td class="p-3.5 text-slate-800 text-xs">
              <div class="font-bold">${this.formatDateBr(c.dataVencimentoIso) || '-'}</div>
              ${this.isRenovacaoPrazo(c.prazoVencimento) ? `
                <div class="text-[10px] text-blue-700 font-semibold" title="Prazo de Renovação / Adição considerado para alertas">🕒 ${c.prazoVencimento}</div>
              ` : ''}
          </td>
          <td class="p-3.5 text-center">
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${sem.badgeClass}">${sem.label}</span>
          </td>
          <td class="p-3.5 text-center whitespace-nowrap print:hidden">
              <button onclick="app.contratos.openContractHistoryModal(${c.id})" class="text-blue-600 hover:text-blue-800 font-bold mr-1.5 text-xs" title="Ver Histórico de Alterações">📜</button>
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
            <span class="text-sm font-black text-slate-800">Carregando Contratos...</span>
            <span class="text-slate-400 text-xs mt-1">Sincronizando dados em tempo real com o servidor</span>
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
    const headers = [
      "ID", "Empresa", "Numero_CTT", "Objeto", "Observacao", "Fiscal", 
      "Prazo_Vencimento", "Vencimento_ISO", "Compartilhado", 
      "Valor_Global_Prefeitura", "Cota_Saude_FMS", "Exercicio_2026_RS", 
      "Exercicio_2027_LOA_RS", "Situacao", "Link_Contrato"
    ];
    const rows = list.map(c => {
      const sem = this.calculateStatus(c);
      const b = this.getContractBudget(c);
      return [
        c.id, 
        `"${c.empresa.replace(/"/g, '""')}"`, 
        `"${this.formatCttNumber(c.numeroCtt)}"`, 
        `"${(c.objeto || '').replace(/"/g, '""')}"`,
        `"${(c.observacao || '').replace(/"/g, '""')}"`, 
        `"${c.fiscal}"`, 
        `"${c.prazoVencimento}"`, 
        `"${c.dataVencimentoIso}"`,
        b.isCompartilhado ? "SIM" : "NAO",
        b.valorGlobal.toFixed(2),
        b.cotaSaude.toFixed(2),
        b.exercicioAtual.toFixed(2),
        b.exercicioSeguinte.toFixed(2),
        `"${sem.label}"`,
        `"${(c.linkContrato || '').replace(/"/g, '""')}"`
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Painel_Contratos_LDO_LOA_Saude_Torres_${new Date().toISOString().slice(0, 10)}.csv`;
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

  const allContracts = (app.state.panelContracts || []).filter(c => c && c.status !== 'Disponível' && !String(c.empresa).includes('ESPAÇO VAZIO') && String(c.empresa || '').trim().length > 0);
  if (allContracts.length !== (app.state.panelContracts || []).length) {
    app.state.panelContracts = allContracts;
    if (app.data && app.data.saveLocalPanelContracts) {
      app.data.saveLocalPanelContracts(allContracts);
    }
  }
  const activeContracts = allContracts.filter(c => c.status === 'Ativo');
  const previstosList = allContracts.filter(c => c.status === 'Previsto');
  const criticosList = activeContracts.filter(c => {
    const s = app.contratos.calculateStatus(c);
    return s.isUrgente;
  });
  const atencaoList = activeContracts.filter(c => {
    const s = app.contratos.calculateStatus(c);
    return s.label.includes('Atenção');
  });
  
  // CÁLCULOS DOS KPIS LDO / LOA
  const totalPosicoesMural = allContracts.length;
  const totalAtivos = activeContracts.length;

  let montanteGlobalPrefeitura = 0;
  let totalCotaSaude = 0;
  let totalComprometido2026 = 0;
  let totalComprometido2027 = 0;
  let totalCompartilhados = 0;

  activeContracts.forEach(c => {
    const b = app.contratos.getContractBudget(c);
    montanteGlobalPrefeitura += b.valorGlobal;
    totalCotaSaude += b.cotaSaude;
    totalComprometido2026 += b.exercicioAtual;
    totalComprometido2027 += b.exercicioSeguinte;
    if (b.isCompartilhado) totalCompartilhados++;
  });

  const filteredList = app.contratos.getFilteredList();
  const isCardsMode = (app.state.panelViewMode || 'CARDS') === 'CARDS';
  const currFilter = app.state.panelContractsFilter || 'MURAL';
  const currSort = app.state.panelSort || 'ALFABETICA_ASC';

  const activeEmpenhosCount = (app.state.empenhos || []).filter(e => e && e.status !== 'Arquivado').length;

  el.innerHTML = `
    <div class="container mx-auto px-4 sm:px-6 py-6 sm:py-8 fade-in">
        
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <button onclick="app.ui.navigate('saude_links')" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-blue-600 transition group py-1">
                <svg class="w-4 h-4 transition group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                <span>Voltar para o Portal de Acessos</span>
            </button>

            <!-- SELETOR INTEGRADO: CONTRATOS LDO vs CONTROLE DE EMPENHOS -->
            <div class="inline-flex items-center bg-slate-200/80 p-1 rounded-2xl border border-slate-300/80 self-start sm:self-auto">
                <button onclick="app.ui.navigate('contratos')" class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-white text-indigo-700 shadow-xs transition flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Mural de Contratos (LDO)</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800">${totalPosicoesMural}</span>
                </button>
                <button onclick="app.ui.navigate('empenhos')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition flex items-center gap-1.5">
                    <span>💳</span>
                    <span>Controle de Empenhos</span>
                    <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-300/80 text-slate-700">${activeEmpenhosCount}</span>
                </button>
            </div>
        </div>

        <!-- CABEÇALHO DO PAINEL -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-blue-600">Governança Fiscal • Lei nº 5.627 (LDO Torres)</span>
                <h2 class="text-2xl sm:text-3xl font-black text-slate-900">Painel & Gestão Geral de Contratos</h2>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">Mural visual de monitoramento de vigências, semáforo de alerta e previsão orçamentária para LDO / LOA.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <button onclick="app.contratos.exportCSV()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                    📥 Exportar Relatório LDO / LOA (.CSV)
                </button>
                <button onclick="window.print()" class="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition">
                    🖨️ Imprimir
                </button>
                ${app.permissions.can('panel_create') ? `
                  <button onclick="app.contratos.openNewModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5">
                       <span class="text-sm">+</span> Novo Contrato
                  </button>
                ` : ''}
            </div>
        </div>

        <!-- OS 4 KPIS ESTRATÉGICOS DO TOPO (LDO / LOA) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <!-- 1. TOTAL DE POSIÇÕES NO MURAL -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mural de Contratos</span>
                    <span class="p-1 bg-slate-100 rounded text-slate-600 text-xs">📋</span>
                </div>
                <p class="text-2xl font-black text-slate-900 mt-1">${totalPosicoesMural} Contratos</p>
                <span class="text-[10px] text-slate-500 font-semibold">${totalAtivos} ativos vigentes • ${totalCompartilhados} compartilhados</span>
            </div>

            <!-- 2. TOTAL COTA SAÚDE (FMS) -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 bg-blue-50/20">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-blue-900 uppercase tracking-wider">Cota Total da Saúde (FMS)</span>
                    <span class="p-1 bg-blue-100 rounded text-blue-700 text-xs">🏛️</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-blue-700 mt-1">R$ ${totalCotaSaude.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-slate-500 font-medium truncate block" title="Global Prefeitura: R$ ${montanteGlobalPrefeitura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}">Global Prefeitura: R$ ${montanteGlobalPrefeitura.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <!-- 3. COMPROMETIDO EXERCÍCIO 2026 -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-amber-100 bg-amber-50/30">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-amber-900 uppercase tracking-wider">Exercício 2026 (Ano Vigente)</span>
                    <span class="p-1 bg-amber-100 rounded text-amber-800 text-xs">📅</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-amber-800 mt-1">R$ ${totalComprometido2026.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-amber-700 font-bold">Comprometimento do orçamento atual</span>
            </div>

            <!-- 4. RESERVA LOA 2027 -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 bg-emerald-50/30">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-black text-emerald-900 uppercase tracking-wider">Reserva para LOA 2027</span>
                    <span class="p-1 bg-emerald-100 rounded text-emerald-800 text-xs">🎯</span>
                </div>
                <p class="text-xl sm:text-2xl font-black text-emerald-800 mt-1">R$ ${totalComprometido2027.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <span class="text-[10px] text-emerald-700 font-bold">Previsão obrigatória LDO / LOA 2027</span>
            </div>
        </div>

        <!-- BARRA ÚNICA INTEGRADA: PESQUISA, FILTROS & ORDENAÇÃO (EM UMA LINHA SÓ) -->
        <div class="bg-white p-3 sm:p-3.5 rounded-2xl shadow-sm border border-slate-100 mb-4 flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            
            <!-- BUSCA EM TEMPO REAL (AMPLA E FLEXÍVEL) -->
            <div class="relative flex-1 min-w-[200px]">
                <input type="text" id="panel-contratos-search-input" oninput="app.contratos.setSearch(this.value)" value="${app.state.panelSearch || ''}" placeholder="Buscar por empresa, CTT, fiscal ou serviço..." class="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 focus:bg-white transition font-medium">
                <span class="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                <button id="panel-contratos-search-clear" onclick="app.contratos.clearSearch()" class="${(app.state.panelSearch || '').trim() ? '' : 'hidden'} absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs p-1" title="Limpar busca">✕</button>
            </div>

            <!-- 1. MENU: SITUAÇÃO / SEMÁFORO (DROPDOWN VERTICAL) -->
            <div class="flex items-center gap-1 shrink-0">
                <label for="panel-contratos-filter-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Situação:</label>
                <select id="panel-contratos-filter-select" onchange="app.contratos.setFilter(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition">
                    <option value="MURAL" ${currFilter === 'MURAL' ? 'selected' : ''}>🖼️ Mural (${totalPosicoesMural})</option>
                    <option value="ATIVOS" ${currFilter === 'ATIVOS' ? 'selected' : ''}>🟢 Ativos (${totalAtivos})</option>
                    <option value="COMPARTILHADOS" ${currFilter === 'COMPARTILHADOS' ? 'selected' : ''}>🌐 Compartilhados (${totalCompartilhados})</option>
                    <option value="CRITICOS" ${currFilter === 'CRITICOS' ? 'selected' : ''}>🔴 Críticos (${criticosList.length})</option>
                    <option value="ATENCAO" ${currFilter === 'ATENCAO' ? 'selected' : ''}>🟡 Atenção (${atencaoList.length})</option>
                    <option value="PREVISTOS" ${currFilter === 'PREVISTOS' ? 'selected' : ''}>📝 Previstos (${previstosList.length})</option>
                    <option value="ARQUIVADOS" ${currFilter === 'ARQUIVADOS' ? 'selected' : ''}>📁 Arquivados</option>
                </select>
            </div>

            <!-- 2. MENU: FISCAL RESPONSÁVEL (DROPDOWN VERTICAL) -->
            <div class="flex items-center gap-1 shrink-0">
                <label for="panel-contratos-fiscal-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Fiscal:</label>
                <select id="panel-contratos-fiscal-select" onchange="app.contratos.setFiscal(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 uppercase cursor-pointer transition">
                    <option value="TODOS" ${app.state.panelFiscalFilter === 'TODOS' ? 'selected' : ''}>Todos os Fiscais</option>
                    ${app.contratos.getFiscais().map(f => `<option value="${f}" ${app.state.panelFiscalFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
                </select>
            </div>

            <!-- 3. MENU: ORDENAÇÃO (DROPDOWN VERTICAL) -->
            <div class="flex items-center gap-1 shrink-0">
                <label for="panel-contratos-sort-select" class="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap hidden lg:inline">Ordenar:</label>
                <select id="panel-contratos-sort-select" onchange="app.contratos.setSort(this.value)" class="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer transition">
                    <option value="ALFABETICA_ASC" ${currSort === 'ALFABETICA_ASC' ? 'selected' : ''}>🔤 Alfabética (A-Z)</option>
                    <option value="ALFABETICA_DESC" ${currSort === 'ALFABETICA_DESC' ? 'selected' : ''}>🔤 Alfabética (Z-A)</option>
                    <option value="VENCIMENTO_ASC" ${currSort === 'VENCIMENTO_ASC' ? 'selected' : ''}>⏰ Vencimento (Próximos)</option>
                    <option value="VENCIMENTO_DESC" ${currSort === 'VENCIMENTO_DESC' ? 'selected' : ''}>📅 Vencimento (Distantes)</option>
                    <option value="VALOR_DESC" ${currSort === 'VALOR_DESC' ? 'selected' : ''}>💰 Maior Valor</option>
                    <option value="VALOR_ASC" ${currSort === 'VALOR_ASC' ? 'selected' : ''}>💵 Menor Valor</option>
                    <option value="NUMERO_CTT" ${currSort === 'NUMERO_CTT' ? 'selected' : ''}>📄 Nº Contrato</option>
                    <option value="POSICAO_MURAL" ${currSort === 'POSICAO_MURAL' ? 'selected' : ''}>🖼️ Posição no Mural</option>
                </select>
            </div>

            <!-- 4. ALTERNAR MURAL / TABELA -->
            <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
                <button id="panel-btn-cards" onclick="app.contratos.switchViewMode('CARDS')" title="Mural de Cards (Estilo Parede)" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}">
                    <span>🗂️</span> <span class="hidden sm:inline">Mural</span>
                </button>
                <button id="panel-btn-tabela" onclick="app.contratos.switchViewMode('TABELA')" title="Tabela Analítica Financeira" class="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${!isCardsMode ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}">
                    <span>📊</span> <span class="hidden sm:inline">Tabela</span>
                </button>
            </div>

        </div>

        <!-- CONTADOR DE CONTRATOS & CRITÉRIO DE ORDENAÇÃO -->
        <div class="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-1">
            <span id="panel-filtered-count">Exibindo ${filteredList.length} de ${allContracts.length} contratos do mural • Ordenado por: ${app.contratos.getSortLabel(currSort)}</span>
        </div>

        <!-- CONTEÚDO DINÂMICO (MURAL DE CARDS OU TABELA ANALÍTICA) -->
        <div id="painel-contratos-content">
            ${app.contratos.renderContentHtml()}
        </div>

    </div>
  `;
};

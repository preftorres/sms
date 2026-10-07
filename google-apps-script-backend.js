/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * BACKEND CENTRAL: Painel de Contratos (R$ 14,2M), Dotações, Auditoria,
 * Matriz de Permissões, Usuários & Rotina Automática de Backups
 * Planilha: Auditoria_Exames
 * ============================================================================
 * 
 * INSTRUÇÕES:
 * 1. Abra sua planilha do Google Sheets (Auditoria_Exames).
 * 2. No menu superior, clique em "Extensões" > "Apps Script".
 * 3. Selecione todo o código do arquivo Code.gs, apague e cole este código completo.
 * 4. Clique no ícone de disquete (Salvar).
 * 5. SELECIONE A FUNÇÃO "popularContrato73Fontana" no menu superior e clique em "Executar" (Run).
 *    -> Isso criará e preencherá automaticamente a aba Contrato_73_2026 com todos os 76 exames reais!
 * 6. Em seguida, clique em "Implantar" (Deploy) > "Gerenciar Implantações" >
 *    ícone do lápis (Editar) > Versão: "Nova Versão" (New Version) > "Implantar".
 * ============================================================================
 */

/**
 * ============================================================================
 * FUNÇÃO DE EXECUÇÃO DIRETA NO GOOGLE APPS SCRIPT:
 * Selecione esta função no menu suspenso do editor e clique em "Executar" (Run).
 * Ela limpa e preenche a aba Contrato_73_2026 com todos os 76 procedimentos reais.
 * ============================================================================
 */
function popularContrato73Fontana() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Contrato_73_2026");
  if (!sheet) {
    sheet = ss.insertSheet("Contrato_73_2026");
  }
  sheet.clearContents();
  sheet.appendRow(HEADERS_EXAMS);
  if (INITIAL_73_EXAMS.length > 0) {
    sheet.getRange(2, 1, INITIAL_73_EXAMS.length, HEADERS_EXAMS.length).setValues(INITIAL_73_EXAMS);
  }

  // Registra ou garante na aba _Contratos
  const cfgSheet = ensureMasterStructure(ss);
  const rows = cfgSheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === "Contrato_73_2026") {
      found = true;
      break;
    }
  }
  if (!found) {
    cfgSheet.appendRow([
      "Contrato_73_2026", "73/2026", "3173/2026 (Global)",
      "LABORATORIO DE ANALISES CLINICAS FONTANA LTDA", "25/09/2026 às 15:00"
    ]);
  }
  Logger.log("✓ Contrato 73/2026 populado com sucesso! Total de exames: " + INITIAL_73_EXAMS.length);
}

/**
 * ============================================================================
 * FUNÇÃO DE EXECUÇÃO DIRETA: ATUALIZAR MURAL DE CONTRATOS AUDITADO (43 ITENS)
 * Selecione esta função no menu suspenso do editor e clique em "Executar" (Run).
 * Ela sincroniza a aba _Painel_Contratos com os 43 contratos das fotos do mural.
 * ============================================================================
 */
function popularPainelContratosMural() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PANEL_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PANEL_SHEET);
  }
  sheet.clearContents();
  sheet.appendRow(HEADERS_PANEL);
  if (INITIAL_34_CONTRATOS.length > 0) {
    sheet.getRange(2, 1, INITIAL_34_CONTRATOS.length, HEADERS_PANEL.length).setValues(INITIAL_34_CONTRATOS);
  }
  logAudit(ss, {
    usuario: "admin",
    modulo: "Contratos LDO",
    acao: "Reconciliação Mural Físico",
    detalhes: "Aba _Painel_Contratos atualizada com os 34 contratos e espaços do mural físico da Secretaria",
    registroId: "MURAL_FISICO"
  });
  Logger.log("✓ Painel de Contratos atualizado com sucesso com os 34 contratos e espaços do mural!");
}

// IDs REAIS DAS PASTAS DE BACKUP DO GOOGLE DRIVE
const ID_PASTA_PREFTORRES = "1omc63ImTO0aVWHT15WDjEusbhqlN-r92";
const ID_PASTA_DIEGO = "1x38IjFJ3PjYT3dPV9_Lc9KeOIu7yTCKb";

const CONFIG_SHEET = "_Contratos";
const SHORTCUTS_SHEET = "_Atalhos";
const USERS_SHEET = "_Usuarios";
const DOTACOES_SHEET = "_Dotacoes";
const PANEL_SHEET = "_Painel_Contratos";
const PERMISSIONS_SHEET = "_Permissoes";
const AUDIT_LOGS_SHEET = "_Logs_Auditoria";

const HEADERS_PANEL = [
  "id", "empresa", "numeroCtt", "prazoVencimento", "dataVencimentoIso",
  "valorContrato", "fiscal", "status", "objeto", "criadoEm", "criadoPor", "observacao"
];
const HEADERS_EXAMS = ["id", "item", "cat", "descEmpenho", "descPrestador", "vlUnit", "qtdEmpenho", "saldoAnterior", "faturado"];
const HEADERS_SHORTCUTS = ["id", "title", "url", "desc"];
const HEADERS_USERS = ["id", "usuario", "senha", "nome", "perfil", "createdAt"];
const HEADERS_DOTACOES = [
  "id", "sf", "ata", "processo", "objeto", "doc1", "empenho", "situacao", "patrimonio",
  "status", "comprador", "compradorLogin", "dataSolicitacao",
  "validador", "validadorLogin", "dataValidacao", "valor", "motivoCancelamento"
];
const HEADERS_AUDIT_LOGS = [
  "id", "dataHora", "usuario", "modulo", "acao", "detalhes", "registroId"
];

// OS 34 CONTRATOS E ESPAÇOS FÍSICOS DO MURAL DA SECRETARIA MUNICIPAL DE SAÚDE DE TORRES
// Mapeamento idêntico às fotos das paredes e quadros da Secretaria
const INITIAL_34_CONTRATOS = [
  // --- QUADRO 1: MURAL PAREDE AZUL (Posições 1 a 21) ---
  [1, "MEDENF IVOTI SERVIÇOS MÉDICOS E DE ENFERMAGEM", "344/2025", "Prorrogado até 26/09/2027", "2027-09-26", 257664.00, "FRAN", "Ativo", "Enfermagem e Procedimentos Clínicos (MED ENF)", "07/10/2026", "admin", "Prorrogação anotada à caneta no mural: 26/09/2027"],
  [2, "PRECISÃO TRATAMENTO DE ÁGUA LTDA", "297/2025", "Prorrogado até 30/09/2027", "2027-09-30", 7734.00, "LASIER", "Ativo", "Tratamento de Água nas Unidades (PRESCISÃO)", "07/10/2026", "admin", "Prorrogação à caneta até 30/09/2027; fiscal Lasier com anotação no mural"],
  [3, "ELO SERVIÇOS DE SAÚDE LTDA", "377/2024", "12 Meses até 04/10/2026", "2026-10-04", 3747715.20, "FRAN", "Ativo", "Gestão Médica Hospitalar (ELO SERVIÇOS)", "07/10/2026", "admin", "Vencimento 04/10/2026 destacado no mural"],
  [4, "R. DIMER EMPREENDIMENTOS IMOBILIARIOS LTDA", "539/2025", "12 Meses até 23/12/2026", "2026-12-23", 93600.00, "NAIARA", "Ativo", "Locação Imóvel TEACULHE (R DIMER)", "07/10/2026", "admin", "Aluguel TEACULHE confirmado no mural: Venc 23/12/2026"],
  [5, "SILVIO FARIAS ALVES", "203/2021", "12 Meses até 19/10/2026", "2026-10-19", 49663.20, "LASIER", "Ativo", "Locação de Imóvel Vigilância (SILVIO ALUGUEL VIGILÂNCIA)", "07/10/2026", "admin", "Aluguel Vigilância; fiscal Lasier com anotação no mural"],
  [6, "JVS CENTRO TERAPÊUTICO LTDA", "142/2023", "12 Meses até 03/11/2026", "2026-11-03", 107016.00, "NAIARA", "Ativo", "Terapias Integradas e Multidisciplinares (JVS PLENO)", "07/10/2026", "admin", "Vencimento 03/11/2026 destacado no mural"],
  [7, "AMPLAMAIS SERVIÇOS MÉDICOS LTDA", "390/2025", "12 Meses até 03/11/2026", "2026-11-03", 30684.06, "SANDRO", "Ativo", "Serviços Médicos Especializados (AMPLA MAIS EXAMES)", "07/10/2026", "admin", "Vencimento 03/11/2026 destacado no mural"],
  [8, "CARLOS DOS SANTOS TEIXEIRA", "04/2023", "12 Meses até 04/01/2027", "2027-01-04", 180000.00, "NAIARA", "Ativo", "Locação Imóvel SAMU (CARLOS ALUGUEL SAMU)", "07/10/2026", "admin", "Aluguel SAMU confirmado no mural: Venc 04/01/2027"],
  [9, "DELTA SOLUÇÕES EM INFORMÁTICA LTDA", "14/2024", "12 Meses até 22/01/2027", "2027-01-22", 1074209.92, "PREFEITURA", "Ativo", "Sistemas e Gestão de TI (DELTA INFORMÁTICA)", "07/10/2026", "admin", "Vencimento 22/01/2027 confirmado no mural"],
  [10, "TECPRINTERS TECNOLOGIA DE IMPRESSÃO LTDA", "29/2026", "12 Meses até 10/02/2027", "2027-02-10", 73200.00, "PREFEITURA", "Ativo", "Outsourcing de Impressoras (TEC PRINTERS)", "07/10/2026", "admin", "Fiscal PREFEITURA confirmado no mural"],
  [11, "IBG INDUSTRIA BRASILEIRA DE GASES LTDA", "77/2024", "12 Meses até 22/02/2027", "2027-02-22", 46800.00, "ADRI", "Ativo", "Fornecimento de Oxigênio Medicinal (IBG OXIGÊNIO)", "07/10/2026", "admin", "Vencimento 22/02/2027 confirmado no mural"],
  [12, "INSTITUTO DE AMPARO AO EXCEPCIONAL - INAMEX", "125/2024", "12 Meses até 18/03/2027", "2027-03-18", 56337.48, "NAIARA", "Ativo", "Acolhimento e Assistência Especial (INAMEX)", "07/10/2026", "admin", "Vencimento 18/03/2027 confirmado no mural"],
  [13, "ONE GESTÃO E SERVIÇOS LTDA", "149/2026", "12 Meses até 04/05/2027", "2027-05-04", 240240.00, "NAIARA", "Ativo", "Serviços Especializados de Apoio (ONE GESTÃO)", "07/10/2026", "admin", "Vencimento 04/05/2027 confirmado no mural"],
  [14, "INTEGRALIDADE MÉDICA LTDA", "151/2026", "12 Meses até 04/05/2027", "2027-05-04", 1367024.00, "FRAN", "Ativo", "Plantões Médicos de Urgência (INTEGRALIDADE MÉDICA)", "07/10/2026", "admin", "Vencimento 04/05/2027 confirmado no mural"],
  [15, "HIDRAMACO PEÇAS E ACESSÓRIOS LTDA", "274/2026", "12 Meses até 22/07/2027", "2027-07-22", 90240.46, "SANDRO", "Ativo", "Peças e Reposição Mecânica (HIDRAMACO SULCAR)", "07/10/2026", "admin", "Anotação à mão no mural: CTT 390/2026 - Venc: 04/09/2027"],
  [16, "ELO SERVIÇOS DE SAÚDE LTDA", "297/2025", "12 Meses até 28/08/2027", "2027-08-28", 1026110.34, "NAIARA", "Ativo", "Serviços Médicos Ambulatoriais (ELO SERVIÇOS)", "07/10/2026", "admin", "Vencimento 28/08/2027 confirmado no mural"],
  [17, "AMBIENTUUS TECNOLOGIA AMBIENTAL", "264/2023", "12 Meses até 30/08/2027", "2027-08-30", 36720.00, "ADRI", "Ativo", "Tratamento de Resíduos Hospitalares (AMBIENTUSS)", "07/10/2026", "admin", "Vigência confirmada no mural físico até 30/08/2027"],
  [18, "HENGER COMÉRCIO E SERVIÇOS LTDA", "166/2026", "36 Meses até 05/05/2029", "2029-05-05", 90000.00, "ADRI", "Ativo", "Manutenção Predial Continuada (HENGER)", "07/10/2026", "admin", "Vencimento 05/05/2029 confirmado no mural"],
  [19, "LABORATÓRIO DE ANÁLISES CLÍNICAS", "43/2024", "Chamamento 210/26 até 03/09/2027", "2027-09-03", 129163.00, "PREFEITURA", "Ativo", "Credenciamento de Exames Laboratoriais (LABORATÓRIO ANALISE)", "07/10/2026", "admin", "Termo de Credenciamento 43/2024 afixado no mural"],
  [20, "[ESPAÇO VAZIO - PAINEL MURAL]", "S/N", "Espaço vago no mural físico", "", 0, "PREFEITURA", "Disponível", "Nicho vago no painel da Secretaria", "07/10/2026", "admin", "Espaço reservado vago no mural físico"],
  [21, "[ESPAÇO VAZIO - PAINEL MURAL]", "S/N", "Espaço vago no mural físico", "", 0, "PREFEITURA", "Disponível", "Nicho vago no painel da Secretaria", "07/10/2026", "admin", "Espaço reservado vago no mural físico"],

  // --- QUADRO 2: QUADRO BRANCO (Posições 22 a 34) ---
  [22, "SIMSAUDE SERVIÇOS SA", "342/2025", "12 Meses até 16/11/2026", "2026-11-16", 828960.00, "ADRI", "Ativo", "Consultas e Atendimentos Médicos (SIM SAÚDE)", "07/10/2026", "admin", "Vencimento 16/11/2026 destacado no mural"],
  [23, "SILVANO TUPINAMBA DELFIM", "345/2023", "12 Meses até 21/11/2026", "2026-11-21", 48000.00, "NAIARA", "Ativo", "Locação Imóvel Especialidades (SILVANO)", "07/10/2026", "admin", "Aluguel Especialidades confirmado no mural: Venc 21/11/2026"],
  [24, "LUMIAR HEALTH BUILDERS EQUIP HOSP LTDA", "303/2025", "12 Meses até 26/11/2026", "2026-11-26", 135700.00, "FRAN", "Ativo", "Oxigenoterapia Domiciliar (LUMIAR OXIGENOTERAPIA)", "07/10/2026", "admin", "Nº CTT atribuído: 303/2025 conforme mural"],
  [25, "TRANSALVA EMERGÊNCIAS MÉDICAS LTDA", "442/2025", "12 Meses até 08/12/2026", "2026-12-08", 199800.05, "NAIARA", "Ativo", "Ambulâncias de Suporte Avançado (TRANSALVA)", "07/10/2026", "admin", "Vencimento 08/12/2026 destacado no mural"],
  [26, "DANIEL CARDOSO MAGNUS", "195/2026", "12 Meses até 01/06/2027", "2027-06-01", 19800.00, "LASIER", "Ativo", "Aplicação BTI Controle de Vetores (DANIEL APLICAÇÃO BTI)", "07/10/2026", "admin", "Vencimento 01/06/2027 confirmado no mural"],
  [27, "VIAÇÃO OURO E PRATA SA", "231/2026", "12 Meses até 30/06/2027", "2027-06-30", 1355940.00, "SANDRO", "Ativo", "Passagens TFD (OURO E PRATA)", "07/10/2026", "admin", "Nº CTT 231/2026 confirmado no mural"],
  [28, "K & S EMPREENDIMENTOS IMOBILIARIOS LTDA", "258/2026", "12 Meses até 15/07/2027", "2027-07-15", 96000.00, "NAIARA", "Ativo", "Locação de Imóvel para Fisioterapia (KS ALUGUEL FISIO)", "07/10/2026", "admin", "Nº CTT 258/2026 confirmado no mural"],
  [29, "ULTRA AIR COMÉRCIO DE GASES INDUSTRIAIS", "232/2025", "12 meses até 17/07/2027", "2027-07-17", 52266.50, "ADRI", "Ativo", "Gases Medicinais e Ar Comprimido (ULTRA AIR)", "07/10/2026", "admin", "Vencimento 17/07/2027 confirmado no mural"],
  [30, "SOSSEG (EDUCAÇÃO)", "Em Aberto", "Em fase de contratação", "", 0, "PREFEITURA", "Previsto", "Serviços de Educação / Apoio à Saúde", "07/10/2026", "admin", "Folha afixada no mural reservada para novo contrato"],
  [31, "CRISTO REI (CLÍNICA)", "Em Aberto", "Em fase de contratação", "", 0, "PREFEITURA", "Previsto", "Serviços e Consultas Clínicas", "07/10/2026", "admin", "Folha afixada no mural reservada para novo contrato"],
  [32, "IB SAÚDE (HOSPITAL)", "Em Aberto", "Em fase de contratação", "", 0, "PREFEITURA", "Previsto", "Gestão e Atendimento Hospitalar", "07/10/2026", "admin", "Folha afixada no mural reservada para novo contrato"],
  [33, "APAE", "Em Aberto", "Em fase de contratação", "", 0, "PREFEITURA", "Previsto", "Assistência e Atendimento Especializado", "07/10/2026", "admin", "Folha afixada no mural reservada para novo contrato"],
  [34, "[ESPAÇO VAZIO - PAINEL MURAL]", "S/N", "Espaço vago no mural físico", "", 0, "PREFEITURA", "Disponível", "Nicho vago no painel da Secretaria", "07/10/2026", "admin", "Espaço reservado vago no mural físico"]
];

// ============================================================================
// ESTRUTURAS COM PROTEÇÃO CONTRA PARÂMETRO VAZIO
// ============================================================================

function ensurePermissionsStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PERMISSIONS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PERMISSIONS_SHEET);
    sheet.appendRow(["perfil", "permissoesJson"]);
  }
  return sheet;
}

function ensurePanelContractsStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(PANEL_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(PANEL_SHEET);
    sheet.appendRow(HEADERS_PANEL);
    if (INITIAL_34_CONTRATOS.length > 0) {
      sheet.getRange(2, 1, INITIAL_34_CONTRATOS.length, INITIAL_34_CONTRATOS[0].length).setValues(INITIAL_34_CONTRATOS);
    }
  } else {
    const lastCol = sheet.getLastColumn();
    if (lastCol < HEADERS_PANEL.length) {
      sheet.getRange(1, HEADERS_PANEL.length).setValue("observacao");
    }
  }
  return sheet;
}

function ensureDotacoesStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DOTACOES_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(DOTACOES_SHEET);
    sheet.appendRow(HEADERS_DOTACOES);
    sheet.appendRow([
      1, "18306", "229", "198", "2 detector fetal C.E E.I:212", "20490", "",
      "Aguardando dotação do setor financeiro", "", "AGUARDANDO",
      "Diego Canto", "diego", "28/09/2026 às 10:00",
      "", "", "", "639,98", ""
    ]);
  }
  return sheet;
}

function ensureUsersStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(USERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(USERS_SHEET);
    sheet.appendRow(HEADERS_USERS);
    sheet.appendRow([1, "admin", "admin123", "Administrador", "Administrador", "12/09/2026 às 08:30"]);
  }
  return sheet;
}

// OS 76 PROCEDIMENTOS REAIS - CONTRATO Nº 73/2026 (LABORATÓRIO FONTANA - R$ 129.163,00)
const INITIAL_73_EXAMS = [
  [1, "1", "Laboratorial", "ÁCIDO FÓLICO (VITAMINA B9)", "0202010406 - ACIDO FOLICO", 15.65, 150, 150, 20],
  [2, "2", "Laboratorial", "EXAMES LABORATORIAIS ÁCIDO ÚRICO", "0202010120 - ACIDO URICO [SORO]", 1.85, 400, 400, 144],
  [3, "3", "Laboratorial", "EXAME ÁCIDO VALPROICO", "0202070050 - ACIDO VALPROICO [SORO]", 15.65, 150, 150, 1],
  [4, "4", "Laboratorial", "EXAMES LABORATORIAIS DE ALBUMINA", "Não Consta na Fatura", 8.12, 150, 150, 0],
  [5, "5", "Laboratorial", "EXAME AMILASE", "0202010180 - AMILASE [SORO]", 2.25, 350, 350, 7],
  [6, "6", "Laboratorial", "ANALISE DE CARACTERES FISICOS, URINA (EQU)", "0202050017 - EQU EXAME QUALITATIVO DE URINA", 3.70, 600, 600, 338],
  [7, "7", "Laboratorial", "ANTI HBC IgG", "Não Consta na Fatura", 18.55, 100, 100, 0],
  [8, "8", "Laboratorial", "ANTI HBC IGM", "Não Consta na Fatura", 18.55, 100, 100, 0],
  [9, "9", "Laboratorial", "EXAME ANTIHCV", "0202030679 - HEPATITE C, ANTICORPOS (ANTI-HCV)", 18.55, 100, 100, 4],
  [10, "10", "Laboratorial", "ANTICORPOS ANTI TIREOGLOBULINA", "0202030628 - TIREOGLOBULINA ANTICORPOS ANTI", 13.35, 200, 200, 3],
  [11, "11", "Laboratorial", "EXAME ANTIESTREPTOLISINA O", "0202030474 - ANTIESTREPTOLISINA O", 2.83, 100, 100, 2],
  [12, "12", "Laboratorial", "B-HCG", "0202060217 - BETA HCG [IMUNOCROMATOGRAFICO]", 7.85, 200, 200, 6],
  [13, "13", "Laboratorial", "BACTEROSCOPIA (GRAM)", "Não Consta na Fatura", 2.80, 100, 100, 0],
  [14, "14", "Laboratorial", "BILIRRUBINAS T e F", "0202010201 - BILIRRUBINA TOTAL E FRACOES", 2.01, 100, 100, 27],
  [15, "15", "Laboratorial", "EXAME CÁLCIO", "0202010210 - CALCIO [SORO]", 1.85, 1200, 1200, 18],
  [16, "16", "Laboratorial", "EXAME COLESTEROL HDL", "0202010279 - COLESTEROL HDL", 3.51, 1200, 1200, 421],
  [17, "17", "Laboratorial", "EXAME COLESTEROL LDL", "0202010287 - COLESTEROL LDL", 3.51, 1200, 1200, 357],
  [18, "18", "Laboratorial", "EXAME COLESTEROL TOTAL", "0202010295 - COLESTEROL TOTAL [SORO]", 1.85, 600, 600, 422],
  [19, "19", "Laboratorial", "EXAMES LABORATORIAIS CREATININA", "0202010317 - CREATININA [SORO]", 1.85, 1200, 1200, 414],
  [20, "20", "Laboratorial", "EXAMES LABORATORIAIS CREATINURIA EM AMOSTRA", "Não Consta na Fatura", 1.85, 1200, 1200, 0],
  [21, "21", "Laboratorial", "EXAME CULTURA DE BACTERIAS PARA IDENTIFICAÇÃO", "0202080080 - CULTURA [URINA SIMPLES]", 5.62, 1200, 1200, 156],
  [22, "22", "Laboratorial", "CURVA GLICÊMICA (2 DOSAGENS)", "Não Consta na Fatura", 3.63, 600, 600, 0],
  [23, "23", "Laboratorial", "Depuração da creatinina endógena", "0202050025 - CLEARANCE DE CREATININA", 3.51, 200, 200, 3],
  [24, "24", "Laboratorial", "DESIDROGENASE LÁCTICA", "0202010368 - DESIDROGENASE LACTICA [SORO]", 3.68, 200, 200, 4],
  [25, "25", "Laboratorial", "EXAME DOSAGEM DE PROTEÍNAS TOTAIS", "Não Consta na Fatura", 1.40, 200, 200, 0],
  [26, "26", "Laboratorial", "EXAME DOSAGEM DE MICROALBUMINA NA URINA", "0202050092 - MICROALBUMINURIA", 8.12, 200, 200, 184],
  [27, "27", "Laboratorial", "DOSAGEM CREATINOFOSFOQUINASE (CPK)", "0202010325 - CREATINOFOSFOQUINASE (CPK)", 3.68, 200, 200, 4],
  [28, "28", "Laboratorial", "EPF - EXAME PARASITOLÓGICO DE FEZES", "0202040046 - PARASITOLOGICO DE FEZES", 1.65, 600, 600, 57],
  [29, "29", "Laboratorial", "EXAME ESTRADIOL", "0202060160 - ESTRADIOL", 10.15, 100, 100, 17],
  [30, "30", "Laboratorial", "FAN-FATOR ANTINUCLEAR", "0202030598 - FATOR ANTINUCLEAR [SORO]", 17.16, 100, 100, 7],
  [31, "31", "Laboratorial", "FATOR REUMATOIDE (LÁTEX R)", "0202030075 - FATOR REUMATOIDE", 1.89, 100, 100, 9],
  [32, "32", "Laboratorial", "FTA-ABS", "Não Consta na Fatura", 10.00, 100, 100, 0],
  [33, "33", "Laboratorial", "EXAMES LABORATORIAIS FERRITINA", "0202010384 - FERRITINA", 15.59, 100, 100, 286],
  [34, "34", "Laboratorial", "EXAMES LABORATORIAIS FERRO SÉRICO", "0202010392 - FERRO", 3.51, 200, 200, 82],
  [35, "35", "Laboratorial", "FOSFATASE ALCALINA", "0202010422 - FOSFATASE ALCALINA", 2.01, 200, 200, 27],
  [36, "36", "Laboratorial", "EXAME FÓSFORO", "0202010430 - FOSFORO [SORO]", 1.85, 600, 600, 4],
  [37, "37", "Laboratorial", "EXAMES LABORATORIAIS GAMA GT", "0202010465 - GAMA GLUTAMIL TRANSFERASE", 3.51, 600, 600, 49],
  [38, "38", "Laboratorial", "EXAME DE GLICOSE", "0202010473 - GLICOSE [PLASMA/SORO]", 1.85, 800, 800, 411],
  [39, "39", "Laboratorial", "HBSAG (ANTIGENO AUSTRÁLIA)", "0202030970 - HEPATITE B, ANTIGENO (HBSAG)", 18.55, 150, 150, 4],
  [40, "40", "Laboratorial", "EXAME DE HEMOGLOBINA GLICOSILADA", "0202010503 - HEMOGLOBINA GLICADA (A1C)", 7.86, 500, 500, 396],
  [41, "41", "Laboratorial", "EXAME HEMOGRAMA COMPLETO", "0202020380 - HEMOGRAMA COMPLETO", 4.11, 2000, 2000, 474],
  [42, "42", "Laboratorial", "HORMÔNIO FOLÍCULO ESTIMULANTE (FSH)", "0202060233 - FSH HORMONIO FOLICULO ESTIMULANTE", 7.89, 100, 100, 26],
  [43, "43", "Laboratorial", "HORMÔNIO LUTEINIZANTE (LH)", "0202060241 - LH HORMONIO LUTEINIZANTE", 8.97, 100, 100, 17],
  [44, "44", "Laboratorial", "IST (INDICE SAT. TRANSFERRINA)", "0202010660 - CALCULO INDICE SATURACAO TRANSFERRINA", 4.19, 100, 100, 4],
  [45, "45", "Laboratorial", "KTTP (TEMPO DE TROMBOPLATIA PARCIAL ATIVADA)", "0202020134 - TEMPO DE TROMBOPLASTINA PARCIAL (TTP)", 5.77, 100, 100, 5],
  [46, "46", "Laboratorial", "LIPASE", "0202010554 - LIPASE [SORO]", 2.25, 200, 200, 6],
  [47, "47", "Laboratorial", "LITEMIA", "0202070255 - LITIO", 8.12, 100, 100, 8],
  [48, "48", "Laboratorial", "EXAME MAGNÉSIO", "0202010562 - MAGNESIO [SORO]", 2.01, 600, 600, 9],
  [49, "49", "Laboratorial", "PCR - PROTEINA REATIVA", "0202030083 - PROTEINA C REATIVA ULTRA SENSIVEL", 2.83, 100, 100, 42],
  [50, "50", "Laboratorial", "ANTICORPOS ANTICROMOSSOMOS (ANTI-TPO)", "0202030555 - ANTICORPOS ANTI TIREOPEROXIDASE", 17.16, 100, 100, 2],
  [51, "51", "Laboratorial", "EXAMES LABORATORIAIS PLAQUETAS", "0202020380 - CONTAGEM DE PLAQUETAS", 2.73, 1500, 1500, 68],
  [52, "52", "Laboratorial", "EXAMES LABORATORIAIS POTÁSSIO", "0202010600 - POTASSIO [SORO]", 1.85, 1200, 1200, 84],
  [53, "53", "Laboratorial", "EXAME LABORATORIAL PROGESTERONA", "0202060292 - PROGESTERONA", 10.22, 150, 150, 7],
  [54, "54", "Laboratorial", "PROLACTINA", "0202060306 - PROLACTINA", 10.15, 150, 150, 5],
  [55, "55", "Laboratorial", "EXAME DE PSA LIVRE", "Não definido - PSAL ANTIGENO PROSTATICO LIVRE", 16.42, 600, 600, 2],
  [56, "56", "Laboratorial", "EXAME PSA TOTAL", "0202030105 - PSA ANTIGENO PROSTATICO ESPECIFICO", 16.42, 600, 600, 79],
  [57, "57", "Laboratorial", "RETICULÓCITOS", "0202020037 - RETICULOCITOS CONTAGEM", 2.73, 200, 200, 8],
  [58, "58", "Laboratorial", "EXAMES LABORATORIAIS SÓDIO", "0202010635 - SODIO [SORO]", 1.85, 600, 600, 80],
  [59, "59", "Laboratorial", "EXAMES LABORATORIAIS T4 - TIROXINA", "0202060373 - T4 TIROXINA", 8.76, 100, 100, 8],
  [60, "60", "Laboratorial", "EXAMES LABORATORIAIS T4 LIVRE (TIROXINA)", "0202060381 - T4 L TIROXINA LIVRE", 11.60, 100, 100, 187],
  [61, "61", "Laboratorial", "TEMPO DE TROMBOPLASTINA ATIVADO", "0202020134 - TEMPO DE TROMBOPLASTINA (TTPA)", 5.77, 100, 100, 3],
  [62, "62", "Laboratorial", "EXAMES LABORATORIAIS TESTOSTERONA TOTAL", "0202060349 - TESTOSTERONA TOTAL", 10.43, 100, 100, 8],
  [63, "63", "Laboratorial", "EXAMES LABORATORIAIS TGO", "0202010643 - ASPARTATO AMINO TRANSFERASE (TGO)", 2.01, 150, 150, 252],
  [64, "64", "Laboratorial", "EXAMES LABORATORIAIS TGP", "0202010651 - ALANINA AMINO TRANSFERASE (TGP)", 2.01, 150, 150, 248],
  [65, "65", "Laboratorial", "TIBC (CAPACIDADE DE FIXAÇÃO DO FERRO)", "0202010023 - CAPACIDADE TOTAL LIGACAO DO FERRO", 2.01, 200, 200, 5],
  [66, "66", "Laboratorial", "TIPAGEM SANGUINEA E FATOR RH", "0202120082 - FATOR RH / GRUPO SANGUINEO", 1.37, 300, 300, 8],
  [67, "67", "Laboratorial", "TAP (TEMPO DE ATIVIDADE DE PROTOMBINA)", "0202020142 - TEMPO DE PROTROMBINA (TP)", 2.73, 200, 200, 11],
  [68, "68", "Laboratorial", "EXAMES LABORATORIAIS TRIGLICERÍDEOS", "0202010678 - TRIGLICERIDEOS [SORO]", 3.51, 800, 800, 420],
  [69, "69", "Laboratorial", "EXAMES TSH - TIREOTROFINA", "0202060250 - TSH HORMONIO TIREOESTIMULANTE", 8.96, 150, 150, 308],
  [70, "70", "Laboratorial", "EXAMES LABORATORIAIS UREIA", "0202010694 - UREIA [SORO]", 1.85, 500, 500, 254],
  [71, "71", "Laboratorial", "VDRL PARA DETECÇÃO DE SÍFILIS", "0202031098 - VDRL [SORO]", 2.83, 500, 500, 8],
  [72, "72", "Laboratorial", "EXAMES LABORATORIAIS VITAMINA B12", "0202010708 - VITAMINA B12", 15.24, 50, 50, 291],
  [73, "73", "Laboratorial", "EXAME LABORATORIAL VITAMINA D", "0202010767 - VITAMINA D (25 HIDROXI)", 15.24, 50, 50, 283],
  [74, "74", "Laboratorial", "EXAME VSG/VHS (HEMOSEDIMENTAÇÃO)", "0202020150 - VELOCIDADE HEMOSSEDIMENTACAO", 2.73, 50, 50, 20],
  [75, "75", "Laboratorial", "Pesquisa de anticorpos EIE anticlamidia", "Não Consta na Fatura", 17.76, 50, 50, 0],
  [76, "NF", "Laboratorial", "AJUSTE FISCAL / ITENS EXTRAS DAS NFS-E", "Conciliação Faturas NFS-e 3205 a 3264", 4291.20, 1, 1, 1]
];

function ensureContrato73Structure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Contrato_73_2026");
  if (!sheet) {
    sheet = ss.insertSheet("Contrato_73_2026");
    sheet.appendRow(HEADERS_EXAMS);
    if (INITIAL_73_EXAMS.length > 0) {
      sheet.getRange(2, 1, INITIAL_73_EXAMS.length, HEADERS_EXAMS.length).setValues(INITIAL_73_EXAMS);
    }
  } else if (sheet.getLastRow() < 70 && INITIAL_73_EXAMS.length > 0) {
    // Se a aba existir mas tiver apenas o cabeçalho ou os 13 exames legados, repopula com os 76 oficiais
    sheet.clearContents();
    sheet.appendRow(HEADERS_EXAMS);
    sheet.getRange(2, 1, INITIAL_73_EXAMS.length, HEADERS_EXAMS.length).setValues(INITIAL_73_EXAMS);
  }
  return sheet;
}

function ensureMasterStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let cfgSheet = ss.getSheetByName(CONFIG_SHEET);
  if (!cfgSheet) {
    cfgSheet = ss.insertSheet(CONFIG_SHEET);
    cfgSheet.appendRow(["tabName", "num", "empenhos", "prestador", "createdAt"]);
    cfgSheet.appendRow([
      "Contrato_73_2026", "73/2026", "3173/2026 (Global)",
      "LABORATORIO DE ANALISES CLINICAS FONTANA LTDA", "25/09/2026 às 15:00"
    ]);
    cfgSheet.appendRow([
      "Contrato_67_2026", "67/2026", "3406/2026 e 3407/2026",
      "LABORATORIO BIOMEDICO LTDA - ME", "12/09/2026 às 08:30"
    ]);
  } else {
    const rows = cfgSheet.getDataRange().getValues();
    const has73 = rows.some(r => r[0] === "Contrato_73_2026");
    if (!has73) {
      cfgSheet.appendRow([
        "Contrato_73_2026", "73/2026", "3173/2026 (Global)",
        "LABORATORIO DE ANALISES CLINICAS FONTANA LTDA", "25/09/2026 às 15:00"
      ]);
    }
  }
  return cfgSheet;
}

function ensureShortcutsStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHORTCUTS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(SHORTCUTS_SHEET);
    sheet.appendRow(HEADERS_SHORTCUTS);
    sheet.appendRow([2, "ETP/TR", "https://etp-tr.torres.rs.gov.br/", "Termos de Referência"]);
    sheet.appendRow([3, "Betha Cloud", "http://betha.cloud/", "Sistemas ERP"]);
    sheet.appendRow([4, "1Doc", "http://torres.1doc.com.br/", "Processos Digitais"]);
    sheet.appendRow([5, "Webmail", "http://webmail.torres.rs.gov.br/", "E-mail Institucional"]);
    sheet.appendRow([1, "Vacinas", "https://vacinastorres.dpdns.org/", "Controle de Imunização"]);
  }
  return sheet;
}

// ============================================================================
// FUNÇÕES DE LEITURA
// ============================================================================

function getPermissionsMatrix(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensurePermissionsStructure(ss);
  const rows = sheet.getDataRange().getValues();
  if (rows.length > 1 && rows[1][1]) {
    try {
      return JSON.parse(rows[1][1]);
    } catch (e) {
      return null;
    }
  }
  return null;
}

function formatCellToIsoDate(val) {
  if (!val && val !== 0) return "";
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    var y = val.getFullYear();
    var m = ("0" + (val.getMonth() + 1)).slice(-2);
    var d = ("0" + val.getDate()).slice(-2);
    return y + "-" + m + "-" + d;
  }
  var s = String(val).trim();
  if (!s || s === 'S/N' || s === 'Em Aberto') return "";
  var matchBr = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (matchBr) {
    return matchBr[3] + "-" + ("0" + matchBr[2]).slice(-2) + "-" + ("0" + matchBr[1]).slice(-2);
  }
  var matchIso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matchIso) {
    return matchIso[1] + "-" + ("0" + matchIso[2]).slice(-2) + "-" + ("0" + matchIso[3]).slice(-2);
  }
  var parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    var py = parsed.getFullYear();
    var pm = ("0" + (parsed.getMonth() + 1)).slice(-2);
    var pd = ("0" + parsed.getDate()).slice(-2);
    return py + "-" + pm + "-" + pd;
  }
  return s;
}

function getPanelContractsList(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensurePanelContractsStructure(ss);
  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0] && rows[i][0] !== 0) continue;
    list.push({
      id: Number(rows[i][0]),
      empresa: String(rows[i][1]),
      numeroCtt: String(rows[i][2]),
      prazoVencimento: String(rows[i][3]),
      dataVencimentoIso: formatCellToIsoDate(rows[i][4]),
      valorContrato: Number(rows[i][5]) || 0,
      fiscal: String(rows[i][6]),
      status: String(rows[i][7] || "Ativo"),
      objeto: String(rows[i][8] || ""),
      criadoEm: String(rows[i][9] || ""),
      criadoPor: String(rows[i][10] || ""),
      observacao: String(rows[i][11] || "")
    });
  }
  return list;
}

function getDotacoesList(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureDotacoesStructure(ss);
  const rows = sheet.getDataRange().getValues();
  const list = [];
  if (rows.length <= 1) return list;

  const headers = rows[0].map(h => String(h || '').trim().toLowerCase());
  const col = (name) => headers.indexOf(name.toLowerCase());

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && row[0] !== 0) continue;

    const getVal = (colName, defIdx) => {
      const idx = col(colName);
      if (idx !== -1 && idx < row.length) return row[idx];
      if (defIdx !== undefined && defIdx < row.length) return row[defIdx];
      return "";
    };

    list.push({
      id: Number(row[0]),
      sf: String(getVal("sf", 1) || ""),
      ata: String(getVal("ata", 2) || ""),
      processo: String(getVal("processo", 3) || ""),
      objeto: String(getVal("objeto", 4) || ""),
      doc1: String(getVal("doc1", 5) || ""),
      empenho: String(getVal("empenho", 6) || ""),
      situacao: String(getVal("situacao", 7) || ""),
      patrimonio: String(getVal("patrimonio", 8) || ""),
      status: String(getVal("status", 9) || "AGUARDANDO"),
      comprador: String(getVal("comprador", 10) || ""),
      compradorLogin: String(getVal("compradorLogin", 11) || ""),
      dataSolicitacao: String(getVal("dataSolicitacao", 12) || ""),
      validador: String(getVal("validador", 13) || ""),
      validadorLogin: String(getVal("validadorLogin", 14) || ""),
      dataValidacao: String(getVal("dataValidacao", 15) || ""),
      valor: String(getVal("valor", 16) || ""),
      motivoCancelamento: String(getVal("motivoCancelamento", 17) || "")
    });
  }
  return list;
}

function getUsersList(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureUsersStructure(ss);
  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0] && rows[i][0] !== 0) continue;
    list.push({
      id: rows[i][0],
      usuario: String(rows[i][1]),
      senha: String(rows[i][2]),
      nome: String(rows[i][3]),
      perfil: String(rows[i][4]),
      createdAt: String(rows[i][5] || "")
    });
  }
  return list;
}

function getContractsList(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const cfgSheet = ensureMasterStructure(ss);
  const rows = cfgSheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0]) continue;
    list.push({
      tabName: String(rows[i][0]),
      num: String(rows[i][1]),
      empenhos: String(rows[i][2]),
      prestador: String(rows[i][3]),
      createdAt: String(rows[i][4] || "12/09/2026 às 08:30")
    });
  }
  
  // Garante que o Contrato 73/2026 (Laboratório Fontana) sempre seja o primeiro da lista
  const idx73 = list.findIndex(c => c.tabName === "Contrato_73_2026");
  if (idx73 > 0) {
    const c73 = list.splice(idx73, 1)[0];
    list.unshift(c73);
  } else if (idx73 === -1) {
    list.unshift({
      tabName: "Contrato_73_2026",
      num: "73/2026",
      empenhos: "3173/2026 (Global)",
      prestador: "LABORATORIO DE ANALISES CLINICAS FONTANA LTDA",
      createdAt: "25/09/2026 às 15:00"
    });
  }
  return list;
}

function getShortcutsList(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureShortcutsStructure(ss);
  const rows = sheet.getDataRange().getValues();
  const list = [];
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i][0] && rows[i][0] !== 0) continue;
    list.push({
      id: rows[i][0],
      title: String(rows[i][1]),
      url: String(rows[i][2]),
      desc: String(rows[i][3])
    });
  }
  return list;
}

// ============================================================================
// TRILHA DE AUDITORIA & REGISTRO DE LOGS INSTITUCIONAIS
// ============================================================================

function ensureAuditLogsStructure(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(AUDIT_LOGS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(AUDIT_LOGS_SHEET);
    sheet.appendRow(HEADERS_AUDIT_LOGS);
    try {
      sheet.getRange(1, 1, 1, HEADERS_AUDIT_LOGS.length)
        .setFontWeight("bold")
        .setBackground("#0f172a")
        .setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    } catch(e) {}
  }
  return sheet;
}

function logAudit(ss, logData) {
  try {
    ss = ss || SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ensureAuditLogsStructure(ss);
    const agora = new Date();
    const dataHoraStr = Utilities.formatDate(agora, "America/Sao_Paulo", "dd/MM/yyyy 'às' HH:mm:ss");
    const id = logData.id || agora.getTime();
    const usuario = String(logData.usuario || "sistema").trim();
    const modulo = String(logData.modulo || "Geral").trim();
    const acao = String(logData.acao || "Alteração").trim();
    const detalhes = String(logData.detalhes || "").trim();
    const registroId = String(logData.registroId || "").trim();

    sheet.appendRow([id, dataHoraStr, usuario, modulo, acao, detalhes, registroId]);
  } catch (err) {
    Logger.log("Erro ao registrar log de auditoria: " + err.toString());
  }
}

function getAuditLogsList(ss, maxLimit) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ensureAuditLogsStructure(ss);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  const limit = maxLimit || 500;
  const startRow = Math.max(2, lastRow - limit + 1);
  const numRows = lastRow - startRow + 1;
  const values = sheet.getRange(startRow, 1, numRows, HEADERS_AUDIT_LOGS.length).getValues();

  const logs = [];
  for (let i = values.length - 1; i >= 0; i--) {
    const row = values[i];
    if (!row[0] && row[0] !== 0) continue;
    logs.push({
      id: row[0],
      dataHora: String(row[1] || ""),
      usuario: String(row[2] || "sistema"),
      modulo: String(row[3] || "Geral"),
      acao: String(row[4] || ""),
      detalhes: String(row[5] || ""),
      registroId: String(row[6] || "")
    });
  }
  return logs;
}

// ============================================================================
// REQUISIÇÕES GET
// ============================================================================

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

    if (action === "POPULAR_73") {
      popularContrato73Fontana();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Contrato 73/2026 populado com sucesso com os 76 procedimentos reais!",
        count: INITIAL_73_EXAMS.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "LOGIN") {
      const u = String(e.parameter.u || "").trim().toLowerCase();
      const p = String(e.parameter.p || "").trim();
      const users = getUsersList(ss);
      const found = users.find(user => user.usuario.toLowerCase() === u && user.senha === p);

      if (found) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          user: { id: found.id, usuario: found.usuario, nome: found.nome, perfil: found.perfil }
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error", message: "Usuário ou senha incorretos."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "GET_USERS") {
      const users = getUsersList(ss).map(u => ({
        id: u.id, usuario: u.usuario, nome: u.nome, perfil: u.perfil, createdAt: u.createdAt
      }));
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", users: users
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "GET_AUDIT_LOGS") {
      const limit = Number(e.parameter.limit) || 500;
      const logs = getAuditLogsList(ss, limit);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", logs: logs
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "POPULAR_PANEL_MURAL") {
      popularPainelContratosMural();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Painel de contratos reconciliado com sucesso com as fotos do mural (43 contratos)!",
        panelContracts: getPanelContractsList(ss)
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // RETORNO COMPLETO DO SISTEMA
    const contracts = getContractsList(ss);
    const shortcuts = getShortcutsList(ss);
    const dotacoes = getDotacoesList(ss);
    const panelContracts = getPanelContractsList(ss);
    const permissions = getPermissionsMatrix(ss);
    
    const requestedContract = (e && e.parameter && e.parameter.contract) 
      ? e.parameter.contract 
      : (contracts.length > 0 ? contracts[0].tabName : "Contrato_73_2026");

    let sheet;
    if (requestedContract === "Contrato_73_2026") {
      sheet = ensureContrato73Structure(ss);
    } else {
      sheet = ss.getSheetByName(requestedContract);
      if (!sheet) {
        sheet = ss.insertSheet(requestedContract);
        sheet.appendRow(HEADERS_EXAMS);
      }
    }

    const rows = sheet.getDataRange().getValues();
    const exams = [];
    const headerRow = rows[0] || [];
    const hasVlUnit = headerRow.indexOf("vlUnit") !== -1;
    const vlUnitIdx = hasVlUnit ? headerRow.indexOf("vlUnit") : -1;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === "" || rows[i][0] === undefined) continue;
      let vlUnitVal = 0;
      let qtdEmpVal = 0;
      let saldoAntVal = 0;
      let fatVal = 0;

      if (hasVlUnit && vlUnitIdx !== -1) {
        vlUnitVal = Number(rows[i][vlUnitIdx]) || 0;
        qtdEmpVal = Number(rows[i][vlUnitIdx + 1]) || 0;
        saldoAntVal = Number(rows[i][vlUnitIdx + 2]) || 0;
        fatVal = Number(rows[i][vlUnitIdx + 3]) || 0;
      } else {
        qtdEmpVal = Number(rows[i][5]) || 0;
        saldoAntVal = Number(rows[i][6]) || 0;
        fatVal = Number(rows[i][7]) || 0;
      }

      exams.push({
        id: Number(rows[i][0]),
        item: String(rows[i][1]),
        cat: String(rows[i][2]),
        descEmpenho: String(rows[i][3]),
        descPrestador: String(rows[i][4]),
        vlUnit: vlUnitVal,
        qtdEmpenho: qtdEmpVal,
        saldoAnterior: saldoAntVal,
        faturado: fatVal
      });
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      contracts: contracts,
      activeContract: requestedContract,
      exams: exams,
      shortcuts: shortcuts,
      dotacoes: dotacoes,
      panelContracts: panelContracts,
      permissions: permissions
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// REQUISIÇÕES POST (COM TRAVA LOCKSERVICE ANTI-CONFLITO)
// ============================================================================

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    // --- CONSULTA E REGISTRO DIRETO DE LOGS DE AUDITORIA ---
    if (action === "GET_AUDIT_LOGS") {
      const limit = Number(payload.limit) || 500;
      const logs = getAuditLogsList(ss, limit);
      return ContentService.createTextOutput(JSON.stringify({ status: "success", logs: logs })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "RECORD_AUDIT_LOG") {
      logAudit(ss, {
        usuario: payload.currentUser || payload.usuario || "sistema",
        modulo: payload.modulo || "Geral",
        acao: payload.actionName || payload.acao || "Registro",
        detalhes: payload.detalhes || "",
        registroId: payload.registroId || ""
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DE PERMISSÕES INSTITUCIONAIS ---
    if (action === "SAVE_PERMISSIONS") {
      const sheet = ensurePermissionsStructure(ss);
      sheet.clearContents();
      sheet.appendRow(["perfil", "permissoesJson"]);
      sheet.appendRow(["Matriz_Geral", JSON.stringify(payload.permissions)]);
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Permissões",
        acao: "Atualizar Matriz",
        detalhes: "Matriz geral de permissões atualizada",
        registroId: "Matriz_Geral"
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DO PAINEL GERAL DE CONTRATOS (R$ 14,2M) ---
    if (action === "CREATE_PANEL_CONTRACT") {
      const sheet = ensurePanelContractsStructure(ss);
      const c = payload.contract;
      sheet.appendRow([
        c.id || Date.now(), c.empresa, c.numeroCtt, c.prazoVencimento, c.dataVencimentoIso,
        c.valorContrato, c.fiscal, "Ativo", c.objeto || "", c.criadoEm || "", c.criadoPor || "",
        c.observacao || ""
      ]);
      logAudit(ss, {
        usuario: payload.currentUser || c.criadoPor || "admin",
        modulo: "Contratos LDO",
        acao: "Cadastrar Contrato",
        detalhes: `Contrato nº ${c.numeroCtt} - ${c.empresa} (R$ ${Number(c.valorContrato || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`,
        registroId: c.numeroCtt
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_PANEL_CONTRACT") {
      const sheet = ensurePanelContractsStructure(ss);
      const c = payload.contract;
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(c.id)) {
          const rowNum = i + 1;
          sheet.getRange(rowNum, 2).setValue(c.empresa);
          sheet.getRange(rowNum, 3).setValue(c.numeroCtt);
          sheet.getRange(rowNum, 4).setValue(c.prazoVencimento);
          sheet.getRange(rowNum, 5).setValue(c.dataVencimentoIso);
          sheet.getRange(rowNum, 6).setValue(c.valorContrato);
          sheet.getRange(rowNum, 7).setValue(c.fiscal);
          sheet.getRange(rowNum, 9).setValue(c.objeto);
          sheet.getRange(rowNum, 12).setValue(c.observacao || "");
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Contratos LDO",
        acao: "Editar Contrato",
        detalhes: `Contrato nº ${c.numeroCtt} - ${c.empresa} (Venc: ${c.prazoVencimento})`,
        registroId: c.numeroCtt
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "ARCHIVE_PANEL_CONTRACT") {
      const sheet = ensurePanelContractsStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let cttNum = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          sheet.getRange(i + 1, 8).setValue(payload.status);
          cttNum = rows[i][2] || payload.id;
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Contratos LDO",
        acao: payload.status === "Arquivado" ? "Arquivar Contrato" : "Desarquivar Contrato",
        detalhes: `Contrato ${cttNum} marcado como ${payload.status}`,
        registroId: cttNum
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "DELETE_PANEL_CONTRACT") {
      const sheet = ensurePanelContractsStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let cttNum = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          cttNum = `${rows[i][2]} (${rows[i][1]})`;
          sheet.deleteRow(i + 1);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Contratos LDO",
        acao: "Excluir Contrato",
        detalhes: `Contrato ${cttNum} excluído em definitivo`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "SYNC_MURAL_CONTRATOS" || action === "RESET_PANEL_MURAL") {
      popularPainelContratosMural();
      const updatedList = getPanelContractsList(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Painel de contratos sincronizado com os 43 contratos auditados do mural físico!",
        panelContracts: updatedList
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DE DOTAÇÕES (FLUXO 3 ETAPAS) ---
    if (action === "CREATE_DOTACAO") {
      const sheet = ensureDotacoesStructure(ss);
      const d = payload.dotacao;
      sheet.appendRow([
        d.id || Date.now(), d.sf || "", d.ata || "", d.processo || "", d.objeto || "",
        d.doc1 || "", d.empenho || "", d.situacao || "", d.patrimonio || "",
        d.status || "AGUARDANDO", d.comprador || "", d.compradorLogin || "", d.dataSolicitacao || "",
        d.validador || "", d.validadorLogin || "", d.dataValidacao || "", d.valor || "", d.motivoCancelamento || ""
      ]);
      logAudit(ss, {
        usuario: payload.currentUser || d.compradorLogin || "comprador",
        modulo: "Dotações",
        acao: "Criar Pedido",
        detalhes: `SF ${d.sf}: ${d.objeto ? d.objeto.substring(0, 70) : "Sem objeto"} (Doc 1: ${d.doc1 || "-"})`,
        registroId: d.sf
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_DOTACAO") {
      const sheet = ensureDotacoesStructure(ss);
      const d = payload.dotacao;
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(d.id)) {
          const rowNum = i + 1;
          if (d.sf !== undefined) sheet.getRange(rowNum, 2).setValue(d.sf);
          if (d.ata !== undefined) sheet.getRange(rowNum, 3).setValue(d.ata);
          if (d.processo !== undefined) sheet.getRange(rowNum, 4).setValue(d.processo);
          if (d.objeto !== undefined) sheet.getRange(rowNum, 5).setValue(d.objeto);
          if (d.doc1 !== undefined) sheet.getRange(rowNum, 6).setValue(d.doc1);
          if (d.empenho !== undefined) sheet.getRange(rowNum, 7).setValue(d.empenho);
          if (d.situacao !== undefined) sheet.getRange(rowNum, 8).setValue(d.situacao);
          if (d.patrimonio !== undefined) sheet.getRange(rowNum, 9).setValue(d.patrimonio);
          if (d.status !== undefined) sheet.getRange(rowNum, 10).setValue(d.status);
          if (d.valor !== undefined) sheet.getRange(rowNum, 17).setValue(d.valor);
          if (d.motivoCancelamento !== undefined) sheet.getRange(rowNum, 18).setValue(d.motivoCancelamento);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "usuario",
        modulo: "Dotações",
        acao: d.status === "CANCELADO" ? "Cancelar Pedido" : (d.empenho ? "Atualizar Empenho/Situação" : "Editar Pedido"),
        detalhes: `SF ${d.sf}: ${d.motivoCancelamento ? 'Motivo: ' + d.motivoCancelamento : (d.situacao || d.objeto || '').substring(0, 70)}`,
        registroId: d.sf
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_DOTACAO_STATUS") {
      const sheet = ensureDotacoesStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let sfRef = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          const rowNum = i + 1;
          sfRef = rows[i][1] || payload.id;
          sheet.getRange(rowNum, 10).setValue(payload.status);
          if (payload.validador) sheet.getRange(rowNum, 14).setValue(payload.validador);
          if (payload.validadorLogin) sheet.getRange(rowNum, 15).setValue(payload.validadorLogin);
          if (payload.dataValidacao) sheet.getRange(rowNum, 16).setValue(payload.dataValidacao);
          if (payload.situacao) sheet.getRange(rowNum, 8).setValue(payload.situacao);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || payload.validadorLogin || "financeiro",
        modulo: "Dotações",
        acao: "Validar Dotação",
        detalhes: `SF ${sfRef} validado com status ${payload.status} por ${payload.validador || "Setor Financeiro"}`,
        registroId: sfRef
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "DELETE_DOTACAO") {
      const sheet = ensureDotacoesStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let sfRef = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          sfRef = rows[i][1] || payload.id;
          sheet.deleteRow(i + 1);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Dotações",
        acao: "Excluir Pedido",
        detalhes: `Pedido SF ${sfRef} excluído do sistema`,
        registroId: sfRef
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DE USUÁRIOS ---
    if (action === "CREATE_USER") {
      const sheet = ensureUsersStructure(ss);
      sheet.appendRow([
        Date.now(), String(payload.usuario).trim().toLowerCase(), String(payload.senha).trim(),
        String(payload.nome).trim(), String(payload.perfil || "Comprador").trim(),
        String(payload.createdAt || "")
      ]);
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Gestão de Usuários",
        acao: "Cadastrar Usuário",
        detalhes: `Usuário "${payload.usuario}" (${payload.perfil}) cadastrado para ${payload.nome}`,
        registroId: payload.usuario
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_USER") {
      const sheet = ensureUsersStructure(ss);
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          const rowNum = i + 1;
          sheet.getRange(rowNum, 2).setValue(String(payload.usuario).trim().toLowerCase());
          if (payload.senha && payload.senha !== "****" && payload.senha !== "********") {
            sheet.getRange(rowNum, 3).setValue(String(payload.senha).trim());
          }
          sheet.getRange(rowNum, 4).setValue(String(payload.nome).trim());
          sheet.getRange(rowNum, 5).setValue(String(payload.perfil).trim());
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Gestão de Usuários",
        acao: "Editar Usuário",
        detalhes: `Usuário "${payload.usuario}" (${payload.perfil}) atualizado`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "DELETE_USER") {
      const sheet = ensureUsersStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let uName = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          uName = rows[i][1];
          sheet.deleteRow(i + 1);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Gestão de Usuários",
        acao: "Excluir Usuário",
        detalhes: `Usuário "${uName}" excluído do sistema`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_USER_PASSWORD") {
      const sheet = ensureUsersStructure(ss);
      const rows = sheet.getDataRange().getValues();
      let uName = payload.id;
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          uName = rows[i][1];
          sheet.getRange(i + 1, 3).setValue(String(payload.newPassword).trim());
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Gestão de Usuários",
        acao: "Redefinir Senha",
        detalhes: `Senha do usuário "${uName}" redefinida pelo administrador`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DE ATALHOS ---
    if (action === "SAVE_SHORTCUTS") {
      const sheet = ensureShortcutsStructure(ss);
      sheet.clearContents();
      sheet.appendRow(HEADERS_SHORTCUTS);
      if (Array.isArray(payload.shortcuts) && payload.shortcuts.length > 0) {
        const rowsToAdd = payload.shortcuts.map(s => [s.id, s.title, s.url, s.desc]);
        sheet.getRange(2, 1, rowsToAdd.length, 4).setValues(rowsToAdd);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // --- MÓDULO DE AUDITORIA DE EXAMES ---
    if (action === "CREATE_CONTRACT") {
      const cfgSheet = ensureMasterStructure(ss);
      const tabName = payload.tabName;
      let newSheet = ss.getSheetByName(tabName);
      if (!newSheet) {
        newSheet = ss.insertSheet(tabName);
        newSheet.appendRow(HEADERS_EXAMS);
      }

      if (Array.isArray(payload.initialExams) && payload.initialExams.length > 0) {
        const rowsToAdd = payload.initialExams.map(item => [
          item.id, item.item, item.cat, item.descEmpenho, item.descPrestador, item.vlUnit || 0, item.qtdEmpenho, item.saldoAnterior, item.faturado || 0
        ]);
        newSheet.getRange(2, 1, rowsToAdd.length, HEADERS_EXAMS.length).setValues(rowsToAdd);
      }

      cfgSheet.appendRow([tabName, payload.num, payload.empenhos, payload.prestador, payload.createdAt || ""]);
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Auditoria de Exames",
        acao: "Criar Contrato",
        detalhes: `Contrato nº ${payload.num} (${payload.prestador}) - ${(payload.initialExams || []).length} exames`,
        registroId: payload.num
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    const targetTab = payload.contract || "Contrato_67_2026";
    let sheet = ss.getSheetByName(targetTab);
    if (!sheet) {
      sheet = ss.insertSheet(targetTab);
      sheet.appendRow(HEADERS_EXAMS);
    }

    if (action === "INITIAL_SEED") {
      sheet.clearContents();
      sheet.appendRow(HEADERS_EXAMS);
      if (Array.isArray(payload.exams) && payload.exams.length > 0) {
        const rowsToAdd = payload.exams.map(item => [
          item.id, item.item, item.cat, item.descEmpenho, item.descPrestador, item.vlUnit || 0, item.qtdEmpenho, item.saldoAnterior, item.faturado || 0
        ]);
        sheet.getRange(2, 1, rowsToAdd.length, HEADERS_EXAMS.length).setValues(rowsToAdd);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "UPDATE_VALUES") {
      // Rebalanceamento em lote (76 exames)
      if (Array.isArray(payload.exams) && payload.exams.length > 0) {
        sheet.clearContents();
        sheet.appendRow(HEADERS_EXAMS);
        const rowsToAdd = payload.exams.map(item => [
          item.id, item.item, item.cat, item.descEmpenho, item.descPrestador, item.vlUnit || 0, item.qtdEmpenho, item.saldoAnterior, item.faturado || 0
        ]);
        sheet.getRange(2, 1, rowsToAdd.length, HEADERS_EXAMS.length).setValues(rowsToAdd);

        logAudit(ss, {
          usuario: payload.currentUser || "admin",
          modulo: "Auditoria de Exames",
          acao: "Rebalancear Cotas",
          detalhes: `Rebalanceamento aplicado ao Contrato ${targetTab} (${payload.exams.length} procedimentos readequados)`,
          registroId: targetTab
        });
        return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
      }

      // Atualização individual de item
      const rows = sheet.getDataRange().getValues();
      const headerRow = rows[0] || [];
      const hasVlUnit = headerRow.indexOf("vlUnit") !== -1;
      const vlUnitCol = hasVlUnit ? (headerRow.indexOf("vlUnit") + 1) : 0;
      const colOffset = hasVlUnit ? 1 : 0;
      let found = false;

      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          const rowNum = i + 1;
          if (payload.vlUnit !== undefined && vlUnitCol > 0) sheet.getRange(rowNum, vlUnitCol).setValue(payload.vlUnit);
          if (payload.qtdEmpenho !== undefined) sheet.getRange(rowNum, 6 + colOffset).setValue(payload.qtdEmpenho);
          if (payload.saldoAnterior !== undefined) sheet.getRange(rowNum, 7 + colOffset).setValue(payload.saldoAnterior);
          if (payload.faturado !== undefined) sheet.getRange(rowNum, 8 + colOffset).setValue(payload.faturado);
          found = true;
          break;
        }
      }
      if (!found && payload.itemData) {
        const item = payload.itemData;
        const newRow = hasVlUnit
          ? [
              item.id, item.item, item.cat, item.descEmpenho, item.descPrestador,
              payload.vlUnit !== undefined ? payload.vlUnit : (item.vlUnit || 0),
              payload.qtdEmpenho !== undefined ? payload.qtdEmpenho : item.qtdEmpenho,
              payload.saldoAnterior !== undefined ? payload.saldoAnterior : item.saldoAnterior,
              payload.faturado !== undefined ? payload.faturado : item.faturado
            ]
          : [
              item.id, item.item, item.cat, item.descEmpenho, item.descPrestador,
              payload.qtdEmpenho !== undefined ? payload.qtdEmpenho : item.qtdEmpenho,
              payload.saldoAnterior !== undefined ? payload.saldoAnterior : item.saldoAnterior,
              payload.faturado !== undefined ? payload.faturado : item.faturado
            ];
        sheet.appendRow(newRow);
      }

      logAudit(ss, {
        usuario: payload.currentUser || "auditor",
        modulo: "Auditoria de Exames",
        acao: "Atualizar Faturamento",
        detalhes: `Contrato ${targetTab}: Item ID ${payload.id} (Faturado: ${payload.faturado})`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "SAVE_EXAM") {
      const rows = sheet.getDataRange().getValues();
      const headerRow = rows[0] || [];
      const hasVlUnit = headerRow.indexOf("vlUnit") !== -1;
      let found = false;

      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          const rowNum = i + 1;
          if (hasVlUnit) {
            sheet.getRange(rowNum, 2, 1, 8).setValues([[
              payload.item, payload.cat, payload.descEmpenho, payload.descPrestador,
              payload.vlUnit || 0, payload.qtdEmpenho, payload.saldoAnterior, payload.faturado || 0
            ]]);
          } else {
            sheet.getRange(rowNum, 2, 1, 7).setValues([[
              payload.item, payload.cat, payload.descEmpenho, payload.descPrestador,
              payload.qtdEmpenho, payload.saldoAnterior, payload.faturado || 0
            ]]);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        if (hasVlUnit) {
          sheet.appendRow([
            payload.id, payload.item, payload.cat, payload.descEmpenho, payload.descPrestador,
            payload.vlUnit || 0, payload.qtdEmpenho, payload.saldoAnterior, payload.faturado || 0
          ]);
        } else {
          sheet.appendRow([
            payload.id, payload.item, payload.cat, payload.descEmpenho, payload.descPrestador,
            payload.qtdEmpenho, payload.saldoAnterior, payload.faturado || 0
          ]);
        }
      }

      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Auditoria de Exames",
        acao: "Salvar Procedimento",
        detalhes: `Contrato ${targetTab}: Item ${payload.item} - ${payload.descEmpenho} (Cota: ${payload.qtdEmpenho})`,
        registroId: payload.item
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    } else if (action === "DELETE_EXAM") {
      const rows = sheet.getDataRange().getValues();
      for (let i = 1; i < rows.length; i++) {
        if (Number(rows[i][0]) === Number(payload.id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      logAudit(ss, {
        usuario: payload.currentUser || "admin",
        modulo: "Auditoria de Exames",
        acao: "Excluir Procedimento",
        detalhes: `Contrato ${targetTab}: Procedimento ID ${payload.id} excluído`,
        registroId: payload.id
      });
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * ============================================================================
 * ROTINA DE BACKUP AUTOMÁTICO (COM SEUS IDs REAIS CONFIGURADOS)
 * ============================================================================
 */
function executarBackupAutomatico() {
  console.log("Iniciando rotina de backup oficial...");
  const agora = new Date();
  const diaDaSemana = agora.getDay();

  // Executa de Segunda (1) a Sexta (5)
  if (diaDaSemana === 0 || diaDaSemana === 6) {
    console.warn("Fim de semana: backup ignorado.");
    return;
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const arquivoOriginal = DriveApp.getFileById(ss.getId());
    const dataHoraFormatada = Utilities.formatDate(agora, "America/Sao_Paulo", "yyyy-MM-dd_HH'h'mm");
    const nomeBackup = `Backup_Auditoria_${dataHoraFormatada}`;

    // 1. Cópia na pasta da Prefeitura
    const pastaPref = DriveApp.getFolderById(ID_PASTA_PREFTORRES);
    const copia1 = arquivoOriginal.makeCopy(nomeBackup, pastaPref);
    console.log("✓ Cópia 1 salva com sucesso na pasta preftorres: " + copia1.getName());

    // 2. Cópia na pasta pessoal do Diego
    const pastaDiego = DriveApp.getFolderById(ID_PASTA_DIEGO);
    const copia2 = arquivoOriginal.makeCopy(nomeBackup, pastaDiego);
    console.log("✓ Cópia 2 salva com sucesso na pasta diegoocanto: " + copia2.getName());

    console.log("✓ Backup concluído com sucesso em ambas as contas!");

  } catch (erro) {
    console.error("Erro na rotina de backup: " + erro.toString());
  }
}

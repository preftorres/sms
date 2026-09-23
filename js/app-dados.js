/**
 * ============================================================================
 * PREFEITURA MUNICIPAL DE TORRES - SECRETARIA DA SAÚDE
 * MÓDULO DE DADOS & CONFIGURAÇÕES: Constantes, Matrizes e Bases Iniciais
 * Arquivo: js/app-dados.js
 * ============================================================================
 */

const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycbzB_7aIOl2t5Pq3nVBHJ7TyPd2vJsXBJ5HZ0mkg7Xn2mzewLPZ0brFBJB_rp5NfPkjwrw/exec";

const CONFIG = {
  keys: {
    links: 'torres_links_v6',
    contractsList: 'torres_contracts_hub_v1',
    activeContractTab: 'torres_active_tab_v1',
    examsCache: 'torres_exams_cache_v1',
    dotacoesCache: 'torres_dotacoes_cache_v1',
    permissions: 'torres_permissions_matrix_v1',
    auditSession: 'torres_audit_logged_user'
  }
};

const INITIAL_LINKS = [
  { id: 2, title: 'ETP/TR', url: 'https://etp-tr.torres.rs.gov.br/', desc: 'Termos de Referência' },
  { id: 3, title: 'Betha Cloud', url: 'http://betha.cloud/', desc: 'Sistemas ERP' },
  { id: 4, title: '1Doc', url: 'http://torres.1doc.com.br/', desc: 'Processos Digitais' },
  { id: 5, title: 'Webmail', url: 'http://webmail.torres.rs.gov.br/', desc: 'E-mail Institucional' },
  { id: 1, title: 'Vacinas', url: 'https://vacinastorres.dpdns.org/', desc: 'Controle de Imunização' }
];

const DEFAULT_CONTRACTS = [
  {
    tabName: "Contrato_67_2026",
    num: "67/2026",
    empenhos: "3406/2026 e 3407/2026",
    prestador: "LABORATORIO BIOMEDICO LTDA - ME",
    createdAt: "12/09/2026 às 08:30"
  }
];

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

const INITIAL_DOTACOES = [
  {
    id: 1,
    processo: "19011",
    origem: "Farmácia Municipal",
    objeto: "Medicamentos de Atenção Básica e Insulinas",
    quantidade: 12000,
    solicitante: "Dra. Juliana / Farmácia",
    comprador: "Carlos Silva",
    compradorLogin: "carlos.compras",
    dataSolicitacao: "13/09/2026 às 10:15",
    status: "PENDENTE",
    empenhoDoc: "",
    validador: "",
    validadorLogin: "",
    dataValidacao: ""
  },
  {
    id: 2,
    processo: "18982",
    origem: "Posto Central",
    objeto: "Luvas cirúrgicas estéreis e máscaras N95",
    quantidade: 5000,
    solicitante: "Enf. Roberto / Posto Central",
    comprador: "Mariana Costa",
    compradorLogin: "mariana.compras",
    dataSolicitacao: "13/09/2026 às 09:30",
    status: "REGISTRADO",
    empenhoDoc: "3890/2026",
    validador: "Gestor Financeiro",
    validadorLogin: "gestor.financeiro",
    dataValidacao: "13/09/2026 às 11:20"
  }
];

const DEFAULT_PERMISSIONS = {
  'Comprador': {
    'audit_edit_values': false,
    'audit_create_contract': false,
    'audit_manage_procedures': false,
    'dotacoes_create': true,
    'dotacoes_check': false,
    'dotacoes_edit': false,
    'dotacoes_delete': false,
    'panel_create': false,
    'panel_edit': false,
    'panel_archive': false
  },
  'Gestor Financeiro': {
    'audit_edit_values': true,
    'audit_create_contract': false,
    'audit_manage_procedures': false,
    'dotacoes_create': true,
    'dotacoes_check': true,
    'dotacoes_edit': true,
    'dotacoes_delete': false,
    'panel_create': true,
    'panel_edit': true,
    'panel_archive': true
  }
};

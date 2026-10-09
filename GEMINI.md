# Diretrizes e Regras do Projeto (Pref Torres WEB)

## 1. Regra Fundamental de Controle de Versão (Git / GitHub)
- **NUNCA executar `git commit` ou `git push` de forma automática.**
- Todas as alterações de código, layout e scripts devem ser feitas **exclusivamente nos arquivos locais** da máquina do usuário.
- Se o espelho de rede estiver disponível, manter a unidade `Z:\Diretoria Administrativa\Secretaria\Diego Canto\Docs\sistema\Antigravity\Pref Torres WEB\` atualizada através de cópia local de arquivos (`Copy-Item`), **sem qualquer comando git**.
- O envio (`commit` e `push`) para o GitHub somente poderá ocorrer se o usuário solicitar ou autorizar de forma expressa após validar as alterações.

## 2. Preservação de Dados e Integridade
- **Nunca resetar ou sobrescrever contratos do usuário:** Rotinas de sincronização devem sempre fazer mesclagem cumulativa (`merge`), preservando contratos novos ou modificados pelo usuário.
- **Filtro Anti-Fantasmas:** Manter a proteção contra linhas vazias ou slots nulos no painel.

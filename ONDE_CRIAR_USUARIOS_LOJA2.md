# 👥 ONDE CRIAR USUÁRIOS PARA LOJA 2

## 🎯 **LOCALIZAÇÃO DOS USUÁRIOS**

---

## 1️⃣ **USUÁRIOS DO ATENDIMENTO2** (`/atendimento2`)

### 📍 **Onde Gerenciar:**
- **URL**: `/gerenciamento_loja2` → Aba "Usuários"
- **Login**: `admin_loja2` / `config_loja2_123`

### 📂 **Arquivo de Configuração:**
- **Localização**: `src/hooks/useStore2Attendance.ts`
- **Linha**: 35-55 (objeto `users`)

### 🔧 **Como Adicionar Usuário:**
```javascript
// Em src/hooks/useStore2Attendance.ts (linha ~35)
users = [{
  id: '1',
  username: 'loja2',           // ← USUÁRIO PADRÃO
  password: 'elite2024',       // ← SENHA PADRÃO
  name: 'Administrador Loja 2',
  role: 'admin',
  isActive: true,
  permissions: {
    can_view_orders: false,    // Loja 2 não tem delivery
    can_update_status: false,
    can_chat: false,
    can_create_manual_orders: false,
    can_print_orders: true
  }
},
{
  id: '2',
  username: 'operador2',       // ← NOVO USUÁRIO
  password: 'senha123',        // ← NOVA SENHA
  name: 'Operador Loja 2',
  role: 'attendant',
  isActive: true,
  permissions: {
    can_view_orders: false,
    can_update_status: false,
    can_chat: false,
    can_create_manual_orders: false,
    can_print_orders: true
  }
}];
```

---

## 2️⃣ **USUÁRIOS DOS RELATÓRIOS** (`/relatorios_loja2`)

### 📍 **Onde Gerenciar:**
- **Interface**: `/gerenciamento_loja2` → Aba "Usuários"
- **Filtro**: Usuários com permissão `can_view_reports: true`

### 📂 **Arquivo de Configuração:**
- **Localização**: `src/components/Store2/Store2ReportsPage.tsx`
- **Linha**: 15-18 (objeto `CREDENTIALS`)

### 🔧 **Como Alterar Credenciais:**
```javascript
// Em src/components/Store2/Store2ReportsPage.tsx (linha ~15)
const CREDENTIALS = {
  username: 'admin_loja2',     // ← ALTERE O USUÁRIO AQUI
  password: 'senha_segura_123' // ← ALTERE A SENHA AQUI
};
```

---

## 3️⃣ **SISTEMA UNIFICADO DE USUÁRIOS**

### 🎛️ **Interface de Gerenciamento:**
- **URL**: `/gerenciamento_loja2`
- **Login**: `admin_loja2` / `config_loja2_123`
- **Aba**: "Usuários"

### ✅ **Funcionalidades:**
- ✅ **Criar usuários**: Botão "Novo Usuário"
- ✅ **Editar**: Clique no ícone de edição
- ✅ **Ativar/Desativar**: Toggle de status
- ✅ **Permissões**: Granulares por função
- ✅ **Funções**: Operador, Gerente, Administrador

### 🔒 **Tipos de Permissões:**
- ✅ **can_view_sales**: Visualizar vendas
- ✅ **can_view_cash**: Visualizar caixa
- ✅ **can_view_products**: Gerenciar produtos
- ✅ **can_view_reports**: Visualizar relatórios ← **IMPORTANTE**
- ✅ **can_manage_settings**: Gerenciar configurações

---

## 🚀 **PASSO A PASSO COMPLETO**

### 📝 **Para Criar Usuário de Atendimento:**
1. ✅ **Acesse**: `/gerenciamento_loja2`
2. ✅ **Login**: `admin_loja2` / `config_loja2_123`
3. ✅ **Aba**: "Usuários"
4. ✅ **Clique**: "Novo Usuário"
5. ✅ **Preencha**: Nome, usuário, senha, função
6. ✅ **Permissões**: Marque as necessárias
7. ✅ **Salve**: Clique "Criar Usuário"

### 📝 **Para Criar Usuário de Relatórios:**
1. ✅ **Siga passos acima**
2. ✅ **Importante**: Marque `can_view_reports: true`
3. ✅ **Função**: Gerente ou Administrador
4. ✅ **Teste**: Use as credenciais em `/relatorios_loja2`

---

## 📊 **USUÁRIOS PADRÃO EXISTENTES**

### 👤 **Atendimento (`/atendimento2`):**
| Usuário | Senha | Função | Status |
|---------|-------|--------|--------|
| `loja2` | `elite2024` | Admin | ✅ Ativo |

### 👤 **Relatórios (`/relatorios_loja2`):**
| Usuário | Senha | Função | Status |
|---------|-------|--------|--------|
| `admin_loja2` | `senha_segura_123` | Admin | ✅ Ativo |

### 👤 **Gerenciamento (`/gerenciamento_loja2`):**
| Usuário | Senha | Função | Status |
|---------|-------|--------|--------|
| `admin_loja2` | `config_loja2_123` | Admin | ✅ Ativo |

---

## ⚠️ **IMPORTANTE**

### 🔐 **Segurança:**
- ✅ **Senhas únicas**: Use senhas diferentes para cada usuário
- ✅ **Permissões mínimas**: Dê apenas o acesso necessário
- ✅ **Backup**: Anote as credenciais em local seguro
- ✅ **Rotação**: Altere senhas periodicamente

### 🎯 **Recomendações:**
- ✅ **Usuários específicos**: Crie usuários para cada pessoa
- ✅ **Funções claras**: Operador < Gerente < Administrador
- ✅ **Logs**: Monitore acessos e atividades
- ✅ **Treinamento**: Ensine o uso correto do sistema

---

**📅 Última atualização:** Janeiro 2025
**🏪 Sistema:** Elite Açaí - Loja 2
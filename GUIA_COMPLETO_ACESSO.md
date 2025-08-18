# 🔐 GUIA COMPLETO DE PÁGINAS E CREDENCIAIS

## 📋 **TODAS AS PÁGINAS DO SISTEMA**

---

## 🏠 **PÁGINAS PÚBLICAS (Sem Login)**

### 1️⃣ **Página Principal**
- **URL**: `/` ou `https://localhost:3000/`
- **Descrição**: Cardápio de delivery, carrinho de compras
- **Acesso**: ✅ **PÚBLICO** - Sem necessidade de login
- **Funcionalidades**: Ver produtos, fazer pedidos, chat

### 2️⃣ **Buscar Pedido**
- **URL**: `/buscar-pedido`
- **Descrição**: Localizar pedido por ID
- **Acesso**: ✅ **PÚBLICO** - Sem necessidade de login
- **Funcionalidades**: Busca por ID do pedido

### 3️⃣ **Acompanhar Pedido**
- **URL**: `/pedido/:orderId`
- **Descrição**: Status e chat do pedido específico
- **Acesso**: ✅ **PÚBLICO** - Precisa apenas do ID do pedido
- **Funcionalidades**: Status, chat com atendente

### 4️⃣ **Meu Cashback**
- **URL**: `/meu-cashback`
- **Descrição**: Consultar saldo de cashback por telefone
- **Acesso**: ✅ **PÚBLICO** - Precisa apenas do telefone
- **Funcionalidades**: Consulta por telefone, histórico

---

## 🔒 **PÁGINAS COM LOGIN**

### 5️⃣ **PDV (Ponto de Venda)**
- **URL**: `/pdv` ou `/pdv/app`
- **Descrição**: Sistema completo de vendas
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: ADMIN
  Senha: elite2024
  ```
- **Funcionalidades**: Vendas, caixa, produtos, relatórios, operadores

### 6️⃣ **Administrativo**
- **URL**: `/administrativo`
- **Descrição**: Painel administrativo geral
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: admin
  Senha: elite2024
  ```
- **Funcionalidades**: Produtos, bairros, horários, usuários

### 7️⃣ **Atendimento (Loja 1)**
- **URL**: `/atendimento`
- **Descrição**: Painel de atendimento e pedidos
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: admin
  Senha: elite2024
  ```
- **Funcionalidades**: Pedidos, chat, vendas, caixa

### 8️⃣ **Atendimento Loja 2**
- **URL**: `/atendimento2`
- **Descrição**: Sistema exclusivo da Loja 2
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: loja2
  Senha: elite2024
  ```
- **Funcionalidades**: Vendas presenciais, caixa independente

### 9️⃣ **Relatórios Loja 2**
- **URL**: `/relatorios_loja2`
- **Descrição**: Relatórios exclusivos da Loja 2
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: admin_loja2
  Senha: senha_segura_123
  ```
- **Funcionalidades**: 3 tipos de relatórios de caixa

### 🔟 **Gerenciamento Loja 2**
- **URL**: `/gerenciamento_loja2`
- **Descrição**: Configurações avançadas da Loja 2
- **Acesso**: 🔐 **LOGIN OBRIGATÓRIO**
- **Credenciais**:
  ```
  Usuário: admin_loja2
  Senha: config_loja2_123
  ```
- **Funcionalidades**: Usuários, produtos, configurações

### 1️⃣1️⃣ **Portal do Entregador**
- **URL**: `/entregas` (após login em `/login`)
- **Descrição**: Sistema para entregadores
- **Acesso**: 🔐 **LOGIN SUPABASE AUTH**
- **Credenciais**: Configuradas no Supabase Auth
- **Funcionalidades**: Lista de pedidos, impressão, WhatsApp

---

## 📊 **RESUMO POR CATEGORIA**

### 🏪 **LOJA 1 (Principal)**
| Página | URL | Usuário | Senha |
|--------|-----|---------|-------|
| PDV | `/pdv` | `ADMIN` | `elite2024` |
| Administrativo | `/administrativo` | `admin` | `elite2024` |
| Atendimento | `/atendimento` | `admin` | `elite2024` |

### 🏪 **LOJA 2 (Unidade 2)**
| Página | URL | Usuário | Senha |
|--------|-----|---------|-------|
| Atendimento | `/atendimento2` | `loja2` | `elite2024` |
| Relatórios | `/relatorios_loja2` | `admin_loja2` | `senha_segura_123` |
| Gerenciamento | `/gerenciamento_loja2` | `admin_loja2` | `config_loja2_123` |

### 🚚 **DELIVERY**
| Página | URL | Tipo | Credenciais |
|--------|-----|------|-------------|
| Portal Entregador | `/entregas` | Supabase Auth | Configurar no Supabase |

---

## 🔧 **COMO ALTERAR CREDENCIAIS**

### 📝 **Localização das Senhas:**

#### 🏪 **Loja 1:**
- **PDV**: `src/components/PDV/PDVLogin.tsx` (linha ~45)
- **Admin**: `src/hooks/useAdmin.ts` (linha ~6)
- **Atendimento**: `src/hooks/useAttendance.ts` (linha ~35)

#### 🏪 **Loja 2:**
- **Atendimento**: `src/hooks/useStore2Attendance.ts` (linha ~35)
- **Relatórios**: `src/components/Store2/Store2ReportsPage.tsx` (linha ~15)
- **Gerenciamento**: `src/components/Store2/Store2ManagementPage.tsx` (linha ~15)

### ⚙️ **Como Modificar:**
1. ✅ **Abra o arquivo** correspondente
2. ✅ **Localize** o objeto `CREDENTIALS`
3. ✅ **Altere** `username` e `password`
4. ✅ **Salve** o arquivo

---

## 🎯 **ACESSO RÁPIDO**

### 🚀 **URLs Diretas:**
```
https://localhost:3000/                    # Cardápio público
https://localhost:3000/pdv                 # PDV (ADMIN/elite2024)
https://localhost:3000/administrativo      # Admin (admin/elite2024)
https://localhost:3000/atendimento         # Atendimento (admin/elite2024)
https://localhost:3000/atendimento2        # Loja 2 (loja2/elite2024)
https://localhost:3000/relatorios_loja2    # Relatórios L2 (admin_loja2/senha_segura_123)
https://localhost:3000/gerenciamento_loja2 # Gerenciamento L2 (admin_loja2/config_loja2_123)
```

---

## ⚠️ **IMPORTANTE**

### 🔒 **Segurança:**
- ✅ **Senhas visíveis**: Para facilitar desenvolvimento
- ✅ **Produção**: Altere todas as senhas antes do deploy
- ✅ **Backup**: Anote as credenciais em local seguro
- ✅ **Acesso**: Compartilhe apenas com pessoas autorizadas

### 🎯 **Recomendações:**
- ✅ **Senhas fortes**: Use combinações complexas
- ✅ **Usuários únicos**: Evite reutilizar credenciais
- ✅ **Rotação**: Altere periodicamente
- ✅ **Logs**: Monitore acessos suspeitos

---

**📅 Última atualização:** Janeiro 2025
**🔧 Versão:** Sistema Elite Açaí v2.0
# # 🧮 Calculadora de Integrais — Frações Parciais
<p align="center">
  <!-- Substitua o caminho abaixo pela sua logo (ex.: /assets/logo.png ou /docs/logo.png) -->
  <img src="assets/Imagens/nazare.png" alt="EquiTrade Logo" width="320" />
</p>

Este projeto foi desenvolvido como parte do **Trabalho Prático de Cálculo II**, com o objetivo de implementar uma **calculadora simbólica de integrais racionais** utilizando **decomposição em frações parciais**.

O programa identifica automaticamente o tipo de fatoração do denominador (linear, quadrático simples, quadrático distinto ou quadrático repetido) e realiza a decomposição e integração simbólica aproximada sem utilizar bibliotecas externas como `SymPy` ou `NumPy`.

---

## ⚙️ Funcionalidades

- Identificação automática do tipo de denominador:
  - Linear distinto — `(x - x₁)(x - x₂)`
  - Quadrático simples — `ax² + bx + c`
  - Quadráticos distintos — `(x² + a₁)(x² + a₂)`
  - Quadrático repetido — `(x² + a)²`

- Cálculo simbólico das integrais via decomposição parcial.
- Completação de quadrado automática para denominadores quadráticos.
- Interface web amigável em **HTML, CSS e JavaScript**.
- Exibição clara da decomposição e da integral simbólica aproximada.

---

## 🖥️ Tecnologias Utilizadas

- **HTML5** — estrutura da interface.
- **CSS3** — estilização e layout.
- **JavaScript (ES6)** — lógica de cálculo e manipulação simbólica.
- **Node.js (opcional)** — para execução local no terminal, caso deseje testar o cálculo diretamente.

---

## 🚀 Como Executar

### 🔹 Opção 1: Executar via navegador (recomendado)
1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

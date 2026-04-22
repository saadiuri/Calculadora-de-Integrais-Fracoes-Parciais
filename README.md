#  🧮 Calculadora de Integrais — Frações Parciais
<p align="center">
  <!-- Substitua o caminho abaixo pela sua logo (ex.: /assets/logo.png ou /docs/logo.png) -->
  <img src="assets/Imagens/nazare.png" alt="Imagem Calculadora" width="320" />
</p>

Este projeto foi desenvolvido como parte do **Trabalho Prático de Cálculo II**, com o objetivo de implementar uma **calculadora simbólica de integrais racionais** utilizando **decomposição em frações parciais**.

O programa identifica automaticamente o tipo de fatoração do denominador (linear, quadrático simples, quadrático distinto ou quadrático repetido) e realiza a decomposição e integração simbólica aproximada.

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
  
---

## 🧭 Guia de Utilização — Passo a Passo

### Requisitos
- Visual Studio Code
- Extensão **Live Server** no VS Code
- Git (opcional — para clonar o repositório)
  
### 1) Instalar o Visual Studio Code
- Baixe e instale o VS Code em: https://code.visualstudio.com/  
- No **Linux (Ubuntu/Debian)**, você pode instalar via terminal:
  
```bash
 sudo apt install ./code_*.deb
```
    
### 2) Instalar a extensão Live Server
- Abra o VS Code.
- Vá em Extensões (Ctrl+Shift+X).
- Procure por Live Server (autor: Ritwick Dey) e clique em Instalar.

> A extensão abre um servidor local e atualiza a página automaticamente ao salvar.
  
## 🚀 Como Executar
### 3) Executar via navegador
Clone o repositório:

```bash
 git clone https://github.com/saadiuri/Calculadora-de-Integrais-Fracoes-Parciais
```

Sem Git: faça Download ZIP na página do repositório e extraia.

### 4) Abrir o projeto no VS Code
Na pasta do projeto:

```bash
 code .
```
      
Abra o arquivo [`/index.html`](scr/index.html/) no editor.

### 5) Executar com Live Server
- 1. Com index.html aberto, clique com o botão direito no editor e selecione Open with Live Server (ou use o botão Go Live no canto inferior direito).
- 2. O browser abrirá em `http://127.0.0.1:5500/` (ou endereço similar) mostrando a interface da calculadora.

### 6) Exemplos de teste rápidos
- Os exemplos de testes estão em `/testes tp calculo.txt`.
  
---



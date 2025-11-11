// UTILS

function normalizarExpr(s) {
    if (!s) return s;
    s = s.replace(/[\u2012\u2013\u2014\u2212]/g, "-");
    s = s.replace(/\s+/g, "");
    return s;
}

function formatarCoeficiente(valor) {
    // 1. Arredonda o valor para 4 casas decimais para evitar erros de ponto flutuante
    const precisao = Math.round(valor * 10000) / 10000;

    // 2. Verifica se o valor é um número inteiro (com pequena tolerância)
    if (Math.abs(precisao - Math.round(precisao)) < 1e-4) {
        return Math.round(precisao);
    }
    // Se não for inteiro, retorna com 4 casas decimais
    return precisao.toFixed(4);
}

// EXTRAÇÃO DE COEFICIENTES

function extrairCoeficientesLinear(expr) {
    expr = expr.replace(/-/g, "+-");
    let partes = expr.split("+");
    let a = 0, b = 0;
    for (let p of partes) {
        if (p.includes("x")) {
            let coef = p.replace("x", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            a += parseFloat(coef);
        } else if (p.trim() !== "") {
            b += parseFloat(p);
        }
    }
    return [a, b];
}

function extrairCoeficientesQuadratico(expr) {
    expr = expr.replace(/-/g, "+-");
    let partes = expr.split("+");
    let a = 0, b = 0, c = 0;
    for (let p of partes) {
        if (p.includes("x^2")) {
            let coef = p.replace("x^2", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            a += parseFloat(coef);
        } else if (p.includes("x")) {
            let coef = p.replace("x", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            b += parseFloat(coef);
        } else if (p.trim() !== "") {
            c += parseFloat(p);
        }
    }
    return [a, b, c];
}

// NOVO: EXTRAÇÃO DE COEFICIENTES CÚBICOS
function extrairCoeficientesCubico(expr) {
    expr = expr.replace(/-/g, "+-");
    let partes = expr.split("+");
    let a = 0, b = 0, c = 0, d = 0; // x^3, x^2, x, constante

    for (let p of partes) {
        if (p.includes("x^3")) {
            let coef = p.replace("x^3", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            a += parseFloat(coef);
        } else if (p.includes("x^2")) {
            let coef = p.replace("x^2", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            b += parseFloat(coef);
        } else if (p.includes("x")) {
            let coef = p.replace("x", "");
            if (coef === "" || coef === "+") coef = "1";
            if (coef === "-") coef = "-1";
            c += parseFloat(coef);
        } else if (p.trim() !== "") {
            d += parseFloat(p);
        }
    }
    return [a, b, c, d];
}


// EXTRAÇÃO DE RAIZ LINEAR
function extrairRaizLinear(sRaw) {
    if (!sRaw) return NaN;
    let s = normalizarExpr(sRaw);
    const mX = s.match(/([+-]?\d*\.?\d*)x/);
    let a;
    if (mX) {
        a = mX[1];
        if (a === "" || a === "+") a = "1";
        if (a === "-") a = "-1";
        a = parseFloat(a);
    } else {
        return NaN;
    }

    let resto = s.replace(mX[0], "");
    let b = 0;
    if (resto !== "") {
        const mB = resto.match(/([+-]?\d+(\.\d+)?)/);
        if (mB) {
            b = parseFloat(mB[1]);
        } else {
            const mAlt = s.match(/([+-]?\d+(\.\d+)?)([+-]\d*\.?\d*)x/);
            if (mAlt) {
                b = parseFloat(mAlt[1]);
            } else {
                return NaN;
            }
        }
    }

    if (a === 0 || isNaN(a) || isNaN(b)) return NaN;
    return -b / a;
}

function groupsLengthSafe(g) {
    if (!g) return 0;
    return Array.isArray(g) ? g.length : 0;
}

// CASOS DE DECOMPOSIÇÃO E INTEGRAÇÃO

// CASO 1: Fatores Lineares Distintos (x - r1)(x - r2)
function decomporLinearDistinto(a, b, r1, r2) {
    const A = (a * r1 + b) / (r1 - r2);
    const B = (a * r2 + b) / (r2 - r1);
    return [A, B];
}

function integrarLinearDistinto(A, B, r1, r2) {
    const r1_str = formatarCoeficiente(-r1);
    const r2_str = formatarCoeficiente(-r2);

    return `f(x) = ${formatarCoeficiente(A)}/(x + ${r1_str}) + ${formatarCoeficiente(B)}/(x + ${r2_str})\n\n∫f(x)dx = ${formatarCoeficiente(A)}·ln|x - ${r1}| + ${formatarCoeficiente(B)}·ln|x - ${r2}| + C`;
}

// CASO 2: Fator Quadrático Irredutível Simples (ax^2 + bx + c)
function integrarQuadraticoSimples(a_den, b_den, c_den, A_num, B_num) {
    // Completação do quadrado
    const p = b_den / (2 * a_den);
    const q = c_den / a_den - p ** 2;
    const raiz_q = Math.sqrt(Math.abs(q));

    // CÁLCULOS DOS COEFICIENTES DA INTEGRAL
    const Coef_ln = A_num / (2 * a_den);
    const Coef_atan_num = B_num - (A_num * b_den / (2 * a_den));
    const Coef_atan = Coef_atan_num / (a_den * raiz_q);

    // MONTAGEM DA STRING DE RESULTADO
    let resultado = `Completação do quadrado: ${formatarCoeficiente(a_den)}((x + ${formatarCoeficiente(p)})² + ${formatarCoeficiente(q)})`;

    // Termo LN
    resultado += `\nIntegral = ${formatarCoeficiente(Coef_ln)}·ln|${formatarCoeficiente(a_den)}x² + ${formatarCoeficiente(b_den)}x + ${formatarCoeficiente(c_den)}| `;

    // Termo ARCTAN (com formatação de sinal corrigida)
    const sinal_atan = (Coef_atan >= 0) ? '+' : '-';
    const valor_atan = formatarCoeficiente(Math.abs(Coef_atan));

    resultado += `${sinal_atan} ${valor_atan}·arctan((x + ${formatarCoeficiente(p)})/${formatarCoeficiente(raiz_q)}) + C`;

    return resultado;
}

// CASO 3: Fatores Quadráticos Irredutíveis Distintos (x^2 + a1)(x^2 + a2)
function decomporIntegrarQuadraticosDistintos(a_num, b_num, a1_den, a2_den) {
    const A = a_num / (a1_den - a2_den);
    const C = -A;
    const B = b_num / (a1_den - a2_den);
    const D = -B;

    const K_ln1 = A / 2;
    const K_ln2 = C / 2;
    const raiz_a1 = Math.sqrt(a1_den);
    const raiz_a2 = Math.sqrt(a2_den);
    const K_atan1 = B / raiz_a1;
    const K_atan2 = D / raiz_a2;

    let resultado = `Decomposição: f(x) = (${formatarCoeficiente(A)}x + ${formatarCoeficiente(B)})/(x² + ${a1_den}) + (${formatarCoeficiente(C)}x + ${formatarCoeficiente(D)})/(x² + ${a2_den})\n\n`;

    resultado += `∫f(x)dx = ${formatarCoeficiente(K_ln1)}·ln(x²+${a1_den}) `;
    resultado += `${K_ln2 >= 0 ? '+' : ''} ${formatarCoeficiente(K_ln2)}·ln(x²+${a2_den}) `;
    resultado += `${K_atan1 >= 0 ? '+' : ''} ${formatarCoeficiente(K_atan1)}·arctan(x/${formatarCoeficiente(raiz_a1)}) `;
    resultado += `${K_atan2 >= 0 ? '+' : ''} ${formatarCoeficiente(K_atan2)}·arctan(x/${formatarCoeficiente(raiz_a2)}) + C`;

    return resultado;
}

// CASO 4: Fator Quadrático Repetido (x^2 + a)^2
// Implementação inicial para frações próprias (grau 1 no numerador)
// NOVO: Funcao para Decompor e Integrar o Caso 4 quando o numerador é grau 3 (como em seu exemplo)
// NOVO: Funcao para Decompor e Integrar o Caso 4 quando o numerador é grau 3 (como em seu exemplo)
// Esta função lida com todos os casos de Fator Quadrático Repetido (grau num <= 3)
function decomporIntegrarQuadraticoRepetidoGrau3(A_cub, B_quad, C_lin, D_const, a_den) {

    // VERIFICAÇÃO DE FRAÇÃO IMPRÓPRIA (grau do num >= grau do den) - Continua como aviso
    if (A_cub !== 0 || B_quad !== 0) {
        // O seu exemplo é N(x) = x^3 + 2x^2 + 5x + 3, D(x) = x^4 + 4x^2 + 4. Grau num < Grau den.
        // A lógica abaixo é para grau num < grau den.
    }

    // 1. Decomposição (Encontrando A1, B1, C1, D1)
    // Decomposição: (A1*x + B1) / (x^2 + a)  +  (C1*x + D1) / (x^2 + a)^2
    const A1 = A_cub;
    const B1 = B_quad;

    // C1 e D1 são os coeficientes restantes que vão para a segunda fração.
    const C1 = C_lin - (2 * A1); // C_lin = 2*A1 + C1
    const D1 = D_const - (2 * B1); // D_const = 2*B1 + D1

    // 2. Integração (Cálculo dos Coeficientes Individuais)
    const raiz_a = Math.sqrt(a_den);

    // Termos da Primeira Fração: (A1*x + B1) / (x^2 + a)
    const K_ln = A1 / 2; // Coeficiente para ln(x^2 + a)
    const K_atan1 = B1 / raiz_a; // Coeficiente para o primeiro arctan

    // Termos da Segunda Fração: (C1*x + D1) / (x^2 + a)^2
    const K_pot = C1 / 2; // Numerador do termo -1/(x^2 + a) (o sinal negativo é aplicado na exibição)
    const K_arctan2 = D1 / (2 * a_den * raiz_a); // Coeficiente para o segundo arctan
    const K_frac = D1 / (2 * a_den); // Coeficiente do termo x/(x^2 + a) da redução

    // 3. Combinação dos Termos SIMILARES

    // A) Combinação dos termos Arctan
    const K_atan_total = K_atan1 + K_arctan2;

    // B) Combinação dos termos Fracionários em um único numerador: (Numerador_Lin*x + Numerador_Const) / (x^2 + a)
    // Numerador_Lin: Termo de 'x' da redução (K_frac)
    const Numerador_Lin = K_frac;

    // Numerador_Const: Termo constante (-K_pot)
    const Numerador_Const = -K_pot;

    // 4. Montagem do Resultado Final Simplificado

    // Decomposição
    let resultado = `Decomposição: f(x) = (${formatarCoeficiente(A1)}x + ${formatarCoeficiente(B1)})/(x² + ${a_den}) + (${formatarCoeficiente(C1)}x + ${formatarCoeficiente(D1)})/(x² + ${a_den})²\n\n`;

    // 1. Termo LN
    resultado += `∫f(x)dx = ${formatarCoeficiente(K_ln)}·ln(x² + ${a_den}) `;

    // 2. Termo Fracionário Algebrico (UNIFICADO)
    // Verifica se o termo fracionário é diferente de zero
    if (Math.abs(Numerador_Lin) > 1e-4 || Math.abs(Numerador_Const) > 1e-4) {

        // Monta o numerador unificado
        const num_unificado_x = Math.abs(Numerador_Lin) > 1e-4 ? `${formatarCoeficiente(Math.abs(Numerador_Lin))}x` : '';
        const num_unificado_const = Math.abs(Numerador_Const) > 1e-4 ? `${Numerador_Const >= 0 ? '+' : '-'} ${formatarCoeficiente(Math.abs(Numerador_Const))}` : '';

        // Limpa a string do numerador (remove o '+' se for o primeiro termo positivo)
        let num_unificado = `${num_unificado_x} ${num_unificado_const}`.trim();
        if (num_unificado.startsWith('+')) num_unificado = num_unificado.substring(1).trim();

        // Determina o sinal da fração. Por convenção, exibimos a fração como negativa se for o termo principal.
        // Se o numerador é positivo, exibimos - (numerador) / (den)
        // Se o numerador é negativo, exibimos + (-numerador) / (den)
        // Simplificando, exibimos o sinal do Numerador_Lin (ou Const, se Lin=0) e colocamos parênteses em torno do numerador

        const sinal_externo = (Numerador_Lin < -1e-4) || (Math.abs(Numerador_Lin) < 1e-4 && Numerador_Const < -1e-4) ? '+' : '-';

        resultado += ` ${sinal_externo} (${num_unificado}) / (x² + ${a_den}) `;
    }

    // 3. Termo Arctan (TOTAL)
    const sinal_atan_total = K_atan_total >= 0 ? '+' : '-';
    resultado += `${sinal_atan_total} ${formatarCoeficiente(Math.abs(K_atan_total))}·arctan(x/${formatarCoeficiente(raiz_a)}) + C`;

    return resultado;
}

function testeConexao() {
    if (true) console.log("executa sempre"); // deve gerar alerta
    eval("console.log('inseguro')"); // deve gerar alerta
}


// FUNÇÃO PRINCIPAL

function calcular() {
    const numRaw = document.getElementById("numerador").value || "";
    const denRaw = document.getElementById("denominador").value || "";

    const num = normalizarExpr(numRaw);
    let den = normalizarExpr(denRaw);

    // MANTÉM A EXTRAÇÃO LINEAR PARA OS CASOS 1, 2 e 3
    const [a_num, b_num] = extrairCoeficientesLinear(num);

    // EXTRAÇÃO PARA O CASO 4 (GRAU 3)
    const [a_cub, b_quad, c_lin, d_const] = extrairCoeficientesCubico(num);

    let resultado = "";

    let grupos = den.match(/\(.*?\)/g);

    // Tenta detectar fatores fora de parênteses (ex: x^2+1, ou (x-1)(x-2) sem parênteses)
    if (!grupos) {
        const partes = den.split(/[\*·]/).filter(p => p.trim() !== "");
        if (partes.length > 1) {
            grupos = partes.map(p => `(${p})`);
        }
    }

    // Lógica de Decisão do Caso

    if (grupos && groupsLengthSafe(grupos) === 2) {
        // CASO 1 ou CASO 3 (Fatores Distintos)
        const g1 = grupos[0].replace(/[()]/g, "");
        const g2 = grupos[1].replace(/[()]/g, "");
        
        const g1TemX2 = /x\^2/.test(g1);

        if (g1TemX2) {
            // CASO 3: Ambos Quadráticos (ex: (x^2+1)(x^2+4))
            const [A1, B1, C1] = extrairCoeficientesQuadratico(g1);
            const [A2, B2, C2] = extrairCoeficientesQuadratico(g2);

            // Verifica se são da forma x^2 + k (simples, B1=B2=0, A1=A2=1)
            if (A1 === 1 && B1 === 0 && A2 === 1 && B2 === 0) {
                resultado = decomporIntegrarQuadraticosDistintos(a_num, b_num, C1, C2);
            } else {
                resultado = "⚠️ CASO 3: Fatores Quadráticos Distintos, mas não são da forma simples (x²+k).";
            }

        } else {
            // CASO 1: Ambos Lineares (ex: (x-1)(x-2))
            const r1 = extrairRaizLinear(g1);
            const r2 = extrairRaizLinear(g2);

            if (isNaN(r1) || isNaN(r2) || Math.abs(r1 - r2) < 1e-4) {
                resultado = "⚠️ Fatores lineares inválidos ou repetidos. Use formato (x-r1)(x-r2).";
            } else {
                const [A_fp, B_fp] = decomporLinearDistinto(a_num, b_num, r1, r2);
                resultado = integrarLinearDistinto(A_fp, B_fp, r1, r2);
            }
        }

    } else if (/\bx\^2\b/.test(den) && !/\(.*\)/.test(den)) {
        // CASO 2: Quadrático Irredutível Simples (ex: x^2+2x+2)
        const [A, B, C] = extrairCoeficientesQuadratico(den);

        // Verifica se é irredutível: Discriminante < 0
        const delta = B ** 2 - 4 * A * C;

        if (delta < 0) {
            resultado = integrarQuadraticoSimples(A, B, C, a_num, b_num);
        } else {
            resultado = "⚠️ CASO 2: O quadrático não é irredutível (pode ser fatorado).";
        }

    } else if (/\(x\^2\+\s*\d+\)\s*(\^2|²)/.test(den)) {
        // CASO 4: Quadrático Repetido (ex: (x^2+4)^2)

        // Expressão regular robusta para extrair o valor 'a' de (x^2 + a)
        const match = den.match(/x\^2\+\s*(\d+)/);

        if (match) {
            const a_val = parseFloat(match[1]); // Obtém 'a' do denominador (x^2 + a)^2

            // Chama a função de decomposição mais robusta para grau 3
            // O nome da função é "decomporIntegrarQuadraticoRepetidoGrau3"
            // mas ela é o motor do Caso 4 e lida com todos os graus <= 3.
            resultado = decomporIntegrarQuadraticoRepetidoGrau3(a_cub, b_quad, c_lin, d_const, a_val);

        } else {
            resultado = "❌ Fator quadrático repetido não reconhecido. Formato esperado: (x^2+a)^2";
        }
    } else {
        // Caso Não Reconhecido
        resultado = "❌ Formato de denominador não reconhecido. Exemplos:\n(x-1)(x-2)\n(x^2+1)(x^2+4)\nx^2+2x+2\n(x^2+4)²";
    }

    document.getElementById("resultado").textContent = resultado;
}
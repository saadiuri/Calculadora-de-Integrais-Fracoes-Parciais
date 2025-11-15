function normalizarExpr(s) {
    if (!s) return s;
    s = s.replace(/[\u2012\u2013\u2014\u2212]/g, "-"); // Normaliza traços
    s = s.replace(/\s+/g, ""); // Remove espaços
    s = s.replace(/²/g, "^2"); // Converte x² para x^2
    s = s.replace(/³/g, "^3"); // Converte x³ para x^3
    return s;
}

function formatarCoeficiente(valor) {
    // Arredonda o valor para 4 casas decimais para evitar erros de ponto flutuante
    const precisao = Math.round(valor * 10000) / 10000;

    // Verifica se o valor é um número inteiro (com pequena tolerância)
    if (Math.abs(precisao - Math.round(precisao)) < 1e-4) {
        return Math.round(precisao);
    }
    // Se não for inteiro, retorna com 4 casas decimais
    return precisao.toFixed(4);
}

// ===============================
// EXTRAÇÃO DE COEFICIENTES
// ===============================

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
    return { a, b };
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
    return { A: a, B: b, C: c }; // Retorna A, B, C maiúsculos
}

// Para o caso 4
function extrairCoeficientesCubico(expr) {
    expr = expr.replace(/-/g, "+-");
    let partes = expr.split("+").filter(p => p.trim() !== "");
    let a = 0, b = 0, c = 0, d = 0;
    
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
        } else {
            d += parseFloat(p);
        }
    }
    return { a, b, c, d };
}

// ===============================
// FUNÇÕES DE CÁLCULO (LÓGICA)
// ===============================

// CASO 1: (x-r1)(x-r2)
function decomporIntegrarLinearDistinto(r1, r2, a_num, b_num) {
    // Sistema: A + B = a_num
    // -A*r2 - B*r1 = b_num
    let A = (a_num * r1 + b_num) / (r1 - r2);
    let B = a_num - A;

    A = formatarCoeficiente(A);
    B = formatarCoeficiente(B);

    let decomp = `${A}/(x - ${r1}) + ${B}/(x - ${r2})`;
    let integral = `${A}*ln|x - ${r1}| + ${B}*ln|x - ${r2}| + C`;
    
    return {
        caso: `CASO 1: Fatores Lineares Distintos (r1=${r1}, r2=${r2})`,
        decomposicao: decomp,
        integral: integral
    };
}

// CASO 2: ax^2+bx+c (Irredutível)
function integrarQuadraticoSimples(A, B, C, a_num, b_num) {
    
    // Lógica para o caso genérico ax²+bx+c
    // A integral é ∫ (a_num*x + b_num) / (A*x² + B*x + C) dx
    // O denominador tem derivada: (2Ax + B)
    //
    // Reescrevemos o numerador como: K * (derivada) + M
    // a_num*x + b_num = K * (2Ax + B) + M
    // a_num*x + b_num = (2AK)x + (BK + M)
    //
    // Comparando coeficientes:
    // 1) a_num = 2AK  =>  K = a_num / (2*A)
    // 2) b_num = BK + M => M = b_num - B*K
    
    const K = a_num / (2 * A);
    const M = b_num - B * K;

    // A integral é dividida em duas:
    // 1. ∫ K * (2Ax+B) / (Ax²+Bx+C) dx  = K * ln|Ax²+Bx+C|
    // 2. ∫ M / (Ax²+Bx+C) dx           = (M/A) * ∫ 1 / (x² + (B/A)x + (C/A)) dx

    // Parte 1: O Logaritmo (ln)
    const p1_K = formatarCoeficiente(K);
    const int1 = `${p1_K} * ln|${A}x² + ${B}x + ${C}|`;

    // Parte 2: O Arco-Tangente (arctan) ---
    // Completando o quadrado do denominador: x² + (B/A)x + (C/A)
    // (x + B/2A)² + (C/A) - (B/2A)²
    // (x + B/2A)² + (4AC - B²) / (4A²)
    
    // (4AC - B²) é o oposto do delta (que é negativo), então (4AC - B²) é POSITIVO.
    const neg_delta = 4*A*C - B**2;
    
    // (x + P)² + Q²
    // P = B / (2A)
    // Q = sqrt(neg_delta) / (2A)
    const P = B / (2 * A);
    const Q = Math.sqrt(neg_delta) / (2 * A);
    
    // A integral é (M/A) * ∫ 1 / ( (x+P)² + Q² ) dx
    // A fórmula é (M/A) * (1/Q) * arctan((x+P) / Q)
    
    const K_arctan = (M / A) * (1 / Q);
    
    const p2_K = formatarCoeficiente(K_arctan);
    const p2_P = formatarCoeficiente(P);
    const p2_Q = formatarCoeficiente(Q);
    
    // Formata o (x+P) pra ficar (ex: x+0.5 ou x-1)
    const x_mais_P = (p2_P > 0) ? `(x + ${p2_P})` : (p2_P < 0) ? `(x - ${Math.abs(p2_P)})` : 'x';

    const int2 = `${p2_K} * arctan(${x_mais_P} / ${p2_Q})`;

    const decompStr = `(${formatarCoeficiente(a_num)}x + ${formatarCoeficiente(b_num)}) / (${A}x² + ${B}x + ${C})`;
    
    // Se K ou M forem zero, simplifica a saída
    let integralFinal = "";
    if (p1_K != 0) integralFinal += int1;
    if (p2_K != 0) {
        if (integralFinal.length > 0) integralFinal += " + ";
        integralFinal += int2;
    }
    
    return {
        caso: `CASO 2: Quadrático Irredutível (Δ = ${formatarCoeficiente(B**2 - 4*A*C)})`,
        decomposicao: decompStr, // Caso 2 não tem decomposição, a fração é ela mesma
        integral: `${integralFinal} + C`
    };
}


// CASO 3: (x^2+a)(x^2+b)
function decomporIntegrarQuadraticoDistinto(a, b, a_num, b_num) {

    // Decompõe (a_num*x + b_num) / ((x^2+a)(x^2+b)) em (Ax+B)/(x^2+a) + (Cx+D)/(x^2+b)
    // Para o TP, o numerador é (Ax+B), então a_num=A, b_num=B.
    // Simplificação do TP: (Ax+B) / ((x^2+a)(x^2+b))
    // Vamos assumir que A=a_num e B=b_num (do numerador original)
    // (Ax+B)/(x^2+a) + (Cx+D)/(x^2+b) -> (a_num*x + b_num)
    
    // Sistema complexo. O foco é o formato (Ax+B)
    // (A1*x + B1)/(x^2+a) + (A2*x + B2)/(x^2+b)
    // Assumindo B1=0, B2=0: (A1*x)/(x^2+a) + (A2*x)/(x^2+b) = x(A1(x^2+b) + A2(x^2+a)) / ...
    // Assumindo A1=0, A2=0: B1/(x^2+a) + B2/(x^2+b) = (B1(x^2+b) + B2(x^2+a)) / ...

    // Foco no caso simples: (Ax+B) / ((x^2+x1)(x^2+x2))
    // A decomposição é (A1x + B1)/(x^2+x1) + (A2x + B2)/(x^2+x2)
    // (A1x+B1)(x^2+x2) + (A2x+B2)(x^2+x1) = Ax+B
    // A1x^3 + A1x*x2 + B1x^2 + B1*x2 + A2x^3 + A2x*x1 + B2x^2 + B2*x1 = Ax+B
    // x^3(A1+A2) + x^2(B1+B2) + x(A1*x2 + A2*x1) + (B1*x2 + B2*x1) = 0x^3 + 0x^2 + Ax + B
    //
    // A1 + A2 = 0  => A2 = -A1
    // B1 + B2 = 0  => B2 = -B1
    // A1*x2 + A2*x1 = A => A1*x2 - A1*x1 = A => A1 = A / (x2 - x1)
    // B1*x2 + B2*x1 = B => B1*x2 - B1*x1 = B => B1 = B / (x2 - x1)
    
    let A1 = a_num / (b - a); // b é x2, a é x1
    let B1 = b_num / (b - a);
    let A2 = -A1;
    let B2 = -B1;

    A1 = formatarCoeficiente(A1);
    B1 = formatarCoeficiente(B1);
    A2 = formatarCoeficiente(A2);
    B2 = formatarCoeficiente(B2);

    let decomp = `(${A1}x + ${B1})/(x² + ${a}) + (${A2}x + ${B2})/(x² + ${b})`;
    
    // Integrando cada termo (usando a lógica do Caso 2)
    let int1 = integrarQuadraticoSimples(1, 0, a, A1, B1).integral.replace(" + C", "");
    let int2 = integrarQuadraticoSimples(1, 0, b, A2, B2).integral.replace(" + C", "");
    
    let integral = `${int1} + ${int2} + C`;

    return {
        caso: `CASO 3: Fatores Quadráticos Distintos (x²+${a})(x²+${b})`,
        decomposicao: decomp,
        integral: integral
    };
}


// CASO 4: (x^2+a)^2
function decomporIntegrarQuadraticoRepetidoGrau3(A, B, C, D, a) {

    // (Ax^3 + Bx^2 + Cx + D) / (x^2 + a)^2
    // Decompõe em: (A1x + B1)/(x^2 + a) + (A2x + B2)/(x^2 + a)^2
    //
    // (A1x + B1)(x^2 + a) + (A2x + B2) = Ax^3 + Bx^2 + Cx + D
    // (A1x^3 + A1ax + B1x^2 + B1a) + (A2x + B2) = Ax^3 + Bx^2 + Cx + D
    // A1*x^3 + B1*x^2 + (A1a + A2)x + (B1a + B2) = Ax^3 + Bx^2 + Cx + D
    //
    // Comparando coeficientes:
    // A1 = A
    // B1 = B
    // A1a + A2 = C  => A2 = C - A1*a = C - A*a
    // B1a + B2 = D  => B2 = D - B1*a = D - B*a
    
    let A1 = A;
    let B1 = B;
    let A2 = C - A * a;
    let B2 = D - B * a;

    A1 = formatarCoeficiente(A1);
    B1 = formatarCoeficiente(B1);
    A2 = formatarCoeficiente(A2);
    B2 = formatarCoeficiente(B2);

    let decomp = `(${A1}x + ${B1})/(x² + ${a}) + (${A2}x + ${B2})/(x² + ${a})²`;

    // Integrar os termos:
    // 1. ∫ (A1x + B1)/(x^2 + a) dx -> (Mesmo do Caso 2)
    let int1_obj = integrarQuadraticoSimples(1, 0, a, A1, B1);
    let int1 = int1_obj.integral.replace(" + C", "");

    // 2. ∫ (A2x + B2)/(x^2 + a)^2 dx
    //    = ∫ A2x / (x^2 + a)^2 dx + ∫ B2 / (x^2 + a)^2 dx
    
    // 2a. ∫ A2x / (x^2 + a)^2 dx (Subst. u = x^2+a, du = 2x dx)
    //    = (A2/2) ∫ 1/u^2 du = (A2/2) * (-1/u) = -A2 / (2(x^2 + a))
    let int2_a = `(${formatarCoeficiente(-A2 / 2)}) / (x² + ${a})`;

    // 2b. ∫ B2 / (x^2 + a)^2 dx (Subst. trigonométrica x = sqrt(a)*tan(θ))
    //    = (B2 / (2a)) * ( (x / (x^2+a)) + (1/sqrt(a))*arctan(x/sqrt(a)) )
    const sqrt_a = Math.sqrt(a);
    let int2_b_p1 = `(${formatarCoeficiente(B2 / (2 * a))}) * (x / (x² + ${a}))`;
    let int2_b_p2 = `(${formatarCoeficiente(B2 / (2 * a * sqrt_a))}) * arctan(x/${sqrt_a})`;
    
    let int2 = `${int2_a} + ${int2_b_p1} + ${int2_b_p2}`;

    let integral = `${int1} + ${int2} + C`;

    return {
        caso: `CASO 4: Fator Quadrático Repetido (x²+${a})²`,
        decomposicao: decomp,
        integral: integral
    };
}


// ==========================================================
// FUNÇÃO PRINCIPAL DE LÓGICA
// ==========================================================

function calcularIntegral(numStr, denStr) {
    numStr = normalizarExpr(numStr);
    denStr = normalizarExpr(denStr);

    if (!numStr || !denStr) {
        return { erro: "Numerador ou denominador inválido." };
    }

    // Extração de coeficientes (mantém-se igual)
    let { a: a_num, b: b_num } = extrairCoeficientesLinear(numStr);
    let { a: a_cub, b: b_cub, c: c_cub, d: d_cub } = extrairCoeficientesCubico(numStr);

    // Tenta detectar fatores fora dos parênteses
    if (!denStr.startsWith("(") || !denStr.endsWith(")")) {
        if (denStr.includes("x^2")) {
            denStr = `(${denStr})`;
        }
    }

    let resultado = {};

    // CASO 1 ou CASO 3 (Fatores distintos)
    if (denStr.includes(")(")) {
        
        let fatores = denStr.split(")(");
        
        // Verifica se há mais de 2 fatores (ex: (x-1)(x-2)(x-3))
        if (fatores.length > 2) {
            resultado = { erro: `Caso não-suportado. O denominador tem ${fatores.length} fatores, mas apenas 2 (distintos) são permitidos.` };
        
        } else {
            let fator1 = fatores[0] + ")";
            let fator2 = "(" + fatores[1];

            // Define os tipos de fator de forma mais estrita
            let f1_isQuad = fator1.startsWith("(x^2");
            let f1_isLin = fator1.startsWith("(x") && !f1_isQuad; // É (x...) mas NÃO (x^2...)

            let f2_isQuad = fator2.startsWith("(x^2");
            let f2_isLin = fator2.startsWith("(x") && !f2_isQuad; // É (x...) mas NÃO (x^2...)

            // CASO 3: Ambos quadráticos (ex: (x^2+1)(x^2+4))
            if (f1_isQuad && f2_isQuad) {
                let { C: c1 } = extrairCoeficientesQuadratico(fator1.slice(1, -1));
                let { C: c2 } = extrairCoeficientesQuadratico(fator2.slice(1, -1));
                resultado = decomporIntegrarQuadraticoDistinto(c1, c2, a_num, b_num);

            // CASO 1: Ambos lineares (ex: (x-1)(x-2))
            } else if (f1_isLin && f2_isLin) {
                let { a: a1, b: b1 } = extrairCoeficientesLinear(fator1.slice(1, -1));
                let { a: a2, b: b2 } = extrairCoeficientesLinear(fator2.slice(1, -1));
                let r1 = -b1 / a1;
                let r2 = -b2 / a2;
                resultado = decomporIntegrarLinearDistinto(r1, r2, a_num, b_num);
            
            // Fatores mistos (linear + quadrático)
            } else {
                resultado = { erro: "Erro: Mistura de tipos de fatores (linear e quadrático) não suportada." };
            }
        }

    // CASO 4: Quadrático repetido (ex: (x^2+4)^2)
    } else if (/\(x\^2\+\s*\d+\)\s*(\^2|²)/.test(denStr)) {
        const match = denStr.match(/x\^2\+\s*(\d+)/);
        if (match) {
            const a_val = parseFloat(match[1]);
            resultado = decomporIntegrarQuadraticoRepetidoGrau3(a_cub, b_cub, c_cub, d_cub, a_val);
        } else {
            resultado = { erro: "CASO 4: Não foi possível extrair 'a' de (x^2+a)^2." };
        }
        
    // CASO 2: Quadrático irredutível simples (ex: x^2+2x+2)
    } else if (/^\(.*\)$/.test(denStr) && denStr.includes("x^2")) {
        const { A, B, C } = extrairCoeficientesQuadratico(denStr.slice(1, -1));
        const delta = B ** 2 - 4 * A * C;

        if (delta < 0) {
            resultado = integrarQuadraticoSimples(A, B, C, a_num, b_num);
        } else {
            resultado = { erro: "CASO 2: O quadrático não é irredutível (pode ser fatorado em raízes reais)." };
        }

    // Caso não reconhecido
    } else {
        resultado = { erro: "Caso não-suportado. O denominador não corresponde a (x-r1)(x-r2), (x^2+...irredutível), (x^2+a)(x^2+b) ou (x^2+a)^2." };
    }
    
    return resultado;
}


// ==========================================================
// FUNÇÃO DE PRINCIPAL DE INTEGRAÇÃO
// ==========================================================

function calcular() {
    const numStr = document.getElementById('numerador').value;
    const denStr = document.getElementById('denominador').value;

    // Seletores para 5 cards
    const resultsSection = document.getElementById('results-section');
    const resultSuccess = document.getElementById('result-success');
    const resultError = document.getElementById('result-error');
    const errorMessageEl = document.getElementById('result-error-message');

    // Os 5 cards de resultado
    const resOriginal = document.getElementById('res-original');
    const resAnalysis = document.getElementById('res-analysis');
    const resDecomposition = document.getElementById('res-decomposition');
    const resTermByTerm = document.getElementById('res-term-by-term');
    const resFinal = document.getElementById('res-final');

    // Validação
    if (!numStr || !denStr) {
        resultsSection.classList.remove('hidden');
        resultSuccess.classList.add('hidden');
        resultError.classList.remove('hidden');
        errorMessageEl.textContent = 'Por favor, preencha ambos os campos.';
        return;
    }

    // Chamar a lógica principal
    const resultado = calcularIntegral(numStr, denStr);

    // Mostrar a seção de resultados
    resultsSection.classList.remove('hidden');

    // Preencher os cards
    if (resultado.erro) {
        // Estado de ERRO
        resultSuccess.classList.add('hidden');
        resultError.classList.remove('hidden');
        errorMessageEl.textContent = resultado.erro;
    } else {
        // Estado de SUCESSO
        resultSuccess.classList.remove('hidden');
        resultError.classList.add('hidden');
        
        // Integral original
        resOriginal.textContent = `∫ (${numStr}) / (${denStr}) dx`;
        
        // Análise do denominador
        resAnalysis.textContent = resultado.caso || "(Análise não fornecida)";
        
        // Decomposição
        resDecomposition.textContent = resultado.decomposicao || "(Decomposição não fornecida)";
        
        // Integração termo-a-termo (criado a partir da decomposição)
        let termos = (resultado.decomposicao || "").split(' + ');
        let termos_integrais = termos.map(t => {
            if (t.trim() === "") return "";
            return `∫ (${t}) dx`
        }).join(' + ');
        resTermByTerm.textContent = termos_integrais;
        
        // Resultado final
        resFinal.textContent = resultado.integral || "(Integral não fornecida)";
    }
}

// ==========================================================
// FUNÇÃO PARA LIMPAR OS CAMPOS
// ==========================================================

function limpar() {
    // Limpa os campos de input
    document.getElementById('numerador').value = '';
    document.getElementById('denominador').value = '';

    // Esconde a seção de resultados inteira
    document.getElementById('results-section').classList.add('hidden');

    // Esconde os cards de sucesso e erro individualmente
    document.getElementById('result-success').classList.add('hidden');
    document.getElementById('result-error').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Conecta o botão "Calcular" à função calcular()
    const calcBtn = document.getElementById('calculate-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', calcular);
    }

    // Conecta o novo botão "Limpar" à função limpar()
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', limpar);
    }
});

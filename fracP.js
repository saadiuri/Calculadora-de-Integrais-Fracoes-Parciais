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

// ===== CASOS =====

function decomporLinearDistinto(a, b, r1, r2) {
    const A = (b - a * r1) / (r2 - r1);
    const B = a - A;
    return [A, B];
}

function integrarLinearDistinto(A, B, r1, r2) {
    return `∫f(x)dx = ${A.toFixed(4)}·ln|x - ${r1}| + ${B.toFixed(4)}·ln|x - ${r2}| + C`;
}

function integrarQuadraticoSimples(a, b, c, A, B) {
    const p = b / (2 * a);
    const q = c / a - p ** 2;
    return `Completação do quadrado: (x + ${p.toFixed(4)})² + ${q.toFixed(4)}\nIntegral ≈ (${(A / 2).toFixed(4)})·ln(x² + ${b}x + ${c}) + (${(B / Math.sqrt(q)).toFixed(4)})·atan((x + ${p})/${Math.sqrt(q).toFixed(4)}) + C`;
}

function integrarQuadraticosDistintos(A, B, x1, x2) {
    const C = (A * x2) / (x2 - x1);
    const D = (-A * x1) / (x2 - x1);
    return `∫f(x)dx = (${(C / 2).toFixed(4)})·ln(x²+${x1}) + (${(D / 2).toFixed(4)})·ln(x²+${x2}) + C`;
}

function integrarQuadraticoRepetido(A, B, a) {
    return `∫f(x)dx = (${(A / 2).toFixed(4)})·ln(x²+${a}) - (${(A * a - B).toFixed(4)})/(x²+${a}) + C`;
}

// ===== Função principal =====
function calcular() {
    const num = document.getElementById("numerador").value.replace(/ /g, "");
    const den = document.getElementById("denominador").value.replace(/\s+/g, "");
    const [a, b] = extrairCoeficientesLinear(num);
    let resultado = "";

    // captura tudo entre parênteses: retorna array com os blocos "(...)" se houver
    const grupos = den.match(/\(.*?\)/g);

    // ===== CASO: dois fatores entre parênteses =====
    if (grupos && grupos.length === 2) {
        // remove parênteses e espaços
        const g1 = grupos[0].replace(/[()]/g, "");
        const g2 = grupos[1].replace(/[()]/g, "");

        const g1TemX2 = /x\^2/.test(g1);
        const g2TemX2 = /x\^2/.test(g2);
        const g1TemX = /\bx\b/.test(g1);
        const g2TemX = /\bx\b/.test(g2);

        // --- Caso: ambos quadráticos (ex: (2x^2+2x)(x^2+2x) ou (x^2+1)(x^2+4)) ---
        if (g1TemX2 || g2TemX2) {
            // parseia coeficientes dos dois quadráticos
            const [A1, B1, C1] = extrairCoeficientesQuadratico(g1);
            const [A2, B2, C2] = extrairCoeficientesQuadratico(g2);

            // verifica se são realmente quadráticos
            if (A1 === 0 || A2 === 0) {
                resultado = "⚠️ Um dos fatores não parece ser um quadrático (coeficiente x^2 = 0).";
            } else {
                // podemos obter um "deslocamento" x1 = B1/(2*A1) se quisermos usar aquela heurística,
                // mas a decomposição pode variar — aqui usamos B/(2A) como aproximação do termo x1
                const x1 = B1 / (2 * A1);
                const x2 = B2 / (2 * A2);

                resultado = integrarQuadraticosDistintos(a, b, x1, x2);
            }

            // --- Caso: ambos lineares simples (ex: (x-1)(x-2) ou (x+3)(x-4)) ---
        } else if (g1TemX && g2TemX && !g1TemX2 && !g2TemX2) {
            // tenta extrair as constantes r1 e r2 (procura +n ou -n)
            const rx = (s) => {
                // aceita formas como x-1, x+2, 2x-1 (se houver coeficiente, tentamos ignorar)
                // primeiro tenta encontrar padrão x±num
                let m = s.match(/x\s*([-+])\s*(\d+(\.\d+)?)/);
                if (m) {
                    const sinal = m[1];
                    const val = parseFloat(m[2]);
                    return sinal === "-" ? val : -val * -1 /* placeholder */; // we'll compute properly below
                }
                // segundo caso: pode ser forma (x-1) sem espaços - já tratado
                m = s.match(/[-+]\d+(\.\d+)?$/);
                if (m) return parseFloat(m[0]);
                return NaN;
            };

            // mais robusto: extrair a constante via regex que captura +n ou -n imediatamente após 'x'
            const extrairR = (s) => {
                // x-2 ou x+3 ou x - 2 ou x + 2
                const m = s.match(/x\s*([\+\-])\s*(\d+(\.\d+)?)/);
                if (m) {
                    const sinal = m[1];
                    const val = parseFloat(m[2]);
                    // se era x - val => raiz = val ; se x + val => raiz = -val
                    return sinal === "-" ? val : -val;
                }
                // também aceita formas -2+x (menos comum)
                const m2 = s.match(/([-+]?\d+(\.\d+)?)/g);
                // se não conseguir, tenta extrair número inteiro do final
                return NaN;
            };

            // mais simples: procurar formato x-<num> ou x+<num>
            const extrairR2 = (s) => {
                const m = s.match(/x\s*([+-])\s*(\d+(\.\d+)?)/);
                if (m) {
                    const sign = m[1];
                    const val = parseFloat(m[2]);
                    return sign === "-" ? val : -val;
                }
                // se não achou, tenta padrão (x-1) com possível coeficiente à frente (ex: 2x-1)
                const m2 = s.match(/([+-]?\d*\.?\d*)x\s*([+-])\s*(\d+(\.\d+)?)/);
                if (m2) {
                    const sign = m2[2];
                    const val = parseFloat(m2[3]);
                    return sign === "-" ? val : -val;
                }
                return NaN;
            };

            const r1 = extrairR2(g1);
            const r2 = extrairR2(g2);

            if (isNaN(r1) || isNaN(r2)) {
                resultado = "⚠️ Não consegui extrair as constantes dos fatores lineares. Use formato (x-1)(x-2).";
            } else {
                const [A_fp, B_fp] = decomporLinearDistinto(a, b, r1, r2);
                resultado = `f(x) = ${A_fp.toFixed(4)}/(x - ${r1}) + ${B_fp.toFixed(4)}/(x - ${r2})\n\n${integrarLinearDistinto(A_fp, B_fp, r1, r2)}`;
            }

        } else {
            resultado = "⚠️ Dois fatores entre parênteses foram detectados, mas não identifiquei o tipo (linear/quad). Use (x-1)(x-2) ou (2x^2+2x)(x^2+2x).";
        }

        // ===== CASO: polinômio quadrático simples (ex: x^2+2x+1) sem parênteses ----
    } else if (/\bx\^2\b/.test(den) && !/\(.*\)/.test(den)) {
        const [A, B, C] = extrairCoeficientesQuadratico(den);
        resultado = integrarQuadraticoSimples(A, B, C, a, b);

        // ===== CASO: quadrático repetido — detecta padrão (x^2 + a)² escrito com '²' (se você usar esse formato) =====
    } else if (den.includes("(x^2+") && den.includes("²")) {
        const a_val = parseFloat(den.split("+")[1].split(")")[0]);
        resultado = integrarQuadraticoRepetido(a, b, a_val);

    } else {
        resultado = "❌ Formato de denominador não reconhecido. Exemplos válidos:\n(x-1)(x-2)\n(x^2+1)(x^2+4)\n(2x^2+2x)(x^2+2x)\nOu um quadrático simples: x^2+2x+1";
    }

    document.getElementById("resultado").textContent = resultado;
}


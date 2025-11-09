// ======== EXTRAÇÃO DE COEFICIENTES ========

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

// ======== CASOS DE DECOMPOSIÇÃO ========

function decomporLinearDistinto(a, b, r1, r2) {
    const A = (b - a * r1) / (r2 - r1);
    const B = a - A;
    return [A, B];
}

// ======== INTEGRAIS ========

function integrarLinearDistinto(A, B, r1, r2) {
    return `∫f(x)dx = ${A.toFixed(4)}·ln|x - ${r1}| + ${B.toFixed(4)}·ln|x - ${r2}| + C`;
}

function integrarQuadraticoSimples(a, b, c, A, B) {
    const p = b / (2 * a);
    const q = c / a - p ** 2;
    return `Completação do quadrado: (x + ${p.toFixed(4)})² + ${q.toFixed(4)}\nIntegral ≈ (${(A / 2).toFixed(4)})·ln(x² + ${b}x + ${c}) + (${(B / Math.sqrt(Math.abs(q))).toFixed(4)})·atan((x + ${p})/${Math.sqrt(Math.abs(q)).toFixed(4)}) + C`;
}

function integrarQuadraticosDistintos(A, B, a1, a2) {
    const C = (A * a2) / (a2 - a1);
    const D = (-A * a1) / (a2 - a1);
    return `∫f(x)dx = (${(C / 2).toFixed(4)})·ln(x²+${a1}) + (${(D / 2).toFixed(4)})·ln(x²+${a2}) + C`;
}

function integrarQuadraticoRepetido(A, B, a) {
    return `∫f(x)dx = (${(A / 2).toFixed(4)})·ln(x²+${a}) - (${(A * a - B).toFixed(4)})/(x²+${a}) + C`;
}

// ======== FUNÇÃO PRINCIPAL ========

function calcular() {
    const num = document.getElementById("numerador").value.replace(/ /g, "");
    const den = document.getElementById("denominador").value.replace(/\s+/g, "");
    const [a, b] = extrairCoeficientesLinear(num);
    let resultado = "";

    const grupos = den.match(/\(.*?\)/g);

    // ===== CASO: dois fatores entre parênteses =====
    if (grupos && grupos.length === 2) {
        const g1 = grupos[0].replace(/[()]/g, "");
        const g2 = grupos[1].replace(/[()]/g, "");

        const g1TemX2 = /x\^2/.test(g1);
        const g2TemX2 = /x\^2/.test(g2);
        const g1TemX = /\bx\b/.test(g1);
        const g2TemX = /\bx\b/.test(g2);

        // === CASO: ambos quadráticos (ex: (x^2+1)(x^2+4)) ===
        if (g1TemX2 || g2TemX2) {
            const [A1, B1, C1] = extrairCoeficientesQuadratico(g1);
            const [A2, B2, C2] = extrairCoeficientesQuadratico(g2);

            if (A1 === 0 || A2 === 0) {
                resultado = "⚠️ Um dos fatores não parece ser um quadrático (coeficiente x^2 = 0).";
            } else {
                // completa o quadrado corretamente
                const p1 = B1 / (2 * A1);
                const q1 = C1 / A1 - p1 ** 2;

                const p2 = B2 / (2 * A2);
                const q2 = C2 / A2 - p2 ** 2;

                resultado = integrarQuadraticosDistintos(a, b, q1, q2);
            }

            // === CASO: ambos lineares (ex: (x-1)(x-2)) ===
        } else if (g1TemX && g2TemX && !g1TemX2 && !g2TemX2) {
            const extrairR = (s) => {
                const m = s.match(/x\s*([+-])\s*(\d+(\.\d+)?)/);
                if (m) {
                    const sign = m[1];
                    const val = parseFloat(m[2]);
                    return sign === "-" ? val : -val;
                }
                return NaN;
            };

            const r1 = extrairR(g1);
            const r2 = extrairR(g2);

            if (isNaN(r1) || isNaN(r2)) {
                resultado = "⚠️ Não consegui extrair as constantes dos fatores lineares. Use formato (x-1)(x-2).";
            } else {
                const [A_fp, B_fp] = decomporLinearDistinto(a, b, r1, r2);
                resultado = `f(x) = ${A_fp.toFixed(4)}/(x - ${r1}) + ${B_fp.toFixed(4)}/(x - ${r2})\n\n${integrarLinearDistinto(A_fp, B_fp, r1, r2)}`;
            }

        } else {
            resultado = "⚠️ Dois fatores entre parênteses foram detectados, mas não identifiquei o tipo (linear/quad). Use (x-1)(x-2) ou (x^2+1)(x^2+4).";
        }

        // ===== CASO: quadrático simples (sem parênteses) =====
    } else if (/\bx\^2\b/.test(den) && !/\(.*\)/.test(den)) {
        const [A, B, C] = extrairCoeficientesQuadratico(den);
        resultado = integrarQuadraticoSimples(A, B, C, a, b);

        // ===== CASO: quadrático repetido (ex: (x^2+4)²) =====
    } else if (den.includes("(x^2+") && den.includes("²")) {
        const a_val = parseFloat(den.split("+")[1].split(")")[0]);
        resultado = integrarQuadraticoRepetido(a, b, a_val);

    } else {
        resultado = "❌ Formato de denominador não reconhecido. Exemplos válidos:\n(x-1)(x-2)\n(x^2+1)(x^2+4)\n(x^2+4)²\nOu um quadrático simples: x^2+2x+1";
    }

    document.getElementById("resultado").textContent = resultado;
}

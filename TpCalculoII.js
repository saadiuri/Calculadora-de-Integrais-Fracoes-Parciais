/*
 * 1. Calcula as raízes (x1, x2) de um polinômio a*x² + b*x + c = 0.
 * Retorna um objeto com as raízes ou uma mensagem de erro.
 */
function FatorarEquacaoSegundoGrau(a, b, c) {
    if (a === 0) {
        return { error: "Não é uma equação do segundo grau (a=0)." };
    }
    const delta = b * b - 4 * a * c;

    if (delta < 0) {
        return { error: "A equação não possui raízes reais (Delta < 0)." };
    }

    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);

    if (delta === 0) {
        return { x1: x1, x2: x2, tipo: 'dupla' };
    }
    return { x1: x1, x2: x2, tipo: 'distinta' };
}

/*
 * 2. Resolve simbolicamente a integral por Frações Parciais (DFP) para raízes distintas.
 * ∫ (Ax + B) / ((x - x1)(x - x2)) dx
 */
function resolverIntegralFracoesParciais(A, B, x1, x2) {
    // Cálculo dos coeficientes C e D
    // C = (A*x1 + B) / (x1 - x2)
    // D = (A*x2 + B) / (x2 - x1)
    const C = (A * x1 + B) / (x1 - x2);
    const D = (A * x2 + B) / (x2 - x1);

    // Função auxiliar para formatar o termo "Coeficiente * ln|x - raiz|"
    function formatarTermo(coef, raiz, isFirstTerm) {
        if (coef === 0) return '';

        let operador = '';
        if (coef > 0) {
            operador = isFirstTerm ? '' : ' + ';
        } else {
            operador = isFirstTerm ? '-' : ' - ';
        }

        let absCoef = Math.abs(coef);
        let coefStr = (absCoef === 1) ? '' : absCoef.toFixed(4);

        // Formata o fator (x - x_i)
        let fatorX = (raiz === 0) ? 'x' : (raiz > 0) ? `x - ${raiz.toFixed(4)}` : `x + ${Math.abs(raiz).toFixed(4)}`;

        return `${operador}${coefStr}ln|${fatorX}|`;
    }

    let termoC = formatarTermo(C, x1, true);
    let termoD = formatarTermo(D, x2, termoC !== '');

    if (!termoC && !termoD) return "0 + K";

    return `${termoC}${termoD} + K`.trim();
}

// INTERFACE DO TERMINAL (Leitura de Dados)

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Sequência de perguntas
rl.question('--- FATORAÇÃO DO DENOMINADOR (ax² + bx + c) ---\nDigite o coeficiente a: ', (aStr) => {
    const a = parseFloat(aStr);

    rl.question('Digite o coeficiente b: ', (bStr) => {
        const b = parseFloat(bStr);

        rl.question('Digite o coeficiente c: ', (cStr) => {
            const c = parseFloat(cStr);

            // 1. Tenta fatorar o denominador
            const fatoracao = FatorarEquacaoSegundoGrau(a, b, c);

            if (fatoracao.error) {
                console.log(`\nERRO: ${fatoracao.error}`);
                rl.close();
                return;
            }
            if (fatoracao.tipo === 'dupla') {
                console.log(`\nERRO: Este programa é para raízes DISTINTAS. Raiz dupla (x1=x2) requer outro método de DFP.`);
                rl.close();
                return;
            }

            const x1 = fatoracao.x1;
            const x2 = fatoracao.x2;

            console.log(`\nDenominador fatorado: ${a}(x - ${x1.toFixed(4)})(x - ${x2.toFixed(4)})`);

            // 2. Pergunta sobre o numerador (Ax + B)
            rl.question('\n--- COEFICIENTES DO NUMERADOR (Ax + B) ---\nDigite o coeficiente A: ', (AStr) => {
                const A = parseFloat(AStr);

                rl.question('Digite o coeficiente B: ', (BStr) => {
                    const B = parseFloat(BStr);

                    // 3. Resolve a integral simbolicamente
                    const resultadoIntegral = resolverIntegralFracoesParciais(A, B, x1, x2);

                    console.log('\n=========================================================');
                    console.log(`INTEGRAL: ∫ (${A}x + ${B}) / (${a}x² + ${b}x + ${c}) dx`);
                    console.log('RESULTADO DA INTEGRAL (FRAÇÕES PARCIAIS):');
                    console.log(resultadoIntegral);
                    console.log('=========================================================');

                    rl.close();
                });
            });
        });
    });
});
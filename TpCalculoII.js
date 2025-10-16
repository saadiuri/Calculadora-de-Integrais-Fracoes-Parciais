function FatorarEquacaoSegundoGrau(a, b, c) {

    // Função auxiliar para construir o fator (x - raiz) corretamente
    function criaFator(raiz) {
        if (raiz >= 0) {
            // Se a raiz for 2, o fator é (x - 2)
            return `(x - ${raiz})`;
        } else {
            // Se a raiz for -3, o fator é (x - (-3)), ou seja, (x + 3)
            // Usamos Math.abs(raiz) para obter o valor positivo da raiz negativa
            return `(x + ${Math.abs(raiz)})`;
        }
    }

    // Verifica se é uma equação do segundo grau
    if (a === 0) {
        return "Não é uma equação do segundo grau.";
    }

    // Calcula o delta
    const delta = b * b - 4 * a * c;

    // Verifica o valor do delta
    if (delta < 0) { // Sem raízes reais
        return "A equação não possui raízes reais.";
    } else if (delta === 0) { // Raiz real dupla
        const raiz = -b / (2 * a);
        const fator = criaFator(raiz);
        // Incluindo o coeficiente 'a' na frente, se for diferente de 1
        const coeficiente = (a === 1) ? '' : a;
        return `A equação possui uma raiz real dupla: ${coeficiente}${fator}²`;
    }
    else { // Duas raízes reais distintas
        const raiz1 = (-b + Math.sqrt(delta)) / (2 * a);
        const raiz2 = (-b - Math.sqrt(delta)) / (2 * a);

        // Formata os fatores corretamente
        const fator1 = criaFator(raiz1);
        const fator2 = criaFator(raiz2);

        // Incluindo o coeficiente 'a' na frente, se for diferente de 1
        const coeficiente = (a === 1) ? '' : a;

        return `A equação pode ser fatorada como: ${coeficiente}${fator1}${fator2}`;
    }
}

// Importa o módulo 'readline' do Node.js
const readline = require('readline');

// Cria uma interface de leitura e escrita
// process.stdin: Onde o programa vai "ler" (entrada padrão - teclado)
// process.stdout: Onde o programa vai "escrever" (saída padrão - terminal)
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Digite o coeficiente a: ', (aStr) => {
    rl.question('Digite o coeficiente b: ', (bStr) => {
        rl.question('Digite o coeficiente c: ', (cStr) => {

            // Converte as strings lidas do teclado para números
            const a = parseFloat(aStr);
            const b = parseFloat(bStr);
            const c = parseFloat(cStr);

            // Chama sua função de fatoração (assumindo que você a definiu)
            // const resultado = fatorarEquacaoSegundoGrau(a, b, c);
            // console.log(resultado.formaFatorada);
            console.log(`\nEquação: ${a}x² + ${b}x + ${c}`);
            console.log('Resultado da fatoração: ' + FatorarEquacaoSegundoGrau(a, b, c)); // Raízes -2 e -3

            rl.close();
        });
    });
});
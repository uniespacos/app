export interface AndarOption {
    value: string;
    label: string;
    numero: number;
}

export function gerarOpcoesAndares(): AndarOption[] {
    const opcoes: AndarOption[] = [];

    // Subsolos (-2 a -1)
    for (let i = -2; i <= -1; i++) {
        const numeroAbsoluto = Math.abs(i);
        opcoes.push({
            value: `subsolo-${numeroAbsoluto}`,
            label: numeroAbsoluto === 1 ? 'Subsolo' : `${numeroAbsoluto}º Subsolo`,
            numero: i,
        });
    }

    // Térreo (0)
    opcoes.push({
        value: 'terreo',
        label: 'Térreo',
        numero: 0,
    });

    // Andares superiores (1 a 10)
    for (let i = 1; i <= 10; i++) {
        opcoes.push({
            value: `andar-${i}`,
            label: `${i}º Andar`,
            numero: i,
        });
    }

    return opcoes;
}

export function getAndarLabelByValue(value: string): string {
    const opcoes = gerarOpcoesAndares();
    return opcoes.find((opcao) => opcao.value === value)?.label || value;
}

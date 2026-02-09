import { Setor } from '@/types';
import { useState } from 'react';

export function useSetores(listSetores: Setor[] = []) {
    const [setores] = useState<Setor[]>(listSetores);

    return {
        setores,
    };
}

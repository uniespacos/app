export const PERMISSION_LABELS: Record<string, string> = {
    // Usuários
    'usuarios.listar': 'Listar usuários',
    'usuarios.visualizar': 'Visualizar usuário',
    'usuarios.criar': 'Criar usuário',
    'usuarios.atualizar': 'Atualizar usuário',
    'usuarios.deletar': 'Deletar usuário',
    'usuarios.gerenciar-permissoes': 'Gerenciar permissões (atribuir role)',
    'usuarios.gerenciar-permissoes-diretas': 'Gerenciar permissões diretas',

    // Espaços
    'espacos.listar': 'Listar espaços',
    'espacos.visualizar': 'Visualizar espaço',
    'espacos.criar': 'Criar espaço',
    'espacos.atualizar': 'Atualizar espaço',
    'espacos.deletar': 'Deletar espaço',
    'espacos.alterar-gestores': 'Alterar gestores do espaço',

    // Reservas
    'reservas.listar': 'Listar reservas',
    'reservas.visualizar': 'Visualizar reserva',
    'reservas.atualizar': 'Atualizar reserva',
    'reservas.deletar': 'Deletar reserva',
    'reservas.avaliar': 'Avaliar reserva (aprovar/recusar)',

    // Chamados
    'chamados.listar': 'Listar chamados',
    'chamados.triar': 'Triar chamado (alterar situação)',

    // Roles
    'roles.listar': 'Listar roles',
    'roles.visualizar': 'Visualizar role',
    'roles.criar': 'Criar role',
    'roles.atualizar': 'Atualizar role',
    'roles.deletar': 'Deletar role',
    'roles.gerenciar-permissoes': 'Gerenciar permissões da role',

    // Instituições
    'instituicoes.listar': 'Listar instituições',
    'instituicoes.visualizar': 'Visualizar instituição',
    'instituicoes.criar': 'Criar instituição',
    'instituicoes.atualizar': 'Atualizar instituição',
    'instituicoes.deletar': 'Deletar instituição',

    // Unidades
    'unidades.listar': 'Listar unidades',
    'unidades.visualizar': 'Visualizar unidade',
    'unidades.criar': 'Criar unidade',
    'unidades.atualizar': 'Atualizar unidade',
    'unidades.deletar': 'Deletar unidade',

    // Módulos
    'modulos.listar': 'Listar módulos',
    'modulos.visualizar': 'Visualizar módulo',
    'modulos.criar': 'Criar módulo',
    'modulos.atualizar': 'Atualizar módulo',
    'modulos.deletar': 'Deletar módulo',

    // Setores
    'setores.listar': 'Listar setores',
    'setores.visualizar': 'Visualizar setor',
    'setores.criar': 'Criar setor',
    'setores.atualizar': 'Atualizar setor',
    'setores.deletar': 'Deletar setor',

    // Andares
    'andares.criar': 'Criar andar',
    'andares.atualizar': 'Atualizar andar',

    // Sistema
    'sistema.telescope': 'Acessar Telescope (debug)',

    // Seções (UI gating)
    'secao.dashboard-institucional': 'Acessar dashboard institucional',
    'secao.dashboard-gestor': 'Acessar dashboard de gestor',
    'secao.gestao-reservas': 'Acessar gestão de reservas',
    'secao.gestao-chamados': 'Acessar fila de chamados',
    'secao.gestao-espacos': 'Acessar gestão de espaços',
    'secao.gestao-usuarios': 'Acessar gestão de usuários',
    'secao.gestao-instituicoes': 'Acessar gestão de instituições',
    'secao.gestao-unidades': 'Acessar gestão de unidades',
    'secao.gestao-modulos': 'Acessar gestão de módulos',
    'secao.gestao-setores': 'Acessar gestão de setores',
    'secao.gestao-roles': 'Acessar gestão de roles',
};

export const GROUP_LABELS: Record<string, string> = {
    usuarios: 'Usuários',
    espacos: 'Espaços',
    reservas: 'Reservas',
    roles: 'Roles',
    instituicoes: 'Instituições',
    unidades: 'Unidades',
    modulos: 'Módulos',
    setores: 'Setores',
    andares: 'Andares',
    sistema: 'Sistema',
    secao: 'Seções (acesso a telas)',
};

export function getPermissionLabel(name: string): string {
    return PERMISSION_LABELS[name] ?? name;
}

export function getGroupLabel(group: string): string {
    return GROUP_LABELS[group] ?? group;
}

/**
 * Registry singleton para canais Echo com reference-counting.
 *
 * Centraliza a obtenção/liberação de canais Echo (público e privado), garantindo que:
 * - Múltiplos consumidores podem assinar o mesmo canal sem duplicação
 * - O canal só é efetivamente "left" quando o último consumidor desmonta
 * - Não há colisão entre Echo.leave() de um consumidor derrubando listeners de outros
 */

export type EchoPublicChannel = ReturnType<Window['Echo']['channel']>;
export type EchoPrivateChannel = ReturnType<Window['Echo']['private']>;

interface ChannelRef<T> {
    channel: T;
    refCount: number;
}

// Maps internos para rastreamento de referência
const publicChannels = new Map<string, ChannelRef<EchoPublicChannel>>();
const privateChannels = new Map<string, ChannelRef<EchoPrivateChannel>>();

/**
 * Adquire uma referência a um canal público Echo.
 * Se já existe, incrementa o refCount e devolve a instância cacheada.
 * Se não existe, cria uma nova e armazena com refCount = 1.
 * Se window.Echo não existir, retorna undefined.
 */
export function acquirePublicChannel(name: string): EchoPublicChannel | undefined {
    if (!window.Echo) {
        return undefined;
    }

    const existing = publicChannels.get(name);
    if (existing) {
        existing.refCount += 1;
        return existing.channel;
    }

    const channel = window.Echo.channel(name);
    publicChannels.set(name, { channel, refCount: 1 });
    return channel;
}

/**
 * Libera uma referência a um canal público Echo.
 * Decrementa o refCount; se chegar a 0, chama window.Echo.leave(name) e remove do registro.
 * Se o canal não existe no registry, é um no-op.
 */
export function releasePublicChannel(name: string): void {
    const existing = publicChannels.get(name);
    if (!existing) {
        return;
    }

    existing.refCount -= 1;
    if (existing.refCount <= 0) {
        window.Echo?.leave(name);
        publicChannels.delete(name);
    }
}

/**
 * Adquire uma referência a um canal privado Echo.
 * Se já existe, incrementa o refCount e devolve a instância cacheada.
 * Se não existe, cria uma nova e armazena com refCount = 1.
 * Se window.Echo não existir, retorna undefined.
 */
export function acquirePrivateChannel(name: string): EchoPrivateChannel | undefined {
    if (!window.Echo) {
        return undefined;
    }

    const existing = privateChannels.get(name);
    if (existing) {
        existing.refCount += 1;
        return existing.channel;
    }

    const channel = window.Echo.private(name);
    privateChannels.set(name, { channel, refCount: 1 });
    return channel;
}

/**
 * Libera uma referência a um canal privado Echo.
 * Decrementa o refCount; se chegar a 0, chama window.Echo.leave(name) e remove do registro.
 * Se o canal não existe no registry, é um no-op.
 */
export function releasePrivateChannel(name: string): void {
    const existing = privateChannels.get(name);
    if (!existing) {
        return;
    }

    existing.refCount -= 1;
    if (existing.refCount <= 0) {
        window.Echo?.leave(name);
        privateChannels.delete(name);
    }
}

/**
 * Reseta o estado interno do registry (limpa os dois Maps).
 * APENAS para uso em testes — isola estado entre testes.
 */
export function __resetEchoChannelRegistryForTests(): void {
    publicChannels.clear();
    privateChannels.clear();
}

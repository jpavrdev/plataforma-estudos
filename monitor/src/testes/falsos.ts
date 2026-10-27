import type {
    ArmazenamentoBackup,
    ClienteHttp,
    FonteDeSegredo,
    Navegador,
    Notificador,
    RepositorioEstado,
} from "../dominio/portas.ts";
import type { Alerta, EstadoVerificacao } from "../dominio/tipos.ts";

type OpcoesHttp = Parameters<ClienteHttp["obter"]>[1];
type RespostaHttp = Awaited<ReturnType<ClienteHttp["obter"]>>;
type Renderizacao = Awaited<ReturnType<Navegador["renderizar"]>>;

export class RelogioFalso {
    #instante: number;

    constructor(iso: string) {
        this.#instante = Date.parse(iso);
    }

    agora = (): Date => new Date(this.#instante);

    avancar(ms: number): void {
        this.#instante += ms;
    }
}

export class ClienteHttpFalso implements ClienteHttp {
    readonly chamadas: { url: string; opcoes: OpcoesHttp }[] = [];
    readonly #respostas = new Map<string, () => RespostaHttp>();

    responder(url: string, status: number, corpo: string, latenciaMs = 40): this {
        this.#respostas.set(url, () => ({ status, corpo, latenciaMs }));
        return this;
    }

    falhar(url: string, erro: Error): this {
        this.#respostas.set(url, () => {
            throw erro;
        });
        return this;
    }

    async obter(url: string, opcoes?: OpcoesHttp): Promise<RespostaHttp> {
        this.chamadas.push({ url, opcoes });
        const responder = this.#respostas.get(url);
        if (!responder) throw new Error(`nenhuma resposta configurada para ${url}`);
        return responder();
    }
}

export class SegredoFalso implements FonteDeSegredo {
    leituras = 0;
    readonly #valor: string | Error;

    constructor(valor: string | Error) {
        this.#valor = valor;
    }

    async token(): Promise<string> {
        this.leituras++;
        if (this.#valor instanceof Error) throw this.#valor;
        return this.#valor;
    }
}

export class NavegadorFalso implements Navegador {
    readonly chamadas: { url: string; timeoutMs: number }[] = [];
    resposta: Renderizacao | Error;

    constructor(resposta: Renderizacao | Error) {
        this.resposta = resposta;
    }

    async renderizar(url: string, timeoutMs: number): Promise<Renderizacao> {
        this.chamadas.push({ url, timeoutMs });
        if (this.resposta instanceof Error) throw this.resposta;
        return structuredClone(this.resposta);
    }
}

export class ArmazenamentoFalso implements ArmazenamentoBackup {
    readonly consultas: string[] = [];
    readonly objetos: Map<string, number>;
    erro: Error | undefined;

    constructor(objetos: Record<string, number> = {}) {
        this.objetos = new Map(Object.entries(objetos));
    }

    async tamanhoDe(chave: string): Promise<number | null> {
        this.consultas.push(chave);
        if (this.erro) throw this.erro;
        return this.objetos.get(chave) ?? null;
    }
}

export class RepositorioEmMemoria implements RepositorioEstado {
    readonly estados = new Map<string, EstadoVerificacao>();
    readonly gravacoes: EstadoVerificacao[] = [];
    readonly lidas: string[][] = [];
    readonly falharAoSalvar = new Set<string>();
    falharAoLer = false;

    constructor(iniciais: EstadoVerificacao[] = []) {
        for (const estado of iniciais) this.estados.set(estado.verificacao, estado);
    }

    async ler(verificacoes: string[]): Promise<Map<string, EstadoVerificacao>> {
        if (this.falharAoLer) throw new Error("DynamoDB indisponível");
        this.lidas.push([...verificacoes]);
        const encontrados = new Map<string, EstadoVerificacao>();
        for (const nome of verificacoes) {
            const estado = this.estados.get(nome);
            if (estado) encontrados.set(nome, structuredClone(estado));
        }
        return encontrados;
    }

    async salvar(estado: EstadoVerificacao): Promise<void> {
        if (this.falharAoSalvar.has(estado.verificacao)) throw new Error("DynamoDB indisponível");
        this.gravacoes.push(structuredClone(estado));
        this.estados.set(estado.verificacao, structuredClone(estado));
    }
}

export class NotificadorFalso implements Notificador {
    readonly enviados: Alerta[] = [];
    falhasAntesDeEnviar = 0;

    async enviar(alerta: Alerta): Promise<void> {
        if (this.falhasAntesDeEnviar > 0) {
            this.falhasAntesDeEnviar--;
            throw new Error("SNS indisponível");
        }
        this.enviados.push(alerta);
    }
}

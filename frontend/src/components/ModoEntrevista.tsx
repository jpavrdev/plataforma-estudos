import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Check } from './Icons';
import {
  NIVEIS,
  filaDeEntrevista,
  obterResumo,
  obterTopicos,
  type Nivel,
  type ResumoEntrevista,
  type TopicoEntrevista,
} from '../services/entrevista';
import type { Cartao } from '../services/flashcards';
import { lerPreferencia, gravarPreferencia } from '../utils/preferencia';

// Quantas perguntas por sessão. Ensaio de entrevista é curto de propósito: passar
// de vinte perguntas de uma vez não é ensaio, é maratona.
const OPCOES_QUANTIDADE = [5, 10, 20];

// A combinação escolhida no último ensaio. Vive em chave própria, separada da
// revisão do dia, porque são duas escolhas diferentes e o aluno alterna entre elas.
const ESCOLHA = 'ensina:revisao:entrevista';

interface EscolhaSalva {
  nivel: Nivel;
  topicos: string[];
  quantas: number;
}

const ESCOLHA_PADRAO: EscolhaSalva = { nivel: 'junior', topicos: [], quantas: 10 };

// Cada campo volta conferido: o nível vira classe de CSS e vai para a API, e a
// quantidade precisa ser uma das três opções para o botão certo aparecer marcado.
function lerEscolha(): EscolhaSalva {
  const salvo = lerPreferencia(ESCOLHA, ESCOLHA_PADRAO);
  return {
    nivel: NIVEIS.some((n) => n.valor === salvo.nivel) ? salvo.nivel : ESCOLHA_PADRAO.nivel,
    topicos: Array.isArray(salvo.topicos) ? salvo.topicos.filter((t) => typeof t === 'string') : [],
    quantas: OPCOES_QUANTIDADE.includes(salvo.quantas) ? salvo.quantas : ESCOLHA_PADRAO.quantas,
  };
}

interface Props {
  /** Entrega a fila pronta para a sala abrir a carta. */
  onComecar: (cartoes: Cartao[]) => void;
}

/**
 * O painel do modo entrevista: escolher o nível, os assuntos e o tamanho da sessão.
 *
 * Fica separado da revisão do dia porque são objetivos diferentes. Revisar trilha é
 * fixar o que se estudou; treinar entrevista é ensaiar resposta. O que continua
 * compartilhado é o essencial: mesmo baralho, mesmo agendamento e mesmas
 * estatísticas, porque a carta respondida aqui volta pela fila do dia.
 */
export function ModoEntrevista({ onComecar }: Props) {
  // O painel some da tela ao trocar de modo, então o estado nasce do que ficou
  // guardado: sem isso, ir ver a revisão do dia e voltar já apagava a escolha.
  const { t } = useTranslation();
  const [salvo] = useState(lerEscolha);
  const [nivel, setNivel] = useState<Nivel>(salvo.nivel);
  const [topicos, setTopicos] = useState<TopicoEntrevista[]>([]);
  const [escolhidos, setEscolhidos] = useState<Set<string>>(() => new Set(salvo.topicos));
  const [resumo, setResumo] = useState<ResumoEntrevista | null>(null);
  const [quantas, setQuantas] = useState(salvo.quantas);
  const [carregando, setCarregando] = useState(true);
  // A mensagem mora no catálogo: o estado guarda só a chave.
  const [erro, setErro] = useState<
    '' | 'entrevista.loadError' | 'entrevista.emptyCombo' | 'entrevista.sessionError'
  >('');

  const carregar = useCallback(async (alvo: Nivel) => {
    setCarregando(true);
    setErro('');
    try {
      const [lista, r] = await Promise.all([obterTopicos(alvo), obterResumo(alvo)]);
      setTopicos(lista);
      setResumo(r);
    } catch (err) {
      console.error('Falha ao carregar o modo entrevista.', err);
      setErro('entrevista.loadError');
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar(nivel);
  }, [nivel, carregar]);

  // Guarda a escolha inteira, inclusive assunto que não é do nível aberto agora:
  // quem sobe para pleno e volta para júnior espera reencontrar o que tinha marcado.
  useEffect(() => {
    gravarPreferencia(ESCOLHA, { nivel, topicos: [...escolhidos], quantas });
  }, [nivel, escolhidos, quantas]);

  // Trocar de nível não pode carregar assunto que sumiu da lista, porque um tópico
  // só de sênior deixa de existir ao voltar para estágio. A marcação é derivada em
  // vez de sincronizada por efeito: assim não existe intervalo em que a contagem já
  // mudou e a seleção ainda não.
  const marcados = topicos.filter((t) => escolhidos.has(t.id));

  function alternar(id: string) {
    setEscolhidos((antes) => {
      const nova = new Set(antes);
      if (nova.has(id)) nova.delete(id);
      else nova.add(id);
      return nova;
    });
  }

  const disponiveis = marcados.length
    ? marcados.reduce((s, t) => s + t.total, 0)
    : (resumo?.total ?? 0);

  async function comecar() {
    setErro('');
    try {
      const cartoes = await filaDeEntrevista(
        nivel,
        marcados.map((x) => x.id),
        quantas,
      );
      if (!cartoes.length) {
        setErro('entrevista.emptyCombo');
        return;
      }
      onComecar(cartoes);
    } catch (err) {
      console.error('Falha ao montar a sessão de entrevista.', err);
      setErro('entrevista.sessionError');
    }
  }

  return (
    <div className="rev-sala__aviso ent">
      <h3>{t('entrevista.title')}</h3>
      <p>{t('entrevista.intro')}</p>

      {/* O nível é cumulativo, e o texto diz isso: escolher pleno traz estágio e
          júnior junto, que é como a entrevista real funciona. */}
      <div className="ent-niveis" role="group" aria-label={t('entrevista.levelAria')}>
        {NIVEIS.map((n) => (
          <button
            key={n.valor}
            type="button"
            className={`ent-nivel${nivel === n.valor ? ' ent-nivel--on' : ''}`}
            onClick={() => setNivel(n.valor)}
            aria-pressed={nivel === n.valor}
          >
            <b>{t(n.key)}</b>
            <span>{t(n.descriptionKey)}</span>
          </button>
        ))}
      </div>
      <p className="ent-cumulativo">
        {t('entrevista.cumulative', { level: nivelAtual(nivel, t) })}
      </p>

      {carregando && <p className="ent-vazio">{t('entrevista.loading')}</p>}

      {!carregando && !topicos.length && (
        <p className="ent-vazio">{t('entrevista.noTopics')}</p>
      )}

      {!carregando && topicos.length > 0 && (
        <>
          <div className="ent-topicos">
            {topicos.map((topico) => {
              const marcado = escolhidos.has(topico.id);
              return (
                <button
                  key={topico.id}
                  type="button"
                  className={`ent-topico${marcado ? ' ent-topico--on' : ''}`}
                  onClick={() => alternar(topico.id)}
                  aria-pressed={marcado}
                  disabled={topico.total === 0}
                >
                  <span className="ent-topico__check">{marcado && <Check size={13} />}</span>
                  <span className="ent-topico__nome">{topico.nome}</span>
                  {/* Quantas já foram vistas ao menos uma vez, para dar noção de
                      progresso em vez de só um menu. */}
                  <span className="ent-topico__n">
                    {topico.vistas
                      ? t('revisao.countOf', { seen: topico.vistas, total: topico.total })
                      : topico.total}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="ent-cumulativo">
            {marcados.length
              ? t('entrevista.marked', { count: disponiveis })
              : t('entrevista.unmarked')}
          </p>

          <div className="ent-quantas">
            <span>{t('entrevista.howMany')}</span>
            <div className="ent-quantas__opcoes">
              {OPCOES_QUANTIDADE.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`ent-quant${quantas === n ? ' ent-quant--on' : ''}`}
                  onClick={() => setQuantas(n)}
                  aria-pressed={quantas === n}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {erro && <p className="ent-erro">{t(erro)}</p>}

      <button
        className="btn btn--accent"
        onClick={() => void comecar()}
        disabled={carregando || !topicos.length}
      >
        {t('entrevista.start')}
      </button>
    </div>
  );
}

function nivelAtual(nivel: Nivel, t: TFunction) {
  const n = NIVEIS.find((x) => x.valor === nivel);
  return n ? t(n.key).toLowerCase() : nivel;
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Logo } from '../../components/Logo';
import { Plus, Trash, Check, Minus } from '../../components/Icons';
import { mensagemErro } from '../../utils/erro';
import { useToast } from '../../contexts/ToastContext';
import { obterSimuladoAdmin, sincronizarQuestoes } from '../../services/simulados';

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F'];

interface EdQuestao {
  id?: string;
  statement: string;
  topic: string;
  explanation: string;
  options: { text: string; isCorrect: boolean }[];
  msg?: string;
  msgErro?: boolean;
}

const NOVA: EdQuestao = {
  statement: '',
  topic: '',
  explanation: '',
  options: [
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ],
};

export function SimuladoEditor() {
  const { slug = '' } = useParams();
  const { mostrar } = useToast();
  const [nome, setNome] = useState('');
  const [questoes, setQuestoes] = useState<EdQuestao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [salvandoTudo, setSalvandoTudo] = useState(false);
  const [msgGeral, setMsgGeral] = useState('');

  useEffect(() => {
    obterSimuladoAdmin(slug)
      .then((s) => {
        setNome(s.name);
        setQuestoes(
          s.questions.map((q) => ({
            id: q.id,
            statement: q.statement,
            topic: q.topic ?? '',
            explanation: q.explanation ?? '',
            options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
          })),
        );
      })
      .catch(() => setErro('Não foi possível carregar o simulado.'))
      .finally(() => setCarregando(false));
  }, [slug]);

  const patchQ = (qi: number, patch: Partial<EdQuestao>) =>
    setQuestoes((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  const patchOpts = (qi: number, fn: (opts: EdQuestao['options']) => EdQuestao['options']) =>
    setQuestoes((prev) => prev.map((q, i) => (i === qi ? { ...q, options: fn(q.options) } : q)));

  function addQuestao() {
    setQuestoes((prev) => [...prev, { ...NOVA, options: NOVA.options.map((o) => ({ ...o })) }]);
  }

  function excluirQuestao(qi: number) {
    const q = questoes[qi];
    if (q.id && !window.confirm('Remover esta questão? Ela será excluída ao salvar.')) return;
    setQuestoes((prev) => prev.filter((_, i) => i !== qi));
  }

  async function salvarTudo() {
    if (salvandoTudo) return;
    setMsgGeral('');

    // Valida no cliente e marca cada card; aborta antes de enviar se algo estiver errado.
    let algumInvalido = false;
    const validado = questoes.map((q) => {
      const validas = q.options.filter((o) => o.text.trim());
      let msg = '';
      if (q.statement.trim().length < 3) msg = 'Enunciado muito curto.';
      else if (validas.length < 2) msg = 'Precisa de ao menos 2 alternativas.';
      else if (!validas.some((o) => o.isCorrect)) msg = 'Marque ao menos uma correta.';
      if (msg) algumInvalido = true;
      return { ...q, msg, msgErro: !!msg };
    });
    setQuestoes(validado);
    if (algumInvalido) {
      setMsgGeral('Corrija as questões em vermelho.');
      return;
    }

    setSalvandoTudo(true);
    const payload = validado.map((q) => ({
      id: q.id,
      statement: q.statement.trim(),
      topic: q.topic.trim() || undefined,
      explanation: q.explanation.trim() || undefined,
      options: q.options
        .filter((o) => o.text.trim())
        .map((o) => ({ text: o.text.trim(), isCorrect: o.isCorrect })),
    }));
    try {
      await sincronizarQuestoes(slug, payload);
      // Recarrega com os ids do banco para o próximo "Salvar tudo" atualizar em vez de recriar.
      const s = await obterSimuladoAdmin(slug);
      setQuestoes(
        s.questions.map((q) => ({
          id: q.id,
          statement: q.statement,
          topic: q.topic ?? '',
          explanation: q.explanation ?? '',
          options: q.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })),
        })),
      );
      setSalvandoTudo(false);
      mostrar('Simulado salvo com sucesso.');
    } catch (e: unknown) {
      setSalvandoTudo(false);
      mostrar(mensagemErro(e, 'Não foi possível salvar.'), 'erro');
    }
  }

  return (
    <div className="home">
      <header className="topbar studio__bar">
        <div className="studio__brand">
          <Logo variant="solid" size={19} />
          <span className="studio__badge">Estúdio</span>
        </div>
        <span className="studio__divider" />
        <div className="studio__crumb">
          <Link to="/estudio/simulados">Simulados</Link>
          <span className="studio__crumb-sep">/</span>
          <b>{nome || '...'}</b>
        </div>
        <div className="topbar__spacer" />
        <button
          className="btn btn--accent studio__btn"
          disabled={salvandoTudo || carregando}
          onClick={salvarTudo}
        >
          {salvandoTudo ? 'Salvando...' : 'Salvar tudo'}
        </button>
        <Link className="btn btn--ghost studio__btn" to="/estudio/simulados">
          Voltar
        </Link>
      </header>

      <div className="studio__editor">
        <div className="studio__section">
          <div className="studio__section-title">Questões</div>
          <span className="studio__pill">{questoes.length}</span>
        </div>
        <p className="studio__section-sub">
          Cada tentativa sorteia questões deste banco. Múltipla resposta é permitida: marque quantas
          alternativas forem corretas.
        </p>

        {carregando && <p className="track__desc">Carregando...</p>}
        {erro && <div className="auth__alert">{erro}</div>}

        <div className="studio__questions">
          {questoes.map((q, qi) => (
            <div key={q.id ?? `nova-${qi}`} className="qcard">
              <div className="qcard__head">
                <span className="qcard__num">{qi + 1}</span>
                <span className="qcard__label">Questão {qi + 1}</span>
                <div className="topbar__spacer" />
                <button
                  className="qcard__del"
                  onClick={() => excluirQuestao(qi)}
                  aria-label="Excluir questão"
                >
                  <Trash size={16} />
                </button>
              </div>

              <div className="qcard__field">
                <input
                  className="es-input"
                  value={q.statement}
                  placeholder="Enunciado da questão"
                  onChange={(e) => patchQ(qi, { statement: e.target.value })}
                />
              </div>
              <div className="qcard__field">
                <input
                  className="es-input"
                  value={q.topic}
                  placeholder="Tema (ex.: Segurança e identidade)"
                  onChange={(e) => patchQ(qi, { topic: e.target.value })}
                />
              </div>

              <div className="qcard__options">
                {q.options.map((o, oi) => (
                  <div key={oi} className={`qopt${o.isCorrect ? ' qopt--correct' : ''}`}>
                    <button
                      className="qopt__radio"
                      onClick={() =>
                        patchOpts(qi, (opts) =>
                          opts.map((x, j) => (j === oi ? { ...x, isCorrect: !x.isCorrect } : x)),
                        )
                      }
                      aria-label="Marcar como correta"
                    >
                      {o.isCorrect ? <Check size={12} /> : null}
                    </button>
                    <span className="qopt__letter">{LETRAS[oi] ?? oi + 1}</span>
                    <input
                      className="es-input"
                      value={o.text}
                      placeholder="Texto da alternativa"
                      onChange={(e) =>
                        patchOpts(qi, (opts) =>
                          opts.map((x, j) => (j === oi ? { ...x, text: e.target.value } : x)),
                        )
                      }
                    />
                    {o.isCorrect && <span className="qopt__tag">correta</span>}
                    <button
                      className="qopt__remove"
                      onClick={() => patchOpts(qi, (opts) => opts.filter((_, j) => j !== oi))}
                      aria-label="Remover alternativa"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="studio__add studio__add--ghost"
                onClick={() => patchOpts(qi, (opts) => [...opts, { text: '', isCorrect: false }])}
              >
                <Plus size={14} /> Adicionar alternativa
              </button>

              <textarea
                className="sim-adm__ta"
                value={q.explanation}
                placeholder="Justificativa (aparece na revisão do aluno)"
                onChange={(e) => patchQ(qi, { explanation: e.target.value })}
              />

              {q.msg && (
                <div className="sim-adm__qfoot">
                  <span className={`sim-adm__msg${q.msgErro ? ' sim-adm__msg--erro' : ''}`}>
                    {q.msg}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="studio__add studio__add--dashed studio__add--lg" onClick={addQuestao}>
          <Plus size={14} /> Adicionar questão
        </button>

        <div className="sim-adm__save">
          <button
            className="btn btn--accent"
            disabled={salvandoTudo || carregando}
            onClick={salvarTudo}
          >
            {salvandoTudo ? 'Salvando...' : 'Salvar tudo'}
          </button>
          {msgGeral && <span className="sim-adm__geral">{msgGeral}</span>}
        </div>
      </div>
    </div>
  );
}

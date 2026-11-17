import { useState } from 'react';
import type { MontagemTentativa, OpcoesSimulado } from '../../services/simulados';
import { useTravaFundo } from '../../hooks/useTravaFundo';
import { useTranslation } from 'react-i18next';

export function MontarModal({
  opcoes,
  onIniciar,
  onCancel,
  loading = false,
  praticaInicial = false,
}: {
  opcoes: OpcoesSimulado;
  onIniciar: (montagem: MontagemTentativa) => void;
  onCancel: () => void;
  loading?: boolean;
  praticaInicial?: boolean;
}) {
  // O componente só monta com o modal aberto, então o fundo fica travado
  // enquanto ele existir.
  useTravaFundo(true);
  const { t } = useTranslation();
  const [temas, setTemas] = useState<string[]>([]);
  const [qtd, setQtd] = useState(opcoes.oficial.questionCount);
  const [comTempo, setComTempo] = useState(true);
  const [minutos, setMinutos] = useState(opcoes.oficial.durationMinutes);
  const [pratica, setPratica] = useState(praticaInicial);

  const disponiveis = temas.length
    ? opcoes.temas.filter((t) => temas.includes(t.nome)).reduce((s, t) => s + t.questoes, 0)
    : opcoes.maxQuestoes;
  const teto = Math.max(opcoes.minQuestoes, disponiveis);
  const quantidade = Math.min(Math.max(qtd, opcoes.minQuestoes), teto);

  function alternarTema(nome: string) {
    setTemas((atual) =>
      atual.includes(nome) ? atual.filter((t) => t !== nome) : [...atual, nome],
    );
  }

  return (
    <div
      className="sim-modal"
      role="dialog"
      aria-modal="true"
      onClick={() => !loading && onCancel()}
    >
      <div className="sim-modal__card sim-modal__card--form" onClick={(ev) => ev.stopPropagation()}>
        <h2 className="sim-modal__title">
          {pratica ? t('simulados.builder.titlePractice') : t('simulados.builder.titleCustom')}
        </h2>
        <p className="sim-modal__text">
          {pratica ? t('simulados.builder.textPractice') : t('simulados.builder.textCustom')}
        </p>

        <div className="sim-montar__corpo">
          <label className="sim-montar__modo">
            <input
              type="checkbox"
              checked={pratica}
              onChange={(e) => setPratica(e.target.checked)}
            />
            <span>
              <b>{t('simulados.builder.practiceLabel')}</b>
              <small>{t('simulados.builder.practiceDesc')}</small>
            </span>
          </label>

          <div className="sim-montar__campo">
            <div className="sim-montar__rotulo">
              <label htmlFor="mm-qtd">{t('simulados.builder.quantity')}</label>
              <input
                id="mm-qtd"
                className="sim-montar__num"
                type="number"
                min={opcoes.minQuestoes}
                max={teto}
                value={qtd}
                onChange={(e) => setQtd(Number(e.target.value) || opcoes.minQuestoes)}
                onBlur={() => setQtd(quantidade)}
              />
            </div>
            <input
              className="sim-montar__range"
              type="range"
              min={opcoes.minQuestoes}
              max={teto}
              value={quantidade}
              onChange={(e) => setQtd(Number(e.target.value))}
            />
            <div className="sim-montar__limites">
              <span>{opcoes.minQuestoes}</span>
              <span>{t('simulados.builder.available', { count: teto })}</span>
            </div>
          </div>

          <div className={`sim-montar__campo${pratica ? ' sim-montar__campo--off' : ''}`}>
            <label className="sim-montar__linha">
              <input
                type="checkbox"
                checked={comTempo && !pratica}
                disabled={pratica}
                onChange={(e) => setComTempo(e.target.checked)}
              />
              <span>{t('simulados.builder.withTimer')}</span>
            </label>
            {pratica && <p className="sim-montar__nota">{t('simulados.builder.noTimerNote')}</p>}
            {comTempo && !pratica && (
              <div className="sim-montar__rotulo">
                <label htmlFor="mm-min">{t('simulados.builder.minutes')}</label>
                <input
                  id="mm-min"
                  className="sim-montar__num"
                  type="number"
                  min={1}
                  max={300}
                  value={minutos}
                  onChange={(e) => setMinutos(Number(e.target.value) || 1)}
                  onBlur={() => setMinutos(Math.min(300, Math.max(1, minutos)))}
                />
              </div>
            )}
          </div>

          {opcoes.temas.length > 0 && (
            <div className="sim-montar__campo">
              <div className="sim-montar__rotulo">
                <span>{t('simulados.builder.topics')}</span>
                <span className="sim-montar__valor">
                  {temas.length === 0
                    ? t('simulados.builder.allTopics')
                    : t('simulados.builder.chosenTopics', { count: temas.length })}
                </span>
              </div>
              <div className="sim-montar__temas">
                {opcoes.temas.map((t) => (
                  <button
                    key={t.nome}
                    type="button"
                    className={`sim-tema${temas.includes(t.nome) ? ' sim-tema--on' : ''}`}
                    onClick={() => alternarTema(t.nome)}
                  >
                    {t.nome} <span className="sim-tema__n">{t.questoes}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sim-modal__actions">
          <button
            className="sim-modal__btn sim-modal__btn--ghost"
            onClick={onCancel}
            disabled={loading}
          >
            {t('simulados.builder.cancel')}
          </button>
          <button
            className="sim-modal__btn sim-modal__btn--primary"
            disabled={loading}
            onClick={() =>
              onIniciar({
                questionCount: quantidade,
                comTempo: pratica ? false : comTempo,
                duracaoMinutos:
                  comTempo && !pratica ? Math.min(300, Math.max(1, minutos)) : undefined,
                topicos: temas,
                pratica,
              })
            }
          >
            {loading
              ? t('simulados.builder.wait')
              : pratica
                ? t('simulados.builder.startPractice')
                : t('simulados.builder.startCustom')}
          </button>
        </div>
      </div>
    </div>
  );
}

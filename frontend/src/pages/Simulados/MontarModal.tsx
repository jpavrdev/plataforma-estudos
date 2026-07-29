import { useState } from 'react';
import type { MontagemTentativa, OpcoesSimulado } from '../../services/simulados';

export function MontarModal({
  opcoes,
  onIniciar,
  onCancel,
  loading = false,
}: {
  opcoes: OpcoesSimulado;
  onIniciar: (montagem: MontagemTentativa) => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  const [temas, setTemas] = useState<string[]>([]);
  const [qtd, setQtd] = useState(opcoes.oficial.questionCount);
  const [comTempo, setComTempo] = useState(true);
  const [minutos, setMinutos] = useState(opcoes.oficial.durationMinutes);

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
        <h2 className="sim-modal__title">Monte do seu jeito</h2>
        <p className="sim-modal__text">
          Escolha o tamanho, o tempo e os assuntos. A tentativa fica marcada como treino no seu
          histórico.
        </p>

        <div className="sim-montar__corpo">
          <div className="sim-montar__campo">
            <div className="sim-montar__rotulo">
              <label htmlFor="mm-qtd">Quantidade de questões</label>
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
              <span>{teto} disponíveis</span>
            </div>
          </div>

          <div className="sim-montar__campo">
            <label className="sim-montar__linha">
              <input
                type="checkbox"
                checked={comTempo}
                onChange={(e) => setComTempo(e.target.checked)}
              />
              <span>Com cronômetro</span>
            </label>
            {comTempo && (
              <div className="sim-montar__rotulo">
                <label htmlFor="mm-min">Tempo em minutos</label>
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
                <span>Assuntos</span>
                <span className="sim-montar__valor">
                  {temas.length === 0 ? 'todos' : `${temas.length} escolhidos`}
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
            Cancelar
          </button>
          <button
            className="sim-modal__btn sim-modal__btn--primary"
            disabled={loading}
            onClick={() =>
              onIniciar({
                questionCount: quantidade,
                comTempo,
                duracaoMinutos: comTempo ? Math.min(300, Math.max(1, minutos)) : undefined,
                topicos: temas,
              })
            }
          >
            {loading ? 'Aguarde...' : 'Iniciar treino'}
          </button>
        </div>
      </div>
    </div>
  );
}

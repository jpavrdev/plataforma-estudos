import type { ReactNode } from 'react';
import { Alert } from '../../components/Icons';

export function ConfirmModal({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  loading = false,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div
      className="sim-modal"
      role="dialog"
      aria-modal="true"
      onClick={() => !loading && onCancel()}
    >
      <div className="sim-modal__card" onClick={(ev) => ev.stopPropagation()}>
        <span className="sim-modal__icon">
          <Alert size={22} />
        </span>
        <h2 className="sim-modal__title">{title}</h2>
        <p className="sim-modal__text">{children}</p>
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
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Aguarde...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

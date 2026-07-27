// Evento interno que sinaliza "uma ação pode ter desbloqueado conquista". O toaster
// ouve e busca as conquistas não-vistas para mostrar a notificação de desbloqueio.
export const EVENTO_CONQUISTA = 'conquista:checar';

export function sinalizarConquista() {
  window.dispatchEvent(new Event(EVENTO_CONQUISTA));
}

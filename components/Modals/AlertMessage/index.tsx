import styles from './AlertMessage.module.scss';
import ModalBase from '../ModalBase';

interface AlertMessageProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  message: string;
  onConfirm?: () => void; // Adicionamos esta prop opcional
}

export default function AlertMessage({ open, setOpen, message, onConfirm }: AlertMessageProps) {
  return (
    <ModalBase open={open} setOpen={setOpen}>
      <div className={styles.container}>
        <div className={styles.iconCircle}>
          <span>!</span>
        </div>

        <p className={styles.message}>{message}</p>

        {/* Se existir onConfirm, exibe botão de ação, senão apenas o de fechar */}
        {onConfirm ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <button
              className={styles.button}
              onClick={onConfirm}
              style={{ background: 'linear-gradient(180deg, #f7d14c 0%, #b89b36 100%)', color: '#000' }}
            >
              Recarregar Agora
            </button>
            <button className={styles.button} onClick={() => setOpen(false)} style={{ background: 'transparent', border: '1px solid #444' }}>
              Voltar
            </button>
          </div>
        ) : (
          <button className={styles.button} onClick={() => setOpen(false)}>
            Voltar
          </button>
        )}
      </div>
    </ModalBase>
  );
}
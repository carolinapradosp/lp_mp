'use client';

import styles from './LoadingOverlay.module.scss';

interface LoadingOverlayProps {
  visible: boolean | ((loading: boolean) => void);
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message,
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Spinner SVG Animado */}
        <svg className={styles.spinner} viewBox="0 0 50 50">
          <circle
            className={styles.path}
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="5"
          />
        </svg>

        {message && <p className={styles.text}>{message}</p>}
      </div>
    </div>
  );
}

import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import styles from './ModalBase.module.scss';
import { IoIosClose } from 'react-icons/io';

interface ModalBaseProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
}

export default function ModalBase({ open, setOpen, children }: ModalBaseProps) {
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      className="relative z-99 max-w-5xl mx-auto"
    >
      <DialogBackdrop className={styles.overlay} />
      <div className={styles.modalWrapper}>
        <DialogPanel className={styles.card}>
          <button onClick={() => setOpen(false)} className={styles.closeButton}>
            <IoIosClose size={24} />
          </button>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  );
}

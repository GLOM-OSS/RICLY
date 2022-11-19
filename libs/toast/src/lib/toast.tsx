import styles from './toast.module.css';

/* eslint-disable-next-line */
export interface ToastProps {}

export function Toast(props: ToastProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Toast!</h1>
    </div>
  );
}

export default Toast;

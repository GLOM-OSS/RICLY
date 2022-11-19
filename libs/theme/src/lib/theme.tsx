import styles from './theme.module.css';

/* eslint-disable-next-line */
export interface ThemeProps {}

export function Theme(props: ThemeProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Theme!</h1>
    </div>
  );
}

export default Theme;

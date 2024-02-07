import styles from "./Spinner.module.scss";

export function Spinner() {
  return (
    <div className={styles.container}>
      <div className={styles.ring} />
    </div>
  );
}

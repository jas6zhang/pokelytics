import Image from "next/image";
import styles from "./page.module.css";
import display from "./components/display"
import Display from "./components/display";

export default function Home() {
  return (
    <div className={styles.page}>
      <Display pokemon={"Breloom"} />
    </div>
  );
}

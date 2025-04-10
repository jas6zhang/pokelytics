import styles from "./page.module.css";
import SearchInput from "./components/search";

export default function Home() {
  return (
    <div className={styles.page}>
      <h1 className="text-3xl font-bold text-center mb-8">Pokelytics</h1>
      <div className="max-w-2xl mx-auto">
        <SearchInput defaultValue="" />
        <div className="mt-8 text-center">
          Search for a Pokemon to see its stats and usage data
        </div>
      </div>
    </div>
  );
}

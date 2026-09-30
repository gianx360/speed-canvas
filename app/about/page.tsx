import Link from "next/link";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <Link href="/" className={styles.back}>
          ← Back to Speed Canvas
        </Link>

        <p className={styles.eyebrow}>ABOUT THE EXPERIMENT</p>

        <h1>Painting with velocity.</h1>

        <div className={styles.story}>
          <p>
            Speed Canvas began with a simple observation: looking through
            the window of a fast-moving vehicle can transform an ordinary
            landscape into something completely different.
          </p>

          <p>
            Nearby fields, trees, roads, buildings and flashes of light
            stop appearing as individual objects. They stretch horizontally,
            overlap and dissolve into bands of colour.
          </p>

          <p>
            For a moment, movement seems to turn the landscape itself
            into an abstract painting.
          </p>

          <p>
            Speed Canvas is an attempt to recreate that phenomenon
            computationally.
          </p>

          <p>
            Rather than generating a conventional image, the system builds
            compositions from horizontal streaks whose colour, thickness,
            persistence and variation are controlled by a set of rules.
            Randomness introduces chance, while a seed makes each composition
            reproducible.
          </p>

          <p>
            The result sits somewhere between landscape, abstraction,
            mathematics and motion — a small experiment in what the world
            might look like when speed becomes the artist.
          </p>
        </div>

        <footer className={styles.footer}>
          SPEED CANVAS
          <span>by gianx-labs</span>
        </footer>
      </div>
    </main>
  );
}

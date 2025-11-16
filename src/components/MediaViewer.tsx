import { useState } from "react";
import ModelView from "./ModelView"; // корректный импорт

// Интерфейс (не экспортируем, нужен только в этом файле)
interface MediaItem {
  id: number;
  title: string;
  url: string;
  type: "png" | "gif" | "mp4" | "glb";
}

// Массив данных (не экспортируем)
const MEDIA: MediaItem[] = [
  {
    id: 1,
    title: "Lydia. Electrum One-Third Stater, 12-karat, circa 610–561 BC.",
    url: "/media/image1.png",
    type: "png",
  },
  {
    id: 2,
    title: "Athens. Silver Tetradrachm with Owl, circa 450–400 BC.",
    url: "/media/video1.mp4",
    type: "mp4",
  },
  {
    id: 3,
    title: "Daric, Phase III: Darius II – Artaxerxes II (424–358 BC).",
    url: "/media/animation1.gif",
    type: "gif",
  },
  {
    id: 4,
    title: "LYDIA. Kroisos. Circa 564/53–550/39 BC. AV Stater.",
    url: "/media/model1.glb",
    type: "glb",
  },
  {
    id: 5,
    title: "Macedonia, Alexander III (the Great), 333–315 BC. AR Tetradrachm.",
    url: "/media/image2.png",
    type: "png",
  },
  {
    id: 6,
    title: "Rome. Anonymous. Circa 225–214 BC. AR Quadrigatus.",
    url: "/media/video2.mp4",
    type: "mp4",
  },
  {
    id: 7,
    title:
      "China. Zhou Dynasty. Circa 6th–4th century BC. Bronze Knife and Spade Money.",
    url: "/media/animation2.gif",
    type: "gif",
  },
  {
    id: 8,
    title: "Rome, Julius Caesar. AR Denarius, military mint, 49–48 BC.",
    url: "/media/model2.glb",
    type: "glb",
  },
];

/**
 * Основной компонент для просмотра медиа‑файлов
 */
export default function MediaViewer() {
  const [index, setIndex] = useState(0);
  const current = MEDIA[index];

  // Переключение с зацикливанием
  const next = () => setIndex((i) => (i + 1) % MEDIA.length);
  const prev = () => setIndex((i) => (i - 1 + MEDIA.length) % MEDIA.length);

  // Рендер нужного тега в зависимости от типа
  const renderMedia = (item: MediaItem) => {
    switch (item.type) {
      case "png":
      case "gif":
        return (
          <img
            src={item.url}
            alt={item.title}
            className="w-full h-full object-contain"
          />
        );
      case "mp4":
        return (
          <video controls className="w-full h-full object-contain">
            <source src={item.url} type="video/mp4" />
            Your browser does not support video
          </video>
        );
      case "glb":
        // 3D‑просмотрщик
        return <ModelView url={item.url} quality="full" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-white bg-slate-900 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">
        See it all. All at once. Ancient Coins That Still Speak.
      </h1>
      <p className="mb-6 text-slate-200">
        More than currency — these coins were emblems of power, belief, and
        artistic mastery. Staters and darics once rang in the hands of
        Alexander’s warriors. Tetradrachms carried Athena’s wisdom across the
        Mediterranean. Aurei gleamed in the palms of Roman emperors, while
        denarii passed from citizen to citizen, shaping everyday life. Each coin
        is a miniature artifact, stamped with gods, kings, and the ideals of its
        time. They’ve survived conquests, markets, temples, and theft — and now
        they stand before you as silent witnesses of history… still speaking
        across millennia.
      </p>

      {/* Контейнер с фиксированной высотой */}
      <div className="relative w-full h-[400px] bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        {renderMedia(current)}
      </div>

      {/* Навигация */}
      <div className="flex justify-between items-center mt-6 gap-4">
        <button
          onClick={prev}
          className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full shadow-lg hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300"
        >
          ← Go Back
        </button>

        <span className="text-slate-500 text-lg font-semibold">
          {current.title}
        </span>

        <button
          onClick={next}
          className="flex items-center gap-2 px-5 py-2 bg-linear-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-full shadow-lg hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-300"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

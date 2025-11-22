import { useState } from "react";
import ModelView from "./ModelView"; // корректный импорт

// Интерфейс (не экспортируем, нужен только в этом файле)
interface MediaItem {
  id: number;
  title: string;
  url: string;
  type: "png" | "gif" | "mp4" | "glb";
}

// ✅ ИСПРАВЛЕНИЕ 1: Убираем слеш в начале путей (media/... вместо /media/...)
// Это нужно, чтобы корректно склеить путь с BASE_URL
const MEDIA: MediaItem[] = [
  {
    id: 1,
    title: "Lydia. Electrum One-Third Stater, 12-karat, circa 610–561 BC.",
    url: "media/image1.png",
    type: "png",
  },
  {
    id: 2,
    title: "Athens. Silver Tetradrachm with Owl, circa 450–400 BC.",
    url: "media/video1.mp4",
    type: "mp4",
  },
  {
    id: 3,
    title: "Daric, Phase III: Darius II – Artaxerxes II (424–358 BC).",
    url: "media/animation1.gif",
    type: "gif",
  },
  {
    id: 4,
    title: "LYDIA. Kroisos. Circa 564/53–550/39 BC. AV Stater.",
    url: "media/model1.glb",
    type: "glb",
  },
  {
    id: 5,
    title: "Macedonia, Alexander III (the Great), 333–315 BC. AR Tetradrachm.",
    url: "media/image2.png",
    type: "png",
  },
  {
    id: 6,
    title: "Rome. Anonymous. Circa 225–214 BC. AR Quadrigatus.",
    url: "media/video2.mp4",
    type: "mp4",
  },
  {
    id: 7,
    title: "China (Ancient). State of Han. Spade Money, 1 Jin, 350–250 BCE.",
    url: "media/animation2.gif",
    type: "gif",
  },
  {
    id: 8,
    title: "Rome, Julius Caesar. AR Denarius, military mint, 49–48 BC.",
    url: "media/model2.glb",
    type: "glb",
  },
  {
    id: 9,
    title:
      "Mysia, Kyzikos. Electrum Hekte, Perseus and Medusa above tunny, circa 450–330 BC.",
    url: "media/image3.png",
    type: "png",
  },
  {
    id: 10,
    title:
      "Lydia, Alyattes II, Electrum Stater, Sardis mint, circa 610–560 BC.",
    url: "media/video3.mp4",
    type: "mp4",
  },
  {
    id: 11,
    title:
      "Ionia, Phocaea. Electrum Hekte (1/6 Stater), circa 521–478 BC. Lion devouring prey.",
    url: "media/animation3.gif",
    type: "gif",
  },
  {
    id: 12,
    title: "Achaemenid Daric of King Xerxes II, Sardis mint, circa 420–375 BC.",
    url: "media/model3.glb",
    type: "glb",
  },
  {
    id: 13,
    title:
      "Roman Empire. Augustus (27 BC–14 AD). AV Aureus, Pergamon, circa 19–18 BC",
    url: "media/image4.png",
    type: "png",
  },
  {
    id: 14,
    title: "Achaemenid Empire. AR Siglos, Darius I (circa 520–505 BC)",
    url: "media/video4.mp4",
    type: "mp4",
  },
  {
    id: 15,
    title: "Roman Empire. Antoninus Pius. AV Aureus, Rome mint, AD 147",
    url: "media/animation4.gif",
    type: "gif",
  },
  {
    id: 16,
    title:
      "Kingdom of Macedonia. AV Gold Stater, Alexander III the Great (circa 334–323 BC).",
    url: "media/model4.glb",
    type: "glb",
  },
  {
    id: 17,
    title:
      'China (Ancient). State of Chu. Small "Bei" Ant-nose Cash Coin, 400–220 BCE',
    url: "media/image5.png",
    type: "png",
  },
  {
    id: 18,
    title: "Lydia. AV Stater of Croesus, circa 561–546 BC.",
    url: "media/video5.mp4",
    type: "mp4",
  },
  {
    id: 19,
    title:
      "Kingdom of Macedonia. AE Chalkon, Kings Philip III & Alexander IV (323–319 BC)",
    url: "media/animation5.gif",
    type: "gif",
  },
  {
    id: 20,
    title: "China (Ancient). State of Yan. Ming Knife Money, 401–220 BCE",
    url: "media/model5.glb",
    type: "glb",
  },
];

/**
 * Основной компонент для просмотра медиа‑файлов
 */
export default function MediaViewer() {
  const [index, setIndex] = useState(0);
  const current = MEDIA[index];

  // ✅ ИСПРАВЛЕНИЕ 2: Получаем базовый путь из конфига Vite
  const baseUrl = import.meta.env.BASE_URL;

  // Переключение с зацикливанием
  const next = () => setIndex((i) => (i + 1) % MEDIA.length);
  const prev = () => setIndex((i) => (i - 1 + MEDIA.length) % MEDIA.length);

  // Рендер нужного тега в зависимости от типа
  const renderMedia = (item: MediaItem) => {
    // ✅ ИСПРАВЛЕНИЕ 3: Формируем полный путь к файлу
    const fullPath = `${baseUrl}${item.url}`;

    switch (item.type) {
      case "png":
      case "gif":
        return (
          <img
            src={fullPath} // используем полный путь
            alt={item.title}
            className="w-full h-full object-contain"
          />
        );
      case "mp4":
        return (
          // key={fullPath} нужен, чтобы видео перезагружалось при смене слайда
          <video
            key={fullPath}
            controls
            className="w-full h-full object-contain"
          >
            <source src={fullPath} type="video/mp4" />
            Your browser does not support video
          </video>
        );
      case "glb":
        // 3D‑просмотрщик
        return <ModelView url={fullPath} quality="full" />;
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

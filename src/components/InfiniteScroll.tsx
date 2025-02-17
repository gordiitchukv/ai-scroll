import { useEffect, useRef, useState } from "react";
import "./InfiniteScroll.css";

//Оголошуємо тип для кожного зображення
interface Image {
  id: string;
  author: string;
  download_url: string;
}

//Функція для завантаження зображень з API
const fetchImages = async (page: number, limit = 3): Promise<Image[]> => {
  const response = await fetch(
    `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
  );
  return response.json(); //Повертаємо результат як JSON (масив зображень)
};

export const InfiniteScroll = () => {
  //Стани
  const [images, setImages] = useState<Image[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  //Реф для IntersectionObserver та реф для останнього елементу, до якого будемо підв’язувати спостерігача
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastImageRef = useRef<HTMLDivElement | null>(null);

  //Хук для завантаження зображень, коли змінюється сторінка
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      const newImages = await fetchImages(page);
      setImages((prev) => [...prev, ...newImages]);
      setLoading(false);
    };

    loadImages();
  }, [page]);

  //Хук для спостереження за останнім елементом на сторінці
  useEffect(() => {
    observerRef.current = new IntersectionObserver( //Створюємо новий IntersectionObserver
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          //Якщо останнє зображення видно і ми не завантажуємо зображення
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 } //Спрацьовує, коли 100% елемента видно
    );

    //Якщо останнє зображення є, починаємо його спостерігати
    if (lastImageRef.current) {
      observerRef.current.observe(lastImageRef.current);
    }

    //Очищаємо спостерігач, коли компонент буде знятий або змінилася сторінка
    return () => {
      observerRef.current?.disconnect();
    };
  }, [images]);

  return (
    <div className="image-grid">
      {images.map((img, index) => (
        <div
          key={img.id}
          ref={index === images.length - 1 ? lastImageRef : null}
          className="image-item"
        >
          <img src={img.download_url} alt={img.author} className="image" />
        </div>
      ))}
      {loading && <h1>Loading...</h1>}
    </div>
  );
};

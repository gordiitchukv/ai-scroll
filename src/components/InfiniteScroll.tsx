import { useEffect, useRef, useState } from "react";
import "./InfiniteScroll.css";

interface Image {
  id: string;
  author: string;
  download_url: string;
}

const fetchImages = async (page: number, limit = 3): Promise<Image[]> => {
  const response = await fetch(
    `https://picsum.photos/v2/list?page=${page}&limit=${limit}`
  );
  return response.json();
};

export const InfiniteScroll = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef<number>(0);
  const lastImageRef = useRef<HTMLDivElement | null>(null);

  const loadNextImages = async () => {
    setLoading(true);
    try {
      const newImages = await fetchImages(pageRef.current + 1);
      pageRef.current++;
      setImages((prev) => [...prev, ...newImages]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!lastImageRef.current || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextImages();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(lastImageRef.current);

    return () => {
      observer.disconnect();
    };
  }, [images, loading]);

  return (
    <div className="image-grid">
      {images.map((img) => (
        <div key={img.id} className="image-item">
          <img src={img.download_url} alt={img.author} className="image" />
        </div>
      ))}
      <div ref={lastImageRef} />
      {loading && <h1>Loading...</h1>}
    </div>
  );
};

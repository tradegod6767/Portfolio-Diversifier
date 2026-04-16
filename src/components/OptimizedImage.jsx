import { useState, useRef, useEffect } from 'react';

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  webpSrc,
  avifSrc,
  srcSet,
  sizes,
  priority = false,
  className = '',
  blurDataURL,
  ...rest
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current?.complete) setIsLoaded(true);
  }, []);

  const wrapperStyle = {
    aspectRatio: `${width} / ${height}`,
    ...(blurDataURL && !isLoaded
      ? {
          backgroundImage: `url(${blurDataURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : {}),
  };

  const imgProps = {
    src,
    alt,
    width,
    height,
    srcSet,
    sizes,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async',
    ...(priority ? { fetchPriority: 'high' } : {}),
    className: `${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`,
    onLoad: () => setIsLoaded(true),
    ref: imgRef,
    ...rest,
  };

  if (avifSrc || webpSrc) {
    return (
      <div className="relative overflow-hidden" style={wrapperStyle}>
        <picture>
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img {...imgProps} />
        </picture>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={wrapperStyle}>
      <img {...imgProps} />
    </div>
  );
}

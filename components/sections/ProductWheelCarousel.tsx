import type { CSSProperties } from "react";
import { Picture } from "@/components/ui/Picture";
import type { ImageRef } from "@/types/content";
import type { ShopProduct } from "@/types/shop";

const CARD_WIDTH_REM = 24;
// El hueco sobre el arco tiene que ser mayor que el hueco visible: al girar
// rectángulos altos, sus esquinas se acercan. Con 5rem quedan ~32px reales
// entre los puntos más próximos de dos tarjetas contiguas.
const CARD_GAP_REM = 5;
const CAROUSEL_SIZES = "(max-width: 767px) 240px, 384px";

type CustomProperties = CSSProperties & Record<`--${string}`, string | number>;

function carouselImages(products: ShopProduct[]): ImageRef[] {
  return products.flatMap((product) =>
    product.imageB ? [product.image, product.imageB] : [product.image],
  );
}

function WheelCard({ image, angle }: { image: ImageRef; angle: number }) {
  const decorativeImage = { ...image, alt: "", sizes: CAROUSEL_SIZES };
  const style = { "--wheel-angle": `${angle}deg` } as CustomProperties;

  return (
    <div className="product-wheel__card" style={style} data-carousel-image={image.src}>
      <Picture image={decorativeImage} className="product-wheel__image" />
    </div>
  );
}

/**
 * Rueda decorativa de todas las fotos del catálogo.
 *
 * La geometría se calcula con el número real de imágenes para conservar un
 * hueco constante aunque el catálogo crezca. En móvil las dos copias se vuelven
 * una cinta continua; en escritorio la copia queda fuera del layout.
 */
export function ProductWheelCarousel({ products }: { products: ShopProduct[] }) {
  const images = carouselImages(products);
  if (images.length === 0) return null;

  const radiusRem = (images.length * (CARD_WIDTH_REM + CARD_GAP_REM)) / (2 * Math.PI);
  const discStyle = { "--wheel-radius": `${radiusRem.toFixed(4)}rem` } as CustomProperties;

  return (
    <div className="product-wheel" aria-hidden="true" data-carousel-count={images.length}>
      <div className="product-wheel__disc" style={discStyle}>
        <div className="product-wheel__set">
          {images.map((image, index) => (
            <WheelCard
              image={image}
              angle={(index * 360) / images.length}
              key={image.src}
            />
          ))}
        </div>

        <div className="product-wheel__set product-wheel__set--copy" aria-hidden="true">
          {images.map((image, index) => (
            <WheelCard
              image={image}
              angle={(index * 360) / images.length}
              key={`copy-${image.src}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Btn } from "@/components/ui/Btn";
import { Picture } from "@/components/ui/Picture";
import { SmartLink } from "@/components/ui/SmartLink";
import { SocialIcon } from "@/components/ui/SocialIcon";
import type { HomeContent } from "@/types/content";

/**
 * Footer con la tarjeta CTA solapada sobre el bloque oscuro (spec §6.8).
 * Punto 9 del checklist.
 *
 * ⚠ `.cta-wrapper` es HERMANO de `.footer-dark`, nunca hijo. Si se anida, la
 * tarjeta crema hereda los tokens de tinta invertidos que `.footer-dark`
 * re-declara y el contraste del solape se rompe. El solape de −198px (−258 en
 * móvil) es la firma visual de esta sección.
 *
 * El logo del pie usa una variante clara generada desde `assets/logo-boquita.jpg`:
 * el fondo blanco se elimina en el pipeline de imágenes y la tinta oscura se
 * recolorea para sobrevivir sobre el marrón.
 *
 * El título de la newsletter se renderiza como `<h2 class="as-h4">` y no como
 * `h4`, para no saltar un nivel de encabezado (desvío D-7). Es pixel-idéntico.
 */
export function Footer({ footer }: { footer: HomeContent["footer"] }) {
  return (
    <footer className="footer">
      {/* 1) Tarjeta CTA — hermana del bloque oscuro, no hija. */}
      <div className="cta-wrapper">
        <div className="container">
          <div className="cta-card">
            <div className="cta-copy">
              <h2>
                {footer.cta.titleTop}
                <br />
                {footer.cta.titleBottom}
              </h2>
              <p className="mt-20">{footer.cta.body}</p>
              <Btn link={footer.cta.button} className="mt-40" />
            </div>
            <Picture image={footer.cta.image} className="cta-img" />
          </div>
        </div>
      </div>

      {/* 2) Bloque oscuro: sube −198px y pasa por detrás de la tarjeta. */}
      <div className="footer-dark">
        <div className="container">
          <div className="newsletter">
            <h2 className="as-h4">{footer.newsletter.title}</h2>
            <div className="newsletter-form-wrap">
              {/* En esta fase no envía: el endpoint llega en la Fase 5. */}
              <form className="newsletter-form" action="#" method="post">
                <label className="sr-only" htmlFor="newsletter-email">
                  {footer.newsletter.label}
                </label>
                <input
                  className="input"
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={footer.newsletter.placeholder}
                  required
                />
                <button className="btn btn--footer" type="submit">
                  {footer.newsletter.button}
                </button>
              </form>
            </div>
          </div>

          <div className="footer-cols">
            <div className="footer-brand-col">
              <Link
                className="footer-brand"
                href="/"
                aria-label="Boquita — Sweet & Salty, inicio"
              >
                <img
                  className="footer-logo"
                  src="/img/brand/logo-light-36x36.png"
                  srcSet="/img/brand/logo-light-36x36.png 36w, /img/brand/logo-light-72x72.png 72w"
                  sizes="36px"
                  width={36}
                  height={36}
                  alt="Boquita — Sweet & Salty"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <p className="footer-brand-text">{footer.brandText}</p>
              <div className="footer-social">
                {footer.social.map((social, index) => (
                  <SocialIcon
                    key={social.icon}
                    social={social}
                    last={index === footer.social.length - 1}
                  />
                ))}
              </div>
            </div>

            <div className="footer-right-col">
              <nav className="footer-links" aria-label="Enlaces del pie">
                {footer.links.map((link) => (
                  <SmartLink className="footer-link" key={link.label} link={link} />
                ))}
              </nav>

              <div className="footer-contact">
                <div className="footer-address">{footer.address}</div>
                <div>
                  {footer.phones.map((phone, index) => (
                    <a
                      className={`footer-phone${index === footer.phones.length - 1 ? " footer-phone--last" : ""}`}
                      key={phone.display}
                      href={phone.href}
                    >
                      {phone.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="footer-rights">
            <div className="footer-copy">
              {footer.copyright} <a href={footer.legal.href}>{footer.legal.label}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

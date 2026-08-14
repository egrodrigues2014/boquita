import Link from "next/link";
import { SmartLink } from "@/components/ui/SmartLink";
import { SocialIconGlyph } from "@/components/ui/SocialIcon";
import type { HomeContent } from "@/types/content";

/**
 * Footer editorial de cierre: marca, navegacion, direccion y contacto.
 */
export function Footer({ footer }: { footer: HomeContent["footer"] }) {
  const addressLines = footer.address.split(",").map((line) => line.trim()).filter(Boolean);

  return (
    <footer className="footer">
      <div className="footer-dark">
        <div className="container">
          <div className="footer-cols">
            <div className="footer-brand-col">
              <Link
                className="footer-brand"
                href="/"
                aria-label="Boquita — Sweet & Salty, inicio"
              >
                <img
                  className="footer-logo"
                  src="/img/brand/logo-light-72x72.png"
                  srcSet="/img/brand/logo-light-36x36.png 36w, /img/brand/logo-light-72x72.png 72w, /img/brand/logo-light-144x144.png 144w, /img/brand/logo-light-216x216.png 216w"
                  sizes="72px"
                  width={72}
                  height={72}
                  alt="Boquita — Sweet & Salty"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="footer-brand-name">Boquita</div>
              <div className="footer-brand-tagline">Sweet &amp; Salty</div>
              <p className="footer-brand-text">Repostería artesanal</p>
            </div>

            <nav className="footer-col footer-nav" aria-label="Enlaces del pie">
              <h2 className="footer-col-title">Navegación</h2>
              {footer.links.map((link) => (
                <SmartLink className="footer-link" key={link.label} link={link} />
              ))}
            </nav>

            <address className="footer-col footer-address" aria-label={footer.address}>
              <h2 className="footer-col-title">Dirección</h2>
              {addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>

            <div className="footer-col footer-contact">
              <h2 className="footer-col-title">Contacto</h2>
              {footer.contacts.map((contact) => (
                <a
                  className="footer-contact-link"
                  href={contact.href}
                  key={contact.label}
                  aria-label={contact.label}
                  {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <SocialIconGlyph className="footer-contact-icon" icon={contact.icon} />
                  {contact.display}
                </a>
              ))}
            </div>
          </div>

          <div className="footer-rights">
            <div className="footer-copy">
              {footer.copyright}{" "}
              <Link className="footer-legal-link" href={footer.legal.href}>
                {footer.legal.label}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

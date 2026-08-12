import Link from "next/link";
import { SmartLink } from "@/components/ui/SmartLink";
import { SocialIcon } from "@/components/ui/SocialIcon";
import type { HomeContent } from "@/types/content";

/**
 * Footer editorial de cierre: marca, navegacion, direccion y contacto.
 */
export function Footer({ footer }: { footer: HomeContent["footer"] }) {
  const [phone, whatsapp] = footer.phones;
  const instagram = footer.social.find((social) => social.icon === "instagram");
  const whatsAppSocial = footer.social.find((social) => social.icon === "whatsapp");

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
                  srcSet="/img/brand/logo-light-36x36.png 36w, /img/brand/logo-light-72x72.png 72w, /img/brand/logo-light-144x144.png 144w"
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
              <div className="footer-social" aria-label="Redes de Boquita">
                {footer.social.map((social, index) => (
                  <SocialIcon
                    key={social.icon}
                    social={social}
                    last={index === footer.social.length - 1}
                  />
                ))}
              </div>
            </div>

            <nav className="footer-col footer-nav" aria-label="Enlaces del pie">
              <h2 className="footer-col-title">Navegación</h2>
              {footer.links.map((link) => (
                <SmartLink className="footer-link" key={link.label} link={link} />
              ))}
            </nav>

            <address className="footer-col footer-address" aria-label={footer.address}>
              <h2 className="footer-col-title">Dirección</h2>
              <span>Calle Obelisco, condominio Condado del Río</span>
              <span>Santa Ana</span>
              <span>Costa Rica</span>
            </address>

            <div className="footer-col footer-contact">
              <h2 className="footer-col-title">Contacto</h2>
              {phone ? (
                <a className="footer-contact-link" href={phone.href}>
                  <span aria-hidden="true">Tel.</span>
                  {phone.display}
                </a>
              ) : null}
              {whatsapp ? (
                <a className="footer-contact-link" href={whatsapp.href}>
                  <span aria-hidden="true">WhatsApp</span>
                  {whatsapp.display.replace("WhatsApp: ", "")}
                </a>
              ) : null}
              {instagram ? (
                <a className="footer-contact-link" href={instagram.href}>
                  <span aria-hidden="true">Instagram</span>
                  @boquita_cr
                </a>
              ) : null}
              {whatsAppSocial && whatsAppSocial.href !== whatsapp?.href ? (
                <a className="footer-contact-link" href={whatsAppSocial.href}>
                  WhatsApp
                </a>
              ) : null}
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

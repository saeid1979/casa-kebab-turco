import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';
import './styles.css';
import logo from './assets/casa-kebab-logo.png';

const OPENING_DATE = new Date('2026-06-15T12:00:00');
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

function Countdown() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, OPENING_DATE - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return (
    <div className="countdown">
      <div><strong>{days}</strong><span>Días</span></div>
      <div><strong>{hours}</strong><span>Horas</span></div>
      <div><strong>{minutes}</strong><span>Min</span></div>
      <div><strong>{seconds}</strong><span>Seg</span></div>
    </div>
  );
}

function App() {
  const [showMap, setShowMap] = useState(false);
  const [isAdminInfo, setIsAdminInfo] = useState(window.location.hash === '#admin');

  useEffect(() => {
    const onHashChange = () => setIsAdminInfo(window.location.hash === '#admin');
    window.addEventListener('hashchange', onHashChange);

    fetch(`${API_BASE}/coming-soon/visit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_url: window.location.href,
        referrer: document.referrer,
        language: navigator.language,
      }),
    }).catch(() => {});

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const address = 'Calle García Lorca, 1, 37004 Salamanca, Spain';
  const encodedAddress = encodeURIComponent(address);
  const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=17&output=embed`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const openGoogleMaps = () => {
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="coming-soon-page">
      <div className="flame-bg flame-one" />
      <div className="flame-bg flame-two" />

      <section className="coming-card">
        <div className="logo-wrap">
          <img src={logo} alt="Casa de Kebab Turco" />
        </div>

        <div className="title-block">
          <div className="badge"><Sparkles size={18}/> Próximamente</div>
          <h1>Casa de Kebab Turco</h1>
          <p className="subtitle">Kebab fresco, auténtico sabor turco y pedidos rápidos.</p>
        </div>

        <div className="opening-box">
          <div className="opening-icon"><CalendarDays size={26}/></div>
          <div>
            <span>Fecha de apertura</span>
            <strong>15 Junio 2026</strong>
          </div>
        </div>

        <Countdown />

        <div className="info-grid">
          <div className="info-card">
            <Clock3 size={19}/>
            <span>Muy pronto abriremos nuestras puertas</span>
          </div>
          <button className="info-card address-button" onClick={() => setShowMap(true)}>
            <MapPin size={19}/>
            <span>Calle García Lorca, 1. Salamanca 37004</span>
          </button>
        </div>

        {showMap && (
          <div className="map-box">
            <iframe
              title="Casa de Kebab Turco location"
              src={mapUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="map-actions">
              <button type="button" onClick={openGoogleMaps}>
                Abrir en Google Maps
              </button>
              <button type="button" onClick={() => setShowMap(false)}>
                Cerrar mapa
              </button>
            </div>
          </div>
        )}

        <div className="soon-text">
          <strong>Estamos preparando algo especial para ti.</strong>
          <span>Muy pronto podrás ver el menú y realizar pedidos online.</span>
        </div>

        {isAdminInfo && (
          <div className="admin-access-box">
            <strong>Admin visitors panel</strong>
            <span>برای دیدن IP بازدیدکنندگان وارد Django Admin شو و بخش Coming Soon Visits را باز کن.</span>
            <a href="http://127.0.0.1:8000/admin/restaurant/comingsoonvisit/" target="_blank" rel="noreferrer">
              Open local admin
            </a>
            <small>در نسخه اینترنتی، لینک را با آدرس backend واقعی جایگزین کن.</small>
          </div>
        )}

        <footer>© 2026 Casa de Kebab Turco</footer>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react';
import './styles.css';
import logo from './assets/casa-kebab-logo.png';

const OPENING_DATE = new Date('2026-06-15T12:00:00');

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
          <div className="info-card">
            <MapPin size={19}/>
            <span>Salamanca, España</span>
          </div>
        </div>

        <div className="soon-text">
          <strong>Estamos preparando algo especial para ti.</strong>
          <span>Muy pronto podrás ver el menú y realizar pedidos online.</span>
        </div>

        <footer>© 2026 Casa de Kebab Turco</footer>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);

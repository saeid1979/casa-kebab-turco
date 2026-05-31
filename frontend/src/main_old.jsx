
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}


import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import restaurantLogo from './assets/logo.png';
import {
  ShoppingCart, ChefHat, Languages, Lock, LogOut, UserRound,
  PlusCircle, Save, RefreshCw, BellRing, Flame, LayoutDashboard, Clock3, CalendarDays
} from 'lucide-react';
import './styles.css';

const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
const RESTAURANT_PHONE = '34613473564';


function isOnlinePaymentAllowedV426() {
  const host = window.location.hostname;
  return !(host === '127.0.0.1' || host === 'localhost');
}

const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('admin_refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API}/token/refresh/`, { refresh });
          localStorage.setItem('admin_access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

const translations = {
  es: {
    brandSub: 'Kebab fresco, pedidos rápidos, auténtico sabor turco',
  en: {
    brandSub: 'Fresh kebab, fast orders, authentic Turkish taste', fast orders, authentic Turkish taste',
    customer: 'Customer',
    trackingTab: 'Tracking',
    orderDeliveredHidden: 'This order has already been delivered. There is no pending information to show.',
    myAccount: 'My account',
    orderTracking: 'Order tracking',
    trackingCode: 'Tracking number',
    trackingCodePlaceholder: 'Example: CDKT-000032',
    trackOrderButton: 'Find order',
    trackingNotFound: 'No order found with this tracking number and phone.',
    trackingHelp: 'Enter the tracking number and the phone used for the order.',
    registerAccount: 'Create account',
    loginAccount: 'Login to my account',
    customerPassword: 'Password',
    myOrders: 'My orders',
    noOrdersYet: 'No orders yet.',
    trackingOnlyAccount: 'Tracking is only available for orders placed from this account.',
    logoutAccount: 'Logout account',
    admin: 'Admin',
    accounting: 'Accounting',
    menu: 'Menu',
    yourOrder: 'Your order',
    cartEmpty: 'Your cart is empty.',
    total: 'Total',
    customerName: 'Customer name',
    phone: 'Phone',
    address: 'Address or table number',
    takeaway: 'Takeaway',
    dineIn: 'Dine in',
    delivery: 'Delivery',
    notes: 'Notes',
    placeOrder: 'Place order',
    paymentMethodCustomer: 'Payment method',
    paymentStatusLabel: 'Payment status',
    paidLabel: 'Paid',
    pendingLabel: 'Pending',
    payOnDeliveryLabel: 'Pay on delivery',
    failedLabel: 'Payment failed',
    cashDeliveryLabel: 'Cash on delivery',
    cardDeliveryLabel: 'Card on delivery',
    onlineCardLabel: 'Online payment',
    mixedPaymentLabel: 'Mixed payment',
    cashOnDelivery: 'Cash on delivery',
    cardOnDelivery: 'Card terminal on delivery',
    onlineCardPayment: 'Online card payment',
    simulateBankPayment: 'Simulate BBVA/Redsys payment',
    paymentApproved: 'Payment approved',
    paymentPendingDelivery: 'Pay on delivery pending',
    orderConfirmed: 'Order confirmed',
    trackingNumber: 'Tracking number',
    orderSummary: 'Order summary',
    restaurantPhone: 'Restaurant phone',
    callNow: 'Call now',
    close: 'Close',
    successBlink: 'Order sent successfully!',
    thankYouOrder: 'Thank you for your order. We will prepare it as soon as possible.',
    addToCart: 'Add',
    required: 'Please enter name, phone, address/table number and choose at least one item.',
    fieldRequired: 'This field is required.',
    completeRequiredFields: 'Please complete the fields marked in red.',
    orderOk: 'Order created successfully. Order ID',
    orderFail: 'Restaurant ordering hours are from 11:30 AM to 1:00 AM.',
    backendFail: 'Could not connect to the server.',
    language: 'Language',
    loginTitle: 'Staff Login',
    username: 'Username',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    loginError: 'Wrong username or password.',
    protectedHint: 'This section is only for authorized staff.',
    role: 'Role',
    cashier: 'Cashier',
    kitchen: 'Kitchen',
    deliveryRole: 'Delivery',
    liveManagement: 'Live order management',
    cashierPanel: 'Cashier and payments', paymentMethod: 'Payment method', cash: 'Cash', card: 'Card', debt: 'Debt', discount: 'Discount', registerPayment: 'Register payment', openCash: 'Open cash register', closeCash: 'Close cash register', openingCash: 'Opening cash', closingCash: 'Closing cash', profitLoss: 'Profit and loss', materialCost: 'Material cost', grossProfit: 'Gross profit', dailyExpenses: 'Daily expenses', netProfit: 'Net profit',
    adminHelp: 'Manage orders, menu, inventory and cashier tools depending on the user role.',
    adminTabs: 'Sections',
    tabLive: 'Live orders',
    tabRiders: 'Riders',
    tabCashier: 'Cashier',
    tabCustomers: 'Customers',
    tabInventory: 'Inventory',
    tabMenu: 'Menu',
    tabHistory: 'History',
    todaySales: 'Today sales',
    todayOrders: 'Today orders',
    activeOrders: 'Active orders',
    newOrdersCount: 'New orders',
    topFood: 'Top food',
    monthIncome: 'Monthly income',
    recentOrders: 'Recent orders',
    orderItems: 'Items',
    type: 'Type',
    status: 'Status',
    changeStatus: 'Change status',
    printReceipt: 'Print receipt',
    sendWhatsapp: 'Send WhatsApp',
    allStatuses: 'All statuses',
    searchOrders: 'Search order, customer or phone',
    orderStatusNew: 'New',
    orderStatusPreparing: 'Preparing',
    orderStatusReady: 'Ready',
    orderStatusDelivered: 'Delivered',
    orderStatusCancelled: 'Cancelled',
    addFood: 'Add food',
    foodName: 'Food name',
    price: 'Price',
    description: 'Description',
    available: 'Available',
    save: 'Save',
    created: 'Created successfully',
    updated: 'Updated successfully',
    customers: 'Customers',
    customerDatabase: 'Customer database',
    customerRepeat: 'Returning customer',
    lastOrder: 'Last order',
    totalSpent: 'Total spent',
    menuManagement: 'Menu management',
    categories: 'Categories',
    addCategory: 'Add category',
    categoryName: 'Category name',
    allCategories: 'All',
    editFood: 'Edit food',
    deleteFood: 'Delete',
    updateFood: 'Update food',
    cancelEdit: 'Cancel edit',
    foodImage: 'Food image',
    imageOptional: 'Optional image',
    noImage: 'No image',
    inventory: 'Inventory',
    addInventory: 'Add material',
    materialName: 'Material name',
    unit: 'Unit',
    currentStock: 'Current stock',
    minimumStock: 'Minimum stock',
    unitCost: 'Unit cost',
    lowStock: 'Low stock',
    inventoryValue: 'Inventory value',
    linkIngredient: 'Link ingredient to food',
    quantityRequired: 'Quantity required',
    refresh: 'Refresh',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    testSound: 'Test sound',
    newOrderAlert: 'New order received',
    telegramSent: 'Sent to Telegram',
    telegramNotConfigured: 'Telegram not configured or not sent',
  }
};

const menuTranslations = {
  'Chicken Doner Kebab': { es: 'Kebab de pollo', en: 'Chicken Doner Kebab' },
  'Beef Doner Kebab': { es: 'Kebab de ternera', en: 'Beef Doner Kebab' },
  'Mixed Kebab': { es: 'Kebab mixto', en: 'Mixed Kebab' },
  'Kebab Plate with Rice': { es: 'Plato de kebab con arroz', en: 'Kebab Plate with Rice' },
  'Falafel Plate': { es: 'Plato de falafel', en: 'Falafel Plate' },
  'Coca Cola': { es: 'Coca Cola', en: 'Coca Cola' },
  'Water': { es: 'Agua', en: 'Water' }
};

const descriptionTranslations = {
  'Fresh chicken doner with salad and sauce': { es: 'Kebab de pollo con ensalada y salsa', en: 'Fresh chicken doner with salad and sauce' },
  'Beef doner with fresh vegetables': { es: 'Kebab de ternera con verduras frescas', en: 'Beef doner with fresh vegetables' },
  'Chicken and beef mix': { es: 'Mezcla de pollo y ternera', en: 'Chicken and beef mix' },
  'Kebab with rice, salad and sauce': { es: 'Kebab con arroz, ensalada y salsa', en: 'Kebab with rice, salad and sauce' },
  'Falafel with rice and salad': { es: 'Falafel con arroz y ensalada', en: 'Falafel with rice and salad' },
  'Cold drink': { es: 'Bebida fría', en: 'Cold drink' },
  'Bottle of water': { es: 'Botella de agua', en: 'Bottle of water' }
};

function translateMenuName(name, lang) {
  return menuTranslations[name]?.[lang] || name;
}

function translateDescription(description, lang) {
  return descriptionTranslations[description]?.[lang] || description;
}


function FancyDateTime({ lang = 'es', compact = false }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const locale = lang === 'es' ? 'es-ES' : 'en-GB';

  const dateText = now.toLocaleDateString(locale, {
    weekday: compact ? undefined : 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeText = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    second: compact ? undefined : '2-digit',
  });

  return (
    <div className={`fancy-datetime ${compact ? 'compact' : ''}`}>
      <div className="dt-icon"><CalendarDays size={18}/></div>
      <div>
        <strong>{dateText}</strong>
        <span><Clock3 size={14}/> {timeText}</span>
      </div>
    </div>
  );
}


function Header({ page, setPage, lang, setLang, t, isAdmin, currentUser, logout }) {
  const role = currentUser?.role;
  const roleLabel = role === 'cashier' ? t.cashier : role === 'kitchen' ? t.kitchen : role === 'delivery' ? t.deliveryRole : t.admin;

  return (
    <header className="header">
      <div className="brand">
        <div className="logo"><ChefHat size={28}/></div>
        <div className="brand-text">
          <div className="brand-title-row">
            <h1>{restaurantSettings?.name || 'Casa de Kebab Turco'}</h1>
            <a className="header-phone-pill" href={`tel:+${RESTAURANT_PHONE}`}>☎ {restaurantSettings?.phone || '+34 613 473 564'}</a>
          </div>
          <p>{t.brandSub}</p>
        </div>
      </div>
      <div className="top-actions">
        <FancyDateTime lang={lang}/>
        <div className="language-switch">
          <Languages size={18}/><span>{t.language}</span>
          <button onClick={() => setLang('es')} className={lang === 'es' ? 'active' : ''}>ES</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
        </div>
        <nav>
          <button onClick={() => setPage('customer')} className={page === 'customer' ? 'active' : ''}>{t.customer}</button>
          <button onClick={() => setPage('tracking')} className={page === 'tracking' ? 'active' : ''}>{t.trackingTab}</button>
          {isAdmin && <button onClick={() => setPage('admin')} className={page === 'admin' ? 'active' : ''}>{roleLabel}</button>}
          {isAdmin && role === 'admin' && <button onClick={() => setPage('accounting')} className={page === 'accounting' ? 'active' : ''}>{t.accounting}</button>}
          {isAdmin && <button onClick={logout}><LogOut size={16}/> {t.logout}</button>}
        </nav>
      </div>
    </header>
  );
}

function LoginPage({ t, onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const submit = async () => {
    try {
      const res = await axios.post(`${API}/token/`, form);
      localStorage.setItem('admin_access_token', res.data.access);
      localStorage.setItem('admin_refresh_token', res.data.refresh);
      window.location.hash = '';
      setMessage('');
      onLogin();
    } catch {
      setMessage(t.loginError);
    }
  };

  return (
    <main className="login-wrap">
      <section className="login-card">
        <div className="login-icon"><UserRound size={34}/></div>
        <h2>{t.loginTitle}</h2>
        <p>{t.protectedHint}</p>
        <input placeholder={t.username} value={form.username} onChange={e => setForm({...form, username: e.target.value})}/>
        <input placeholder={t.password} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} onKeyDown={e => e.key === 'Enter' && submit()}/>
        <button className="primary full" onClick={submit}><Lock size={17}/> {t.login}</button>
        {message && <p className="message danger">{message}</p>}
      </section>

    </main>
  );
}


function RestaurantLocationCard() {
  return (
    <section className="restaurant-location-card">
      <div className="restaurant-location-overlay">
        <h2>📍 Casa de Kebab Turco</h2>

        <div className="restaurant-location-address">
          <p>Calle García Lorca, 1</p>
          <p>37004 Salamanca, España</p>
        </div>

        <div className="restaurant-location-info">
          <span>🕒 11:30 — 01:00</span>
          <span>🍽️ Kebab • Dürüm • Comida Turca • Comida Halal</span>
          <span>🚗 Para Llevar y Entrega a Domicilio Disponible</span>
        </div>

        <a
          className="restaurant-location-button"
          href="https://www.google.com/maps/search/?api=1&query=Calle+García+Lorca+1+Salamanca+37004"
          target="_blank"
          rel="noreferrer"
        >
          📍 Abrir en Google Maps
        </a>
      </div>
    </section>
  );
}




function ProDeliveryMobilePage({ lang }) {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || '';
    if (urlToken) {
      setToken(urlToken);
      loadDeliveryInfo(urlToken);
    }
  }, []);

  const loadDeliveryInfo = async (tk = token) => {
    setMessage('');
    try {
      const res = await axios.get(`${API}/delivery/info/?token=${encodeURIComponent(tk)}`);
      setOrder(res.data);
    } catch (err) {
      setMessage('Enlace de reparto invalido.');
    }
  };

  const sendLocation = async (position) => {
    const c = position.coords;
    setCoords({ latitude: c.latitude, longitude: c.longitude, accuracy: c.accuracy });
    await axios.post(`${API}/delivery/location/`, {
      token,
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy,
      speed: c.speed,
      heading: c.heading,
    });
    setMessage('Ubicacion enviada correctamente.');
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setMessage('GPS no compatible en este dispositivo.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos).catch(() => setMessage('No se pudo enviar la ubicacion.')),
      () => setMessage('Permiso de GPS denegado. Activa la ubicacion del movil.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    setWatchId(id);
    setIsTracking(true);
    setMessage('Seguimiento en vivo iniciado.');
  };

  const stopTracking = async () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);
    try {
      await axios.post(`${API}/delivery/stop/`, { token });
      setMessage('Seguimiento detenido.');
    } catch {
      setMessage('No se pudo detener el seguimiento.');
    }
  };

  const mapsRoute = coords && order?.customer_address
    ? `https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(order.customer_address + ', Salamanca')}`
    : null;

  return (
    <main className="pro-delivery-page">
      <section className="pro-delivery-card">
        <div className="pro-delivery-header">
          <div>
            <h2>Seguimiento del repartidor</h2>
            <p>Casa de Kebab Turco</p>
          </div>
          <span className={isTracking ? 'tracking-pill active' : 'tracking-pill'}>
            {isTracking ? 'GPS activo' : 'GPS detenido'}
          </span>
        </div>

        {!order && (
          <div className="pro-delivery-token">
            <input placeholder="Token de reparto" value={token} onChange={e => setToken(e.target.value)} />
            <button onClick={() => loadDeliveryInfo()}>Cargar pedido</button>
          </div>
        )}

        {order && (
          <div className="pro-delivery-grid">
            <div className="pro-delivery-order">
              <strong>{order.tracking_code}</strong>
              <p><b>Cliente:</b> {order.customer_name}</p>
              <p><b>Telefono:</b> {order.customer_phone}</p>
              <p><b>Direccion:</b> {order.customer_address}</p>
              <p><b>Estado:</b> {order.status}</p>

              <div className="pro-delivery-actions">
                <button className="start" disabled={isTracking} onClick={startTracking}>Iniciar GPS</button>
                <button className="stop" disabled={!isTracking} onClick={stopTracking}>Detener GPS</button>
              </div>

              {mapsRoute && (
                <a className="route-button" href={mapsRoute} target="_blank" rel="noreferrer">
                  Abrir ruta en Google Maps
                </a>
              )}
            </div>

            <div className="pro-delivery-map-box">
              {coords ? (
                <iframe
                  title="Mapa del repartidor"
                  className="pro-delivery-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude-0.01}%2C${coords.latitude-0.01}%2C${coords.longitude+0.01}%2C${coords.latitude+0.01}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
                />
              ) : (
                <div className="map-placeholder">Pulsa Iniciar GPS para ver tu ubicacion.</div>
              )}
            </div>
          </div>
        )}

        {message && <div className="pro-delivery-message">{message}</div>}
      </section>
    </main>
  );
}


function DeliveryMobilePage({ lang }) {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || '';
    if (urlToken) {
      setToken(urlToken);
      loadDeliveryInfo(urlToken);
    }
  }, []);

  const loadDeliveryInfo = async (tk = token) => {
    setMessage('');
    try {
      const res = await axios.get(`${API}/delivery/info/?token=${encodeURIComponent(tk)}`);
      setOrder(res.data);
    } catch (err) {
      setMessage(lang === 'en' ? 'Invalid delivery link.' : 'Enlace de reparto inválido.');
    }
  };

  const sendLocation = async (position) => {
    const coords = position.coords;
    await axios.post(`${API}/delivery/location/`, {
      token,
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      speed: coords.speed,
      heading: coords.heading,
    });
    setMessage(lang === 'en' ? 'Location sent.' : 'Ubicación enviada.');
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setMessage(lang === 'en' ? 'GPS is not supported.' : 'GPS no compatible.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos).catch(() => setMessage(lang === 'en' ? 'Could not send location.' : 'No se pudo enviar la ubicación.')),
      () => setMessage(lang === 'en' ? 'GPS permission denied.' : 'Permiso de GPS denegado.'),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    setWatchId(id);
    setIsTracking(true);
    setMessage(lang === 'en' ? 'Live tracking started.' : 'Seguimiento en vivo iniciado.');
  };

  const stopTracking = async () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);
    try {
      await axios.post(`${API}/delivery/stop/`, { token });
      setMessage(lang === 'en' ? 'Tracking stopped.' : 'Seguimiento detenido.');
    } catch (err) {
      setMessage(lang === 'en' ? 'Could not stop tracking.' : 'No se pudo detener.');
    }
  };

  return (
    <main className="delivery-mobile-page">
      <section className="delivery-mobile-card">
        <h2>{lang === 'en' ? 'Delivery Tracking' : 'Seguimiento del repartidor'}</h2>

        {!order && (
          <div className="delivery-token-box">
            <input placeholder="Delivery token" value={token} onChange={e => setToken(e.target.value)} />
            <button onClick={() => loadDeliveryInfo()}>{lang === 'en' ? 'Load order' : 'Cargar pedido'}</button>
          </div>
        )}

        {order && (
          <div className="delivery-order-info">
            <strong>{order.tracking_code}</strong>
            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.customer_address}</p>
            <p>Status: {order.status}</p>
            <div className="delivery-actions">
              <button disabled={isTracking} onClick={startTracking}>{lang === 'en' ? 'Start GPS' : 'Iniciar GPS'}</button>
              <button disabled={!isTracking} onClick={stopTracking}>{lang === 'en' ? 'Stop GPS' : 'Detener GPS'}</button>
            </div>
          </div>
        )}

        {message && <div className="delivery-message">{message}</div>}
      </section>
    </main>
  );
}






function EtaProBoxV35({ location, lang = 'es' }) {
  const customerAddress = location?.customer_address || '';
  const riderLat = location?.latitude;
  const riderLng = location?.longitude;
  const rawCustomerLat = Number(location?.customer_latitude);
  const rawCustomerLng = Number(location?.customer_longitude);
  const hasSavedDestination = Number.isFinite(rawCustomerLat) && Number.isFinite(rawCustomerLng) && !(rawCustomerLat === 0 && rawCustomerLng === 0);
  const customerLat = hasSavedDestination ? rawCustomerLat : null;
  const customerLng = hasSavedDestination ? rawCustomerLng : null;
  const destinationText = location?.customer_geocoded_address || 'Destino guardado en Salamanca';
  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; const toRad = (value) => (Number(value) * Math.PI) / 180;
    const dLat = toRad(Number(lat2) - Number(lat1)); const dLon = toRad(Number(lon2) - Number(lon1));
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };
  const estimateMinutes = (km) => Math.max(3, Math.min(Math.ceil((Number(km) / 22) * 60 + 3), 60));
  let distanceKm = null; let eta = null; let suspiciousDistance = false;
  if (hasSavedDestination && riderLat && riderLng) { distanceKm = calculateDistanceKm(riderLat, riderLng, customerLat, customerLng); eta = estimateMinutes(distanceKm); suspiciousDistance = distanceKm > 8; }
  return (
    <div className="eta-pro-v35">
      <div className="eta-pro-v35-header"><div><h4>{lang === 'en' ? 'Rider on the way' : 'Repartidor en camino'}</h4><p>{lang === 'en' ? 'ETA calculated with saved Salamanca address' : 'ETA calculado con direccion guardada de Salamanca'}</p></div><span>{location?.last_seen_at ? new Date(location.last_seen_at).toLocaleTimeString() : '-'}</span></div>
      <div className="eta-pro-v35-address"><strong>{lang === 'en' ? 'Address saved in order:' : 'Direccion guardada en el pedido:'}</strong><span>{customerAddress || '-'}</span></div>
      <div className="eta-pro-v35-address found"><strong>{lang === 'en' ? 'Destination used for ETA:' : 'Destino usado para ETA:'}</strong><span>{hasSavedDestination ? destinationText : (lang === 'en' ? 'No validated Salamanca coordinates for this order.' : 'Este pedido no tiene coordenadas validadas de Salamanca.')}</span></div>
      {eta ? (<><div className="eta-pro-v35-grid"><div><strong>{eta}</strong><span>{lang === 'en' ? 'minutes' : 'minutos'}</span></div><div><strong>{distanceKm.toFixed(2)}</strong><span>km</span></div><div><strong>{Number(location.accuracy || 0).toFixed(0)}</strong><span>{lang === 'en' ? 'm accuracy' : 'm precision'}</span></div></div><div className="eta-pro-v35-coords">{lang === 'en' ? 'Destination:' : 'Destino:'} {customerLat?.toFixed(6)}, {customerLng?.toFixed(6)}</div>{suspiciousDistance && <div className="eta-pro-v35-warning">{lang === 'en' ? 'High distance. The saved address may be wrong or outside delivery area.' : 'Distancia alta. La direccion guardada puede ser incorrecta o estar fuera de la zona de reparto.'}</div>}</>) : (<div className="eta-pro-v35-message">{lang === 'en' ? 'ETA unavailable. The address could not be validated inside Salamanca.' : 'ETA no disponible. La direccion no pudo validarse dentro de Salamanca.'}</div>)}
    </div>
  );
}


function RouteMapV36({ location, lang = 'es' }) {
  const [route, setRoute] = useState(null);
  const [message, setMessage] = useState('');

  const riderLat = Number(location?.latitude);
  const riderLng = Number(location?.longitude);
  const customerLat = Number(location?.customer_latitude);
  const customerLng = Number(location?.customer_longitude);

  const hasRider = Number.isFinite(riderLat) && Number.isFinite(riderLng) && !(riderLat === 0 && riderLng === 0);
  const hasCustomer = Number.isFinite(customerLat) && Number.isFinite(customerLng) && !(customerLat === 0 && customerLng === 0);

  useEffect(() => {
    const loadRoute = async () => {
      setMessage('');
      setRoute(null);

      if (!hasRider || !hasCustomer) {
        setMessage(lang === 'en'
          ? 'Customer coordinates are not available for this order.'
          : 'Este pedido no tiene coordenadas del cliente.');
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${riderLng},${riderLat};${customerLng},${customerLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();

        if (data?.routes?.[0]) {
          setRoute(data.routes[0]);
        } else {
          setMessage(lang === 'en' ? 'Route not found.' : 'No se pudo calcular la ruta.');
        }
      } catch {
        setMessage(lang === 'en' ? 'Route service unavailable.' : 'Servicio de ruta no disponible.');
      }
    };

    loadRoute();
  }, [riderLat, riderLng, customerLat, customerLng, lang, hasRider, hasCustomer]);

  const km = route ? route.distance / 1000 : null;
  const minutes = route ? Math.max(1, Math.ceil(route.duration / 60)) : null;
  const routeCoords = route?.geometry?.coordinates || [];

  const leafletHtml = hasRider && hasCustomer ? `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
html, body, #map { height: 100%; margin: 0; }
.leaflet-popup-content { font-family: Arial, sans-serif; font-weight: 700; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
const rider = [${riderLat}, ${riderLng}];
const customer = [${customerLat}, ${customerLng}];
const routeCoords = ${JSON.stringify(routeCoords.map(([lng, lat]) => [lat, lng]))};

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const riderIcon = L.divIcon({
  html: '<div style="background:#22c55e;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.35)">R</div>',
  className: '',
  iconSize: [34,34],
  iconAnchor: [17,17]
});

const customerIcon = L.divIcon({
  html: '<div style="background:#f97316;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,.35)">C</div>',
  className: '',
  iconSize: [34,34],
  iconAnchor: [17,17]
});

L.marker(rider, { icon: riderIcon }).addTo(map).bindPopup('Repartidor');
L.marker(customer, { icon: customerIcon }).addTo(map).bindPopup('Cliente');

if (routeCoords.length > 0) {
  const line = L.polyline(routeCoords, { color: '#2563eb', weight: 5, opacity: 0.9 }).addTo(map);
  map.fitBounds(line.getBounds(), { padding: [35, 35] });
} else {
  map.fitBounds([rider, customer], { padding: [35, 35] });
}
</script>
</body>
</html>
` : '';

  const googleRouteUrl = hasRider && hasCustomer
    ? `https://www.google.com/maps/dir/?api=1&origin=${riderLat},${riderLng}&destination=${customerLat},${customerLng}&travelmode=driving`
    : '';

  return (
    <div className="route-v36-card">
      <div className="route-v36-header">
        <div>
          <h4>{lang === 'en' ? 'Real route to customer' : 'Ruta real hasta el cliente'}</h4>
          <p>{lang === 'en' ? 'Motorbike/car ETA using street route' : 'ETA para moto/coche usando ruta por calles'}</p>
        </div>
        {minutes && <span>{minutes} min</span>}
      </div>

      {message && <div className="route-v36-message">{message}</div>}

      {hasRider && hasCustomer && (
        <>
          <iframe className="route-v36-map" title="Real route map" srcDoc={leafletHtml} />

          <div className="route-v36-stats">
            <div><strong>{minutes ? minutes : '-'}</strong><span>{lang === 'en' ? 'minutes' : 'minutos'}</span></div>
            <div><strong>{km ? km.toFixed(2) : '-'}</strong><span>km</span></div>
            <div><strong>{Number(location?.accuracy || 0).toFixed(0)}</strong><span>{lang === 'en' ? 'm GPS accuracy' : 'm precision GPS'}</span></div>
          </div>

          <div className="route-v36-addresses">
            <div><b>Repartidor:</b> {riderLat.toFixed(6)}, {riderLng.toFixed(6)}</div>
            <div><b>Cliente:</b> {location?.customer_address || '-'} / {customerLat.toFixed(6)}, {customerLng.toFixed(6)}</div>
            {location?.customer_geocoded_address && <div><b>Destino del mapa:</b> {location.customer_geocoded_address}</div>}
          </div>

          <a className="route-v36-google" href={googleRouteUrl} target="_blank" rel="noreferrer">
            {lang === 'en' ? 'Open route in Google Maps' : 'Abrir ruta en Google Maps'}
          </a>
        </>
      )}
    </div>
  );
}
function LiveDeliveryMap({ trackingCode, phone, lang }) {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const loadLocation = async () => {
    if (!trackingCode || !phone) return;

    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, { tracking_code: trackingCode, phone });

      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || (lang === 'en' ? 'Location not available yet.' : 'Ubicación no disponible todavía.'));
      }
    } catch {
      setLocation(null);
      setMessage(lang === 'en' ? 'Could not load delivery location.' : 'No se pudo cargar la ubicación del repartidor.');
    }
  };

  useEffect(() => {
    loadLocation();
    const timer = setInterval(loadLocation, 10000);
    return () => clearInterval(timer);
  }, [trackingCode, phone]);

  return (
    <div className="live-delivery-box">
      <h3>{lang === 'en' ? 'Live delivery location' : 'Ubicación en vivo del repartidor'}</h3>
      {message && <p>{message}</p>}

      {location && (
        <>
          <p>{lang === 'en' ? 'Last update' : 'Última actualización'}: {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}</p>
          <RouteMapV36 location={location} lang={lang} />
          <EtaProBoxV35 location={location} lang={lang} />
        </>
      )}
    </div>
  );
}
function normalizeSalamancaAddressFrontend(address) {
  let raw = String(address || '').trim().replace(/\s+/g, ' ');
  if (!raw) return raw;
  const lower = raw.toLowerCase();
  const aliases = [['toro','Calle Toro'],['calle toro','Calle Toro'],['c/ toro','Calle Toro'],['rollo','Calle Rollo'],['calle rollo','Calle Rollo'],['c/ rollo','Calle Rollo'],['gran via','Gran Via'],['gran vía','Gran Via'],['calle gran via','Gran Via'],['calle gran vía','Gran Via']];
  for (const [key, value] of aliases) {
    if (lower === key || lower.startsWith(key + ' ')) {
      raw = `${value} ${raw.slice(key.length).trim()}`.trim();
      break;
    }
  }
  const lower2 = raw.toLowerCase();
  const streetWords = ['calle','c/','avenida','av.','plaza','paseo','camino','carretera','gran via','gran vía'];
  if (!streetWords.some(w => lower2.includes(w))) raw = `Calle ${raw}`;
  if (!raw.toLowerCase().includes('salamanca')) raw = `${raw}, Salamanca, España`;
  if (raw.toLowerCase().includes('calle toro') && !raw.includes('37002')) raw = raw.replace(', Salamanca', ', 37002 Salamanca');
  if (raw.toLowerCase().includes('gran via') && !raw.includes('37001')) raw = raw.replace(', Salamanca', ', 37001 Salamanca');
  return raw;
}

function CustomerPage({ lang, t }) {
  const [menu, setMenu] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ customer_name: '', customer_phone: '', customer_address: '', order_type: 'takeaway', payment_method: 'cash_delivery', notes: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [lastOrder, setLastOrder] = useState(null);
  const [successModal, setSuccessModal] = useState(null);
  const [customerAccountToken, setCustomerAccountToken] = useState(() => localStorage.getItem('customer_access_token') || '');
  const [customerAccount, setCustomerAccount] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customerAuthMode, setCustomerAuthMode] = useState('login');
  const [customerAuthForm, setCustomerAuthForm] = useState({ name: '', phone: '', address: '', password: '' });
  const [publicTrackingForm, setPublicTrackingForm] = useState({ tracking_code: '', phone: '' });
  const [publicTrackedOrder, setPublicTrackedOrder] = useState(null);
  const [publicTrackingMessage, setPublicTrackingMessage] = useState('');

  useEffect(() => {
    axios.get(`${API}/menu-items/`)
      .then(res => setMenu(res.data.filter(x => x.is_available)))
      .catch(() => setMessage(t.backendFail));
  }, []);

  const addToCart = item => {
    setCart(prev => {
      const found = prev.find(x => x.id === item.id);
      if (found) return prev.map(x => x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const increaseQty = itemId => setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item));
  const decreaseQty = itemId => setCart(prev => prev.map(item => item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item).filter(item => item.quantity > 0));
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const customerStatusLabels = {
    new: t.orderStatusNew,
    preparing: t.orderStatusPreparing,
    ready: t.orderStatusReady,
    delivered: t.orderStatusDelivered,
    cancelled: t.orderStatusCancelled,
  };

  const updateCustomerField = (field, value) => {
    setCustomer(prev => ({ ...prev, [field]: value }));
    if (value.trim()) setErrors(prev => ({ ...prev, [field]: false }));
  };

  const validateOrder = () => {
    const nextErrors = {};
    if (!customer.customer_name.trim()) nextErrors.customer_name = true;
    if (!customer.customer_phone.trim()) nextErrors.customer_phone = true;
    if (!customer.customer_address.trim()) nextErrors.customer_address = true;
    if (cart.length === 0) nextErrors.cart = true;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildWhatsAppText = (orderData, orderId) => {
    const lines = cart.map(item => {
      const name = translateMenuName(item.name, lang);
      const lineTotal = (Number(item.price) * item.quantity).toFixed(2);
      return `- ${name} x ${item.quantity}: €${lineTotal}`;
    }).join('\n');

    return [
      'Casa de Kebab Turco',
      `Pedido #${orderId}`,
      '',
      `Cliente: ${orderData.customer_name}`,
      `Teléfono: ${orderData.customer_phone}`,
      `Dirección/Mesa: ${orderData.customer_address}`,
      `Tipo: ${orderData.order_type}`,
      orderData.notes ? `Notas: ${orderData.notes}` : '',
      '',
      'Productos:',
      lines,
      '',
      `Total: €${total.toFixed(2)}`
    ].filter(Boolean).join('\n');
  };

  const openWhatsApp = (text, directUrl = null) => {
    const url = directUrl || `https://wa.me/${RESTAURANT_PHONE}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const submitRedsysForm = (redsysData) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = redsysData.action;
    form.style.display = 'none';

    ['Ds_SignatureVersion', 'Ds_MerchantParameters', 'Ds_Signature'].forEach(name => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = redsysData[name];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const submitPublicTracking = async () => {
    setPublicTrackingMessage('');
    setPublicTrackedOrder(null);
    try {
      const res = await axios.post(`${API}/track-order/`, publicTrackingForm);
      setPublicTrackedOrder(res.data);
    } catch (err) {
      setPublicTrackingMessage(t.trackingNotFound);
    }
  };

  const customerAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('customer_access_token') || customerAccountToken}` }
  });

  const loadCustomerOrders = async () => {
    const token = localStorage.getItem('customer_access_token') || customerAccountToken;
    if (!token) return;
    try {
      const profile = await axios.get(`${API}/customer/me/`, customerAuthHeaders());
      setCustomerAccount(profile.data);
      const ordersRes = await axios.get(`${API}/customer/my-orders/`, customerAuthHeaders());
      setCustomerOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const submitCustomerAuth = async () => {
    try {
      const endpoint = customerAuthMode === 'login' ? '/customer/login/' : '/customer/register/';
      const payload = customerAuthMode === 'login'
        ? { phone: customerAuthForm.phone, password: customerAuthForm.password }
        : customerAuthForm;

      const res = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem('customer_access_token', res.data.access);
      localStorage.setItem('customer_refresh_token', res.data.refresh);
      setCustomerAccountToken(res.data.access);
      setCustomerAccount(res.data.customer);
      setCustomer({
        ...customer,
        customer_name: res.data.customer?.name || customer.customer_name,
        customer_phone: res.data.customer?.phone || customer.customer_phone,
        customer_address: res.data.customer?.address || customer.customer_address,
      });
      setTimeout(loadCustomerOrders, 100);
    } catch (err) {
      setMessage(t.loginError || 'Login error');
    }
  };

  const logoutCustomerAccount = () => {
    localStorage.removeItem('customer_access_token');
    localStorage.removeItem('customer_refresh_token');
    setCustomerAccountToken('');
    setCustomerAccount(null);
    setCustomerOrders([]);
  };

  useEffect(() => {
    loadCustomerOrders();
  }, [customerAccountToken]);

  const createAndConfirmOnlinePayment = async (orderId) => {
    const created = await axios.post(`${API}/create-online-payment/`, { order_id: orderId });
    submitRedsysForm(created.data.redsys);
    return {
      order: {
        id: orderId,
        payment_status: 'pending',
        bank_transaction_id: '',
      }
    };
  };

  const submitOrder = async () => {
    if (!validateOrder()) {
      setMessage(t.completeRequiredFields);
      return;
    }

    const normalizedCustomerAddress = normalizeSalamancaAddressFrontend(customer.customer_address);

    const payload = {
      ...customer,
      customer_address: normalizedCustomerAddress,
      order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };

    try {
      const res = await axios.post(`${API}/orders/`, payload);

      let finalOrder = res.data;
      if (customer.payment_method === 'online_card') {
        const paymentResult = await createAndConfirmOnlinePayment(res.data.id);
        finalOrder = paymentResult.order;
      }

      const orderedItems = cart.map(item => ({
        id: item.id,
        name: translateMenuName(item.name, lang),
        quantity: item.quantity,
        price: Number(item.price),
        lineTotal: Number(item.price) * item.quantity,
      }));

      const whatsappText = buildWhatsAppText(customer, finalOrder.id);
      setLastOrder({
        id: finalOrder.id,
        whatsappText,
        whatsappUrl: finalOrder.whatsapp_url,
        paymentStatus: finalOrder.payment_status,
        bankTransactionId: finalOrder.bank_transaction_id,
      });

      setSuccessModal({
        id: finalOrder.id,
        trackingNumber: `CDKT-${String(finalOrder.id).padStart(6, '0')}`,
        items: orderedItems,
        total: total,
        customerName: customer.customer_name,
        customerPhone: customer.customer_phone,
        customerAddress: customer.customer_address,
        paymentStatus: finalOrder.payment_status,
        bankTransactionId: finalOrder.bank_transaction_id,
      });

      const paymentText = customer.payment_method === 'online_card' ? 'Redirigiendo a BBVA/Redsys...' : (finalOrder.payment_status === 'paid' ? t.paymentApproved : t.paymentPendingDelivery);
      setMessage(`${t.orderConfirmed}: #${finalOrder.id}. ${paymentText}${finalOrder.bank_transaction_id ? ' - TX: ' + finalOrder.bank_transaction_id : ''}`);
      setCart([]);
      setTimeout(loadCustomerOrders, 300);
      setCustomer({ customer_name: '', customer_phone: '', customer_address: '', order_type: 'takeaway', payment_method: 'cash_delivery', notes: '' });
      setErrors({});
    } catch {
      setMessage(t.orderFail);
    }
  };

  const customerCategories = Array.from(new Set(menu.map(item => item.category_name).filter(Boolean)));
  const visibleMenu = selectedCategory === 'all' ? menu : menu.filter(item => item.category_name === selectedCategory);

  return (
    <main className="grid">
      <section className="card wide">
        <h2>{t.menu}</h2>
        <div className="category-filter-bar">
          <button className={selectedCategory === 'all' ? 'active' : ''} onClick={() => setSelectedCategory('all')}>{t.allCategories}</button>
          {customerCategories.map(category => (
            <button key={category} className={selectedCategory === category ? 'active' : ''} onClick={() => setSelectedCategory(category)}>{category}</button>
          ))}
        </div>
        <div className="menu-grid">
          {visibleMenu.map(item => {
            const cartItem = cart.find(cartItem => cartItem.id === item.id);
            return (
              <div className="menu-card" key={item.id}>
                {item.image_display_url ? <img className="food-image" src={item.image_display_url} alt={translateMenuName(item.name, lang)} /> : <div className="food-placeholder">Casa Kebab</div>}
                <h3>{translateMenuName(item.name, lang)}</h3>
                <p>{translateDescription(item.description, lang)}</p>
                <strong>€{item.price}</strong>
                {cartItem ? (
                  <div className="menu-card-qty">
                    <button type="button" onClick={() => decreaseQty(item.id)}>-</button>
                    <strong>{cartItem.quantity}</strong>
                    <button type="button" onClick={() => increaseQty(item.id)}>+</button>
</div>
                ) : (
                  <button className="add-button" onClick={() => addToCart(item)}>{t.addToCart}</button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <aside className="card">
        <h2><ShoppingCart size={22}/> {t.yourOrder}</h2>
        {cart.length === 0 ? (
          <p className={errors.cart ? 'cart-empty-error' : ''}>{t.cartEmpty}</p>
        ) : (
          <div className="cart-list">
            {cart.map(item => (
              <div className="cart-row cart-row-inline" key={item.id}>
                <div className="cart-info">
                  <span className="cart-food-name">{translateMenuName(item.name, lang)}</span>
                  <b className="cart-line-price">€{(Number(item.price) * item.quantity).toFixed(2)}</b>
                </div>
                <div className="cart-inline-actions">
                  <button type="button" className="qty-btn" onClick={() => decreaseQty(item.id)}>-</button>
                  <strong className="qty-number">{item.quantity}</strong>
                  <button type="button" className="qty-btn" onClick={() => increaseQty(item.id)}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
        <h3>{t.total}: €{total.toFixed(2)}</h3>

        <div className="field-wrap">
          <input className={errors.customer_name ? 'input-error' : ''} placeholder={t.customerName} value={customer.customer_name} onChange={e => updateCustomerField('customer_name', e.target.value)}/>
          {errors.customer_name && <small className="field-error">{t.fieldRequired}</small>}
        </div>
        <div className="field-wrap">
          <input className={errors.customer_phone ? 'input-error' : ''} placeholder={t.phone} value={customer.customer_phone} onChange={e => updateCustomerField('customer_phone', e.target.value)}/>
          {errors.customer_phone && <small className="field-error">{t.fieldRequired}</small>}
        </div>
        <div className="field-wrap">
          <textarea className={errors.customer_address ? 'input-error' : ''} placeholder={t.address} value={customer.customer_address} onChange={e => updateCustomerField('customer_address', e.target.value)}/>
          {errors.customer_address && <small className="field-error">{t.fieldRequired}</small>}
        </div>
        <select value={customer.order_type} onChange={e => setCustomer({...customer, order_type: e.target.value})}>
          <option value="takeaway">{t.takeaway}</option>
          <option value="dine_in">{t.dineIn}</option>
          <option value="delivery">{t.delivery}</option>
        </select>

        <label className="payment-label">{t.paymentMethodCustomer}</label>
        <select value={customer.payment_method} onChange={e => setCustomer({...customer, payment_method: e.target.value})}>
          <option value="cash_delivery">{t.cashOnDelivery}</option>
          <option value="card_delivery">{t.cardOnDelivery}</option>
          <option value="online_card">{t.onlineCardPayment}</option>
        </select>

        <textarea placeholder={t.notes} value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})}/>
        <button className="primary" onClick={submitOrder}>{t.placeOrder}</button>
        {message && <p className="message">{message}</p>}
        {lastOrder && (
          <button className="whatsapp-order-btn" onClick={() => openWhatsApp(lastOrder.whatsappText, lastOrder.whatsappUrl)}>
            {t.sendWhatsapp}
          </button>
        )}
      </aside>

      {successModal && (
        <div className="success-modal-backdrop">
          <div className="success-modal-card">
            <button className="success-modal-close" onClick={() => setSuccessModal(null)}>×</button>

            <div className="success-icon">✓</div>
            <h2 className="success-blink">{t.successBlink}</h2>

            <div className="tracking-box">
              <span>{t.trackingNumber}</span>
              <strong>{successModal.trackingNumber}</strong>
            </div>

            <div className="success-info-grid">
              <p><b>{t.customerName}:</b> {successModal.customerName}</p>
              <p><b>{t.phone}:</b> {successModal.customerPhone}</p>
              <p><b>{t.address}:</b> {successModal.customerAddress}</p>
            </div>

            <h3>{t.orderSummary}</h3>
            <div className="success-items-list">
              {successModal.items.map(item => (
                <div className="success-item-row" key={item.id}>
                  <span>{item.name}</span>
                  <b>x{item.quantity}</b>
                  <strong>€{item.lineTotal.toFixed(2)}</strong>
                </div>
              ))}
            </div>

            <div className="success-total-row">
              <span>{t.total}</span>
              <strong>€{successModal.total.toFixed(2)}</strong>
            </div>

            <div className="success-thank-you">{t.thankYouOrder}</div>

            <button className="primary full" onClick={() => setSuccessModal(null)}>{t.close}</button>
          </div>
        </div>
      )}


      
          <RestaurantLocationCard />
    </main>
  );
}


function TrackingPage({ t }) {
  const [publicTrackingForm, setPublicTrackingForm] = useState({ tracking_code: '', phone: '' });
  const [publicTrackedOrder, setPublicTrackedOrder] = useState(null);
  const [publicTrackingMessage, setPublicTrackingMessage] = useState('');

  const customerStatusLabels = {
    new: t.orderStatusNew,
    preparing: t.orderStatusPreparing,
    ready: t.orderStatusReady,
    delivered: t.orderStatusDelivered,
    cancelled: t.orderStatusCancelled,
  };

  const submitPublicTracking = async () => {
    setPublicTrackingMessage('');
    setPublicTrackedOrder(null);

    try {
      const res = await axios.post(`${API}/track-order/`, publicTrackingForm);

      if (res.data?.hidden) {
        setPublicTrackingMessage(t.orderDeliveredHidden);
        return;
      }

      setPublicTrackedOrder(res.data);
    } catch (err) {
      setPublicTrackingMessage(t.trackingNotFound);
    }
  };

  return (
    <main className="tracking-page-wrap">
      <section className="card customer-account-panel tracking-tab-card">
        <div className="section-header">
          <h2>{t.orderTracking}</h2>
        </div>

        <div className="customer-auth-box public-tracking-box">
          <p>{t.trackingHelp}</p>
          <input
            placeholder={t.trackingCodePlaceholder}
            value={publicTrackingForm.tracking_code}
            onChange={e => setPublicTrackingForm({...publicTrackingForm, tracking_code: e.target.value})}
          />
          <input
            placeholder={t.phone}
            value={publicTrackingForm.phone}
            onChange={e => setPublicTrackingForm({...publicTrackingForm, phone: e.target.value})}
          />
          <button className="primary" onClick={submitPublicTracking}>{t.trackOrderButton}</button>
          {publicTrackingMessage && <p className="message danger">{publicTrackingMessage}</p>}
        </div>

        {publicTrackedOrder && (
          <div className="customer-order-list public-tracking-result">
            <div className={`customer-order-track-card status-${publicTrackedOrder.status}`}>
              <div className="customer-order-top">
                <strong>CDKT-{String(publicTrackedOrder.id).padStart(6, '0')}</strong>
                <span>{customerStatusLabels?.[publicTrackedOrder.status] || publicTrackedOrder.status}</span>
              </div>
              <p>{new Date(publicTrackedOrder.created_at).toLocaleString()}</p>
              <p><b>{t.customerName}:</b> {publicTrackedOrder.customer_name}</p>
              <p><b>{t.phone}:</b> {publicTrackedOrder.customer_phone}</p>
              <p><b>{t.address}:</b> {publicTrackedOrder.customer_address}</p>
              <p><b>{t.paymentMethodCustomer}:</b> {publicTrackedOrder.payment_method}</p>
              <p><b>{t.paymentStatusLabel}:</b> {publicTrackedOrder.payment_status}</p>

              <div className="tracking-progress">
                <div className={['new','preparing','ready'].includes(publicTrackedOrder.status) ? 'done' : ''}>1</div>
                <div className={['preparing','ready'].includes(publicTrackedOrder.status) ? 'done' : ''}>2</div>
                <div className={['ready'].includes(publicTrackedOrder.status) ? 'done' : ''}>3</div>
              </div>

              <div className="tracking-labels tracking-labels-three">
                <span>{t.orderStatusNew}</span>
                <span>{t.orderStatusPreparing}</span>
                <span>{t.orderStatusReady}</span>
              </div>

              <div className="customer-order-items">
                {publicTrackedOrder.items?.map(item => <span key={item.id}>{item.menu_item_name} x {item.quantity}</span>)}
              </div>
              {String(publicTrackedOrder.status || '').toLowerCase() === 'out_for_delivery' && (
                <LiveDeliveryMap
                  trackingCode={publicTrackedOrder.tracking_code || publicTrackingForm.tracking_code}
                  phone={publicTrackedOrder.customer_phone || publicTrackingForm.phone}
                  lang="es"
                />
              )}

              <b>€{Number(publicTrackedOrder.total_amount || 0).toFixed(2)}</b>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}




function CustomerCRMPanelV40({ t }) {
  const [overview, setOverview] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [message, setMessage] = useState('');

  const money = (value) => `€${Number(value || 0).toFixed(2)}`;

  const loadOverview = async () => {
    setMessage('');
    try {
      const res = await api.get('/customers/crm-overview/');
      setOverview(res.data);
    } catch {
      setMessage('No se pudo cargar CRM profesional. Revisa backend, urls.py y login admin.');
    }
  };

  const loadCustomerDetail = async (id) => {
    setMessage('');
    try {
      const res = await api.get(`/customers/${id}/crm-detail/`);
      setSelectedCustomer(res.data);
    } catch {
      setMessage('No se pudo cargar detalle del cliente.');
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const customers = overview?.customers || [];

  const filtered = customers.filter(c => {
    const q = search.trim().toLowerCase();
    const phoneDigits = String(c.phone || '').replace(/\D/g, '');
    const queryDigits = q.replace(/\D/g, '');

    const matchesSearch = !q || (
      String(c.name || '').toLowerCase().includes(q) ||
      String(c.phone || '').toLowerCase().includes(q) ||
      phoneDigits.includes(queryDigits) ||
      String(c.address || '').toLowerCase().includes(q) ||
      String(c.top_food || '').toLowerCase().includes(q) ||
      String(c.tier_label || '').toLowerCase().includes(q) ||
      String(c.rank || '').includes(q)
    );

    const matchesTier = tierFilter === 'all' || String(c.tier || '').toLowerCase() === tierFilter;

    return matchesSearch && matchesTier;
  });

  const whatsappMessage = selectedCustomer
    ? encodeURIComponent(`Hola ${selectedCustomer.name}, somos Casa de Kebab Turco. Eres cliente ${selectedCustomer.tier_label || ''}. Tenemos una promoción especial para ti.`)
    : '';

  return (
    <section className="crm-v41-card">
      <div className="crm-v41-header">
        <div>
          <h2>CRM profesional de clientes</h2>
          <p>Ranking automático: Top 10 oro, siguientes 10 plata, siguientes 10 bronce.</p>
        </div>
        <button onClick={loadOverview}>Actualizar CRM</button>
      </div>

      {message && <div className="message danger">{message}</div>}

      {overview && (
        <>
          <div className="crm-v41-stats">
            <div className="gold"><span>VIP / طلایی</span><strong>{overview.vip_count || 0}</strong><small>Top 10 clientes</small></div>
            <div className="silver"><span>نقره‌ای</span><strong>{overview.silver_count || 0}</strong><small>Ranking 11-20</small></div>
            <div className="bronze"><span>برنزی</span><strong>{overview.bronze_count || 0}</strong><small>Ranking 21-30</small></div>
            <div><span>Total clientes</span><strong>{overview.total_customers || 0}</strong><small>{overview.inactive_count || 0} inactivos</small></div>
          </div>

          <div className="crm-v41-search">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por teléfono, nombre, dirección, comida favorita, ranking..."
            />
            <select value={tierFilter} onChange={e => setTierFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="vip">VIP / طلایی</option>
              <option value="silver">نقره‌ای</option>
              <option value="bronze">برنزی</option>
              <option value="normal">معمولی</option>
            </select>
            <span>{filtered.length} / {customers.length}</span>
          </div>

          <div className="crm-v41-layout">
            <div className="crm-v41-list">
              <h3>Ranking clientes</h3>
              {filtered.map(customer => (
                <button
                  key={customer.id}
                  className={`crm-v41-customer ${customer.tier_color || 'normal'} ${selectedCustomer?.id === customer.id ? 'active' : ''}`}
                  onClick={() => loadCustomerDetail(customer.id)}
                >
                  <div className="crm-v41-rank">
                    <b>{customer.tier_icon || '??'} #{customer.rank}</b>
                    <span>{customer.tier_label || 'معمولی'}</span>
                  </div>
                  <div className="crm-v41-customer-main">
                    <strong>{customer.name || '-'}</strong>
                    <span>{customer.phone}</span>
                    <small>{customer.total_orders} pedidos - {money(customer.total_spent)}</small>
                    {customer.top_food && <em>Favorito: {customer.top_food} ({customer.top_food_quantity})</em>}
                  </div>
                </button>
              ))}
            </div>

            <div className="crm-v41-detail">
              {!selectedCustomer ? (
                <div className="crm-v41-empty">
                  Selecciona un cliente para ver nivel, historial, comida favorita y acciones.
                </div>
              ) : (
                <>
                  <div className={`crm-v41-profile ${selectedCustomer.tier_color || 'normal'}`}>
                    <div>
                      <span className="crm-v41-tier">
                        {selectedCustomer.tier_icon} {selectedCustomer.tier_label} #{selectedCustomer.rank}
                      </span>
                      <h3>{selectedCustomer.name}</h3>
                      <p>{selectedCustomer.phone}</p>
                      <p>{selectedCustomer.address || '-'}</p>
                    </div>
                    <strong>{money(selectedCustomer.total_spent)}</strong>
                  </div>

                  <div className="crm-v41-mini">
                    <div><span>Pedidos</span><strong>{selectedCustomer.total_orders}</strong></div>
                    <div><span>Total gastado</span><strong>{money(selectedCustomer.total_spent)}</strong></div>
                    <div><span>Ticket medio</span><strong>{money(selectedCustomer.avg_order)}</strong></div>
                    <div><span>Comida favorita</span><strong>{selectedCustomer.top_food || '-'}</strong></div>
                  </div>

                  <div className="crm-v41-actions">
                    <a href={`tel:${selectedCustomer.phone}`}>Llamar</a>
                    <a
                      href={`https://wa.me/${String(selectedCustomer.phone || '').replace(/\D/g, '')}?text=${whatsappMessage}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      WhatsApp
                    </a>
                  </div>

                  <div className="crm-v41-suggestions">
                    <h4>Sugerencias inteligentes</h4>
                    {selectedCustomer.discount_hint && <p>{selectedCustomer.discount_hint}</p>}
                    {selectedCustomer.suggestions?.map((item, idx) => <p key={idx}>{item}</p>)}
                  </div>

                  <div className="crm-v41-orders">
                    <h4>Últimos pedidos</h4>
                    {selectedCustomer.recent_orders?.map(order => (
                      <div key={order.id} className="crm-v41-order">
                        <div>
                          <strong>#{order.id}</strong>
                          <span>{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <b>{money(order.total_amount)}</b>
                        <small>{order.status} - {order.payment_status}</small>
                        <ul>
                          {order.items?.map((item, idx) => (
                            <li key={idx}>{item.name} x {item.quantity}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}




function RestaurantSettingsAdminV43({ lang, restaurantSettings, setRestaurantSettings }) {
  const [form, setForm] = useState({
    name: restaurantSettings?.name || 'Casa de Kebab Turco',
    phone: restaurantSettings?.phone || '+34 613 473 564',
    subtitle_es: restaurantSettings?.subtitle_es || 'Kebab fresco, pedidos rápidos, auténtico sabor turco',
    subtitle_en: restaurantSettings?.subtitle_en || 'Fresh kebab, fast orders, authentic Turkish taste',
    address: restaurantSettings?.address || 'Calle García Lorca, 1, 37004 Salamanca, España',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (restaurantSettings) setForm({
      name: restaurantSettings.name || '',
      phone: restaurantSettings.phone || '',
      subtitle_es: restaurantSettings.subtitle_es || '',
      subtitle_en: restaurantSettings.subtitle_en || '',
      address: restaurantSettings.address || '',
    });
  }, [restaurantSettings]);

  const saveSettings = async () => {
    try {
      const res = await api.put('/restaurant-settings/', form);
      setRestaurantSettings(res.data);
      setMessage(lang === 'en' ? 'Saved.' : 'Guardado.');
    } catch {
      setMessage(lang === 'en' ? 'Could not save.' : 'No se pudo guardar.');
    }
  };

  return (
    <section className="restaurant-settings-v43">
      <h2>{lang === 'en' ? 'Restaurant information' : 'Información del restaurante'}</h2>
      {message && <div className="restaurant-settings-message">{message}</div>}
      <div className="restaurant-settings-grid">
        <label>{lang === 'en' ? 'Restaurant name' : 'Nombre'}<input value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></label>
        <label>{lang === 'en' ? 'Phone' : 'Teléfono'}<input value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} /></label>
        <label>{lang === 'en' ? 'Spanish text' : 'Texto español'}<input value={form.subtitle_es} onChange={e => setForm({...form, subtitle_es:e.target.value})} /></label>
        <label>{lang === 'en' ? 'English text' : 'Texto inglés'}<input value={form.subtitle_en} onChange={e => setForm({...form, subtitle_en:e.target.value})} /></label>
        <label className="wide">{lang === 'en' ? 'Address' : 'Dirección'}<input value={form.address} onChange={e => setForm({...form, address:e.target.value})} /></label>
      </div>
      <button onClick={saveSettings}>{lang === 'en' ? 'Save changes' : 'Guardar cambios'}</button>
    </section>
  );
}

function AdminPage({ t, currentUser }) {
  const role = currentUser?.role || 'admin';
  const canManageMenu = role === 'admin';
  const canManageInventory = role === 'admin';
  const canPrint = ['admin', 'cashier'].includes(role);
  const [adminTab, setAdminTab] = useState('live');

  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newInventory, setNewInventory] = useState({ name: '', unit: 'unit', current_stock: '', minimum_stock: '', unit_cost: '' });
  const [food, setFood] = useState({ name: '', description: '', price: '', category: 1, is_available: true, preparation_minutes: 10, imageFile: null, preview: '' });
  const [foodFormKey, setFoodFormKey] = useState(0);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editFoodForm, setEditFoodForm] = useState({});
  const [message, setMessage] = useState('');
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [lastOrderIds, setLastOrderIds] = useState([]);
  const [newOrderIds, setNewOrderIds] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('order_sound_enabled') === 'true');
  const [filters, setFilters] = useState({ search: '', status: 'all' });
  const [cashierSummary, setCashierSummary] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ order: '', method: 'cash', amount: '', discount_amount: '0', debt_amount: '0', notes: '' });
  const [cashForm, setCashForm] = useState({ opening_cash: '', closing_cash: '', notes: '' });

  const statusLabels = {
    new: t.orderStatusNew,
    preparing: t.orderStatusPreparing,
    ready: t.orderStatusReady,
    delivered: t.orderStatusDelivered,
    cancelled: t.orderStatusCancelled,
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash_delivery: t.cashDeliveryLabel,
      card_delivery: t.cardDeliveryLabel,
      online_card: t.onlineCardLabel,
      mixed: t.mixedPaymentLabel,
      cash: t.cash,
      card: t.card,
      debt: t.debt,
    };
    return labels[method] || method || '-';
  };

  const getPaymentStatusLabel = (status) => {
    const labels = {
      paid: t.paidLabel,
      pending: t.pendingLabel,
      pay_on_delivery: t.payOnDeliveryLabel,
      failed: t.failedLabel,
      cancelled: t.orderStatusCancelled,
    };
    return labels[status] || status || '-';
  };

  const getPaymentStatusClass = (status) => {
    if (status === 'paid') return 'payment-paid';
    if (status === 'failed') return 'payment-failed';
    if (status === 'pay_on_delivery') return 'payment-delivery';
    return 'payment-pending';
  };

  const playToneSequence = (force = false) => {
    const enabled = force || localStorage.getItem('order_sound_enabled') === 'true';
    if (!enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const playTone = (frequency, startTime, duration) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration + 0.05);
      };
      const now = ctx.currentTime;
      playTone(880, now, 0.2);
      playTone(1175, now + 0.27, 0.2);
      playTone(880, now + 0.54, 0.25);
      setTimeout(() => ctx.close(), 1100);
    } catch (err) {
      console.error(err);
    }
  };

  const enableSoundAlert = () => {
    const nextValue = !soundEnabled;
    setSoundEnabled(nextValue);
    localStorage.setItem('order_sound_enabled', String(nextValue));
    if (nextValue) setTimeout(() => playToneSequence(true), 80);
  };

  const loadAll = async () => {
    try {
      const ord = await api.get('/orders/');
      const currentIds = ord.data.map(order => order.id);
      const detectedNewIds = lastOrderIds.length > 0 ? currentIds.filter(id => !lastOrderIds.includes(id)) : [];
      if (detectedNewIds.length > 0) {
        setNewOrderIds(detectedNewIds);
        setNewOrdersCount(prev => prev + detectedNewIds.length);
        playToneSequence(false);
        setTimeout(() => setNewOrderIds([]), 5000);
      }
      setLastOrderIds(currentIds);
      setOrders(ord.data);
    } catch (err) {
      console.error(err);
      setMessage(t.backendFail);
    }

    try {
      const cus = await api.get('/customers/');
      setCustomers(cus.data);
    } catch (err) {
      console.error(err);
    }

    try {
      const men = await api.get('/menu-items/');
      setMenu(men.data);
    } catch (err) {
      console.error(err);
    }

    try {
      const cat = await api.get('/categories/');
      setCategories(cat.data);
      if (cat.data.length) setFood(prev => ({ ...prev, category: prev.category || cat.data[0].id }));
    } catch (err) {
      console.error(err);
    }

    if (canManageInventory) {
      try {
        const inv = await api.get('/inventory-items/');
        setInventory(inv.data);
      } catch (err) {
        console.error(err);
      }
    }
    try { setCashierSummary((await api.get('/cashier-summary/')).data); } catch (err) { console.error(err); }
    try { setProfitLoss((await api.get('/profit-loss-summary/')).data); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 5000);

  return () => clearInterval(timer);
  }, [lastOrderIds.join(','), soundEnabled, role]);

  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayOrdersList = orders.filter(order => new Date(order.created_at).toDateString() === today && order.status !== 'cancelled');
    const todaySales = todayOrdersList.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const activeCount = orders.filter(order => ['new', 'preparing', 'ready'].includes(order.status)).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthOrders = orders.filter(order => {
      const d = new Date(order.created_at);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && order.status !== 'cancelled';
    });
    const monthIncome = monthOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

    const foodCounter = {};
    orders.forEach(order => (order.items || []).forEach(item => {
      foodCounter[item.menu_item_name] = (foodCounter[item.menu_item_name] || 0) + item.quantity;
    }));
    const topFood = Object.entries(foodCounter).sort((a,b) => b[1]-a[1])[0]?.[0] || '-';

    return { todayOrders: todayOrdersList.length, todaySales, activeCount, monthIncome, topFood };
  }, [orders]);

  const updateOrderStatus = async (order, status) => {
    await api.patch(`/orders/${order.id}/`, { status });
    loadAll();
  };

  const printReceipt = (order) => {
    const itemsHtml = (order.items || []).map(item => `
      <tr><td>${item.menu_item_name}</td><td style="text-align:center">${item.quantity}</td><td style="text-align:right">€${Number(item.line_total || 0).toFixed(2)}</td></tr>
    `).join('');

    const receiptWindow = window.open('', '_blank', 'width=420,height=700');
    receiptWindow.document.write(`
      <html><head><title>Receipt #${order.id}</title><style>
      body{font-family:Arial,sans-serif;width:300px;margin:0 auto;padding:12px;color:#111}
      h1{font-size:20px;text-align:center;margin:0 0 4px}.sub{text-align:center;font-size:12px;margin-bottom:8px}
      .line{border-top:1px dashed #333;margin:10px 0}p{margin:4px 0;font-size:13px}
      table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:5px 0;border-bottom:1px dotted #ccc}
      .total{font-size:18px;font-weight:bold;text-align:right;margin-top:10px}.thanks{text-align:center;margin-top:14px;font-size:13px}
      @media print{button{display:none}body{width:280px}}
      </style></head><body>
      <div style="text-align:center"><img src="${restaurantLogo}" style="width:120px;height:auto;margin-bottom:8px;" /></div>
      <h1>Casa de Kebab Turco</h1><div class="sub">Kebab fresco, auténtico sabor turco</div><div class="sub">NIF: B45872195</div>
      <div class="line"></div>
      <p><b>Pedido:</b> #${order.id}</p><p><b>Cliente:</b> ${order.customer_name || '-'}</p><p><b>Teléfono:</b> ${order.customer_phone || '-'}</p>
      <p><b>Dirección/Mesa:</b> ${order.customer_address || '-'}</p><p><b>Tipo:</b> ${order.order_type || '-'}</p><p><b>Estado:</b> ${order.status || '-'}</p>
      <p><b>Fecha pedido:</b> ${new Date(order.created_at).toLocaleString()}</p><p><b>Impreso:</b> ${new Date().toLocaleString()}</p><div class="line"></div>
      <table><thead><tr><th style="text-align:left">Producto</th><th>Cant.</th><th style="text-align:right">Total</th></tr></thead><tbody>${itemsHtml}</tbody></table>
      <div class="total">TOTAL: €${Number(order.total_amount || 0).toFixed(2)}</div>
      <div style="text-align:center;margin-top:12px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Casa%20de%20Kebab%20Turco%20Pedido%20${order.id}" style="width:100px;height:100px;" /></div>
      <div class="line"></div><div class="thanks">Gracias por su compra</div><br/><button onclick="window.print()">Imprimir</button>
      </body></html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    setTimeout(() => receiptWindow.print(), 350);
  };

  const createCategory = async () => {
    if (!newCategory.trim()) return;
    await api.post('/categories/', { name: newCategory.trim(), description: '', is_active: true });
    setNewCategory('');
    loadAll();
  };

  const createInventoryItem = async () => {
    if (!newInventory.name || !newInventory.current_stock) return;
    await api.post('/inventory-items/', {
      name: newInventory.name,
      unit: newInventory.unit,
      current_stock: Number(newInventory.current_stock || 0),
      minimum_stock: Number(newInventory.minimum_stock || 0),
      unit_cost: Number(newInventory.unit_cost || 0),
      is_active: true,
    });
    setNewInventory({ name: '', unit: 'unit', current_stock: '', minimum_stock: '', unit_cost: '' });
    loadAll();
  };

  const updateInventoryStock = async (item, patch) => {
    await api.patch(`/inventory-items/${item.id}/`, patch);
    loadAll();
  };

  const createFood = async () => {
    if (!food.name || !food.price || !food.category) return;
    const formData = new FormData();
    formData.append('name', food.name);
    formData.append('description', food.description || '');
    formData.append('price', String(food.price));
    formData.append('category', String(food.category));
    formData.append('is_available', food.is_available ? 'true' : 'false');
    formData.append('preparation_minutes', String(food.preparation_minutes || 10));
    if (food.imageFile) formData.append('image', food.imageFile);
    await api.post('/menu-items/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setFood({ name: '', description: '', price: '', category: categories[0]?.id || 1, is_available: true, preparation_minutes: 10, imageFile: null, preview: '' });
    setFoodFormKey(prev => prev + 1);
    loadAll();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFood({...food, imageFile: file, preview: URL.createObjectURL(file)});
  };

  const updateFood = async (item, patch) => {
    await api.patch(`/menu-items/${item.id}/`, patch);
    loadAll();
  };

  const startEditFood = (item) => {
    setEditingFoodId(item.id);
    setEditFoodForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: item.category || categories[0]?.id || '',
      is_available: item.is_available,
      imageFile: null,
      preview: item.image_display_url || '',
    });
  };

  const cancelEditFood = () => {
    setEditingFoodId(null);
    setEditFoodForm({});
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditFoodForm(prev => ({
      ...prev,
      imageFile: file,
      preview: URL.createObjectURL(file),
    }));
  };

  const submitEditFood = async (item) => {
    const formData = new FormData();
    formData.append('name', editFoodForm.name || item.name);
    formData.append('description', (editFoodForm.description || editFoodForm.name || item.name || 'Sin descripción').trim());
    formData.append('price', String(editFoodForm.price || item.price));
    formData.append('category', String(editFoodForm.category || item.category));
    formData.append('is_available', editFoodForm.is_available ? 'true' : 'false');
    formData.append('preparation_minutes', String(item.preparation_minutes || 10));

    if (editFoodForm.imageFile) {
      formData.append('image', editFoodForm.imageFile);
    }

    await api.patch(`/menu-items/${item.id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    setEditingFoodId(null);
    setEditFoodForm({});
    loadAll();
  };

  const deleteFood = async (item) => {
    const ok = window.confirm(`${t.deleteFood}: ${item.name}?`);
    if (!ok) return;
    await api.delete(`/menu-items/${item.id}/`);
    setMenu(prev => prev.filter(food => food.id !== item.id));
  };

  const openCashRegister = async () => {
    if (!cashForm.opening_cash) return;
    await api.post('/cash-register-sessions/', { opening_cash: Number(cashForm.opening_cash), closing_cash: 0, notes: cashForm.notes || '', is_closed: false });
    setCashForm({ opening_cash: '', closing_cash: '', notes: '' });
    loadAll();
  };

  const closeCashRegister = async () => {
    if (!cashierSummary?.open_session || !cashForm.closing_cash) return;
    await api.post('/close-cash-register/', { session_id: cashierSummary.open_session.id, closing_cash: Number(cashForm.closing_cash), notes: cashForm.notes || '' });
    setCashForm({ opening_cash: '', closing_cash: '', notes: '' });
    loadAll();
  };

  const registerPayment = async () => {
    if (!paymentForm.order || !paymentForm.amount) return;
    await api.post('/payments/', { order: Number(paymentForm.order), method: paymentForm.method, amount: Number(paymentForm.amount || 0), discount_amount: Number(paymentForm.discount_amount || 0), debt_amount: Number(paymentForm.debt_amount || 0), notes: paymentForm.notes || '' });
    setPaymentForm({ order: '', method: 'cash', amount: '', discount_amount: '0', debt_amount: '0', notes: '' });
    loadAll();
  };

  const filteredOrders = orders.filter(order => {
    const searchText = `${order.id} ${order.customer_name} ${order.customer_phone} ${order.customer_address}`.toLowerCase();
    const matchesSearch = searchText.includes((filters.search || '').toLowerCase());
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  const activeOrders = orders.filter(order => ['new', 'preparing', 'ready'].includes(order.status));

  return (
    <main className="stack">
      <RestaurantSettingsAdminV43 lang={lang} restaurantSettings={restaurantSettings} setRestaurantSettings={setRestaurantSettings} />
      <section className="admin-title">
        <div>
          <h2>{t.liveManagement}</h2>
          <p>{t.adminHelp}</p>
          <span className="role-badge">{t.role}: {role}</span>
          <FancyDateTime lang={document.documentElement.lang || "es"} compact/>
        </div>
        <div className="admin-actions">
          <button onClick={enableSoundAlert} className={soundEnabled ? 'sound-on' : 'sound-off'}>{soundEnabled ? t.soundOn : t.soundOff}</button>
          <button onClick={() => playToneSequence(true)}>{t.testSound}</button>
          <button onClick={loadAll}><RefreshCw size={18}/> {t.refresh}</button>
        </div>
      </section>

      <section className="admin-tabs-shell">
        <div className="admin-tabs-title">{t.adminTabs}</div>
        <div className="admin-tabs-bar">
          <button className={adminTab === 'live' ? 'active' : ''} onClick={() => setAdminTab('live')}>{t.tabLive}</button>
          {role === 'admin' && <button className={adminTab === 'riders' ? 'active' : ''} onClick={() => setAdminTab('riders')}>{t.tabRiders || 'Repartidores'}</button>}
          {(role === 'admin' || role === 'cashier') && <button className={adminTab === 'cashier' ? 'active' : ''} onClick={() => setAdminTab('cashier')}>{t.tabCashier}</button>}
          {role === 'admin' && <button className={adminTab === 'customers' ? 'active' : ''} onClick={() => setAdminTab('customers')}>{t.tabCustomers}</button>}
          {canManageInventory && <button className={adminTab === 'inventory' ? 'active' : ''} onClick={() => setAdminTab('inventory')}>{t.tabInventory}</button>}
          {canManageMenu && <button className={adminTab === 'menu' ? 'active' : ''} onClick={() => setAdminTab('menu')}>{t.tabMenu}</button>}
          <button className={adminTab === 'history' ? 'active' : ''} onClick={() => setAdminTab('history')}>{t.tabHistory}</button>
        </div>
      </section>

      {adminTab !== 'live' && activeOrders.length > 0 && (
        <section className="admin-live-mini">
          <div>
            <strong>{t.activeOrders}</strong>
            <span>{activeOrders.length} LIVE</span>
          </div>
          <button onClick={() => setAdminTab('live')}>{t.tabLive}</button>
        </section>
      )}

      {newOrderIds.length > 0 && (
        <div className="new-order-banner"><BellRing size={20}/>{t.newOrderAlert}<span className="new-count-badge">+{newOrderIds.length}</span></div>
      )}

      <section className="stats">
        <div className="stat"><LayoutDashboard/><span>{t.todayOrders}</span><b>{todayStats.todayOrders}</b></div>
        <div className="stat"><span>{t.todaySales}</span><b>€{todayStats.todaySales.toFixed(2)}</b></div>
        <div className="stat"><span>{t.activeOrders}</span><b>{todayStats.activeCount}</b></div>
        <div className="stat"><span>{t.topFood}</span><b>{todayStats.topFood}</b></div>
        <div className="stat"><span>{t.monthIncome}</span><b>€{todayStats.monthIncome.toFixed(2)}</b></div>
        <div className="stat stat-alert"><span>{t.newOrdersCount}</span><b>{newOrdersCount}</b></div>
      </section>

      {(role === 'admin' || role === 'cashier') && adminTab === 'cashier' && (
        <section className="card admin-3d-card cashier-panel">
          <h2>{t.cashierPanel}</h2>
          <div className="stats cashier-stats">
            <div className="stat"><span>{t.cash}</span><b>€{Number(cashierSummary?.cash_total || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.card}</span><b>€{Number(cashierSummary?.card_total || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.debt}</span><b>€{Number(cashierSummary?.debt_total || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.discount}</span><b>€{Number(cashierSummary?.discount_total || 0).toFixed(2)}</b></div>
          </div>
          <div className="cashier-grid">
            <div className="cashier-box">
              <h3>{t.registerPayment}</h3>
              <select value={paymentForm.order} onChange={e => setPaymentForm({...paymentForm, order: e.target.value})}>
                <option value="">Order</option>
                {orders.map(order => <option key={order.id} value={order.id}>#{order.id} - {order.customer_name} - €{order.total_amount}</option>)}
              </select>
              <select value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}>
                <option value="cash">{t.cash}</option><option value="card">{t.card}</option><option value="debt">{t.debt}</option><option value="mixed">Mixed</option>
              </select>
              <input type="number" placeholder="Amount" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}/>
              <input type="number" placeholder={t.discount} value={paymentForm.discount_amount} onChange={e => setPaymentForm({...paymentForm, discount_amount: e.target.value})}/>
              <input type="number" placeholder={t.debt} value={paymentForm.debt_amount} onChange={e => setPaymentForm({...paymentForm, debt_amount: e.target.value})}/>
              <button className="primary" onClick={registerPayment}>{t.registerPayment}</button>
            </div>
            <div className="cashier-box">
              <h3>{cashierSummary?.open_session ? t.closeCash : t.openCash}</h3>
              {!cashierSummary?.open_session ? (
                <><input type="number" placeholder={t.openingCash} value={cashForm.opening_cash} onChange={e => setCashForm({...cashForm, opening_cash: e.target.value})}/><button className="primary" onClick={openCashRegister}>{t.openCash}</button></>
              ) : (
                <><p>Session #{cashierSummary.open_session.id}</p><input type="number" placeholder={t.closingCash} value={cashForm.closing_cash} onChange={e => setCashForm({...cashForm, closing_cash: e.target.value})}/><button className="primary" onClick={closeCashRegister}>{t.closeCash}</button></>
              )}
            </div>
          </div>
        </section>
      )}

      {role === 'admin' && adminTab === 'cashier' && (
        <section className="card admin-3d-card profit-panel">
          <h2>{t.profitLoss}</h2>
          <div className="stats">
            <div className="stat"><span>{t.todaySales}</span><b>€{Number(profitLoss?.sales_total || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.materialCost}</span><b>€{Number(profitLoss?.material_cost || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.grossProfit}</span><b>€{Number(profitLoss?.gross_profit || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.dailyExpenses}</span><b>€{Number(profitLoss?.daily_expenses || 0).toFixed(2)}</b></div>
            <div className="stat"><span>{t.netProfit}</span><b>€{Number(profitLoss?.net_profit || 0).toFixed(2)}</b></div>
          </div>
        </section>
      )}

      {role === 'admin' && adminTab === 'customers' && (
        <section className="card admin-3d-card customers-panel">
          <CustomerCRMPanelV40 t={t} />
            <h2>{t.customerDatabase}</h2>
            <div className="customer-search-v39">
              <input
                value={customerSearch}
                onChange={e => setCustomerSearch(e.target.value)}
                placeholder="Buscar cliente por teléfono, nombre, dirección o comida favorita"
              />
              <span>{(customers.filter(customer => {
                  const q = customerSearch.trim().toLowerCase();
                  if (!q) return true;
                  const phoneDigits = String(customer.phone || '').replace(/\D/g, '');
                  const queryDigits = q.replace(/\D/g, '');
                  return (
                    String(customer.name || '').toLowerCase().includes(q) ||
                    String(customer.phone || '').toLowerCase().includes(q) ||
                    phoneDigits.includes(queryDigits) ||
                    String(customer.address || '').toLowerCase().includes(q) ||
                    String(customer.top_food || '').toLowerCase().includes(q)
                  );
                })).length} / {customers.length}</span>
            </div>
          <div className="customers-summary">
            <div className="stat"><span>{t.customers}</span><b>{customers.length}</b></div>
            <div className="stat"><span>{t.customerRepeat}</span><b>{customers.filter(c => c.total_orders > 1).length}</b></div>
          </div>

          <div className="customers-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.customerName}</th>
                  <th>{t.phone}</th>
                  <th>{t.address}</th>
                  <th>{t.todayOrders}</th>
                  <th>{t.totalSpent}</th>
                  <th>Comida favorita</th>
                  <th>{t.lastOrder}</th>
                </tr>
              </thead>
              <tbody>
                {customers.filter(customer => {
                  const q = customerSearch.trim().toLowerCase();
                  if (!q) return true;
                  const phoneDigits = String(customer.phone || '').replace(/\D/g, '');
                  const queryDigits = q.replace(/\D/g, '');
                  return (
                    String(customer.name || '').toLowerCase().includes(q) ||
                    String(customer.phone || '').toLowerCase().includes(q) ||
                    phoneDigits.includes(queryDigits) ||
                    String(customer.address || '').toLowerCase().includes(q) ||
                    String(customer.top_food || '').toLowerCase().includes(q)
                  );
                }).map(customer => (
                  <tr key={customer.id} className={customer.total_orders > 1 ? 'returning-customer-row' : ''}>
                    <td><b>{customer.name}</b></td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td>{customer.total_orders}</td>
                    <td>€{Number(customer.total_spent || 0).toFixed(2)}</td>
                    <td>{customer.top_food ? `${customer.top_food} (${customer.top_food_quantity || 0})` : '-'}</td>
                    <td>{customer.last_order_at ? new Date(customer.last_order_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adminTab === 'live' && (
      <>
        <section className="card live-orders-section">
        <div className="section-header"><h2><Flame size={22}/> {t.activeOrders}</h2><span className="live-dot">LIVE</span></div>
        <div className="live-orders-grid">
          {activeOrders.map(order => (
            <article className={`live-order-card status-${order.status} ${newOrderIds.includes(order.id) ? 'new-blink-card' : ''}`} key={order.id}>
              <div className="kitchen-card-top">
                <h3>#{order.id} - {order.customer_name}</h3>
                <span className={`status-pill status-${order.status}`}>{statusLabels[order.status] || order.status}</span>
              </div>
              <div className="order-created-time">🕒 {new Date(order.created_at).toLocaleString()}</div>
              <p><b>{t.type}:</b> {order.order_type}</p>
              <p><b>{t.phone}:</b> {order.customer_phone}</p>
              {order.customer_address && <p><b>{t.address}:</b> {order.customer_address}</p>}
              <div className={`payment-info-box ${getPaymentStatusClass(order.payment_status)}`}>
                <div>
                  <span>{t.paymentMethodCustomer}</span>
                  <b>{getPaymentMethodLabel(order.payment_method)}</b>
                </div>
                <div>
                  <span>{t.paymentStatusLabel}</span>
                  <b>{getPaymentStatusLabel(order.payment_status)}</b>
                </div>
              </div>
              <div className="kitchen-items">
                <b>{t.orderItems}</b>
                {order.items?.map(item => <div key={item.id} className="kitchen-item-row"><span>{item.menu_item_name}</span><strong>x {item.quantity}</strong></div>)}
              </div>
              <div className="quick-status-actions">
                <button onClick={() => updateOrderStatus(order, 'preparing')}>{t.orderStatusPreparing}</button>
                <button onClick={() => updateOrderStatus(order, 'ready')}>{t.orderStatusReady}</button>
                <button onClick={() => updateOrderStatus(order, 'delivered')}>{t.orderStatusDelivered}</button>
                {canPrint && <button className="receipt-btn" onClick={() => printReceipt(order)}>{t.printReceipt}</button>}
                <OrderDeliveryButtonFromList order={order} />
                <OrderRiderStatusBox order={order} />
                <button className="whatsapp-mini-btn" onClick={() => window.open(order.whatsapp_url, '_blank')}>{t.sendWhatsapp}</button>
              </div>
            </article>
          ))}
        </div>
        </section>
      </>
      )}


      {adminTab === 'riders' && role === 'admin' && (
        <section className="riders-admin-tab">
          <RiderManagementPanel />
          <RiderWorkloadSummary />
          <AdminLiveRidersMap />
          <RiderPerformanceReports />
          <LiveOrdersDeliveryPanel lang={document.documentElement.lang || "es"} />
        </section>
      )}

      {canManageInventory && adminTab === 'inventory' && (
        <section className="card admin-3d-card inventory-section">
          <h2>{t.inventory}</h2>
          <div className="inventory-summary">
            <div><span>{t.inventoryValue}</span><b>€{inventory.reduce((sum, item) => sum + Number(item.stock_value || 0), 0).toFixed(2)}</b></div>
            <div><span>{t.lowStock}</span><b>{inventory.filter(item => item.is_low_stock).length}</b></div>
          </div>
          <div className="inventory-form-grid">
            <input placeholder={t.materialName} value={newInventory.name} onChange={e => setNewInventory({...newInventory, name: e.target.value})}/>
            <select value={newInventory.unit} onChange={e => setNewInventory({...newInventory, unit: e.target.value})}>
              <option value="kg">kg</option><option value="g">g</option><option value="unit">unit</option><option value="liter">liter</option><option value="ml">ml</option><option value="pack">pack</option>
            </select>
            <input type="number" placeholder={t.currentStock} value={newInventory.current_stock} onChange={e => setNewInventory({...newInventory, current_stock: e.target.value})}/>
            <input type="number" placeholder={t.minimumStock} value={newInventory.minimum_stock} onChange={e => setNewInventory({...newInventory, minimum_stock: e.target.value})}/>
            <input type="number" placeholder={t.unitCost} value={newInventory.unit_cost} onChange={e => setNewInventory({...newInventory, unit_cost: e.target.value})}/>
            <button className="primary" onClick={createInventoryItem}>{t.addInventory}</button>
          </div>
          <div className="inventory-table-wrap">
            <table>
              <thead><tr><th>{t.materialName}</th><th>{t.unit}</th><th>{t.currentStock}</th><th>{t.minimumStock}</th><th>{t.unitCost}</th><th>{t.lowStock}</th></tr></thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className={item.is_low_stock ? 'low-stock-row' : ''}>
                    <td>{item.name}</td><td>{item.unit}</td>
                    <td><input className="small-input" type="number" defaultValue={item.current_stock} onBlur={e => updateInventoryStock(item, { current_stock: Number(e.target.value) })}/></td>
                    <td><input className="small-input" type="number" defaultValue={item.minimum_stock} onBlur={e => updateInventoryStock(item, { minimum_stock: Number(e.target.value) })}/></td>
                    <td>€<input className="small-input" type="number" defaultValue={item.unit_cost} onBlur={e => updateInventoryStock(item, { unit_cost: Number(e.target.value) })}/></td>
                    <td>{item.is_low_stock ? '⚠️' : '✅'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {canManageMenu && adminTab === 'menu' && (
        <section className="card admin-3d-card">
          <h2>{t.categories}</h2>
          <div className="category-admin-row">
            <input placeholder={t.categoryName} value={newCategory} onChange={e => setNewCategory(e.target.value)} />
            <button className="primary" onClick={createCategory}>{t.addCategory}</button>
          </div>
          <div className="category-chip-list">
            {categories.map(category => <span className="category-chip admin-chip" key={category.id}>{category.name}</span>)}
          </div>
        </section>
      )}

      {canManageMenu && adminTab === 'menu' && (
        <section className="card admin-3d-card">
          <h2><PlusCircle size={22}/> {t.addFood}</h2>
          <div className="form-grid">
            <input placeholder={t.foodName} value={food.name} onChange={e => setFood({...food, name: e.target.value})}/>
            <input placeholder={t.price} type="number" value={food.price} onChange={e => setFood({...food, price: e.target.value})}/>
            <select value={food.category} onChange={e => setFood({...food, category: e.target.value})}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <label className="check"><input type="checkbox" checked={food.is_available} onChange={e => setFood({...food, is_available: e.target.checked})}/> {t.available}</label>
          </div>
          <textarea placeholder={t.description} value={food.description} onChange={e => setFood({...food, description: e.target.value})}/>
          <div className="image-upload-row">
            <label className="image-upload"><span>{t.foodImage} ({t.imageOptional})</span><input key={foodFormKey} type="file" accept="image/*" onChange={handleImageChange}/></label>
            <div className="image-preview-box">{food.preview ? <img src={food.preview} alt="preview"/> : <span>{t.noImage}</span>}</div>
          </div>
          <button className="primary" onClick={createFood}><Save size={18}/> {t.save}</button>
        </section>
      )}

      {canManageMenu && adminTab === 'menu' && (
        <section className="card admin-3d-card">
          <h2>{t.menuManagement}</h2>
          <div className="admin-menu-grid">
            {menu.map(item => (
              <article className="admin-food-card" key={item.id}>
                <div className="admin-food-image-wrap">
                  {editingFoodId === item.id && editFoodForm.preview ? (
                    <img src={editFoodForm.preview} alt={item.name}/>
                  ) : item.image_display_url ? (
                    <img src={item.image_display_url} alt={item.name}/>
                  ) : (
                    <div className="admin-food-placeholder">{t.noImage}</div>
                  )}
                </div>

                {editingFoodId === item.id ? (
                  <div className="admin-food-edit">
                    <input value={editFoodForm.name || ''} onChange={e => setEditFoodForm({...editFoodForm, name: e.target.value})}/>
                    <textarea value={editFoodForm.description || ''} onChange={e => setEditFoodForm({...editFoodForm, description: e.target.value})}/>
                    <input type="number" value={editFoodForm.price || ''} onChange={e => setEditFoodForm({...editFoodForm, price: e.target.value})}/>
                    <select value={editFoodForm.category || item.category} onChange={e => setEditFoodForm({...editFoodForm, category: e.target.value})}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <label className="check">
                      <input type="checkbox" checked={!!editFoodForm.is_available} onChange={e => setEditFoodForm({...editFoodForm, is_available: e.target.checked})}/>
                      {t.available}
                    </label>
                    <label className="image-upload small-upload">
                      <span>{t.changeImage}</span>
                      <input type="file" accept="image/*" onChange={handleEditImageChange}/>
                    </label>

                    <div className="admin-food-actions">
                      <button className="primary" onClick={() => submitEditFood(item)}>{t.updateFood}</button>
                      <button onClick={cancelEditFood}>{t.cancelEdit}</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="admin-food-body">
                      <h3>{item.name}</h3>
                      <p>{item.description}</p>
                      <div className="admin-food-meta">
                        <strong>€{item.price}</strong>
                        <span>{item.category_name}</span>
                      </div>
                      <span className={`status-pill ${item.is_available ? 'status-ready' : 'status-cancelled'}`}>
                        {item.is_available ? 'Disponible' : 'No disponible'}
                      </span>
                    </div>
                    <div className="admin-food-actions">
                      <button onClick={() => startEditFood(item)}>{t.editFood}</button>
                      <button onClick={() => updateFood(item, { is_available: !item.is_available })}>{item.is_available ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => deleteFood(item)} className="delete-btn">{t.deleteFood}</button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {adminTab === 'history' && (
      <section className="card">
        <div className="section-header">
          <h2>{t.recentOrders}</h2>
          <div className="order-filters">
            <input placeholder={t.searchOrders} value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})}/>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
              <option value="all">{t.allStatuses}</option>
              <option value="new">{t.orderStatusNew}</option>
              <option value="preparing">{t.orderStatusPreparing}</option>
              <option value="ready">{t.orderStatusReady}</option>
              <option value="delivered">{t.orderStatusDelivered}</option>
              <option value="cancelled">{t.orderStatusCancelled}</option>
            </select>
          </div>
        </div>
        <table>
          <thead><tr><th>ID</th><th>{t.customerName}</th><th>Fecha/Hora</th><th>{t.type}</th><th>{t.status}</th><th>Payment</th><th>{t.total}</th><th>{t.changeStatus}</th><th>{t.printReceipt}</th></tr></thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td><td>{order.customer_name}</td><td>{new Date(order.created_at).toLocaleString()}</td><td>{order.order_type}</td>
                <td><span className={`status-pill status-${order.status}`}>{statusLabels[order.status] || order.status}</span></td>
                <td><span className={`payment-status-pill ${getPaymentStatusClass(order.payment_status)}`}>{getPaymentMethodLabel(order.payment_method)} / {getPaymentStatusLabel(order.payment_status)}</span></td>
                <td>€{order.total_amount}</td>
                <td>
                  <select value={order.status} onChange={e => updateOrderStatus(order, e.target.value)}>
                    <option value="new">{t.orderStatusNew}</option>
                    <option value="preparing">{t.orderStatusPreparing}</option>
                    <option value="ready">{t.orderStatusReady}</option>
                    <option value="delivered">{t.orderStatusDelivered}</option>
                    <option value="cancelled">{t.orderStatusCancelled}</option>
                  </select>
                </td>
                <td>{canPrint && <button className="receipt-btn" onClick={() => printReceipt(order)}>{t.printReceipt}</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      )}
    </main>
  );
}


function ExecutiveFinanceDashboardV33({ t }) {
  const [period, setPeriod] = useState('today');
  const [data, setData] = useState(null);
  const [expense, setExpense] = useState({ title: '', amount: '', category: 'General', note: '' });
  const [message, setMessage] = useState('');

  const loadFinance = async () => {
    setMessage('');
    try {
      const res = await api.get('/executive-finance-dashboard/', { params: { period } });
      setData(res.data);
    } catch (err) {
      setMessage('No se pudo cargar Finance Pro.');
    }
  };

  useEffect(() => {
    loadFinance();
  }, [period]);

  const money = (value) => `€${Number(value || 0).toFixed(2)}`;

  const addExpense = async () => {
    if (!expense.title || !expense.amount) {
      setMessage('Escribe titulo e importe del gasto.');
      return;
    }

    try {
      await api.post('/executive-expenses/', expense);
      setExpense({ title: '', amount: '', category: 'General', note: '' });
      setMessage('Gasto guardado.');
      await loadFinance();
    } catch {
      setMessage('No se pudo guardar el gasto.');
    }
  };

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['Metric', 'Value'],
      ['Period', data.period],
      ['Sales', data.summary.sales_total],
      ['Material cost', data.summary.material_cost],
      ['Expenses', data.summary.expense_total],
      ['Gross profit', data.summary.gross_profit],
      ['Net profit', data.summary.net_profit],
      ['Orders', data.summary.orders_count],
      ['Average order', data.summary.average_order],
    ];
    const csv = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-pro-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const s = data?.summary || {};
  const maxSales = Math.max(...(data?.daily_rows || []).map(r => Number(r.sales || 0)), 1);

  return (
    <section className="finance-pro-v33 card">
      <div className="finance-pro-header">
        <div>
          <h2>Finance Pro</h2>
          <p>Ventas, costes, gastos y beneficio real del restaurante.</p>
        </div>
        <div className="finance-pro-controls">
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Este mes</option>
          </select>
          <button onClick={loadFinance}>Actualizar</button>
          <button onClick={exportCsv}>Exportar CSV</button>
        </div>
      </div>

      {message && <div className="finance-pro-message">{message}</div>}

      {data && (
        <>
          <div className="finance-pro-stats">
            <div><span>Ventas</span><strong>{money(s.sales_total)}</strong></div>
            <div><span>Coste materiales</span><strong>{money(s.material_cost)}</strong></div>
            <div><span>Gastos</span><strong>{money(s.expense_total)}</strong></div>
            <div><span>Beneficio bruto</span><strong>{money(s.gross_profit)}</strong></div>
            <div className={Number(s.net_profit || 0) >= 0 ? 'good' : 'bad'}><span>Beneficio neto</span><strong>{money(s.net_profit)}</strong></div>
            <div><span>Ticket medio</span><strong>{money(s.average_order)}</strong></div>
          </div>

          <div className="finance-pro-grid">
            <div className="finance-pro-box">
              <h3>Ventas por día</h3>
              <div className="finance-pro-bars">
                {(data.daily_rows || []).map(row => (
                  <div className="finance-pro-bar-row" key={row.date}>
                    <small>{row.date}</small>
                    <div className="finance-pro-bar-track">
                      <div className="finance-pro-bar-fill" style={{ width: `${Math.max(4, (Number(row.sales || 0) / maxSales) * 100)}%` }} />
                    </div>
                    <b>{money(row.sales)}</b>
                  </div>
                ))}
              </div>
            </div>

            <div className="finance-pro-box">
              <h3>Añadir gasto</h3>
              <input placeholder="Título" value={expense.title} onChange={e => setExpense({ ...expense, title: e.target.value })} />
              <input type="number" step="0.01" placeholder="Importe €" value={expense.amount} onChange={e => setExpense({ ...expense, amount: e.target.value })} />
              <select value={expense.category} onChange={e => setExpense({ ...expense, category: e.target.value })}>
                <option value="Materiales">Materiales</option>
                <option value="Salarios">Salarios</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Luz/Gas/Internet">Luz/Gas/Internet</option>
                <option value="Marketing">Marketing</option>
                <option value="Reparto">Reparto</option>
                <option value="General">General</option>
              </select>
              <textarea placeholder="Nota" value={expense.note} onChange={e => setExpense({ ...expense, note: e.target.value })} />
              <button onClick={addExpense}>Guardar gasto</button>
            </div>
          </div>

          <div className="finance-pro-grid three">
            <div className="finance-pro-box">
              <h3>Métodos de pago</h3>
              {Object.entries(data.payment_breakdown || {}).map(([key, value]) => (
                <div className="finance-pro-row" key={key}><span>{key}</span><strong>{money(value)}</strong></div>
              ))}
            </div>

            <div className="finance-pro-box">
              <h3>Tipos de pedido</h3>
              {Object.entries(data.order_type_breakdown || {}).map(([key, value]) => (
                <div className="finance-pro-row" key={key}><span>{key} ({value.count})</span><strong>{money(value.total)}</strong></div>
              ))}
            </div>

            <div className="finance-pro-box">
              <h3>Top productos</h3>
              {(data.top_items || []).length === 0 ? <p>Sin datos.</p> : data.top_items.map((item, index) => (
                <div className="finance-pro-row" key={index}>
                  <span>{item.menu_item__name}</span>
                  <strong>x{item.quantity}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="finance-pro-box">
            <h3>Gastos recientes</h3>
            {(data.recent_expenses || []).length === 0 ? <p>No hay gastos registrados.</p> : (
              <div className="finance-pro-expenses">
                {data.recent_expenses.map(e => (
                  <div className="finance-pro-expense-row" key={e.id}>
                    <span>{new Date(e.created_at).toLocaleString()}</span>
                    <strong>{e.title}</strong>
                    <small>{e.category}</small>
                    <b>{money(e.amount)}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}



function SmartAccountingDashboardV38({ t }) {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [message, setMessage] = useState('');

  const money = (value) => {
    const n = Number(value || 0);
    return `€${n.toFixed(2)}`;
  };

  const percent = (value) => {
    const n = Number(value || 0);
    return `${n.toFixed(1)}%`;
  };

  const loadSmartAccounting = async () => {
    setMessage('');
    try {
      const res = await api.get(`/accounting/smart-dashboard/?days=${days}`);
      setData(res.data);
    } catch (err) {
      setMessage('No se pudo cargar la contabilidad inteligente. Revisa login admin y backend.');
    }
  };

  useEffect(() => {
    loadSmartAccounting();
  }, [days]);

  return (
    <section className="smart-accounting-v38">
      <div className="smart-accounting-header">
        <div>
          <h2>Contabilidad inteligente</h2>
          <p>Ventas, costes, beneficios, pagos y alertas automáticas para Casa de Kebab Turco.</p>
        </div>
        <div className="smart-accounting-controls">
          <select value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>7 días</option>
            <option value={30}>30 días</option>
            <option value={90}>90 días</option>
            <option value={365}>365 días</option>
          </select>
          <button onClick={loadSmartAccounting}>Actualizar</button>
        </div>
      </div>

      {message && <div className="smart-accounting-message">{message}</div>}

      {data && (
        <>
          <div className="smart-kpi-grid">
            <div className="smart-kpi-card">
              <span>Ventas</span>
              <strong>{money(data.sales_total)}</strong>
              <small>Periodo: {data.period_days} días</small>
            </div>
            <div className="smart-kpi-card">
              <span>Beneficio neto</span>
              <strong>{money(data.net_profit)}</strong>
              <small>Margen: {percent(data.profit_margin)}</small>
            </div>
            <div className="smart-kpi-card">
              <span>Coste materiales</span>
              <strong>{money(data.cost_total)}</strong>
              <small>Ratio coste: {percent(data.cost_ratio)}</small>
            </div>
            <div className="smart-kpi-card">
              <span>Ticket medio</span>
              <strong>{money(data.avg_order)}</strong>
              <small>{data.orders_count} pedidos</small>
            </div>
          </div>

          <div className="smart-accounting-layout">
            <div className="smart-panel">
              <h3>Alertas inteligentes</h3>
              <div className="smart-alert-list">
                {data.alerts?.map((alert, idx) => (
                  <div key={idx} className={`smart-alert ${alert.level}`}>
                    <strong>{alert.title}</strong>
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="smart-panel">
              <h3>Productos más vendidos</h3>
              <div className="smart-table">
                <div className="smart-table-head">
                  <span>Producto</span>
                  <span>Cant.</span>
                  <span>Venta</span>
                </div>
                {data.top_items?.map((item, idx) => (
                  <div className="smart-table-row" key={idx}>
                    <span>{item.name}</span>
                    <span>{item.quantity}</span>
                    <span>{money(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="smart-panel">
              <h3>Métodos de pago</h3>
              <div className="smart-table">
                <div className="smart-table-head">
                  <span>Método</span>
                  <span>Pedidos</span>
                  <span>Total</span>
                </div>
                {data.payment_breakdown?.map((item, idx) => (
                  <div className="smart-table-row" key={idx}>
                    <span>{item.method}</span>
                    <span>{item.count}</span>
                    <span>{money(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="smart-panel">
              <h3>Resumen operativo</h3>
              <div className="smart-mini-grid">
                <div>
                  <span>Ventas hoy</span>
                  <strong>{money(data.today_sales)}</strong>
                </div>
                <div>
                  <span>Beneficio hoy</span>
                  <strong>{money(data.today_profit)}</strong>
                </div>
                <div>
                  <span>Pendiente cobro</span>
                  <strong>{money(data.unpaid_total)}</strong>
                </div>
                <div>
                  <span>Efectivo reparto</span>
                  <strong>{money(data.delivery_expected_cash)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="smart-panel smart-wide">
            <h3>Evolución diaria</h3>
            <div className="smart-daily-bars">
              {data.daily_sales?.map((d, idx) => {
                const max = Math.max(...data.daily_sales.map(x => Number(x.sales || 0)), 1);
                const height = Math.max(8, Math.round((Number(d.sales || 0) / max) * 110));
                return (
                  <div key={idx} className="smart-day">
                    <div className="smart-day-bar" style={{ height: `${height}px` }} title={`${d.day}: ${money(d.sales)}`} />
                    <span>{String(d.day || '').slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}




function ProfessionalCashRegisterV42({ t }) {
  const [data, setData] = useState(null);
  const [report, setReport] = useState(null);
  const [openingCash, setOpeningCash] = useState('100');
  const [closingCash, setClosingCash] = useState('');
  const [forceClose, setForceClose] = useState(false);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');

  const isEn = t.accounting === 'Accounting';
  const L = {
    title: isEn ? 'Professional Cash Register' : 'Caja profesional',
    subtitle: isEn ? 'Open, close and control daily cash differences.' : 'Apertura, cierre y control diario de caja.',
    update: isEn ? 'Refresh' : 'Actualizar',
    loadFail: isEn ? 'Could not load cash register status.' : 'No se pudo cargar el estado de caja.',
    openOk: isEn ? 'Cash register opened successfully.' : 'Caja abierta correctamente.',
    closeOk: isEn ? 'Cash register closed successfully.' : 'Caja cerrada correctamente.',
    openStatus: isEn ? 'Cash register open' : 'Caja abierta',
    closedStatus: isEn ? 'Cash register closed' : 'Caja cerrada',
    todaySales: isEn ? 'Today sales' : 'Ventas de hoy',
    expectedCash: isEn ? 'Expected cash' : 'Efectivo esperado',
    cashPayment: isEn ? 'Cash payments' : 'Pagos en efectivo',
    cardPayment: isEn ? 'Card payments' : 'Pagos con tarjeta',
    onlinePaid: isEn ? 'Online paid' : 'Pagado online',
    deliveryCash: isEn ? 'Delivery cash' : 'Efectivo de reparto',
    openOrders: isEn ? 'Open orders' : 'Pedidos abiertos',
    debt: isEn ? 'Debt' : 'Deuda',
    openBox: isEn ? 'Open cash register' : 'Abrir caja',
    closeBox: isEn ? 'Close cash register' : 'Cerrar caja',
    initialCash: isEn ? 'Initial cash' : 'Efectivo inicial',
    countedCash: isEn ? 'Counted cash' : 'Efectivo contado',
    notes: isEn ? 'Notes' : 'Notas',
    difference: isEn ? 'Difference' : 'Diferencia',
    forceClose: isEn ? 'Close even with open orders' : 'Cerrar aunque haya pedidos abiertos',
    dailyReport: isEn ? 'Daily cash report' : 'Reporte diario de caja',
    orders: isEn ? 'Orders' : 'Pedidos',
    sales: isEn ? 'Sales' : 'Ventas',
    cash: isEn ? 'Cash' : 'Efectivo',
    card: isEn ? 'Card' : 'Tarjeta',
    online: isEn ? 'Online' : 'Online',
    discount: isEn ? 'Discount' : 'Descuento',
    sessions: isEn ? 'Cash sessions' : 'Sesiones de caja',
    opened: isEn ? 'Open' : 'Abierta',
    closed: isEn ? 'Closed' : 'Cerrada',
    finalCash: isEn ? 'Final' : 'Final',
    initial: isEn ? 'Initial' : 'Inicial',
  };

  const money = (value) => `€${Number(value || 0).toFixed(2)}`;

  const loadStatus = async () => {
    setMessage('');
    try {
      const res = await api.get('/cash-register/pro/status/');
      setData(res.data);
    } catch {
      setMessage(L.loadFail);
    }
  };

  const loadReport = async () => {
    try {
      const res = await api.get('/cash-register/pro/daily-report/');
      setReport(res.data);
    } catch {
      setMessage(isEn ? 'Could not load daily report.' : 'No se pudo cargar el reporte diario.');
    }
  };

  const openCash = async () => {
    setMessage('');
    try {
      await api.post('/cash-register/pro/open/', { opening_cash: openingCash, notes });
      setMessage(L.openOk);
      await loadStatus();
      await loadReport();
    } catch (err) {
      setMessage(err.response?.data?.detail || (isEn ? 'Could not open cash register.' : 'No se pudo abrir caja.'));
    }
  };

  const closeCash = async () => {
    setMessage('');
    try {
      await api.post('/cash-register/pro/close/', { closing_cash: closingCash, force_close: forceClose, notes });
      setMessage(L.closeOk);
      setClosingCash('');
      setForceClose(false);
      await loadStatus();
      await loadReport();
    } catch (err) {
      setMessage(err.response?.data?.detail || (isEn ? 'Could not close cash register.' : 'No se pudo cerrar caja.'));
    }
  };

  const previewDifference = data ? Number(closingCash || 0) - Number(data.expected_cash || 0) : 0;

  useEffect(() => {
    loadStatus();
    loadReport();
  }, []);

  return (
    <section className="cash-v42-card">
      <div className="cash-v42-header">
        <div><h2>{L.title}</h2><p>{L.subtitle}</p></div>
        <button onClick={() => { loadStatus(); loadReport(); }}>{L.update}</button>
      </div>

      {message && <div className="cash-v42-message">{message}</div>}

      {data && (
        <>
          <div className="cash-v42-status">
            <span className={data.is_open ? 'open' : 'closed'}>{data.is_open ? L.openStatus : L.closedStatus}</span>
            <strong>{data.date}</strong>
          </div>

          {data.warnings?.length > 0 && <div className="cash-v42-warnings">{data.warnings.map((w, idx) => <p key={idx}>{w}</p>)}</div>}

          <div className="cash-v42-kpis">
            <div><span>{L.todaySales}</span><strong>{money(data.sales_total)}</strong></div>
            <div><span>{L.expectedCash}</span><strong>{money(data.expected_cash)}</strong></div>
            <div><span>{L.cashPayment}</span><strong>{money(data.cash_payments)}</strong></div>
            <div><span>{L.cardPayment}</span><strong>{money(data.card_payments)}</strong></div>
            <div><span>{L.onlinePaid}</span><strong>{money(data.online_paid)}</strong></div>
            <div><span>{L.deliveryCash}</span><strong>{money(data.delivery_cash_expected)}</strong></div>
            <div><span>{L.openOrders}</span><strong>{data.open_orders_count}</strong></div>
            <div><span>{L.debt}</span><strong>{money(data.debt_total)}</strong></div>
          </div>

          <div className="cash-v42-layout">
            <div className="cash-v42-panel">
              <h3>{L.openBox}</h3>
              <label>{L.initialCash}</label>
              <input value={openingCash} onChange={e => setOpeningCash(e.target.value)} type="number" step="0.01" />
              <label>{L.notes}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={L.notes} />
              <button disabled={data.is_open} onClick={openCash}>{L.openBox}</button>
            </div>

            <div className="cash-v42-panel">
              <h3>{L.closeBox}</h3>
              <label>{L.countedCash}</label>
              <input value={closingCash} onChange={e => setClosingCash(e.target.value)} type="number" step="0.01" />
              <div className={`cash-v42-difference ${previewDifference < 0 ? 'negative' : previewDifference > 0 ? 'positive' : ''}`}>{L.difference}: {money(previewDifference)}</div>
              {data.open_orders_count > 0 && <label className="cash-v42-force"><input type="checkbox" checked={forceClose} onChange={e => setForceClose(e.target.checked)} />{L.forceClose}</label>}
              <button disabled={!data.is_open} onClick={closeCash}>{L.closeBox}</button>
            </div>
          </div>

          {report && (
            <div className="cash-v42-report">
              <h3>{L.dailyReport}</h3>
              <div className="cash-v42-report-grid">
                <div><span>{L.orders}</span><strong>{report.orders_count}</strong></div>
                <div><span>{L.sales}</span><strong>{money(report.sales_total)}</strong></div>
                <div><span>{L.cash}</span><strong>{money(report.cash_payments)}</strong></div>
                <div><span>{L.card}</span><strong>{money(report.card_payments)}</strong></div>
                <div><span>{L.online}</span><strong>{money(report.online_paid)}</strong></div>
                <div><span>{L.discount}</span><strong>{money(report.discount_total)}</strong></div>
                <div><span>{L.debt}</span><strong>{money(report.debt_total)}</strong></div>
                <div><span>{L.openOrders}</span><strong>{report.open_orders_count}</strong></div>
              </div>
              <h4>{L.sessions}</h4>
              <div className="cash-v42-session-list">
                {report.sessions?.map(session => (
                  <div key={session.id} className="cash-v42-session">
                    <b>#{session.id}</b>
                    <span>{session.is_closed ? L.closed : L.opened}</span>
                    <span>{L.initial}: {money(session.opening_cash)}</span>
                    <span>{L.finalCash}: {money(session.closing_cash)}</span>
                    <span>{L.difference}: {money(session.difference)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
function AccountingPage({ t }) {
  return (
    <main className="stack">
      <section className="card">
        <h2>{t.accounting}</h2>
        <p>Accounting dashboard will continue in v8.0.</p>
      </section>
    
      <ProfessionalCashRegisterV42 t={t} />
      <SmartAccountingDashboardV38 t={t} />
      <ExecutiveFinanceDashboardV33 t={t} />
</main>
  );
}


function ProCustomerTrackingPage({ lang }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadLocation = async () => {
    if (!trackingCode || !phone) {
      setMessage('Introduce el numero de seguimiento y el telefono.');
      return;
    }

    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, {
        tracking_code: trackingCode,
        phone,
      });

      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || 'La ubicacion del repartidor todavia no esta disponible.');
      }
    } catch (err) {
      setLocation(null);
      setMessage('No se pudo cargar la ubicacion. Revisa el numero de pedido y telefono.');
    }
  };

  useEffect(() => {
    let timer = null;
    if (autoRefresh) {
      timer = setInterval(loadLocation, 5000);
    }
    return () => timer && clearInterval(timer);
  }, [autoRefresh, trackingCode, phone]);

  const openMap = location
    ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`
    : '#';

  const whatsapp = location?.rider_phone
    ? `https://wa.me/${String(location.rider_phone).replace(/\D/g, '')}`
    : null;

  return (
    <main className="pro-customer-track-page">
      <section className="pro-customer-track-card">
        <h2>Seguimiento de pedido</h2>
        <p>Consulta la ubicacion del repartidor cuando tu pedido este en camino.</p>

        <div className="track-form">
          <input
            placeholder="Numero de seguimiento, por ejemplo CDKT-000036"
            value={trackingCode}
            onChange={e => setTrackingCode(e.target.value)}
          />
          <input
            placeholder="Telefono del pedido"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <button onClick={loadLocation}>Buscar repartidor</button>
          <button className={autoRefresh ? 'active-refresh' : ''} onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? 'Actualizacion activa' : 'Actualizar cada 5s'}
          </button>
        </div>

        {message && <div className="track-message">{message}</div>}

        {location && (
          <div className="tracking-result">
            <div className="tracking-status-row">
              <strong>{location.tracking_code}</strong>
              <span>{location.status}</span>
            </div>

            <p>
              <b>Ultima actualizacion:</b>{' '}
              {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}
            </p>

            {location.rider_name && <p><b>Repartidor:</b> {location.rider_name}</p>}
            {location.rider_phone && <p><b>Telefono:</b> {location.rider_phone}</p>}

            <iframe
              title="Ubicacion en vivo del repartidor"
              className="customer-live-map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
            />

            <div className="track-actions">
              <a href={openMap} target="_blank" rel="noreferrer">Abrir mapa</a>
              {location.rider_phone && <a href={`tel:${location.rider_phone}`}>Llamar al repartidor</a>}
              {whatsapp && <a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}



function DeliveryAdminPage({ lang }) {
  const [orderId, setOrderId] = useState('');
  const [riderName, setRiderName] = useState('Repartidor');
  const [riderPhone, setRiderPhone] = useState('600000000');
  const [result, setResult] = useState(null);
  const [trackCode, setTrackCode] = useState('');
  const [trackPhone, setTrackPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const authHeaders = () => {
    let token =
      localStorage.getItem('access') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      localStorage.getItem('admin_token') ||
      '';

    try {
      const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
      token = token || authTokens.access || authTokens.accessToken || authTokens.token || '';
    } catch (e) {}

    try {
      const userTokens = JSON.parse(localStorage.getItem('user') || '{}');
      token = token || userTokens.access || userTokens.accessToken || userTokens.token || '';
    } catch (e) {}

    return token ? { Authorization: `Bearer ${token}` } : {};
  };


  const createLink = async () => {
    setMessage('');
    setResult(null);
    try {
      const res = await axios.post(
        `${API}/delivery/create-tracking/`,
        {
          order_id: orderId,
          rider_name: riderName,
          rider_phone: riderPhone,
        },
        { headers: authHeaders() }
      );
      setResult(res.data);
      setMessage('Enlace de reparto creado. El pedido esta en camino.');
    } catch (err) {
      setMessage('No se pudo crear el enlace. Revisa login admin y order_id.');
    }
  };

  const checkLiveLocation = async () => {
    setMessage('');
    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, {
        tracking_code: trackCode,
        phone: trackPhone,
      });
      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || 'Ubicacion no disponible todavia.');
      }
    } catch (err) {
      setLocation(null);
      setMessage('No se pudo consultar la ubicacion.');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (trackCode && trackPhone) checkLiveLocation();
    }, 5000);
    return () => clearInterval(timer);
  }, [trackCode, trackPhone]);

  return (
    <main className="delivery-admin-page">
      <section className="delivery-admin-card">
        <h2>Panel de reparto en vivo</h2>
        <p>Cuando el pedido se entrega al repartidor, crea un enlace y el movil del repartidor empezara a enviar GPS.</p>

        <div className="delivery-admin-grid">
          <div className="delivery-admin-box">
            <h3>Crear enlace para repartidor</h3>
            <input placeholder="Order ID, por ejemplo 36" value={orderId} onChange={e => setOrderId(e.target.value)} />
            <input placeholder="Nombre del repartidor" value={riderName} onChange={e => setRiderName(e.target.value)} />
            <input placeholder="Telefono del repartidor" value={riderPhone} onChange={e => setRiderPhone(e.target.value)} />
            <button onClick={createLink}>Crear enlace y poner En Camino</button>

            {result && (
              <div className="delivery-result-box">
                <p><b>Pedido:</b> {result.tracking_code}</p>
                <p><b>Token:</b> {result.token}</p>
                <p><b>Enlace pÃ­k:</b></p>
                <input readOnly value={`http://127.0.0.1:5173${result.delivery_url}`} />
                <p><b>Enlace cliente:</b></p>
                <input readOnly value="http://127.0.0.1:5173/track" />
              </div>
            )}
          </div>

          <div className="delivery-admin-box">
            <h3>Ver ubicacion por pedido</h3>
            <input placeholder="CDKT-000036 o 36" value={trackCode} onChange={e => setTrackCode(e.target.value)} />
            <input placeholder="Telefono del cliente" value={trackPhone} onChange={e => setTrackPhone(e.target.value)} />
            <button onClick={checkLiveLocation}>Buscar ubicacion</button>

            {location && (
              <div className="admin-live-map-box">
                <p><b>Estado:</b> {location.status}</p>
                <p><b>Ultima actualizacion:</b> {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}</p>
                <iframe
                  title="Mapa admin repartidor"
                  className="admin-live-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
                />
              </div>
            )}
          </div>
        </div>

        {message && <div className="delivery-admin-message">{message}</div>}
      </section>
    </main>
  );
}



function DeliveryManagementCenter({ lang }) {
  const [orderId, setOrderId] = useState('');
  const [riderName, setRiderName] = useState('Repartidor');
  const [riderPhone, setRiderPhone] = useState('600000000');
  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);

  const authHeaders = () => {
    const token =
      localStorage.getItem('access') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadDeliveries = async () => {
    try {
      const res = await axios.get(`${API}/delivery/admin-list/`, { headers: authHeaders() });
      setDeliveries(res.data.deliveries || []);
    } catch (err) {
      setMessage('No se pudo cargar la lista de repartos. Revisa el login admin.');
    }
  };

  const createDelivery = async () => {
    setMessage('');
    try {
      const res = await axios.post(
        `${API}/delivery/create-tracking/`,
        {
          order_id: orderId,
          rider_name: riderName,
          rider_phone: riderPhone,
        },
        { headers: authHeaders() }
      );
      setMessage('Reparto creado. Enlace listo para enviar al repartidor.');
      await loadDeliveries();
      setSelected(res.data);
    } catch (err) {
      setMessage('No se pudo crear el reparto. Revisa el pedido y permisos de admin.');
    }
  };

  useEffect(() => {
    loadDeliveries();
    const timer = setInterval(loadDeliveries, 5000);
    return () => clearInterval(timer);
  }, []);

  const fullDeliveryUrl = (delivery) => {
    const base = window.location.origin;
    return `${base}${delivery.delivery_url || `/rider?token=${delivery.token}`}`;
  };

  const whatsappLink = (delivery) => {
    const phone = String(delivery.rider_phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Nuevo reparto Casa de Kebab Turco\nPedido: ${delivery.tracking_code}\nCliente: ${delivery.customer_name}\nDireccion: ${delivery.customer_address}\nEnlace: ${fullDeliveryUrl(delivery)}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <main className="delivery-center-page">
      <section className="delivery-center-card">
        <div className="delivery-center-header">
          <div>
            <h2>Delivery Management Center</h2>
            <p>Gestion de repartidores, GPS en vivo y seguimiento para cliente y admin.</p>
          </div>
          <button onClick={loadDeliveries}>Actualizar</button>
        </div>

        <div className="delivery-create-box">
          <h3>Asignar pedido a repartidor</h3>
          <div className="delivery-create-grid">
            <input placeholder="Order ID, por ejemplo 40" value={orderId} onChange={e => setOrderId(e.target.value)} />
            <input placeholder="Nombre repartidor" value={riderName} onChange={e => setRiderName(e.target.value)} />
            <input placeholder="Telefono repartidor" value={riderPhone} onChange={e => setRiderPhone(e.target.value)} />
            <button onClick={createDelivery}>Crear reparto</button>
          </div>
        </div>

        {message && <div className="delivery-center-message">{message}</div>}

        <div className="delivery-list-grid">
          {deliveries.length === 0 ? (
            <p>No hay repartos todavia.</p>
          ) : deliveries.map(delivery => (
            <article className="delivery-list-card" key={delivery.id}>
              <div className="delivery-list-top">
                <strong>{delivery.tracking_code}</strong>
                <span className={delivery.is_active ? 'delivery-active' : 'delivery-ended'}>
                  {delivery.is_active ? 'Activo' : 'Finalizado'}
                </span>
              </div>

              <p><b>Cliente:</b> {delivery.customer_name}</p>
              <p><b>Telefono:</b> {delivery.customer_phone}</p>
              <p><b>Direccion:</b> {delivery.customer_address}</p>
              <p><b>Repartidor:</b> {delivery.rider_name} - {delivery.rider_phone}</p>
              <p><b>Estado:</b> {delivery.order_status}</p>
              <p><b>Ultima senal GPS:</b> {delivery.last_seen_at ? new Date(delivery.last_seen_at).toLocaleString() : 'Sin GPS'}</p>

              {delivery.last_latitude && delivery.last_longitude && (
                <iframe
                  title={`delivery-map-${delivery.id}`}
                  className="delivery-mini-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(delivery.last_longitude)-0.01}%2C${Number(delivery.last_latitude)-0.01}%2C${Number(delivery.last_longitude)+0.01}%2C${Number(delivery.last_latitude)+0.01}&layer=mapnik&marker=${delivery.last_latitude}%2C${delivery.last_longitude}`}
                />
              )}

              <DeliveryWhatsAppHelper delivery={delivery} />
              <div className="delivery-card-actions">
                <input readOnly value={fullDeliveryUrl(delivery)} />
                <a href={fullDeliveryUrl(delivery)} target="_blank" rel="noreferrer">Abrir pÃ¡gina pÃ­k</a>
                <a href={whatsappLink(delivery)} target="_blank" rel="noreferrer">Enviar WhatsApp</a>
                <a href={`/track`} target="_blank" rel="noreferrer">Abrir seguimiento cliente</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}



function RiderDeliveryPage({ lang }) {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || '';
    if (urlToken) {
      setToken(urlToken);
      loadInfo(urlToken);
    }
  }, []);

  const loadInfo = async (tk = token) => {
    try {
      const res = await axios.get(`${API}/delivery/info/?token=${encodeURIComponent(tk)}`);
      setOrder(res.data);
      if (!window.v25AutoAcceptDone && String(res.data.status || '').toLowerCase() !== 'delivered') {
        window.v25AutoAcceptDone = true;
        try {
          await axios.post(`${API}/delivery/accept/`, { token: tk });
          setMessage('Entrega aceptada automaticamente. Ahora pulsa Iniciar GPS.');
        } catch (e) {
          setMessage('Pedido cargado. Pulsa Iniciar GPS.');
        }
      } else {
        setMessage('');
      }
    } catch {
      setMessage('Enlace de reparto invalido.');
    }
  };

  const acceptDelivery = async () => {
    try {
      await axios.post(`${API}/delivery/accept/`, { token });
      setMessage('Reparto aceptado. Ahora puedes iniciar GPS.');
      await loadInfo(token);
    } catch {
      setMessage('No se pudo aceptar el reparto.');
    }
  };

  const sendLocation = async (position) => {
    const c = position.coords;
    setCoords({ latitude: c.latitude, longitude: c.longitude, accuracy: c.accuracy });
    await axios.post(`${API}/delivery/location/`, {
      token,
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy,
      speed: c.speed,
      heading: c.heading,
    });
    setMessage('GPS enviado.');
  };

  const startGPS = () => {
    if (!navigator.geolocation) {
      setMessage('GPS no compatible.');
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos).catch(() => setMessage('No se pudo enviar GPS.')),
      () => setMessage('Permiso de ubicacion denegado.'),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
    setWatchId(id);
    setIsTracking(true);
    setMessage('GPS iniciado.');
  };

  const completeDelivery = async () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);
    try {
      await axios.post(`${API}/delivery/complete/`, { token });
      setMessage('Pedido entregado. GPS detenido.');
      await loadInfo(token);
    } catch {
      setMessage('No se pudo marcar como entregado.');
    }
  };

  return (
    <main className="rider-page">
      <section className="rider-card">
        <h2>Reparto Casa de Kebab Turco</h2>

        {!order && (
          <div className="rider-token-box">
            <input placeholder="Token de reparto" value={token} onChange={e => setToken(e.target.value)} />
            <button onClick={() => loadInfo()}>Cargar pedido</button>
          </div>
        )}

        {order && (
          <div className="rider-grid">
            <div className="rider-order">
              <h3>{order.tracking_code}</h3>
              <p><b>Cliente:</b> {order.customer_name}</p>
              <p><b>Telefono:</b> {order.customer_phone}</p>
              <p><b>Direccion:</b> {order.customer_address}</p>
              <p><b>Estado:</b> {order.status}</p>

              <div className="rider-actions">
                <button onClick={acceptDelivery}>Pedido aceptado al abrir link</button>
                <button onClick={startGPS} disabled={isTracking}>Iniciar GPS</button>
                <button onClick={completeDelivery}>Entregado</button>
              </div>

              {coords && (
                <a
                  className="route-button"
                  href={`https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(order.customer_address + ', Salamanca')}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir ruta en Google Maps
                </a>
              )}
            </div>

            <div className="rider-map-box">
              {coords ? (
                <iframe
                  title="Mapa del repartidor"
                  className="rider-map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude-0.01}%2C${coords.latitude-0.01}%2C${coords.longitude+0.01}%2C${coords.latitude+0.01}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
                />
              ) : (
                <div className="rider-map-placeholder">Pulsa Iniciar GPS para enviar tu ubicacion.</div>
              )}
            </div>
          </div>
        )}

        {message && <div className="rider-message">{message}</div>}
      </section>
    </main>
  );
}



function CustomerLiveTrackPage({ lang }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadLocation = async () => {
    if (!trackingCode || !phone) {
      setMessage('Introduce numero de pedido y telefono.');
      return;
    }
    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, {
        tracking_code: trackingCode,
        phone,
      });
      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || 'Ubicacion del repartidor no disponible todavia.');
      }
    } catch {
      setLocation(null);
      setMessage('No se pudo consultar el pedido.');
    }
  };

  useEffect(() => {
    let timer = null;
    if (autoRefresh && trackingCode && phone) {
      loadLocation();
      timer = setInterval(loadLocation, 5000);
    }
    return () => timer && clearInterval(timer);
  }, [autoRefresh, trackingCode, phone]);

  return (
    <main className="customer-live-page">
      <section className="customer-live-card">
        <h2>Seguimiento de pedido</h2>
        <p>Introduce el numero de pedido y telefono para ver el repartidor en vivo.</p>

        <div className="customer-live-form">
          <input placeholder="CDKT-000040 o 40" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} />
          <input placeholder="Telefono" value={phone} onChange={e => setPhone(e.target.value)} />
          <button onClick={loadLocation}>Buscar</button>
          <button className={autoRefresh ? 'active-refresh' : ''} onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? 'Actualizacion activa' : 'Actualizar cada 5s'}
          </button>
        </div>

        {message && <div className="customer-live-message">{message}</div>}

        {location && (
          <div className="customer-live-result">
            <div className="tracking-status-row">
              <strong>{location.tracking_code}</strong>
              <span>{location.status}</span>
            </div>
            <p><b>Ultima actualizacion:</b> {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}</p>
            {location.rider_name && <p><b>Repartidor:</b> {location.rider_name}</p>}
            {location.rider_phone && <p><b>Telefono:</b> {location.rider_phone}</p>}
            <iframe
              title="Mapa cliente"
              className="customer-live-map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
            />
          </div>
        )}
      </section>
    </main>
  );
}




function RiderInstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      alert('En Android/Chrome: abre el menu del navegador y elige "Instalar app" o "Add to Home screen".');
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (installed) {
    return <div className="rider-pwa-installed">App instalada</div>;
  }

  return (
    <button type="button" className="rider-install-btn" onClick={installApp}>
      Instalar app del repartidor
    </button>
  );
}


function RiderAppPage({ lang }) {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState('');
  const [coords, setCoords] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token') || '';
    if (urlToken) {
      setToken(urlToken);
      loadOrder(urlToken);
    }
  }, []);

  const loadOrder = async (tk = token) => {
    try {
      const res = await axios.get(`${API}/delivery/info/?token=${encodeURIComponent(tk)}`);
      setOrder(res.data);
      setMessage('');
    } catch {
      setMessage('Enlace de reparto invalido.');
    }
  };

  const acceptDelivery = async () => {
    try {
      await axios.post(`${API}/delivery/accept/`, { token });
      setMessage('Entrega aceptada. Inicia el GPS.');
      await loadOrder(token);
    } catch {
      setMessage('No se pudo aceptar la entrega.');
    }
  };

  const sendLocation = async (position) => {
    const c = position.coords;
    setCoords({
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy,
    });

    await axios.post(`${API}/delivery/location/`, {
      token,
      latitude: c.latitude,
      longitude: c.longitude,
      accuracy: c.accuracy,
      speed: c.speed,
      heading: c.heading,
    });

    setMessage('GPS enviado correctamente.');
  };

  const startGPS = () => {
    if (!navigator.geolocation) {
      setMessage('GPS no compatible.');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos).catch(() => setMessage('No se pudo enviar GPS.')),
      () => setMessage('Permiso de ubicacion denegado. Activa la ubicacion del movil.'),
      {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 15000,
      }
    );

    setWatchId(id);
    setIsTracking(true);
    setMessage('GPS iniciado.');
  };

  const completeDelivery = async () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsTracking(false);

    try {
      await axios.post(`${API}/delivery/complete/`, { token });
      setMessage('Pedido marcado como entregado. GPS detenido.');
      await loadOrder(token);
    } catch {
      setMessage('No se pudo marcar como entregado.');
    }
  };

  const routeUrl = coords && order?.customer_address
    ? `https://www.google.com/maps/dir/?api=1&origin=${coords.latitude},${coords.longitude}&destination=${encodeURIComponent(order.customer_address + ', Salamanca')}`
    : null;

  const customerTrackUrl = `${window.location.origin}/track`;

  const customerWhatsapp = order?.customer_phone
    ? `https://wa.me/${String(order.customer_phone).replace(/\D/g, '')}?text=${encodeURIComponent(
        `Casa de Kebab Turco\nSu pedido esta en camino.\nNumero de pedido: ${order.tracking_code}\nPuede seguir el pedido aqui:\n${customerTrackUrl}\nTelefono: ${order.customer_phone}`
      )}`
    : null;

  return (
    <main className="rider-app-page">
      <section className="rider-app-card">
        <div className="rider-app-header">
          <div>
            <h2>Casa de Kebab Rider</h2>
            <p>Aplicacion del repartidor</p>
          </div>
          <RiderInstallPWAButton />
          <span className={isTracking ? 'rider-status active' : 'rider-status'}>
            {isTracking ? 'GPS activo' : 'GPS detenido'}
          </span>
        </div>

        {!order && (
          <div className="rider-login-box">
            <input placeholder="Token de reparto" value={token} onChange={e => setToken(e.target.value)} />
            <button onClick={() => loadOrder()}>Cargar pedido</button>
          </div>
        )}

        {order && (
          <div className="rider-app-grid">
            <div className="rider-job-panel">
              <h3>{order.tracking_code}</h3>
              <p><b>Cliente:</b> {order.customer_name}</p>
              <p><b>Telefono:</b> {order.customer_phone}</p>
              <p><b>Direccion:</b> {order.customer_address}</p>
              <p><b>Estado:</b> {order.status}</p>

              <div className="rider-step-buttons">
                <button onClick={acceptDelivery}>Pedido aceptado al abrir link</button>
                <button onClick={startGPS} disabled={isTracking}>2. Iniciar GPS</button>
                {routeUrl && <a href={routeUrl} target="_blank" rel="noreferrer">3. Abrir ruta</a>}
                {customerWhatsapp && <a className="whatsapp-action" href={customerWhatsapp} target="_blank" rel="noreferrer">Enviar WhatsApp al cliente</a>}
                <button className="delivered-action" onClick={completeDelivery}>4. Entregado</button>
              </div>
            </div>

            <div className="rider-live-panel">
              {coords ? (
                <>
                  <iframe
                    title="Rider live route"
                    className="rider-live-map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude-0.012}%2C${coords.latitude-0.012}%2C${coords.longitude+0.012}%2C${coords.latitude+0.012}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
                  />
                  <div className="rider-coords-box">
                    <span>Lat: {coords.latitude.toFixed(6)}</span>
                    <span>Lng: {coords.longitude.toFixed(6)}</span>
                    <span>Accuracy: {Math.round(coords.accuracy || 0)}m</span>
                  </div>
                </>
              ) : (
                <div className="rider-map-empty">Pulsa Iniciar GPS para activar la ubicacion en vivo.</div>
              )}
            </div>
          </div>
        )}

        {message && <div className="rider-app-message">{message}</div>}
      </section>
</main>
  );
}



function DeliveryWhatsAppHelper({ delivery }) {
  if (!delivery) return null;

  const riderPhone = String(delivery.rider_phone || '').replace(/\D/g, '');
  const customerPhone = String(delivery.customer_phone || '').replace(/\D/g, '');
  const deliveryUrl = `${window.location.origin}${delivery.delivery_url || `/rider?token=${delivery.token}`}`;
  const trackUrl = `${window.location.origin}/track`;

  const riderText = encodeURIComponent(
    `Casa de Kebab Turco\nNuevo reparto asignado\nPedido: ${delivery.tracking_code}\nCliente: ${delivery.customer_name}\nDireccion: ${delivery.customer_address}\nAbre este enlace. Al abrirlo, el pedido se confirma automaticamente para reparto:\n${deliveryUrl}`
  );

  const customerText = encodeURIComponent(
    `Casa de Kebab Turco\nSu pedido esta en camino.\nPedido: ${delivery.tracking_code}\nPuede seguir al repartidor aqui:\n${trackUrl}\nUse su telefono del pedido para consultar.`
  );

  return (
    <div className="delivery-whatsapp-helper">
      {riderPhone && <a href={`https://wa.me/${riderPhone}?text=${riderText}`} target="_blank" rel="noreferrer">WhatsApp repartidor</a>}
      {customerPhone && <a href={`https://wa.me/${customerPhone}?text=${customerText}`} target="_blank" rel="noreferrer">WhatsApp cliente</a>}
    </div>
  );
}



function LiveOrdersDeliveryPanel({ lang }) {
  const [orderId, setOrderId] = useState('');
  const [riderName, setRiderName] = useState('Repartidor');
  const [riderPhone, setRiderPhone] = useState('600000000');
  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState('');

  const loadDeliveries = async () => {
    try {
      const res = await axios.get(`${API}/delivery/admin-list/`);
      setDeliveries(res.data.deliveries || []);
    } catch {
      setMessage('No se pudo cargar repartos. Revisa backend.');
    }
  };

  const createDelivery = async () => {
    if (!orderId) {
      setMessage('Introduce el numero de pedido.');
      return;
    }

    try {
      await axios.post(`${API}/delivery/create-tracking/`, {
        order_id: orderId,
        rider_name: riderName,
        rider_phone: riderPhone,
      });
      setMessage('Pedido enviado al repartidor. Enlace creado automaticamente.');
      await loadDeliveries();
    } catch {
      setMessage('No se pudo asignar el pedido al repartidor.');
    }
  };

  useEffect(() => {
    loadDeliveries();
    const timer = setInterval(loadDeliveries, 5000);
    return () => clearInterval(timer);
  }, []);

  const makeRiderUrl = (delivery) => {
    const base = window.location.origin;
    return `${base}/rider?token=${delivery.token}`;
  };

  const makeCustomerTrackUrl = () => {
    return `${window.location.origin}/track`;
  };

  const whatsappRider = (delivery) => {
    const phone = String(delivery.rider_phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Casa de Kebab Turco\nNuevo pedido para repartir\nPedido: ${delivery.tracking_code}\nCliente: ${delivery.customer_name}\nDireccion: ${delivery.customer_address}\nAbre este enlace. Al abrirlo, el pedido se confirma automaticamente para reparto:\n${makeRiderUrl(delivery)}`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const whatsappCustomer = (delivery) => {
    const phone = String(delivery.customer_phone || '').replace(/\D/g, '');
    const text = encodeURIComponent(
      `Casa de Kebab Turco\nSu pedido esta en camino.\nPedido: ${delivery.tracking_code}\nPuede seguir al repartidor aqui:\n${makeCustomerTrackUrl()}\nUse su telefono del pedido para consultar.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <section className="live-delivery-panel card">
      <div className="live-delivery-title">
        <div>
          <h2>Reparto en vivo</h2>
          <p>Asigna pedidos a repartidores, envia enlace por WhatsApp y mira el GPS en vivo.</p>
        </div>
        <button onClick={loadDeliveries}>Actualizar repartos</button>
      </div>

      <div className="live-delivery-create">
        <input
          placeholder="Pedido ID, por ejemplo 41"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <input
          placeholder="Nombre repartidor"
          value={riderName}
          onChange={(e) => setRiderName(e.target.value)}
        />
        <input
          placeholder="Telefono repartidor"
          value={riderPhone}
          onChange={(e) => setRiderPhone(e.target.value)}
        />
        <button onClick={createDelivery}>Enviar pedido a pÃ­k</button>
      </div>

      {message && <div className="live-delivery-message">{message}</div>}

      <div className="live-delivery-grid">
        {deliveries.length === 0 ? (
          <div className="live-delivery-empty">Todavia no hay pedidos asignados a repartidor.</div>
        ) : deliveries.map((delivery) => (
          <article className="live-delivery-card" key={delivery.id}>
            <div className="live-delivery-top">
              <strong>{delivery.tracking_code}</strong>
              <span className={delivery.is_active ? 'delivery-live-on' : 'delivery-live-off'}>
                {delivery.is_active ? 'En reparto' : 'Finalizado'}
              </span>
            </div>

            <p><b>Cliente:</b> {delivery.customer_name}</p>
            <p><b>Telefono:</b> {delivery.customer_phone}</p>
            <p><b>Direccion:</b> {delivery.customer_address}</p>
            <p><b>Repartidor:</b> {delivery.rider_name} - {delivery.rider_phone}</p>
            <p><b>Estado pedido:</b> {delivery.order_status}</p>
            <p><b>Ultima ubicacion:</b> {delivery.last_seen_at ? new Date(delivery.last_seen_at).toLocaleString() : 'Sin GPS todavia'}</p>

            {delivery.last_latitude && delivery.last_longitude ? (
              <iframe
                title={`live-delivery-map-${delivery.id}`}
                className="live-delivery-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(delivery.last_longitude)-0.01}%2C${Number(delivery.last_latitude)-0.01}%2C${Number(delivery.last_longitude)+0.01}%2C${Number(delivery.last_latitude)+0.01}&layer=mapnik&marker=${delivery.last_latitude}%2C${delivery.last_longitude}`}
              />
            ) : (
              <div className="live-delivery-map-empty">Esperando GPS del repartidor</div>
            )}

            <div className="live-delivery-actions">
              <input readOnly value={makeRiderUrl(delivery)} />
              <a href={makeRiderUrl(delivery)} target="_blank" rel="noreferrer">Abrir app pÃ­k</a>
              <a href={whatsappRider(delivery)} target="_blank" rel="noreferrer">WhatsApp pÃ­k</a>
              <a href={whatsappCustomer(delivery)} target="_blank" rel="noreferrer">WhatsApp cliente</a>
              <a href={makeCustomerTrackUrl()} target="_blank" rel="noreferrer">Seguimiento cliente</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}





function OrderRiderStatusBox({ order }) {
  const [delivery, setDelivery] = useState(null);
  const [message, setMessage] = useState('');

  const orderId = order?.id || order?.order_id;

  const loadDelivery = async () => {
    if (!orderId) return;

    try {
      const res = await axios.get(`${API}/delivery/admin-list/`);
      const deliveries = res.data.deliveries || [];
      const found = deliveries.find(d => Number(d.order_id) === Number(orderId));
      setDelivery(found || null);
      setMessage('');
    } catch {
      setMessage('No se pudo cargar el repartidor.');
    }
  };

  useEffect(() => {
    loadDelivery();
    const timer = setInterval(loadDelivery, 5000);
    return () => clearInterval(timer);
  }, [orderId]);

  if (!orderId) return null;

  if (!delivery) {
    return (
      <div className="order-rider-status waiting">
        <strong>Repartidor</strong>
        <span>Sin repartidor asignado</span>
      </div>
    );
  }

  const riderUrl = `${window.location.origin}/rider?token=${delivery.token}`;
  const riderPhone = String(delivery.rider_phone || '').replace(/\D/g, '');
  const isGpsActive = !!(delivery.last_latitude && delivery.last_longitude);

  return (
    <div className={`order-rider-status ${delivery.is_active ? 'active' : 'finished'}`}>
      <div className="order-rider-top">
        <strong>Repartidor</strong>
        <span>{delivery.is_active ? 'En reparto' : 'Finalizado'}</span>
      </div>

      <p><b>Nombre:</b> {delivery.rider_name || '-'}</p>
      <p><b>Teléfono:</b> {delivery.rider_phone || '-'}</p>
      <p><b>GPS:</b> {isGpsActive ? 'Activo' : 'Esperando GPS'}</p>
      <p><b>Última señal:</b> {delivery.last_seen_at ? new Date(delivery.last_seen_at).toLocaleTimeString() : '-'}</p>

      <div className="order-rider-actions">
        {riderPhone && <a href={`tel:${delivery.rider_phone}`}>Llamar</a>}
        {riderPhone && <a href={`https://wa.me/${riderPhone}`} target="_blank" rel="noreferrer">WhatsApp</a>}
        <a href={riderUrl} target="_blank" rel="noreferrer">App pík</a>
      </div>

      {message && <small>{message}</small>}
    </div>
  );
}



function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (Number(v) * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function estimateDeliveryMinutes(distanceKm) {
  const avgUrbanSpeedKmH = 22;
  const minutes = Math.ceil((Number(distanceKm) / avgUrbanSpeedKmH) * 60 + 3);
  return Math.max(3, Math.min(minutes, 60));
}

function AdminLiveRidersMap() {
  const [deliveries, setDeliveries] = useState([]);
  const [message, setMessage] = useState('');

  const loadDeliveries = async () => {
    try {
      const res = await axios.get(`${API}/delivery/admin-list/`);
      const active = (res.data.deliveries || []).filter(d =>
        d.is_active &&
        d.last_latitude &&
        d.last_longitude &&
        String(d.order_status || '').toLowerCase() !== 'delivered'
      );
      setDeliveries(active);
      setMessage('');
    } catch {
      setMessage('No se pudo cargar el mapa de repartidores.');
    }
  };

  useEffect(() => {
    loadDeliveries();
    const timer = setInterval(loadDeliveries, 5000);
    return () => clearInterval(timer);
  }, []);

  const centerLat = deliveries.length ? Number(deliveries[0].last_latitude) : 40.9701;
  const centerLng = deliveries.length ? Number(deliveries[0].last_longitude) : -5.6635;
  const bbox = `${centerLng - 0.04}%2C${centerLat - 0.04}%2C${centerLng + 0.04}%2C${centerLat + 0.04}`;
  const markers = deliveries.map(d => `&marker=${d.last_latitude}%2C${d.last_longitude}`).join('');

  return (
    <section className="admin-live-riders-map card">
      <div className="admin-live-map-header">
        <div>
          <h2>Mapa vivo de repartidores</h2>
          <p>Todos los repartidores activos con GPS actualizado.</p>
        </div>
        <button onClick={loadDeliveries}>Actualizar mapa</button>
      </div>

      {message && <div className="admin-live-map-message">{message}</div>}

      {deliveries.length === 0 ? (
        <div className="admin-live-map-empty">No hay repartidores con GPS activo ahora.</div>
      ) : (
        <>
          <iframe
            title="Mapa vivo de repartidores"
            className="admin-riders-big-map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${markers}`}
          />

          <div className="admin-rider-map-list">
            {deliveries.map(d => (
              <article key={d.id} className="admin-rider-map-card">
                <strong>{d.rider_name || 'Repartidor'}</strong>
                <span>{d.tracking_code}</span>
                <p>{d.customer_address}</p>
                <small>Ultima señal: {d.last_seen_at ? new Date(d.last_seen_at).toLocaleTimeString() : '-'}</small>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function DeliveryEtaBox({ latitude, longitude, customerAddress, status }) {
  const [customerCoords, setCustomerCoords] = useState(null);
  const [message, setMessage] = useState('');

  const geocodeAddress = async () => {
    if (!customerAddress || !latitude || !longitude) return;

    const cacheKey = `geocode_${customerAddress}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        setCustomerCoords(JSON.parse(cached));
        return;
      } catch {}
    }

    try {
      const query = encodeURIComponent(`${customerAddress}, Salamanca, Spain`);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();

      if (data && data[0]) {
        const coords = { lat: Number(data[0].lat), lng: Number(data[0].lon) };
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        setCustomerCoords(coords);
        setMessage('');
      } else {
        setMessage('No se pudo calcular la distancia exacta.');
      }
    } catch {
      setMessage('Distancia no disponible.');
    }
  };

  useEffect(() => {
    geocodeAddress();
  }, [customerAddress, latitude, longitude]);

  if (!latitude || !longitude || String(status || '').toLowerCase() === 'delivered') return null;

  let distanceKm = null;
  let eta = null;

  if (customerCoords) {
    distanceKm = haversineDistanceKm(Number(latitude), Number(longitude), customerCoords.lat, customerCoords.lng);
    eta = estimateDeliveryMinutes(distanceKm);
  }

  return (
    <div className="delivery-eta-box">
      <h4>Tiempo estimado de llegada</h4>
      {eta ? (
        <div className="delivery-eta-grid">
          <div>
            <strong>{eta} min</strong>
            <span>ETA aproximado</span>
          </div>
          <div>
            <strong>{distanceKm.toFixed(2)} km</strong>
            <span>Distancia aprox.</span>
          </div>
        </div>
      ) : (
        <p>{message || 'Calculando distancia y tiempo estimado...'}</p>
      )}
    </div>
  );
}



function RiderPerformanceReports() {
  const [period, setPeriod] = useState('today');
  const [commissionRate, setCommissionRate] = useState('1.5');
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');

  const loadReport = async () => {
    setMessage('');
    try {
      const res = await axios.get(`${API}/delivery/rider-performance/`, {
        params: {
          period,
          commission_rate: commissionRate || 0,
        },
      });
      setReport(res.data);
    } catch {
      setMessage('No se pudo cargar el informe de repartidores.');
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  const exportCsv = () => {
    if (!report?.riders?.length) return;

    const rows = [
      ['Rider', 'Phone', 'Total Orders', 'Delivered', 'Active', 'GPS Orders', 'Avg Minutes', 'Total Sales', 'Commission']
    ];

    report.riders.forEach(r => {
      rows.push([
        r.rider_name,
        r.rider_phone,
        r.total_orders,
        r.delivered_orders,
        r.active_orders,
        r.gps_orders,
        r.avg_delivery_minutes ?? '',
        r.total_sales,
        r.estimated_commission,
      ]);
    });

    const csv = rows.map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rider-performance-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = report?.summary || {};

  return (
    <section className="rider-performance-panel card">
      <div className="rider-performance-header">
        <div>
          <h2>Informe de repartidores</h2>
          <p>Rendimiento, entregas, ventas y comisiones por repartidor.</p>
        </div>

        <div className="rider-performance-controls">
          <select value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="today">Hoy</option>
            <option value="week">Últimos 7 días</option>
            <option value="month">Últimos 30 días</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.1"
            value={commissionRate}
            onChange={e => setCommissionRate(e.target.value)}
            placeholder="Comisión por entrega"
          />
          <button onClick={loadReport}>Actualizar</button>
          <button onClick={exportCsv}>Exportar CSV</button>
        </div>
      </div>

      {message && <div className="rider-performance-message">{message}</div>}

      {report && (
        <>
          <div className="rider-performance-stats">
            <div><strong>{summary.total_riders || 0}</strong><span>Repartidores</span></div>
            <div><strong>{summary.total_orders || 0}</strong><span>Pedidos</span></div>
            <div><strong>{summary.total_delivered || 0}</strong><span>Entregados</span></div>
            <div><strong>{summary.total_active || 0}</strong><span>Activos</span></div>
            <div><strong>€{Number(summary.total_sales || 0).toFixed(2)}</strong><span>Ventas</span></div>
            <div><strong>€{Number(summary.total_commission || 0).toFixed(2)}</strong><span>Comisiones</span></div>
          </div>

          <div className="rider-performance-grid">
            {(report.riders || []).length === 0 ? (
              <div className="rider-performance-empty">No hay datos de repartidores en este periodo.</div>
            ) : report.riders.map((rider, index) => (
              <article className="rider-performance-card" key={`${rider.rider_phone}-${index}`}>
                <div className="rider-performance-top">
                  <div>
                    <strong>{rider.rider_name}</strong>
                    <span>{rider.rider_phone || '-'}</span>
                  </div>
                  <b>{rider.delivered_orders} entregas</b>
                </div>

                <div className="rider-performance-metrics">
                  <div><strong>{rider.total_orders}</strong><span>Total</span></div>
                  <div><strong>{rider.active_orders}</strong><span>Activos</span></div>
                  <div><strong>{rider.gps_orders}</strong><span>GPS</span></div>
                  <div><strong>{rider.avg_delivery_minutes ?? '-'}</strong><span>Min. media</span></div>
                  <div><strong>€{Number(rider.total_sales || 0).toFixed(2)}</strong><span>Ventas</span></div>
                  <div><strong>€{Number(rider.estimated_commission || 0).toFixed(2)}</strong><span>Comisión</span></div>
                </div>

                <details>
                  <summary>Ver pedidos</summary>
                  <div className="rider-performance-orders">
                    {(rider.orders || []).map(order => (
                      <div key={order.order_id} className="rider-performance-order-row">
                        <strong>{order.tracking_code}</strong>
                        <span>{order.status}</span>
                        <span>€{Number(order.total || 0).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}


function RiderWorkloadSummary() {
  const [summary, setSummary] = useState([]);
  const [message, setMessage] = useState('');

  const loadSummary = async () => {
    try {
      const res = await axios.get(`${API}/delivery/admin-list/`);
      const deliveries = res.data.deliveries || [];
      const active = deliveries.filter(d => d.is_active && String(d.order_status || '').toLowerCase() !== 'delivered');

      const grouped = {};
      active.forEach(d => {
        const key = d.rider_phone || d.rider_name || 'Sin repartidor';
        if (!grouped[key]) {
          grouped[key] = {
            rider_name: d.rider_name || 'Repartidor',
            rider_phone: d.rider_phone || '',
            count: 0,
            gps_active: 0,
            orders: [],
          };
        }
        grouped[key].count += 1;
        if (d.last_latitude && d.last_longitude) grouped[key].gps_active += 1;
        grouped[key].orders.push(d.tracking_code);
      });

      setSummary(Object.values(grouped));
      setMessage('');
    } catch {
      setMessage('No se pudo cargar el resumen de repartidores.');
    }
  };

  useEffect(() => {
    loadSummary();
    const timer = setInterval(loadSummary, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="rider-workload-summary card">
      <div className="rider-workload-header">
        <div>
          <h2>Repartidores activos</h2>
          <p>Pedidos activos por repartidor y estado GPS.</p>
        </div>
        <button onClick={loadSummary}>Actualizar</button>
      </div>

      {message && <div className="rider-workload-message">{message}</div>}

      <div className="rider-workload-grid">
        {summary.length === 0 ? (
          <div className="rider-workload-empty">No hay repartidores con pedidos activos.</div>
        ) : summary.map((rider, index) => (
          <article className="rider-workload-card" key={`${rider.rider_phone}-${index}`}>
            <div className="rider-workload-top">
              <strong>{rider.rider_name}</strong>
              <span>{rider.count} pedido(s)</span>
            </div>
            <p><b>Teléfono:</b> {rider.rider_phone || '-'}</p>
            <p><b>GPS activo:</b> {rider.gps_active}/{rider.count}</p>
            <p><b>Pedidos:</b> {rider.orders.join(', ')}</p>
          </article>
        ))}
      </div>
    </section>
  );
}


function OrderDeliveryButtonFromList({ order }) {
  const [open, setOpen] = useState(false);
  const [riders, setRiders] = useState([]);
  const [selectedRiderId, setSelectedRiderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const orderId = order?.id || order?.order_id;

  const loadRiders = async () => {
    setMessage('');
    try {
      const res = await axios.get(`${API}/delivery/riders/`);
      const activeRiders = (res.data.riders || []).filter(r => r.is_active);
      setRiders(activeRiders);
      if (activeRiders.length && !selectedRiderId) {
        setSelectedRiderId(String(activeRiders[0].id));
      }
      if (!activeRiders.length) {
        setMessage('No hay repartidores activos. Primero guarda un repartidor en Gestion de repartidores.');
      }
    } catch {
      setMessage('No se pudo cargar la lista de repartidores. Revisa backend y migraciones.');
    }
  };

  const openPicker = async () => {
    setOpen(true);
    await loadRiders();
  };

  const assignToSelectedRider = async () => {
    if (!orderId) {
      setMessage('Order ID not found.');
      return;
    }

    const rider = riders.find(r => String(r.id) === String(selectedRiderId));
    if (!rider) {
      setMessage('Selecciona un repartidor.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(`${API}/delivery/create-tracking/`, {
        order_id: orderId,
        rider_name: rider.name,
        rider_phone: rider.phone,
      });

      const token = res.data.token;
      const riderUrl = `${window.location.origin}/rider?token=${token}`;
      const customerTrackUrl = `${window.location.origin}/track`;

      try {
        await navigator.clipboard.writeText(riderUrl);
      } catch (e) {}

      const riderPhoneClean = String(rider.phone || '').replace(/\D/g, '');
      const customerPhoneClean = String(order.customer_phone || order.phone || '').replace(/\D/g, '');

      const riderMessage = encodeURIComponent(
        `Casa de Kebab Turco\nNuevo pedido para repartir\nPedido: ${res.data.tracking_code || orderId}\nCliente: ${order.customer_name || order.name || ''}\nDireccion: ${order.customer_address || order.address || ''}\nAbre este enlace. Al abrirlo, el pedido se confirma automaticamente para reparto:\n${riderUrl}`
      );

      const customerMessage = encodeURIComponent(
        `Casa de Kebab Turco\nSu pedido esta en camino.\nPedido: ${res.data.tracking_code || orderId}\nPuede seguir al repartidor aqui:\n${customerTrackUrl}\nTelefono usado en el pedido: ${order.customer_phone || order.phone || ''}`
      );

      if (riderPhoneClean) {
        window.open(`https://wa.me/${riderPhoneClean}?text=${riderMessage}`, '_blank');
      }

      setMessage(`Pedido asignado a ${rider.name}. Link enviado al repartidor. Cuando abra el link, el pedido queda confirmado para reparto.`);
      setOpen(false);

      if (typeof fetchData === 'function') {
        fetchData();
      }
    } catch {
      setMessage('No se pudo asignar el pedido al repartidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="send-rider-btn"
        onClick={openPicker}
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Enviar a repartidor'}
      </button>

      {open && (
        <div className="rider-picker-backdrop">
          <div className="rider-picker-modal">
            <div className="rider-picker-header">
              <h3>Seleccionar repartidor</h3>
              <button type="button" onClick={() => setOpen(false)}>Cerrar</button>
            </div>

            <p className="rider-picker-order">Pedido #{orderId} - {order?.customer_name}</p>

            {message && <div className="rider-picker-message">{message}</div>}

            <div className="rider-picker-list">
              {riders.map(rider => (
                <label
                  key={rider.id}
                  className={`rider-picker-item ${String(selectedRiderId) === String(rider.id) ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`rider-${orderId}`}
                    checked={String(selectedRiderId) === String(rider.id)}
                    onChange={() => setSelectedRiderId(String(rider.id))}
                  />
                  <div>
                    <strong>{rider.name}</strong>
                    <span>{rider.phone}</span>
                    <small>{rider.vehicle_type || 'Moto'} {rider.vehicle_plate ? `- ${rider.vehicle_plate}` : ''}</small>
                  </div>
                </label>
              ))}
            </div>

            <div className="rider-picker-actions">
              <button type="button" onClick={loadRiders}>Actualizar lista</button>
              <button type="button" className="confirm-rider-btn" onClick={assignToSelectedRider} disabled={loading || !selectedRiderId}>
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


function OrderDeliveryButton({ order }) {
  const [loading, setLoading] = useState(false);

  const assignToRider = async () => {
    const orderId = order?.id || order?.order_id;
    if (!orderId) {
      alert('Order ID not found.');
      return;
    }

    const riderName = window.prompt('Nombre del repartidor:', 'Repartidor') || 'Repartidor';
    const riderPhone = window.prompt('Telefono del repartidor:', '600000000') || '600000000';

    setLoading(true);

    try {
      const res = await axios.post(`${API}/delivery/create-tracking/`, {
        order_id: orderId,
        rider_name: riderName,
        rider_phone: riderPhone,
      });

      const token = res.data.token;
      const riderUrl = `${window.location.origin}/rider?token=${token}`;
      const customerTrackUrl = `${window.location.origin}/track`;

      try {
        await navigator.clipboard.writeText(riderUrl);
      } catch (e) {}

      const riderPhoneClean = String(riderPhone).replace(/\D/g, '');
      const customerPhoneClean = String(order.customer_phone || order.phone || '').replace(/\D/g, '');

      const riderMessage = encodeURIComponent(
        `Casa de Kebab Turco\nNuevo pedido para repartir\nPedido: ${res.data.tracking_code || orderId}\nCliente: ${order.customer_name || order.name || ''}\nDireccion: ${order.customer_address || order.address || ''}\nAbre este enlace. Al abrirlo, el pedido se confirma automaticamente para reparto:\n${riderUrl}`
      );

      const customerMessage = encodeURIComponent(
        `Casa de Kebab Turco\nSu pedido esta en camino.\nPedido: ${res.data.tracking_code || orderId}\nPuede seguir al repartidor aqui:\n${customerTrackUrl}`
      );

      const openRiderWhatsApp = window.confirm(
        `Reparto creado.\n\nEnlace del repartidor copiado:\n${riderUrl}\n\nQuieres abrir WhatsApp para el repartidor?`
      );

      if (openRiderWhatsApp && riderPhoneClean) {
        window.open(`https://wa.me/${riderPhoneClean}?text=${riderMessage}`, '_blank');
      }


      if (typeof fetchData === 'function') {
        fetchData();
      }
    } catch (err) {
      alert('No se pudo enviar el pedido al repartidor. Revisa backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="send-rider-btn"
      onClick={assignToRider}
      disabled={loading}
    >
      {loading ? 'Enviando...' : 'Enviar a repartidor'}
    </button>
  );
}



function CustomerOrderLiveDeliveryMap({ trackingCode, phone }) {
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const loadLocation = async () => {
    if (!trackingCode || !phone) return;

    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, {
        tracking_code: trackingCode,
        phone,
      });

      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || 'Ubicacion del repartidor no disponible todavia.');
      }
    } catch {
      setLocation(null);
      setMessage('No se pudo cargar la ubicacion del repartidor.');
    }
  };

  useEffect(() => {
    loadLocation();
    const timer = setInterval(loadLocation, 5000);
    return () => clearInterval(timer);
  }, [trackingCode, phone]);

  if (!trackingCode || !phone) return null;

  return (
    <div className="customer-order-live-map-box">
      <h3>Ubicacion en vivo del repartidor</h3>

      {message && <div className="customer-order-live-message">{message}</div>}

      {location && (
        <>
          <div className="customer-order-live-info">
            <span><b>Estado:</b> {location.status}</span>
            <span><b>Ultima actualizacion:</b> {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}</span>
            {location.rider_name && <span><b>Repartidor:</b> {location.rider_name}</span>}
            {location.rider_phone && <span><b>Telefono:</b> {location.rider_phone}</span>}
          </div>

          <iframe
            title="Ubicacion en vivo del repartidor"
            className="customer-order-live-map"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
          />

          <div className="customer-order-live-actions">
            <a
              href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir mapa
            </a>
            {location.rider_phone && <a href={`tel:${location.rider_phone}`}>Llamar repartidor</a>}
            {location.rider_phone && (
              <a
                href={`https://wa.me/${String(location.rider_phone).replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp repartidor
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
}



function AutoCustomerLiveDeliveryMap() {
  const [visible, setVisible] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState(null);
  const [message, setMessage] = useState('');

  const detectTrackingPage = () => {
    const text = document.body?.innerText || '';
    return text.includes('Seguimiento de pedido') || text.includes('Buscar pedido') || window.location.href.includes('/track');
  };

  const readInputsFromPage = () => {
    const inputs = Array.from(document.querySelectorAll('input'));
    const values = inputs.map(i => String(i.value || '').trim()).filter(Boolean);
    let code = '';
    let tel = '';

    for (const value of values) {
      const clean = value.replace(/\s/g, '');
      if (!code && (/^CDKT-\d+$/i.test(value) || /^\d{1,8}$/.test(value))) code = value;
      if (!tel && /^\+?\d{6,15}$/.test(clean)) tel = clean;
    }

    if (code) setTrackingCode(code);
    if (tel) setPhone(tel);
    return { code, tel };
  };

  const loadLocation = async () => {
    const detected = readInputsFromPage();
    const code = detected.code || trackingCode;
    const tel = detected.tel || phone;

    if (!code || !tel) {
      setMessage('Introduce el numero de pedido y telefono para ver el repartidor.');
      setLocation(null);
      return;
    }

    try {
      const res = await axios.post(`${API}/delivery/customer-location/`, {
        tracking_code: code,
        phone: tel,
      });

      if (res.data.show_map) {
        setLocation(res.data);
        setMessage('');
      } else {
        setLocation(null);
        setMessage(res.data.detail || 'La ubicacion del repartidor todavia no esta disponible.');
      }
    } catch {
      setLocation(null);
      setMessage('No se pudo cargar la ubicacion del repartidor.');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const isVisible = detectTrackingPage();
      setVisible(isVisible);
      if (isVisible) readInputsFromPage();
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    loadLocation();
    const timer = setInterval(loadLocation, 5000);
    return () => clearInterval(timer);
  }, [visible, trackingCode, phone]);

  if (!visible) return null;

  return (
    <section className="auto-customer-live-map">
      <div className="auto-live-header">
        <div>
          <h3>Ubicacion en vivo del repartidor</h3>
          <p>Disponible cuando el pedido esta en camino y el repartidor activa el GPS.</p>
        </div>
        <button onClick={loadLocation}>Actualizar ubicacion</button>
      </div>

      {message && <div className="auto-live-message">{message}</div>}

      {location && (
        <div className="auto-live-content">
          <div className="auto-live-info">
            <span><b>Pedido:</b> {location.tracking_code}</span>
            <span><b>Estado:</b> {location.status}</span>
            <span><b>Ultima actualizacion:</b> {location.last_seen_at ? new Date(location.last_seen_at).toLocaleString() : '-'}</span>
            {location.rider_name && <span><b>Repartidor:</b> {location.rider_name}</span>}
            {location.rider_phone && <span><b>Telefono:</b> {location.rider_phone}</span>}
          </div>

          <iframe
            title="Mapa vivo repartidor cliente"
            className="auto-customer-map-frame"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(location.longitude)-0.01}%2C${Number(location.latitude)-0.01}%2C${Number(location.longitude)+0.01}%2C${Number(location.latitude)+0.01}&layer=mapnik&marker=${location.latitude}%2C${location.longitude}`}
          />

          <div className="auto-live-actions">
            <a href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=17/${location.latitude}/${location.longitude}`} target="_blank" rel="noreferrer">Abrir mapa</a>
            {location.rider_phone && <a href={`tel:${location.rider_phone}`}>Llamar repartidor</a>}
            {location.rider_phone && <a href={`https://wa.me/${String(location.rider_phone).replace(/\D/g, '')}`} target="_blank" rel="noreferrer">WhatsApp repartidor</a>}
          </div>
        </div>
      )}
    </section>
  );
}



function RiderManagementPanel({ onSelectRider }) {
  const [riders, setRiders] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    phone: '',
    vehicle_type: 'Moto',
    vehicle_plate: '',
    is_active: true,
    notes: '',
  });
  const [message, setMessage] = useState('');

  const loadRiders = async () => {
    try {
      const res = await axios.get(`${API}/delivery/riders/`);
      setRiders(res.data.riders || []);
    } catch {
      setMessage('No se pudo cargar la lista de repartidores.');
    }
  };

  useEffect(() => {
    loadRiders();
  }, []);

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      phone: '',
      vehicle_type: 'Moto',
      vehicle_plate: '',
      is_active: true,
      notes: '',
    });
  };

  const saveRider = async () => {
    if (!form.name || !form.phone) {
      setMessage('Nombre y telefono son obligatorios.');
      return;
    }

    try {
      if (form.id) {
        await axios.patch(`${API}/delivery/riders/${form.id}/`, form);
        setMessage('Repartidor actualizado.');
      } else {
        await axios.post(`${API}/delivery/riders/`, form);
        setMessage('Repartidor guardado.');
      }

      resetForm();
      await loadRiders();
    } catch {
      setMessage('No se pudo guardar el repartidor.');
    }
  };

  const editRider = (rider) => {
    setForm({
      id: rider.id,
      name: rider.name || '',
      phone: rider.phone || '',
      vehicle_type: rider.vehicle_type || 'Moto',
      vehicle_plate: rider.vehicle_plate || '',
      is_active: !!rider.is_active,
      notes: rider.notes || '',
    });
  };

  const deleteRider = async (rider) => {
    if (!window.confirm(`Eliminar repartidor ${rider.name}?`)) return;

    try {
      await axios.delete(`${API}/delivery/riders/${rider.id}/`);
      setMessage('Repartidor eliminado.');
      await loadRiders();
    } catch {
      setMessage('No se pudo eliminar el repartidor.');
    }
  };

  return (
    <section className="rider-management-panel card">
      <div className="rider-management-header">
        <div>
          <h2>Gestion de repartidores</h2>
          <p>Guarda, edita y selecciona los repartidores para asignar pedidos.</p>
        </div>
        <button onClick={loadRiders}>Actualizar</button>
      </div>

      <div className="rider-management-form">
        <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Telefono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        <input placeholder="Vehiculo, por ejemplo Moto" value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} />
        <input placeholder="Matricula / identificacion" value={form.vehicle_plate} onChange={e => setForm({ ...form, vehicle_plate: e.target.value })} />
        <label className="rider-check">
          <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
          Activo
        </label>
        <textarea placeholder="Notas" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button onClick={saveRider}>{form.id ? 'Actualizar repartidor' : 'Guardar repartidor'}</button>
        {form.id && <button className="rider-cancel-btn" onClick={resetForm}>Cancelar edicion</button>}
      </div>

      {message && <div className="rider-management-message">{message}</div>}

      <div className="rider-list-grid">
        {riders.length === 0 ? (
          <div className="rider-empty">Todavia no hay repartidores guardados.</div>
        ) : riders.map(rider => (
          <article className="rider-list-card" key={rider.id}>
            <div className="rider-list-top">
              <strong>{rider.name}</strong>
              <span className={rider.is_active ? 'rider-active' : 'rider-inactive'}>
                {rider.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p><b>Telefono:</b> {rider.phone}</p>
            <p><b>Vehiculo:</b> {rider.vehicle_type}</p>
            {rider.vehicle_plate && <p><b>Matricula:</b> {rider.vehicle_plate}</p>}
            {rider.notes && <p><b>Notas:</b> {rider.notes}</p>}

            <div className="rider-list-actions">
              {onSelectRider && rider.is_active && (
                <button onClick={() => onSelectRider(rider)}>Seleccionar</button>
              )}
              <button onClick={() => editRider(rider)}>Editar</button>
              <button className="delete-rider-btn" onClick={() => deleteRider(rider)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


function App() {
  const [restaurantSettings, setRestaurantSettings] = useState(null);
  if (window.location.pathname.includes('/rider')) { return <RiderAppPage lang="es" />; }

  if (window.location.pathname.includes('/delivery-center')) { return <DeliveryManagementCenter lang="es" />; }
  if (window.location.pathname.includes('/delivery')) { return <RiderDeliveryPage lang="es" />; }
  if (window.location.pathname.includes('/track')) { return <CustomerLiveTrackPage lang="es" />; }

  if (window.location.pathname.includes('/delivery-admin')) { return <DeliveryAdminPage lang="es" />; }
  if (window.location.pathname.includes('/delivery')) { return <ProDeliveryMobilePage lang="es" />; }
  if (window.location.pathname.includes('/track')) { return <ProCustomerTrackingPage lang="es" />; }

  if (window.location.pathname.includes('/delivery')) { return <ProDeliveryMobilePage lang="es" />; }
  if (window.location.pathname.includes('/track')) { return <ProCustomerTrackingPage lang="es" />; }

  if (window.location.pathname.includes('/delivery')) { return <DeliveryMobilePage lang={lang || 'es'} />; }

  const [page, setPage] = useState(() => window.location.hash === '#admin' ? 'login' : 'customer');
  const [lang, setLang] = useState(() => localStorage.getItem('restaurant_lang') || 'es');
  const [isAdmin, setIsAdmin] = useState(() => Boolean(localStorage.getItem('admin_access_token')));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('restaurant_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#admin' && !isAdmin) setPage('login');
    };
    window.addEventListener('hashchange', onHashChange);
    
  useEffect(() => {
    api.get('/restaurant-settings/')
      .then(res => setRestaurantSettings(res.data))
      .catch(() => setRestaurantSettings({
        name: 'Casa de Kebab Turco',
        phone: '+34 613 473 564',
        subtitle_es: 'Kebab fresco, pedidos rápidos, auténtico sabor turco',
        subtitle_en: 'Fresh kebab, fast orders, authentic Turkish taste',
      }));
  }, []);

return () => window.removeEventListener('hashchange', onHashChange);
  }, [isAdmin]);

  const t = translations[lang];

  const loadCurrentUser = async () => {
    try {
      const res = await api.get('/current-user/');
      setCurrentUser(res.data);
      return res.data;
    } catch {
      setCurrentUser(null);
      return null;
    }
  };

  useEffect(() => {
    if (isAdmin) loadCurrentUser();
  }, [isAdmin]);

  const loginDone = async () => {
    setIsAdmin(true);
    await loadCurrentUser();
    setPage('admin');
  };

  const logout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    setIsAdmin(false);
    setCurrentUser(null);
    setPage('customer');
  };

  return (
    <>
      <Header page={page} setPage={setPage} lang={lang} setLang={setLang} t={t} isAdmin={isAdmin} currentUser={currentUser} logout={logout}/>
      {page === 'customer' && <CustomerPage lang={lang} t={t}/>}
      {page === 'tracking' && <TrackingPage t={t}/>}
      {page === 'login' && !isAdmin && <LoginPage t={t} onLogin={loginDone}/>}
      {page === 'admin' && isAdmin && <AdminPage t={t} currentUser={currentUser}/>}
      {page === 'accounting' && isAdmin && currentUser?.role === 'admin' && <AccountingPage t={t}/>}
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);

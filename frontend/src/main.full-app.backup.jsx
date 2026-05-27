
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
    customer: 'Cliente',
    trackingTab: 'Seguimiento',
    orderDeliveredHidden: 'Este pedido ya fue entregado. No hay información pendiente para mostrar.',
    myAccount: 'Mi cuenta',
    orderTracking: 'Seguimiento de pedido',
    trackingCode: 'Número de seguimiento',
    trackingCodePlaceholder: 'Ejemplo: CDKT-000032',
    trackOrderButton: 'Buscar pedido',
    trackingNotFound: 'No se encontró ningún pedido con este número y teléfono.',
    trackingHelp: 'Introduce el número de seguimiento y el teléfono usado en el pedido.',
    registerAccount: 'Crear cuenta',
    loginAccount: 'Entrar a mi cuenta',
    customerPassword: 'Contraseña',
    myOrders: 'Mis pedidos',
    noOrdersYet: 'No hay pedidos todavía.',
    trackingOnlyAccount: 'El seguimiento solo está disponible para pedidos realizados desde esta cuenta.',
    logoutAccount: 'Salir de cuenta',
    admin: 'Admin',
    accounting: 'Contabilidad',
    menu: 'Menú',
    yourOrder: 'Tu pedido',
    cartEmpty: 'Tu carrito está vacío.',
    total: 'Total',
    customerName: 'Nombre del cliente',
    phone: 'Teléfono',
    address: 'Dirección o número de mesa',
    takeaway: 'Para llevar',
    dineIn: 'Comer aquí',
    delivery: 'Entrega a domicilio',
    notes: 'Notas',
    placeOrder: 'Enviar pedido',
    paymentMethodCustomer: 'Forma de pago',
    paymentStatusLabel: 'Estado de pago',
    paidLabel: 'Pagado',
    pendingLabel: 'Pendiente',
    payOnDeliveryLabel: 'Pago al recibir',
    failedLabel: 'Pago fallido',
    cashDeliveryLabel: 'Efectivo al recibir',
    cardDeliveryLabel: 'Tarjeta al recibir',
    onlineCardLabel: 'Pago online',
    mixedPaymentLabel: 'Pago mixto',
    cashOnDelivery: 'Efectivo al recibir',
    cardOnDelivery: 'Tarjeta con datáfono al recibir',
    onlineCardPayment: 'Pago online con tarjeta',
    simulateBankPayment: 'Simular pago BBVA/Redsys',
    paymentApproved: 'Pago aprobado',
    paymentPendingDelivery: 'Pago pendiente al recibir',
    orderConfirmed: 'Pedido confirmado',
    trackingNumber: 'Número de seguimiento',
    orderSummary: 'Resumen del pedido',
    restaurantPhone: 'Teléfono del restaurante',
    callNow: 'Llamar ahora',
    close: 'Cerrar',
    successBlink: '¡Pedido enviado correctamente!',
    thankYouOrder: 'Gracias por su pedido. Lo prepararemos lo antes posible.',
    addToCart: 'Añadir',
    required: 'Escribe el nombre, teléfono, dirección o número de mesa y elige al menos un producto.',
    fieldRequired: 'Este campo es obligatorio.',
    completeRequiredFields: 'Completa los campos marcados en rojo.',
    orderOk: 'Pedido creado correctamente. Número de pedido',
    orderFail: 'No se pudo crear el pedido. Revisa el backend.',
    backendFail: 'No se pudo conectar con el servidor.',
    language: 'Idioma',
    loginTitle: 'Acceso de administrador',
    username: 'Usuario',
    password: 'Contraseña',
    login: 'Entrar',
    logout: 'Salir',
    loginError: 'Usuario o contraseña incorrectos.',
    protectedHint: 'Esta sección es solo para personal autorizado.',
    role: 'Rol',
    cashier: 'Caja',
    kitchen: 'Cocina',
    deliveryRole: 'Reparto',
    liveManagement: 'Gestión de pedidos en vivo',
    cashierPanel: 'Caja y pagos', paymentMethod: 'Método de pago', cash: 'Efectivo', card: 'Tarjeta', debt: 'Deuda', discount: 'Descuento', registerPayment: 'Registrar pago', openCash: 'Abrir caja', closeCash: 'Cerrar caja', openingCash: 'Efectivo inicial', closingCash: 'Efectivo final', profitLoss: 'Pérdidas y ganancias', materialCost: 'Coste de materiales', grossProfit: 'Beneficio bruto', dailyExpenses: 'Gastos diarios', netProfit: 'Beneficio neto',
    adminHelp: 'Gestión de pedidos, menú, inventario y caja según el rol del usuario.',
    adminTabs: 'Secciones',
    tabLive: 'Pedidos en vivo',
    tabCashier: 'Caja',
    tabCustomers: 'Clientes',
    tabInventory: 'Inventario',
    tabMenu: 'Menú',
    tabHistory: 'Historial',
    todaySales: 'Ventas de hoy',
    todayOrders: 'Pedidos de hoy',
    activeOrders: 'Pedidos activos',
    newOrdersCount: 'Pedidos nuevos',
    topFood: 'Comida más vendida',
    monthIncome: 'Ingresos del mes',
    recentOrders: 'Pedidos recientes',
    orderItems: 'Productos',
    type: 'Tipo',
    status: 'Estado',
    changeStatus: 'Cambiar estado',
    printReceipt: 'Imprimir recibo',
    sendWhatsapp: 'Enviar por WhatsApp',
    allStatuses: 'Todos los estados',
    searchOrders: 'Buscar pedido, cliente o teléfono',
    orderStatusNew: 'Nuevo',
    orderStatusPreparing: 'Preparando',
    orderStatusReady: 'Listo',
    orderStatusDelivered: 'Entregado',
    orderStatusCancelled: 'Cancelado',
    addFood: 'Añadir comida',
    foodName: 'Nombre de comida',
    price: 'Precio',
    description: 'Descripción',
    available: 'Disponible',
    save: 'Guardar',
    created: 'Creado correctamente',
    updated: 'Actualizado correctamente',
    customers: 'Clientes',
    customerDatabase: 'Banco de clientes',
    customerRepeat: 'Cliente recurrente',
    lastOrder: 'Último pedido',
    totalSpent: 'Total gastado',
    menuManagement: 'Gestión del menú',
    editFood: 'Editar comida',
    updateFood: 'Actualizar comida',
    cancelEdit: 'Cancelar edición',
    deleteFood: 'Eliminar',
    foodImage: 'Imagen de comida',
    imageOptional: 'Imagen opcional',
    noImage: 'Sin imagen',
    changeImage: 'Cambiar imagen',
    categories: 'Categorías',
    addCategory: 'Añadir categoría',
    categoryName: 'Nombre de categoría',
    allCategories: 'Todas',
    editFood: 'Editar comida',
    deleteFood: 'Eliminar',
    updateFood: 'Actualizar comida',
    cancelEdit: 'Cancelar edición',
    foodImage: 'Imagen de comida',
    imageOptional: 'Imagen opcional',
    noImage: 'Sin imagen',
    inventory: 'Inventario',
    addInventory: 'Añadir material',
    materialName: 'Nombre del material',
    unit: 'Unidad',
    currentStock: 'Stock actual',
    minimumStock: 'Stock mínimo',
    unitCost: 'Coste unitario',
    lowStock: 'Stock bajo',
    inventoryValue: 'Valor de inventario',
    linkIngredient: 'Conectar ingrediente a comida',
    quantityRequired: 'Cantidad requerida',
    refresh: 'Actualizar',
    soundOn: 'Sonido activado',
    soundOff: 'Sonido desactivado',
    testSound: 'Probar sonido',
    newOrderAlert: 'Nuevo pedido recibido',
    telegramSent: 'Enviado a Telegram',
    telegramNotConfigured: 'Telegram no configurado o no enviado',
  },
  en: {
    brandSub: 'Fresh kebab, fast orders, authentic Turkish taste',
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
    orderFail: 'Order failed. Check backend.',
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
            <h1>Casa de Kebab Turco</h1>
            <a className="header-phone-pill" href={`tel:+${RESTAURANT_PHONE}`}>☎ +34 613 473 564</a>
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

    const payload = {
      ...customer,
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
              <b>€{Number(publicTrackedOrder.total_amount || 0).toFixed(2)}</b>
            </div>
          </div>
        )}
      </section>
    </main>
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
    formData.append('description', editFoodForm.description || '');
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
          <h2>{t.customerDatabase}</h2>
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
                  <th>{t.lastOrder}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className={customer.total_orders > 1 ? 'returning-customer-row' : ''}>
                    <td><b>{customer.name}</b></td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td>{customer.total_orders}</td>
                    <td>€{Number(customer.total_spent || 0).toFixed(2)}</td>
                    <td>{customer.last_order_at ? new Date(customer.last_order_at).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {adminTab === 'live' && (
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
                <button className="whatsapp-mini-btn" onClick={() => window.open(order.whatsapp_url, '_blank')}>{t.sendWhatsapp}</button>
              </div>
            </article>
          ))}
        </div>
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

function AccountingPage({ t }) {
  return (
    <main className="stack">
      <section className="card">
        <h2>{t.accounting}</h2>
        <p>Accounting dashboard will continue in v8.0.</p>
      </section>
    </main>
  );
}

function App() {
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

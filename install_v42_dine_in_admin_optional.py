
from pathlib import Path
import shutil
import re

ROOT = Path(r"D:\Python_project\Site_resturante")
MAIN = ROOT / "frontend" / "src" / "main.jsx"
SERIALIZERS = ROOT / "backend" / "restaurant" / "serializers.py"

for p in [MAIN, SERIALIZERS]:
    if not p.exists():
        raise FileNotFoundError(f"File not found: {p}")
    shutil.copy2(p, p.with_suffix(p.suffix + ".before_v42_dine_in_optional"))

# -----------------------------
# Frontend patch: main.jsx
# -----------------------------
main = MAIN.read_text(encoding="utf-8", errors="replace")
main = main.encode("utf-8", "ignore").decode("utf-8", "ignore")

# 1) Add staff/admin mode inside CustomerPage after customer state.
if "isStaffOrderingModeV42" not in main:
    main = main.replace(
        "const [customer, setCustomer] = useState({ customer_name: '', customer_phone: '', customer_address: '', order_type: 'takeaway', payment_method: 'cash_delivery', notes: '' });",
        "const [customer, setCustomer] = useState({ customer_name: '', customer_phone: '', customer_address: '', order_type: 'takeaway', payment_method: 'cash_delivery', notes: '' });\n"
        "  const isStaffOrderingModeV42 = Boolean(localStorage.getItem('admin_access_token'));\n"
        "  const isDineInOrderV42 = customer.order_type === 'dine_in';",
        1
    )

# 2) If non-staff somehow has dine_in selected, force takeaway.
if "v42 force public customers away from dine_in" not in main:
    marker = "  const addToCart = item => {"
    effect = """
  // v42 force public customers away from dine_in
  useEffect(() => {
    if (!isStaffOrderingModeV42 && customer.order_type === 'dine_in') {
      setCustomer(prev => ({ ...prev, order_type: 'takeaway' }));
    }
  }, [isStaffOrderingModeV42, customer.order_type]);

"""
    main = main.replace(marker, effect + marker, 1)

# 3) Patch validateOrder: name/phone/address required only if not admin dine-in.
old_validate = """  const validateOrder = () => {
    const nextErrors = {};
    if (!customer.customer_name.trim()) nextErrors.customer_name = true;
    if (!customer.customer_phone.trim()) nextErrors.customer_phone = true;
    if (!customer.customer_address.trim()) nextErrors.customer_address = true;
    if (cart.length === 0) nextErrors.cart = true;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };"""

new_validate = """  const validateOrder = () => {
    const nextErrors = {};
    const dineInByStaff = isStaffOrderingModeV42 && customer.order_type === 'dine_in';

    if (!dineInByStaff && !customer.customer_name.trim()) nextErrors.customer_name = true;
    if (!dineInByStaff && !customer.customer_phone.trim()) nextErrors.customer_phone = true;
    if (!dineInByStaff && !customer.customer_address.trim()) nextErrors.customer_address = true;

    if (cart.length === 0) nextErrors.cart = true;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };"""

if old_validate in main:
    main = main.replace(old_validate, new_validate, 1)

# 4) Patch payload: for staff dine-in, send safe defaults if fields empty.
old_payload = """    const normalizedCustomerAddress = normalizeSalamancaAddressFrontend(customer.customer_address);

    const payload = {
      ...customer,
      customer_address: normalizedCustomerAddress,
      order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };"""

new_payload = """    const dineInByStaff = isStaffOrderingModeV42 && customer.order_type === 'dine_in';

    const safeCustomerForOrder = {
      ...customer,
      customer_name: dineInByStaff
        ? (customer.customer_name.trim() || 'Cliente salón')
        : customer.customer_name,
      customer_phone: dineInByStaff
        ? (customer.customer_phone.trim() || `MESA-${Date.now()}`)
        : customer.customer_phone,
      customer_address: dineInByStaff
        ? (customer.customer_address.trim() || 'Comer aquí')
        : normalizeSalamancaAddressFrontend(customer.customer_address),
    };

    const payload = {
      ...safeCustomerForOrder,
      order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };"""

if old_payload in main:
    main = main.replace(old_payload, new_payload, 1)

# Fallback for older payload without normalizedCustomerAddress
old_payload2 = """    const payload = {
      ...customer,
      order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };"""
if old_payload2 in main and "safeCustomerForOrder" not in main:
    main = main.replace(
        old_payload2,
        """    const dineInByStaff = isStaffOrderingModeV42 && customer.order_type === 'dine_in';

    const safeCustomerForOrder = {
      ...customer,
      customer_name: dineInByStaff
        ? (customer.customer_name.trim() || 'Cliente salón')
        : customer.customer_name,
      customer_phone: dineInByStaff
        ? (customer.customer_phone.trim() || `MESA-${Date.now()}`)
        : customer.customer_phone,
      customer_address: dineInByStaff
        ? (customer.customer_address.trim() || 'Comer aquí')
        : customer.customer_address,
    };

    const payload = {
      ...safeCustomerForOrder,
      order_items: cart.map(item => ({ menu_item_id: item.id, quantity: item.quantity }))
    };""",
        1
    )

# 5) Hide fields when admin/staff dine-in is selected.
field_block = """        <div className="field-wrap">
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
        </div>"""

field_block_new = """        {!(isStaffOrderingModeV42 && customer.order_type === 'dine_in') && (
          <>
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
          </>
        )}

        {isStaffOrderingModeV42 && customer.order_type === 'dine_in' && (
          <div className="dine-in-admin-note-v42">
            Pedido interno de salón: nombre, teléfono y dirección son opcionales.
          </div>
        )}"""

if field_block in main:
    main = main.replace(field_block, field_block_new, 1)

# 6) Hide dine_in option for non-admin/staff users.
option_old = """          <option value="takeaway">{t.takeaway}</option>
          <option value="dine_in">{t.dineIn}</option>
          <option value="delivery">{t.delivery}</option>"""
option_new = """          <option value="takeaway">{t.takeaway}</option>
          {isStaffOrderingModeV42 && <option value="dine_in">{t.dineIn}</option>}
          <option value="delivery">{t.delivery}</option>"""
if option_old in main:
    main = main.replace(option_old, option_new, 1)

MAIN.write_text(main, encoding="utf-8", errors="replace")

# -----------------------------
# Backend patch: serializers.py
# -----------------------------
s = SERIALIZERS.read_text(encoding="utf-8", errors="replace")
s = s.encode("utf-8", "ignore").decode("utf-8", "ignore")

# Insert safe defaults after order_items/payment_method area.
if "v42 backend dine-in optional defaults" not in s:
    target = """        order_items = validated_data.pop("order_items", [])
        payment_method = validated_data.get("payment_method", "cash_delivery")"""
    replacement = """        order_items = validated_data.pop("order_items", [])
        payment_method = validated_data.get("payment_method", "cash_delivery")

        # v42 backend dine-in optional defaults
        if validated_data.get("order_type") == "dine_in":
            if not str(validated_data.get("customer_name", "")).strip():
                validated_data["customer_name"] = "Cliente salón"
            if not str(validated_data.get("customer_phone", "")).strip():
                validated_data["customer_phone"] = f"MESA-{timezone.now().strftime('%Y%m%d%H%M%S')}"
            if not str(validated_data.get("customer_address", "")).strip():
                validated_data["customer_address"] = "Comer aquí\""""
    if target in s:
        s = s.replace(target, replacement, 1)

# Avoid creating Customer records for dine_in pseudo phone.
old_customer_create = """        customer_obj = None
        if phone:
            customer_obj, _ = Customer.objects.update_or_create(
                phone=phone,
                defaults={
                    "name": name,
                    "address": address,
                    "last_order_at": timezone.now(),
                },
            )"""
new_customer_create = """        customer_obj = None
        if phone and validated_data.get("order_type") != "dine_in":
            customer_obj, _ = Customer.objects.update_or_create(
                phone=phone,
                defaults={
                    "name": name,
                    "address": address,
                    "last_order_at": timezone.now(),
                },
            )"""
if old_customer_create in s:
    s = s.replace(old_customer_create, new_customer_create, 1)

SERIALIZERS.write_text(s, encoding="utf-8", errors="replace")

print("v42 dine-in admin optional fields installed.")
print("")
print("Run backend:")
print(r"cd D:\Python_project\Site_resturante\backend")
print("python manage.py runserver")
print("")
print("Run frontend:")
print(r"cd D:\Python_project\Site_resturante\frontend")
print("npm run dev")

from decimal import Decimal
from urllib.parse import quote

import requests
from decouple import config


def build_order_message(order):
    lines = [
        "🍽 Casa de Kebab Turco",
        f"🧾 Order / Pedido: #{order.id}",
        f"📌 Status / Estado: {order.status}",
        "",
        f"👤 Customer / Cliente: {order.customer_name}",
        f"📞 Phone / Teléfono: {order.customer_phone}",
        f"📍 Address/Table / Dirección/Mesa: {order.customer_address or '-'}",
        f"🚚 Type / Tipo: {order.order_type}",
    ]

    if order.notes:
        lines.append(f"📝 Notes / Notas: {order.notes}")

    lines.extend(["", "🛒 Items / Productos:"])

    for item in order.items.select_related("menu_item").all():
        lines.append(
            f"- {item.menu_item.name} x {item.quantity} = €{item.line_total:.2f}"
        )

    lines.extend([
        "",
        f"💳 Pago: {payment_method_label(order)}\n✅ Estado de pago: {payment_status_label(order)}\n🔖 Ref: {getattr(order, 'payment_reference', '') or '-'}\n\n💰 Total: €{order.total_amount:.2f}",
    ])

    return "\n".join(lines)


def send_order_to_telegram(order):
    token = config("TELEGRAM_BOT_TOKEN", default="")
    chat_id = config("TELEGRAM_CHAT_ID", default="")

    if not token or not chat_id:
        return False, "Telegram token or chat id is missing."

    message = build_order_message(order)
    url = f"https://api.telegram.org/bot{token}/sendMessage"

    try:
        response = requests.post(
            url,
            json={
                "chat_id": chat_id,
                "text": message,
                "parse_mode": "HTML",
            },
            timeout=10,
        )
        response.raise_for_status()
        return True, "Telegram notification sent."
    except Exception as exc:
        return False, str(exc)


def build_whatsapp_url(order):
    phone = config("WHATSAPP_RESTAURANT_PHONE", default="34613473564")
    message = build_order_message(order)
    return f"https://wa.me/{phone}?text={quote(message)}"



def payment_method_label(order):
    labels = {
        "cash_delivery": "Efectivo al recibir / پرداخت نقدی هنگام تحویل",
        "card_delivery": "Tarjeta al recibir / پرداخت با کارتخوان هنگام تحویل",
        "online_card": "Online card / پرداخت آنلاین",
        "mixed": "Mixed / پرداخت ترکیبی",
        "cash": "Cash / نقدی",
        "card": "Card / کارت",
        "debt": "Debt / بدهی",
    }
    return labels.get(getattr(order, "payment_method", ""), getattr(order, "payment_method", "-") or "-")


def payment_status_label(order):
    labels = {
        "paid": "Pagado / تسویه شده",
        "pending": "Pendiente / در انتظار پرداخت",
        "pay_on_delivery": "Pago al recibir / پرداخت هنگام تحویل",
        "failed": "Fallido / ناموفق",
        "cancelled": "Cancelado / لغو شده",
    }
    return labels.get(getattr(order, "payment_status", ""), getattr(order, "payment_status", "-") or "-")

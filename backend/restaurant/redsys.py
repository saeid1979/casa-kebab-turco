import base64
import hashlib
import hmac
import json
from decimal import Decimal

from Crypto.Cipher import DES3
from decouple import config


REDSYS_TEST_URL = "https://sis-t.redsys.es:25443/sis/realizarPago"
REDSYS_PRODUCTION_URL = "https://sis.redsys.es/sis/realizarPago"
SIGNATURE_VERSION = "HMAC_SHA512_V2"


def _base64url_encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _base64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode((data + padding).encode("utf-8"))


def _pad_8(data: bytes) -> bytes:
    pad_len = 8 - (len(data) % 8)
    if pad_len == 8:
        pad_len = 0
    return data + (b"\0" * pad_len)


def _decode_merchant_key(secret_key: str) -> bytes:
    try:
        return base64.b64decode(secret_key)
    except Exception:
        return secret_key.encode("utf-8")


def _encrypt_order(secret_key: str, order_number: str) -> bytes:
    key = _decode_merchant_key(secret_key)
    if len(key) not in (16, 24):
        key = hashlib.sha256(key).digest()[:24]

    key = DES3.adjust_key_parity(key)
    cipher = DES3.new(key, DES3.MODE_CBC, iv=b"\0\0\0\0\0\0\0\0")
    return cipher.encrypt(_pad_8(order_number.encode("utf-8")))


def create_signature(secret_key: str, merchant_parameters_b64: str, order_number: str) -> str:
    encrypted_order = _encrypt_order(secret_key, order_number)
    signature = hmac.new(
        encrypted_order,
        merchant_parameters_b64.encode("utf-8"),
        hashlib.sha512,
    ).digest()
    return _base64url_encode(signature)


def encode_parameters(params: dict) -> str:
    json_data = json.dumps(params, separators=(",", ":"), ensure_ascii=False)
    return _base64url_encode(json_data.encode("utf-8"))


def decode_parameters(merchant_parameters_b64: str) -> dict:
    return json.loads(_base64url_decode(merchant_parameters_b64).decode("utf-8"))


def cents_from_amount(amount: Decimal) -> str:
    return str(int((Decimal(amount) * Decimal("100")).quantize(Decimal("1"))))


def get_redsys_action_url() -> str:
    env = config("REDSYS_ENV", default="test").lower()
    return REDSYS_PRODUCTION_URL if env == "production" else REDSYS_TEST_URL


def build_redsys_order_number(order_id: int) -> str:
    # Redsys order should be 4-12 chars, usually numeric/alphanumeric.
    return f"{int(order_id):012d}"[-12:]


def build_payment_form(order):
    order_number = build_redsys_order_number(order.id)
    amount_cents = cents_from_amount(order.total_amount)

    params = {
        "DS_MERCHANT_AMOUNT": amount_cents,
        "DS_MERCHANT_ORDER": order_number,
        "DS_MERCHANT_MERCHANTCODE": config("REDSYS_MERCHANT_CODE", default="999008881"),
        "DS_MERCHANT_CURRENCY": config("REDSYS_CURRENCY", default="978"),
        "DS_MERCHANT_TRANSACTIONTYPE": config("REDSYS_TRANSACTION_TYPE", default="0"),
        "DS_MERCHANT_TERMINAL": config("REDSYS_TERMINAL", default="1"),
        "DS_MERCHANT_MERCHANTURL": config("REDSYS_MERCHANT_URL", default="http://127.0.0.1:8000/api/redsys/callback/"),
        "DS_MERCHANT_URLOK": config("REDSYS_OK_URL", default="http://127.0.0.1:5173/payment-ok"),
        "DS_MERCHANT_URLKO": config("REDSYS_KO_URL", default="http://127.0.0.1:5173/payment-ko"),
        "DS_MERCHANT_MERCHANTNAME": config("REDSYS_MERCHANT_NAME", default="Casa de Kebab Turco"),
        "DS_MERCHANT_PRODUCTDESCRIPTION": f"Pedido #{order.id} Casa de Kebab Turco",
    }

    merchant_parameters = encode_parameters(params)
    signature = create_signature(
        config("REDSYS_SECRET_KEY", default="sq7HjrUOBfKmC576ILgskD5srU870gJ7"),
        merchant_parameters,
        order_number,
    )

    return {
        "action": get_redsys_action_url(),
        "Ds_SignatureVersion": SIGNATURE_VERSION,
        "Ds_MerchantParameters": merchant_parameters,
        "Ds_Signature": signature,
        "order_number": order_number,
    }


def verify_callback_signature(merchant_parameters_b64: str, received_signature: str):
    params = decode_parameters(merchant_parameters_b64)
    order_number = params.get("Ds_Order") or params.get("DS_ORDER") or params.get("DS_MERCHANT_ORDER")
    if not order_number:
        return False, params

    expected = create_signature(
        config("REDSYS_SECRET_KEY", default="sq7HjrUOBfKmC576ILgskD5srU870gJ7"),
        merchant_parameters_b64,
        str(order_number),
    )
    return hmac.compare_digest(expected, received_signature), params


def redsys_response_is_paid(params: dict) -> bool:
    code = params.get("Ds_Response") or params.get("DS_RESPONSE")
    try:
        return int(code) < 100
    except Exception:
        return False

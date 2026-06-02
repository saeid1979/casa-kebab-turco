import requests
import uuid
from django.contrib.auth import authenticate
from decimal import Decimal

from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Customer,
    Category,
    MenuItem,
    Order,
    OrderItem,
    DeliveryTracking,
    DeliveryLocationPoint,
    DeliveryRider,
    Expense,
    InventoryItem,
    MenuItemIngredient,
    RestaurantSettings,
    Payment,
    CashRegisterSession,
    OnlinePaymentAttempt,
    ComingSoonVisit,
)
from .redsys import build_payment_form, verify_callback_signature, redsys_response_is_paid
from .serializers import (
    CustomerSerializer,
    CategorySerializer,
    MenuItemSerializer,
    OrderSerializer,
    ExpenseSerializer,
    InventoryItemSerializer,
    MenuItemIngredientSerializer,
    CurrentUserSerializer,
    PaymentSerializer,
    CashRegisterSessionSerializer,
    RestaurantSettingsSerializer,
    OnlinePaymentAttemptSerializer,
    CustomerAccountRegisterSerializer,
    CustomerAccountLoginSerializer,
    CustomerTrackingOrderSerializer,
)



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-total_orders", "-total_spent", "-updated_at")
    serializer_class = CustomerSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.select_related("category").filter(is_deleted=False)
    serializer_class = MenuItemSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        item.is_deleted = True
        item.is_available = False
        item.save(update_fields=["is_deleted", "is_available"])
        return Response({"deleted": True, "id": item.id})


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related("items__menu_item").all().order_by("-created_at")
    serializer_class = OrderSerializer

    def get_permissions(self):
        if self.action in ["create"]:
            return [AllowAny()]
        return [IsAdminUser()]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all().order_by("-created_at")
    serializer_class = ExpenseSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.filter(is_active=True).order_by("name")
    serializer_class = InventoryItemSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class MenuItemIngredientViewSet(viewsets.ModelViewSet):
    queryset = MenuItemIngredient.objects.select_related("menu_item", "inventory_item").all()
    serializer_class = MenuItemIngredientSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related("order").all().order_by("-created_at")
    serializer_class = PaymentSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class CashRegisterSessionViewSet(viewsets.ModelViewSet):
    queryset = CashRegisterSession.objects.all().order_by("-opened_at")
    serializer_class = CashRegisterSessionSerializer

    def get_permissions(self):
        return [IsAdminUser()]

    def perform_create(self, serializer):
        serializer.save(opened_by=self.request.user)


class OnlinePaymentAttemptViewSet(viewsets.ModelViewSet):
    queryset = OnlinePaymentAttempt.objects.all().order_by("-created_at")
    serializer_class = OnlinePaymentAttemptSerializer

    def get_permissions(self):
        return [IsAdminUser()]


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CurrentUserSerializer(request.user).data)


class DashboardSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        orders = Order.objects.all()
        return Response({
            "orders_count": orders.count(),
            "new_orders": orders.filter(status="new").count(),
            "preparing_orders": orders.filter(status="preparing").count(),
            "sales_total": orders.exclude(status="cancelled").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
        })


class AccountingSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        sales_total = Order.objects.exclude(status="cancelled").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        cost_total = Order.objects.exclude(status="cancelled").aggregate(total=Sum("cost_amount"))["total"] or Decimal("0")
        expense_total = Expense.objects.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        net_profit = sales_total - cost_total - expense_total

        return Response({
            "sales_total": sales_total,
            "cost_total": cost_total,
            "expense_total": expense_total,
            "net_profit": net_profit,
        })



class CashierSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()

        payments = Payment.objects.filter(created_at__date=today)
        orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")

        cash_total = payments.filter(method="cash").aggregate(total=Sum("amount"))["total"] or Decimal("0")
        card_total = payments.filter(method="card").aggregate(total=Sum("amount"))["total"] or Decimal("0")
        mixed_total = payments.filter(method="mixed").aggregate(total=Sum("amount"))["total"] or Decimal("0")
        debt_total = payments.aggregate(total=Sum("debt_amount"))["total"] or Decimal("0")
        discount_total = payments.aggregate(total=Sum("discount_amount"))["total"] or Decimal("0")
        paid_total = payments.aggregate(total=Sum("amount"))["total"] or Decimal("0")

        online_paid_total = orders.filter(payment_method="online_card", payment_status="paid").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        delivery_cash_expected = orders.filter(payment_method="cash_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        delivery_card_expected = orders.filter(payment_method="card_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        unpaid_total = orders.exclude(payment_status="paid").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

        sales_total = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        orders_count = orders.count()
        open_orders_count = orders.exclude(status__in=["delivered", "cancelled"]).count()

        open_session = CashRegisterSession.objects.filter(is_closed=False).order_by("-opened_at").first()
        opening_cash = open_session.opening_cash if open_session else Decimal("0")
        expected_cash = opening_cash + cash_total + delivery_cash_expected

        return Response({
            "cash_total": cash_total,
            "card_total": card_total,
            "mixed_total": mixed_total,
            "debt_total": debt_total,
            "discount_total": discount_total,
            "paid_total": paid_total,
            "online_paid_total": online_paid_total,
            "delivery_cash_expected": delivery_cash_expected,
            "delivery_card_expected": delivery_card_expected,
            "unpaid_total": unpaid_total,
            "sales_total": sales_total,
            "orders_count": orders_count,
            "open_orders_count": open_orders_count,
            "opening_cash": opening_cash,
            "expected_cash": expected_cash,
            "open_session": CashRegisterSessionSerializer(open_session).data if open_session else None,
        })


class ProfitLossSummaryView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")

        sales_total = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        material_cost = orders.aggregate(total=Sum("cost_amount"))["total"] or Decimal("0")
        gross_profit = sales_total - material_cost
        daily_expenses = Expense.objects.filter(created_at__date=today).aggregate(total=Sum("amount"))["total"] or Decimal("0")
        net_profit = gross_profit - daily_expenses

        return Response({
            "sales_total": sales_total,
            "material_cost": material_cost,
            "gross_profit": gross_profit,
            "daily_expenses": daily_expenses,
            "net_profit": net_profit,
        })



class CloseCashRegisterView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        session_id = request.data.get("session_id")
        closing_cash = Decimal(str(request.data.get("closing_cash", 0)))
        notes = request.data.get("notes", "")

        session = CashRegisterSession.objects.get(id=session_id, is_closed=False)
        today = timezone.localdate()

        active_orders = Order.objects.filter(created_at__date=today).exclude(status__in=["delivered", "cancelled"]).count()

        cash_total = Payment.objects.filter(created_at__date=today, method="cash").aggregate(total=Sum("amount"))["total"] or Decimal("0")
        delivery_cash_expected = (
            Order.objects
            .filter(created_at__date=today, payment_method="cash_delivery", payment_status="pay_on_delivery")
            .exclude(status="cancelled")
            .aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        )
        expected_cash = session.opening_cash + cash_total + delivery_cash_expected

        session.closing_cash = closing_cash
        session.expected_cash = expected_cash
        session.difference = closing_cash - expected_cash
        session.notes = notes
        session.is_closed = True
        session.closed_at = timezone.now()
        session.save()

        return Response({
            "session": CashRegisterSessionSerializer(session).data,
            "active_orders_count": active_orders,
            "warning": "There are active orders." if active_orders else "",
        })



class DailyCashReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.localdate()
        orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")
        payments = Payment.objects.filter(created_at__date=today)

        report = {
            "date": str(today),
            "orders_count": orders.count(),
            "sales_total": orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "cash_payments": payments.filter(method="cash").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "card_payments": payments.filter(method="card").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "mixed_payments": payments.filter(method="mixed").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "online_paid": orders.filter(payment_method="online_card", payment_status="paid").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "delivery_cash_expected": orders.filter(payment_method="cash_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "delivery_card_expected": orders.filter(payment_method="card_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "discount_total": payments.aggregate(total=Sum("discount_amount"))["total"] or Decimal("0"),
            "debt_total": payments.aggregate(total=Sum("debt_amount"))["total"] or Decimal("0"),
            "open_orders_count": orders.exclude(status__in=["delivered", "cancelled"]).count(),
        }
        return Response(report)


class CreateOnlinePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        order = Order.objects.get(id=order_id)

        form = build_payment_form(order)
        reference = form["order_number"]

        attempt = OnlinePaymentAttempt.objects.create(
            order=order,
            amount=order.total_amount,
            reference=reference,
            provider="redsys_bbva",
            status="created",
        )

        order.payment_method = "online_card"
        order.payment_status = "pending"
        order.payment_reference = reference
        order.save(update_fields=["payment_method", "payment_status", "payment_reference"])

        return Response({
            "payment_attempt": OnlinePaymentAttemptSerializer(attempt).data,
            "redsys": form,
            "message": "Redsys/BBVA payment form created.",
        })



class ConfirmOnlinePaymentView(APIView):
    """
    Manual test confirmation for local development.
    Real bank confirmations must come through RedsysCallbackView.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        reference = request.data.get("reference")
        success = request.data.get("success", True)
        bank_transaction_id = request.data.get("bank_transaction_id") or f"TEST-TX-{uuid.uuid4().hex[:12].upper()}"

        attempt = OnlinePaymentAttempt.objects.select_related("order").get(reference=reference)
        order = attempt.order

        if success:
            attempt.status = "paid"
            attempt.bank_response_code = "0000"
            attempt.bank_transaction_id = bank_transaction_id
            attempt.confirmed_at = timezone.now()
            order.payment_status = "paid"
            order.bank_transaction_id = bank_transaction_id
            order.status = "new"
        else:
            attempt.status = "failed"
            attempt.bank_response_code = "FAILED"
            order.payment_status = "failed"

        attempt.save()
        order.save()

        return Response({
            "success": bool(success),
            "order": OrderSerializer(order, context={"request": request}).data,
            "payment_attempt": OnlinePaymentAttemptSerializer(attempt).data,
        })


class RedsysCallbackView(APIView):
    """
    Redsys/BBVA server-to-server callback endpoint.
    Redsys sends Ds_SignatureVersion, Ds_MerchantParameters, and Ds_Signature.
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        merchant_parameters = request.data.get("Ds_MerchantParameters")
        signature = request.data.get("Ds_Signature")

        if not merchant_parameters or not signature:
            return Response({"ok": False, "error": "Missing Redsys parameters"}, status=400)

        valid, params = verify_callback_signature(merchant_parameters, signature)
        if not valid:
            return Response({"ok": False, "error": "Invalid signature"}, status=400)

        order_number = params.get("Ds_Order") or params.get("DS_ORDER")
        response_code = params.get("Ds_Response") or params.get("DS_RESPONSE")
        authorisation_code = params.get("Ds_AuthorisationCode") or params.get("DS_AUTHORISATIONCODE") or ""

        attempt = OnlinePaymentAttempt.objects.select_related("order").filter(reference=order_number).first()
        if not attempt:
            return Response({"ok": False, "error": "Payment attempt not found"}, status=404)

        order = attempt.order
        attempt.bank_response_code = str(response_code or "")
        attempt.bank_transaction_id = str(authorisation_code or "")

        if redsys_response_is_paid(params):
            attempt.status = "paid"
            attempt.confirmed_at = timezone.now()
            order.payment_status = "paid"
            order.bank_transaction_id = attempt.bank_transaction_id
            order.status = "new"
        else:
            attempt.status = "failed"
            order.payment_status = "failed"

        attempt.save()
        order.save()

        return Response({
            "ok": True,
            "paid": order.payment_status == "paid",
            "order_id": order.id,
            "payment_status": order.payment_status,
        })



class CustomerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerAccountRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer = serializer.save()

        refresh = RefreshToken.for_user(customer.user)
        return Response({
            "customer": CustomerSerializer(customer).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class CustomerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerAccountLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"].strip()
        password = serializer.validated_data["password"]

        user = authenticate(username=phone, password=password)
        if not user:
            return Response({"detail": "Invalid phone or password"}, status=400)

        customer = Customer.objects.filter(user=user).first() or Customer.objects.filter(phone=phone).first()
        if customer and not customer.user:
            customer.user = user
            customer.save(update_fields=["user", "updated_at"])

        refresh = RefreshToken.for_user(user)
        return Response({
            "customer": CustomerSerializer(customer).data if customer else None,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })


class CustomerMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = Customer.objects.filter(user=request.user).first() or Customer.objects.filter(phone=request.user.username).first()
        if not customer:
            return Response({"detail": "Customer profile not found"}, status=404)
        return Response(CustomerSerializer(customer).data)


class CustomerMyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customer = Customer.objects.filter(user=request.user).first() or Customer.objects.filter(phone=request.user.username).first()
        if not customer:
            return Response([])

        orders = Order.objects.filter(customer_phone=customer.phone).prefetch_related("items__menu_item").order_by("-created_at")
        return Response(CustomerTrackingOrderSerializer(orders, many=True).data)



class PublicOrderTrackingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tracking_code = str(request.data.get("tracking_code", "")).strip().upper()
        phone = str(request.data.get("phone", "")).strip()

        if not tracking_code or not phone:
            return Response({"detail": "Tracking code and phone are required."}, status=400)

        digits = "".join(ch for ch in tracking_code if ch.isdigit())
        if not digits:
            return Response({"detail": "Invalid tracking code."}, status=400)

        order_id = int(digits)
        order = (
            Order.objects
            .prefetch_related("items__menu_item")
            .filter(id=order_id, customer_phone=phone)
            .first()
        )

        if not order:
            return Response({"detail": "Order not found for this tracking code and phone."}, status=404)

        return Response(CustomerTrackingOrderSerializer(order).data)



def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def lookup_ip_details(ip_address):
    if not ip_address or ip_address in ["127.0.0.1", "::1", "localhost"]:
        return {
            "country": "Localhost",
            "country_code": "",
            "city": "Local development",
            "region": "",
            "timezone": "",
            "isp": "",
        }

    try:
        response = requests.get(f"https://ipapi.co/{ip_address}/json/", timeout=4)
        if response.ok:
            data = response.json()
            return {
                "country": data.get("country_name", "") or "",
                "country_code": data.get("country_code", "") or "",
                "city": data.get("city", "") or "",
                "region": data.get("region", "") or "",
                "timezone": data.get("timezone", "") or "",
                "isp": data.get("org", "") or "",
            }
    except Exception:
        pass

    return {
        "country": "",
        "country_code": "",
        "city": "",
        "region": "",
        "timezone": "",
        "isp": "",
    }


class ComingSoonVisitTrackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ip_address = get_client_ip(request)
        details = lookup_ip_details(ip_address)

        visit = ComingSoonVisit.objects.create(
            ip_address=ip_address if ip_address not in ["localhost"] else None,
            country=details.get("country", ""),
            country_code=details.get("country_code", ""),
            city=details.get("city", ""),
            region=details.get("region", ""),
            timezone=details.get("timezone", ""),
            isp=details.get("isp", ""),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            browser_language=request.data.get("language", "") or request.META.get("HTTP_ACCEPT_LANGUAGE", ""),
            page_url=request.data.get("page_url", ""),
            referrer=request.data.get("referrer", ""),
        )

        return Response({"ok": True, "visit_id": visit.id})


class ComingSoonVisitAdminListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        visits = ComingSoonVisit.objects.all()[:300]
        data = []
        for visit in visits:
            data.append({
                "id": visit.id,
                "ip_address": visit.ip_address,
                "country": visit.country,
                "country_code": visit.country_code,
                "city": visit.city,
                "region": visit.region,
                "timezone": visit.timezone,
                "isp": visit.isp,
                "browser_language": visit.browser_language,
                "page_url": visit.page_url,
                "referrer": visit.referrer,
                "user_agent": visit.user_agent,
                "created_at": visit.created_at,
            })
        return Response(data)


def normalize_rider_phone(value):
    """Normalize rider phone for local matching.
    Accepts 613473564 and 34613473564 as the same rider.
    """
    digits = "".join(ch for ch in str(value or "") if ch.isdigit())
    if digits.startswith("0034") and len(digits) > 9:
        digits = digits[4:]
    if digits.startswith("34") and len(digits) > 9:
        digits = digits[2:]
    return digits[-9:] if len(digits) >= 9 else digits


def make_delivery_token():
    import secrets
    return secrets.token_urlsafe(32)


class DeliveryCreateTrackingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        order_id = request.data.get("order_id")
        rider_name = str(request.data.get("rider_name", "")).strip()
        rider_phone_raw = str(request.data.get("rider_phone", "")).strip()
        rider_phone = normalize_rider_phone(rider_phone_raw)

        if not rider_phone:
            return Response({"detail": "Rider phone is required."}, status=400)

        order = Order.objects.filter(id=order_id).first()
        if not order:
            return Response({"detail": "Order not found."}, status=404)

        tracking, created = DeliveryTracking.objects.get_or_create(
            order=order,
            defaults={
                "token": make_delivery_token(),
                "rider_name": rider_name,
                "rider_phone": rider_phone,
                "is_active": True,
            },
        )

        if not created:
            tracking.rider_name = rider_name or tracking.rider_name
            tracking.rider_phone = rider_phone
            if not tracking.token:
                tracking.token = make_delivery_token()
            tracking.is_active = True
            tracking.stopped_at = None
            tracking.save(update_fields=["rider_name", "rider_phone", "token", "is_active", "stopped_at"])

        try:
            order.status = "out_for_delivery"
            order.save(update_fields=["status"])
        except Exception:
            pass

        # Phone-based rider app: no WhatsApp token link is required.
        # The frontend rider app polls /api/rider-app/current-delivery/?phone=...
        return Response({
            "ok": True,
            "assigned": True,
            "phone_based": True,
            "order_id": order.id,
            "tracking_code": f"CDKT-{order.id:06d}",
            "rider_name": tracking.rider_name,
            "rider_phone": tracking.rider_phone,
        })


class DeliveryMobileInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = str(request.query_params.get("token", "")).strip()
        tracking = DeliveryTracking.objects.select_related("order").filter(token=token, is_active=True).first()
        if not tracking:
            return Response({"detail": "Invalid delivery token."}, status=404)

        order = tracking.order
        return Response({
            "order_id": order.id,
            "tracking_code": f"CDKT-{order.id:06d}",
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "customer_latitude": order.customer_latitude,
            "customer_longitude": order.customer_longitude,
            "customer_geocoded_address": order.customer_geocoded_address,
            "customer_address": order.customer_address,
            "status": order.status,
            "rider_name": tracking.rider_name,
            "rider_phone": tracking.rider_phone,
            "last_seen_at": tracking.last_seen_at,
        })


class DeliveryLocationUpdateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = str(request.data.get("token", "")).strip()
        tracking = DeliveryTracking.objects.filter(token=token, is_active=True).first()
        if not tracking:
            return Response({"detail": "Invalid delivery token."}, status=404)

        try:
            lat = float(request.data.get("latitude"))
            lng = float(request.data.get("longitude"))
        except Exception:
            return Response({"detail": "Latitude and longitude are required."}, status=400)

        if not (-90 <= lat <= 90 and -180 <= lng <= 180):
            return Response({"detail": "Invalid coordinates."}, status=400)

        accuracy = request.data.get("accuracy")
        speed = request.data.get("speed")
        heading = request.data.get("heading")

        point = DeliveryLocationPoint.objects.create(
            tracking=tracking,
            latitude=lat,
            longitude=lng,
            accuracy=float(accuracy) if accuracy not in [None, ""] else None,
            speed=float(speed) if speed not in [None, ""] else None,
            heading=float(heading) if heading not in [None, ""] else None,
        )

        tracking.last_latitude = lat
        tracking.last_longitude = lng
        tracking.last_accuracy = point.accuracy
        tracking.last_seen_at = timezone.now()
        tracking.save(update_fields=["last_latitude", "last_longitude", "last_accuracy", "last_seen_at"])

        return Response({"ok": True, "last_seen_at": tracking.last_seen_at})


class DeliveryStopTrackingView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = str(request.data.get("token", "")).strip()
        tracking = DeliveryTracking.objects.filter(token=token, is_active=True).first()
        if not tracking:
            return Response({"detail": "Invalid delivery token."}, status=404)

        tracking.is_active = False
        tracking.stopped_at = timezone.now()
        tracking.save(update_fields=["is_active", "stopped_at"])
        return Response({"ok": True})


class CustomerLiveDeliveryLocationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = str(request.data.get("tracking_code", "")).strip().upper()
        phone = str(request.data.get("phone", "")).strip()

        try:
            order_id = int(code.replace("CDKT-", "")) if code.startswith("CDKT-") else int(code)
        except Exception:
            return Response({"detail": "Invalid tracking code."}, status=400)

        order = Order.objects.filter(id=order_id, customer_phone=phone).first()
        if not order:
            return Response({"detail": "Order not found."}, status=404)

        if str(order.status).lower() in ["delivered", "completed"]:
            return Response({"show_map": False, "status": order.status, "detail": "Order delivered."})

        tracking = DeliveryTracking.objects.filter(order=order, is_active=True).first()
        if not tracking or not tracking.last_latitude or not tracking.last_longitude:
            return Response({"show_map": False, "status": order.status, "detail": "Delivery location is not available yet."})

        return Response({
            "show_map": True,
            "status": order.status,
            "tracking_code": f"CDKT-{order.id:06d}",
            "customer_address": order.customer_address,
            "customer_latitude": order.customer_latitude,
            "customer_longitude": order.customer_longitude,
            "customer_geocoded_address": order.customer_geocoded_address,
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "latitude": tracking.last_latitude,
            "longitude": tracking.last_longitude,
            "accuracy": tracking.last_accuracy,
            "last_seen_at": tracking.last_seen_at,
            "rider_name": tracking.rider_name,
            "rider_phone": tracking.rider_phone,
        })


class DeliveryAcceptView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = str(request.data.get("token", "")).strip()
        tracking = DeliveryTracking.objects.select_related("order").filter(token=token, is_active=True).first()
        if not tracking:
            return Response({"detail": "Invalid delivery token."}, status=404)

        order = tracking.order
        order.status = "out_for_delivery"
        order.save(update_fields=["status"])

        tracking.started_at = timezone.now()
        tracking.save(update_fields=["started_at"])

        return Response({
            "ok": True,
            "tracking_code": f"CDKT-{order.id:06d}",
            "status": order.status,
        })


class DeliveryCompleteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = str(request.data.get("token", "")).strip()
        tracking = DeliveryTracking.objects.select_related("order").filter(token=token).first()
        if not tracking:
            return Response({"detail": "Invalid delivery token."}, status=404)

        order = tracking.order
        order.status = "delivered"
        order.save(update_fields=["status"])

        tracking.is_active = False
        tracking.stopped_at = timezone.now()
        tracking.save(update_fields=["is_active", "stopped_at"])

        return Response({
            "ok": True,
            "tracking_code": f"CDKT-{order.id:06d}",
            "status": order.status,
        })


class DeliveryAdminListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        items = DeliveryTracking.objects.select_related("order").order_by("-started_at")[:50]
        return Response({
            "deliveries": [
                {
                    "id": t.id,
                    "order_id": t.order.id,
                    "tracking_code": f"CDKT-{t.order.id:06d}",
                    "customer_name": t.order.customer_name,
                    "customer_phone": t.order.customer_phone,
                    "customer_address": t.order.customer_address,
                    "customer_latitude": t.order.customer_latitude,
                    "customer_longitude": t.order.customer_longitude,
                    "customer_geocoded_address": t.order.customer_geocoded_address,
                    "order_status": t.order.status,
                    "rider_name": t.rider_name,
                    "rider_phone": t.rider_phone,
                    "is_active": t.is_active,
                    "last_latitude": t.last_latitude,
                    "last_longitude": t.last_longitude,
                    "last_seen_at": t.last_seen_at,
                    "token": t.token,
                    "delivery_url": f"/delivery?token={t.token}",
                }
                for t in items
            ]
        })


# =========================
# Delivery Rider Management API - v22
# =========================

class DeliveryRiderListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        riders = DeliveryRider.objects.all().order_by("name")
        return Response({
            "riders": [
                {
                    "id": r.id,
                    "name": r.name,
                    "phone": r.phone,
                    "vehicle_type": r.vehicle_type,
                    "vehicle_plate": r.vehicle_plate,
                    "is_active": r.is_active,
                    "notes": r.notes,
                    "created_at": r.created_at,
                    "updated_at": r.updated_at,
                }
                for r in riders
            ]
        })

    def post(self, request):
        name = str(request.data.get("name", "")).strip()
        phone = str(request.data.get("phone", "")).strip()

        if not name or not phone:
            return Response({"detail": "Name and phone are required."}, status=400)

        rider, created = DeliveryRider.objects.update_or_create(
            phone=phone,
            defaults={
                "name": name,
                "vehicle_type": str(request.data.get("vehicle_type", "Moto")).strip() or "Moto",
                "vehicle_plate": str(request.data.get("vehicle_plate", "")).strip(),
                "is_active": bool(request.data.get("is_active", True)),
                "notes": str(request.data.get("notes", "")).strip(),
            },
        )

        return Response({
            "ok": True,
            "created": created,
            "rider": {
                "id": rider.id,
                "name": rider.name,
                "phone": rider.phone,
                "vehicle_type": rider.vehicle_type,
                "vehicle_plate": rider.vehicle_plate,
                "is_active": rider.is_active,
                "notes": rider.notes,
            },
        })


class DeliveryRiderDetailView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, rider_id):
        rider = DeliveryRider.objects.filter(id=rider_id).first()
        if not rider:
            return Response({"detail": "Rider not found."}, status=404)

        for field in ["name", "phone", "vehicle_type", "vehicle_plate", "notes"]:
            if field in request.data:
                setattr(rider, field, str(request.data.get(field, "")).strip())

        if "is_active" in request.data:
            rider.is_active = bool(request.data.get("is_active"))

        rider.save()

        return Response({"ok": True})

    def delete(self, request, rider_id):
        rider = DeliveryRider.objects.filter(id=rider_id).first()
        if not rider:
            return Response({"detail": "Rider not found."}, status=404)

        rider.delete()
        return Response({"ok": True})


# =========================
# Rider Performance Report API - v32
# =========================

class RiderPerformanceReportView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from datetime import timedelta
        from django.utils import timezone as dj_timezone

        period = str(request.query_params.get("period", "today")).strip().lower()
        commission_rate = float(request.query_params.get("commission_rate", 1.5))

        now = dj_timezone.now()
        if period == "week":
            start = now - timedelta(days=7)
        elif period == "month":
            start = now - timedelta(days=30)
        else:
            start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        items = DeliveryTracking.objects.select_related("order").filter(started_at__gte=start).order_by("-started_at")

        grouped = {}
        for t in items:
            key = t.rider_phone or t.rider_name or "unknown"
            if key not in grouped:
                grouped[key] = {
                    "rider_name": t.rider_name or "Repartidor",
                    "rider_phone": t.rider_phone or "",
                    "total_orders": 0,
                    "active_orders": 0,
                    "delivered_orders": 0,
                    "cancelled_orders": 0,
                    "gps_orders": 0,
                    "total_sales": 0.0,
                    "delivery_minutes": [],
                    "orders": [],
                }

            g = grouped[key]
            status = str(t.order.status or "").lower()
            total = float(getattr(t.order, "total", 0) or 0)

            g["total_orders"] += 1
            g["total_sales"] += total

            if t.is_active and status != "delivered":
                g["active_orders"] += 1
            if status == "delivered":
                g["delivered_orders"] += 1
            if status == "cancelled":
                g["cancelled_orders"] += 1
            if t.last_latitude and t.last_longitude:
                g["gps_orders"] += 1

            if t.started_at and t.stopped_at:
                minutes = int((t.stopped_at - t.started_at).total_seconds() // 60)
                if minutes >= 0:
                    g["delivery_minutes"].append(minutes)

            g["orders"].append({
                "order_id": t.order.id,
                "tracking_code": f"CDKT-{t.order.id:06d}",
                "status": t.order.status,
                "customer_name": t.order.customer_name,
                "customer_phone": t.order.customer_phone,
                "total": total,
                "started_at": t.started_at,
                "stopped_at": t.stopped_at,
                "last_seen_at": t.last_seen_at,
            })

        results = []
        for g in grouped.values():
            avg_minutes = round(sum(g["delivery_minutes"]) / len(g["delivery_minutes"]), 1) if g["delivery_minutes"] else None
            commission = round(g["delivered_orders"] * commission_rate, 2)

            results.append({
                "rider_name": g["rider_name"],
                "rider_phone": g["rider_phone"],
                "total_orders": g["total_orders"],
                "active_orders": g["active_orders"],
                "delivered_orders": g["delivered_orders"],
                "cancelled_orders": g["cancelled_orders"],
                "gps_orders": g["gps_orders"],
                "total_sales": round(g["total_sales"], 2),
                "avg_delivery_minutes": avg_minutes,
                "commission_rate": commission_rate,
                "estimated_commission": commission,
                "orders": g["orders"],
            })

        results.sort(key=lambda x: x["delivered_orders"], reverse=True)

        return Response({
            "period": period,
            "start": start,
            "end": now,
            "riders": results,
            "summary": {
                "total_riders": len(results),
                "total_orders": sum(r["total_orders"] for r in results),
                "total_delivered": sum(r["delivered_orders"] for r in results),
                "total_active": sum(r["active_orders"] for r in results),
                "total_sales": round(sum(r["total_sales"] for r in results), 2),
                "total_commission": round(sum(r["estimated_commission"] for r in results), 2),
            }
        })


# =========================
# v33 Executive Finance Dashboard API
# =========================

class ExecutiveFinanceDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        period = str(request.query_params.get("period", "today")).lower()
        today = timezone.localdate()

        if period == "week":
            start = today - timezone.timedelta(days=7)
        elif period == "month":
            start = today.replace(day=1)
        else:
            start = today

        orders = Order.objects.filter(created_at__date__gte=start)
        valid_orders = orders.exclude(status="cancelled")
        delivered_orders = orders.filter(status="delivered")
        active_orders = orders.exclude(status__in=["delivered", "cancelled"])
        payments = Payment.objects.filter(created_at__date__gte=start)
        expenses = Expense.objects.filter(created_at__date__gte=start)

        sales_total = valid_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        delivered_sales = delivered_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        material_cost = valid_orders.aggregate(total=Sum("cost_amount"))["total"] or Decimal("0")
        expense_total = expenses.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        gross_profit = sales_total - material_cost
        net_profit = gross_profit - expense_total

        avg_order = Decimal("0")
        if valid_orders.count() > 0:
            avg_order = sales_total / Decimal(valid_orders.count())

        payment_breakdown = {
            "cash": payments.filter(method="cash").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "card": payments.filter(method="card").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "mixed": payments.filter(method="mixed").aggregate(total=Sum("amount"))["total"] or Decimal("0"),
            "debt": payments.aggregate(total=Sum("debt_amount"))["total"] or Decimal("0"),
            "online_paid": valid_orders.filter(payment_method="online_card", payment_status="paid").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "delivery_cash_expected": valid_orders.filter(payment_method="cash_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
            "delivery_card_expected": valid_orders.filter(payment_method="card_delivery", payment_status="pay_on_delivery").aggregate(total=Sum("total_amount"))["total"] or Decimal("0"),
        }

        order_type_breakdown = {}
        for row in valid_orders.values("order_type").annotate(total=Sum("total_amount"), count=Count("id")):
            key = row["order_type"] or "unknown"
            order_type_breakdown[key] = {
                "total": row["total"] or Decimal("0"),
                "count": row["count"],
            }

        expense_breakdown = {}
        for row in expenses.values("category").annotate(total=Sum("amount"), count=Count("id")):
            key = row["category"] or "General"
            expense_breakdown[key] = {
                "total": row["total"] or Decimal("0"),
                "count": row["count"],
            }

        daily_rows = []
        days = 7 if period == "week" else 30 if period == "month" else 1
        for i in range(days - 1, -1, -1):
            day = today - timezone.timedelta(days=i)
            day_orders = valid_orders.filter(created_at__date=day)
            day_expenses = expenses.filter(created_at__date=day)
            day_sales = day_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
            day_cost = day_orders.aggregate(total=Sum("cost_amount"))["total"] or Decimal("0")
            day_expense = day_expenses.aggregate(total=Sum("amount"))["total"] or Decimal("0")
            daily_rows.append({
                "date": str(day),
                "sales": day_sales,
                "cost": day_cost,
                "expenses": day_expense,
                "profit": day_sales - day_cost - day_expense,
                "orders": day_orders.count(),
            })

        top_items = []
        try:
            top_items = list(
                OrderItem.objects
                .filter(order__created_at__date__gte=start)
                .exclude(order__status="cancelled")
                .values("menu_item__name")
                .annotate(quantity=Sum("quantity"), sales=Sum("line_total"))
                .order_by("-quantity")[:10]
            )
        except Exception:
            top_items = []

        recent_expenses = [
            {
                "id": e.id,
                "title": e.title,
                "category": e.category,
                "amount": e.amount,
                "created_at": e.created_at,
                "note": e.note,
            }
            for e in expenses.order_by("-created_at")[:20]
        ]

        return Response({
            "period": period,
            "start": str(start),
            "end": str(today),
            "summary": {
                "orders_count": valid_orders.count(),
                "delivered_orders": delivered_orders.count(),
                "active_orders": active_orders.count(),
                "cancelled_orders": orders.filter(status="cancelled").count(),
                "sales_total": sales_total,
                "delivered_sales": delivered_sales,
                "material_cost": material_cost,
                "expense_total": expense_total,
                "gross_profit": gross_profit,
                "net_profit": net_profit,
                "average_order": avg_order,
            },
            "payment_breakdown": payment_breakdown,
            "order_type_breakdown": order_type_breakdown,
            "expense_breakdown": expense_breakdown,
            "daily_rows": daily_rows,
            "top_items": top_items,
            "recent_expenses": recent_expenses,
        })


class ExecutiveExpenseCreateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        title = str(request.data.get("title", "")).strip()
        amount = request.data.get("amount", "0")
        category = str(request.data.get("category", "General")).strip() or "General"
        note = str(request.data.get("note", "")).strip()

        if not title:
            return Response({"detail": "Title is required."}, status=400)

        expense = Expense.objects.create(
            title=title,
            amount=Decimal(str(amount or 0)),
            category=category,
            note=note,
        )

        return Response({
            "ok": True,
            "expense": {
                "id": expense.id,
                "title": expense.title,
                "amount": expense.amount,
                "category": expense.category,
                "created_at": expense.created_at,
                "note": expense.note,
            }
        })



class SmartAccountingDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from datetime import timedelta
        from django.db.models.functions import TruncDate

        try:
            days = int(request.query_params.get("days", 30))
        except Exception:
            days = 30

        days = max(1, min(days, 365))
        end_date = timezone.localdate()
        start_date = end_date - timedelta(days=days - 1)

        orders = Order.objects.filter(created_at__date__gte=start_date).exclude(status="cancelled")
        expenses = Expense.objects.filter(created_at__date__gte=start_date)

        sales_total = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        cost_total = orders.aggregate(total=Sum("cost_amount"))["total"] or Decimal("0")
        gross_profit = orders.aggregate(total=Sum("profit_amount"))["total"] or Decimal("0")
        expense_total = expenses.aggregate(total=Sum("amount"))["total"] or Decimal("0")
        net_profit = gross_profit - expense_total

        orders_count = orders.count()
        avg_order = sales_total / orders_count if orders_count else Decimal("0")
        profit_margin = (net_profit / sales_total * Decimal("100")) if sales_total else Decimal("0")
        cost_ratio = (cost_total / sales_total * Decimal("100")) if sales_total else Decimal("0")

        payment_breakdown = []
        for row in orders.values("payment_method").annotate(
            count=Count("id"),
            total=Sum("total_amount"),
        ).order_by("-total"):
            payment_breakdown.append({
                "method": row["payment_method"] or "unknown",
                "count": row["count"],
                "total": row["total"] or Decimal("0"),
            })

        status_breakdown = []
        for row in orders.values("status").annotate(
            count=Count("id"),
            total=Sum("total_amount"),
        ).order_by("-count"):
            status_breakdown.append({
                "status": row["status"] or "unknown",
                "count": row["count"],
                "total": row["total"] or Decimal("0"),
            })

        top_items = []
        for row in (
            OrderItem.objects
            .filter(order__in=orders)
            .values("menu_item__name")
            .annotate(quantity=Sum("quantity"), revenue=Sum("line_total"))
            .order_by("-quantity")[:10]
        ):
            top_items.append({
                "name": row["menu_item__name"] or "Unknown",
                "quantity": row["quantity"] or 0,
                "revenue": row["revenue"] or Decimal("0"),
            })

        daily_sales = []
        for row in (
            orders
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(orders=Count("id"), sales=Sum("total_amount"), profit=Sum("profit_amount"))
            .order_by("day")
        ):
            daily_sales.append({
                "day": row["day"].isoformat() if row["day"] else "",
                "orders": row["orders"],
                "sales": row["sales"] or Decimal("0"),
                "profit": row["profit"] or Decimal("0"),
            })

        today = timezone.localdate()
        today_orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")
        today_sales = today_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        today_profit = today_orders.aggregate(total=Sum("profit_amount"))["total"] or Decimal("0")

        unpaid_total = orders.exclude(payment_status="paid").aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        delivery_expected_cash = (
            orders
            .filter(payment_method="cash_delivery", payment_status="pay_on_delivery")
            .aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        )

        alerts = []

        if sales_total > 0 and profit_margin < Decimal("20"):
            alerts.append({
                "level": "danger",
                "title": "Margen bajo",
                "message": "El margen neto está por debajo del 20%. Revisa precios, coste de materiales o gastos diarios.",
            })

        if sales_total > 0 and cost_ratio > Decimal("60"):
            alerts.append({
                "level": "warning",
                "title": "Coste alto",
                "message": "El coste de materiales supera el 60% de las ventas. Conviene revisar recetas, proveedores e inventario.",
            })

        if unpaid_total > 0:
            alerts.append({
                "level": "warning",
                "title": "Pagos pendientes",
                "message": f"Hay {unpaid_total} EUR en pedidos no marcados como pagados.",
            })

        if delivery_expected_cash > 0:
            alerts.append({
                "level": "info",
                "title": "Efectivo esperado en reparto",
                "message": f"El efectivo esperado de pedidos a domicilio es {delivery_expected_cash} EUR.",
            })

        if orders_count == 0:
            alerts.append({
                "level": "info",
                "title": "Sin pedidos en el periodo",
                "message": "No hay pedidos en el periodo seleccionado. Cambia el rango o revisa el canal de ventas.",
            })

        if not alerts:
            alerts.append({
                "level": "success",
                "title": "Situación estable",
                "message": "Ventas, costes y pagos están dentro de un rango normal para este periodo.",
            })

        return Response({
            "period_days": days,
            "start_date": start_date,
            "end_date": end_date,
            "sales_total": sales_total,
            "cost_total": cost_total,
            "gross_profit": gross_profit,
            "expense_total": expense_total,
            "net_profit": net_profit,
            "orders_count": orders_count,
            "avg_order": avg_order,
            "profit_margin": profit_margin,
            "cost_ratio": cost_ratio,
            "today_sales": today_sales,
            "today_profit": today_profit,
            "unpaid_total": unpaid_total,
            "delivery_expected_cash": delivery_expected_cash,
            "payment_breakdown": payment_breakdown,
            "status_breakdown": status_breakdown,
            "top_items": top_items,
            "daily_sales": daily_sales,
            "alerts": alerts,
        })




class CustomerStatsRebuildView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        updated = 0
        for customer in Customer.objects.all():
            orders = Order.objects.filter(customer_phone=customer.phone)
            customer.total_orders = orders.count()
            customer.total_spent = (
                orders.exclude(status="cancelled").aggregate(total=Sum("total_amount"))["total"]
                or Decimal("0")
            )
            last_order = orders.order_by("-created_at").first()
            if last_order:
                customer.last_order_at = last_order.created_at
                if last_order.customer_name:
                    customer.name = last_order.customer_name
                if last_order.customer_address:
                    customer.address = last_order.customer_address
            customer.save(update_fields=["name", "address", "total_orders", "total_spent", "last_order_at", "updated_at"])
            updated += 1

        return Response({"updated_customers": updated})





# =========================
# v41 Professional Customer CRM
# =========================
def get_customer_tier_by_rank(rank):
    if rank <= 10:
        return {
            "tier": "VIP",
            "tier_label": "VIP / طلایی",
            "tier_color": "gold",
            "tier_icon": "🥇",
            "rank": rank,
            "discount_hint": "Cliente oro: atención especial y posible descuento VIP.",
        }
    if rank <= 20:
        return {
            "tier": "SILVER",
            "tier_label": "نقره‌ای",
            "tier_color": "silver",
            "tier_icon": "🥈",
            "rank": rank,
            "discount_hint": "Cliente plata: recomendable ofrecer promoción de fidelización.",
        }
    if rank <= 30:
        return {
            "tier": "BRONZE",
            "tier_label": "برنزی",
            "tier_color": "bronze",
            "tier_icon": "🥉",
            "rank": rank,
            "discount_hint": "Cliente bronce: buen candidato para campaña de retorno.",
        }
    return {
        "tier": "NORMAL",
        "tier_label": "معمولی",
        "tier_color": "normal",
        "tier_icon": "👤",
        "rank": rank,
        "discount_hint": "Cliente normal.",
    }


def build_customer_rank_rows():
    rows = []
    today = timezone.localdate()

    for customer in Customer.objects.all():
        orders = Order.objects.filter(customer_phone=customer.phone).exclude(status="cancelled")
        orders_count = orders.count()
        total_spent = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        avg_order = total_spent / orders_count if orders_count else Decimal("0")
        last_order = orders.order_by("-created_at").first()

        days_since_last_order = None
        if last_order:
            days_since_last_order = (today - last_order.created_at.date()).days

        top_food_row = (
            OrderItem.objects
            .filter(order__customer_phone=customer.phone)
            .exclude(order__status="cancelled")
            .values("menu_item__name")
            .annotate(quantity=Sum("quantity"), revenue=Sum("line_total"))
            .order_by("-quantity")
            .first()
        )

        rows.append({
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "total_orders": orders_count,
            "total_spent": total_spent,
            "avg_order": avg_order,
            "last_order_at": last_order.created_at if last_order else None,
            "days_since_last_order": days_since_last_order,
            "top_food": top_food_row["menu_item__name"] if top_food_row else "",
            "top_food_quantity": top_food_row["quantity"] if top_food_row else 0,
            "top_food_revenue": top_food_row["revenue"] if top_food_row else Decimal("0"),
        })

    rows.sort(
        key=lambda x: (
            x["total_orders"],
            x["total_spent"],
            x["last_order_at"] or timezone.datetime.min.replace(tzinfo=timezone.get_current_timezone()),
        ),
        reverse=True,
    )

    for index, row in enumerate(rows, start=1):
        row.update(get_customer_tier_by_rank(index))

        if row["tier"] == "VIP":
            row["segment"] = "VIP / Gold"
        elif row["tier"] == "SILVER":
            row["segment"] = "Silver"
        elif row["tier"] == "BRONZE":
            row["segment"] = "Bronze"
        elif row["days_since_last_order"] is not None and row["days_since_last_order"] >= 30:
            row["segment"] = "Inactive"
        elif row["total_orders"] >= 5:
            row["segment"] = "Returning"
        elif row["total_orders"] >= 1:
            row["segment"] = "New"
        else:
            row["segment"] = "No orders"

    return rows


class CustomerCRMDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, customer_id):
        rank_rows = build_customer_rank_rows()
        rank_map = {row["id"]: row for row in rank_rows}

        customer = Customer.objects.get(id=customer_id)
        ranked_customer = rank_map.get(customer.id, {
            "rank": 9999,
            "tier": "NORMAL",
            "tier_label": "معمولی",
            "tier_color": "normal",
            "tier_icon": "👤",
            "segment": "Normal",
            "discount_hint": "Cliente normal.",
        })

        orders = Order.objects.filter(customer_phone=customer.phone).exclude(status="cancelled").order_by("-created_at")
        orders_count = orders.count()
        total_spent = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
        avg_order = total_spent / orders_count if orders_count else Decimal("0")

        top_food_row = (
            OrderItem.objects
            .filter(order__customer_phone=customer.phone)
            .exclude(order__status="cancelled")
            .values("menu_item__name")
            .annotate(quantity=Sum("quantity"), revenue=Sum("line_total"))
            .order_by("-quantity")
            .first()
        )

        recent_orders = []
        for order in orders[:12]:
            recent_orders.append({
                "id": order.id,
                "created_at": order.created_at,
                "total_amount": order.total_amount,
                "status": order.status,
                "payment_method": order.payment_method,
                "payment_status": order.payment_status,
                "address": order.customer_address,
                "items": [
                    {
                        "name": item.menu_item.name,
                        "quantity": item.quantity,
                        "line_total": item.line_total,
                    }
                    for item in order.items.select_related("menu_item").all()
                ],
            })

        last_order = orders.first()
        days_since_last_order = None
        if last_order:
            days_since_last_order = (timezone.localdate() - last_order.created_at.date()).days

        suggestions = []
        if ranked_customer["tier"] == "VIP":
            suggestions.append("Cliente VIP / oro: tratar como cliente especial, priorizar atención y considerar detalle gratuito.")
        elif ranked_customer["tier"] == "SILVER":
            suggestions.append("Cliente plata: ofrecer promoción para convertirlo en VIP.")
        elif ranked_customer["tier"] == "BRONZE":
            suggestions.append("Cliente bronce: enviar oferta sencilla para aumentar frecuencia.")
        if days_since_last_order is not None and days_since_last_order >= 30:
            suggestions.append("Cliente inactivo: enviar mensaje de recuperación por WhatsApp.")
        if avg_order >= Decimal("15"):
            suggestions.append("Ticket medio alto: recomendar menús familiares o platos grandes.")
        if top_food_row:
            suggestions.append(f"Comida favorita detectada: {top_food_row['menu_item__name']}. Úsala en promociones.")
        if not suggestions:
            suggestions.append("Cliente estable: mantener seguimiento normal.")

        return Response({
            "id": customer.id,
            "name": customer.name,
            "phone": customer.phone,
            "address": customer.address,
            "total_orders": orders_count,
            "total_spent": total_spent,
            "avg_order": avg_order,
            "last_order_at": last_order.created_at if last_order else None,
            "days_since_last_order": days_since_last_order,
            "segment": ranked_customer.get("segment", "Normal"),
            "tier": ranked_customer["tier"],
            "tier_label": ranked_customer["tier_label"],
            "tier_color": ranked_customer["tier_color"],
            "tier_icon": ranked_customer["tier_icon"],
            "rank": ranked_customer["rank"],
            "discount_hint": ranked_customer["discount_hint"],
            "top_food": top_food_row["menu_item__name"] if top_food_row else "",
            "top_food_quantity": top_food_row["quantity"] if top_food_row else 0,
            "top_food_revenue": top_food_row["revenue"] if top_food_row else Decimal("0"),
            "recent_orders": recent_orders,
            "suggestions": suggestions,
        })


class CustomerCRMOverviewView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        result = build_customer_rank_rows()

        return Response({
            "customers": result,
            "total_customers": len(result),
            "vip_count": len([x for x in result if x["tier"] == "VIP"]),
            "silver_count": len([x for x in result if x["tier"] == "SILVER"]),
            "bronze_count": len([x for x in result if x["tier"] == "BRONZE"]),
            "inactive_count": len([x for x in result if x["segment"] == "Inactive"]),
            "returning_count": len([x for x in result if x["segment"] == "Returning"]),
            "top_customers": result[:10],
            "silver_customers": [x for x in result if x["tier"] == "SILVER"][:10],
            "bronze_customers": [x for x in result if x["tier"] == "BRONZE"][:10],
            "inactive_customers": [x for x in result if x["segment"] == "Inactive"][:10],
        })





# =========================
# v42.5 Cash Register - Order Source of Truth
# =========================
def get_today_payment_totals():
    today = timezone.localdate()
    orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")
    payments = Payment.objects.filter(created_at__date=today)

    # Main source for the cash register is Order, because every real sale is an Order.
    cash_orders = orders.filter(payment_method="cash_delivery")
    card_orders = orders.filter(payment_method="card_delivery")
    online_paid_orders = orders.filter(payment_method="online_card", payment_status="paid")

    cash_total = cash_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    card_total = card_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    online_total = online_paid_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

    # Debt should only be explicit unpaid/debt orders. Pay-on-delivery is NOT debt.
    debt_orders = orders.filter(payment_status__in=["unpaid", "debt", "pending_payment"])
    debt_total = debt_orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

    # Discounts still come from Payment ledger if used.
    discount_total = payments.aggregate(total=Sum("discount_amount"))["total"] or Decimal("0")
    mixed_payments = payments.filter(method="mixed").aggregate(total=Sum("amount"))["total"] or Decimal("0")

    delivery_cash_expected = cash_total
    delivery_card_expected = card_total

    sales_total = orders.aggregate(total=Sum("total_amount"))["total"] or Decimal("0")
    open_orders_count = orders.exclude(status__in=["delivered", "cancelled"]).count()

    return {
        "today": today,
        "orders": orders,
        "payments": payments,
        "sales_total": sales_total,
        "cash_payments": cash_total,
        "card_payments": card_total,
        "mixed_payments": mixed_payments,
        "online_paid": online_total,
        "delivery_cash_expected": delivery_cash_expected,
        "delivery_card_expected": delivery_card_expected,
        "debt_total": debt_total,
        "discount_total": discount_total,
        "open_orders_count": open_orders_count,
    }


class CashRegisterProfessionalStatusView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        totals = get_today_payment_totals()
        open_session = CashRegisterSession.objects.filter(is_closed=False).order_by("-opened_at").first()

        opening_cash = open_session.opening_cash if open_session else Decimal("0")
        expected_cash = opening_cash + totals["delivery_cash_expected"]

        warnings = []
        if not open_session:
            warnings.append("No hay caja abierta.")
        if totals["open_orders_count"] > 0:
            warnings.append(f"Hay {totals['open_orders_count']} pedidos abiertos.")
        if totals["debt_total"] > 0:
            warnings.append(f"Hay deuda real registrada: {totals['debt_total']} EUR.")

        return Response({
            "date": str(totals["today"]),
            "is_open": bool(open_session),
            "open_session": CashRegisterSessionSerializer(open_session).data if open_session else None,
            "opening_cash": opening_cash,
            "expected_cash": expected_cash,
            "cash_payments": totals["cash_payments"],
            "card_payments": totals["card_payments"],
            "mixed_payments": totals["mixed_payments"],
            "online_paid": totals["online_paid"],
            "delivery_cash_expected": totals["delivery_cash_expected"],
            "delivery_card_expected": totals["delivery_card_expected"],
            "sales_total": totals["sales_total"],
            "orders_count": totals["orders"].count(),
            "open_orders_count": totals["open_orders_count"],
            "debt_total": totals["debt_total"],
            "discount_total": totals["discount_total"],
            "warnings": warnings,
        })


class CashRegisterProfessionalOpenView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        already_open = CashRegisterSession.objects.filter(is_closed=False).order_by("-opened_at").first()
        if already_open:
            return Response({"detail": "Ya hay una caja abierta.", "session": CashRegisterSessionSerializer(already_open).data}, status=400)

        opening_cash = Decimal(str(request.data.get("opening_cash", "0") or "0"))
        notes = request.data.get("notes", "")

        session = CashRegisterSession.objects.create(
            opened_by=request.user,
            opening_cash=opening_cash,
            notes=notes,
            is_closed=False,
        )

        return Response({"ok": True, "message": "Caja abierta correctamente.", "session": CashRegisterSessionSerializer(session).data})


class CashRegisterProfessionalCloseView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        session = CashRegisterSession.objects.filter(is_closed=False).order_by("-opened_at").first()
        if not session:
            return Response({"detail": "No hay caja abierta."}, status=400)

        totals = get_today_payment_totals()
        force_close = bool(request.data.get("force_close", False))
        closing_cash = Decimal(str(request.data.get("closing_cash", "0") or "0"))
        notes = request.data.get("notes", "")

        if totals["open_orders_count"] > 0 and not force_close:
            return Response({
                "detail": "No se puede cerrar caja porque hay pedidos abiertos.",
                "open_orders_count": totals["open_orders_count"],
                "can_force_close": True,
            }, status=400)

        expected_cash = session.opening_cash + totals["delivery_cash_expected"]

        session.closing_cash = closing_cash
        session.expected_cash = expected_cash
        session.difference = closing_cash - expected_cash
        session.notes = notes
        session.is_closed = True
        session.closed_at = timezone.now()
        session.save()

        return Response({
            "ok": True,
            "message": "Caja cerrada correctamente.",
            "session": CashRegisterSessionSerializer(session).data,
            "expected_cash": expected_cash,
            "closing_cash": closing_cash,
            "difference": session.difference,
            "open_orders_count": totals["open_orders_count"],
        })


class CashRegisterProfessionalDailyReportView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        totals = get_today_payment_totals()
        sessions = CashRegisterSession.objects.filter(opened_at__date=totals["today"]).order_by("-opened_at")

        return Response({
            "date": str(totals["today"]),
            "orders_count": totals["orders"].count(),
            "sales_total": totals["sales_total"],
            "cash_payments": totals["cash_payments"],
            "card_payments": totals["card_payments"],
            "mixed_payments": totals["mixed_payments"],
            "online_paid": totals["online_paid"],
            "delivery_cash_expected": totals["delivery_cash_expected"],
            "delivery_card_expected": totals["delivery_card_expected"],
            "discount_total": totals["discount_total"],
            "debt_total": totals["debt_total"],
            "open_orders_count": totals["open_orders_count"],
            "sessions": CashRegisterSessionSerializer(sessions, many=True).data,
        })


class PaymentLedgerRebuildTodayView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        today = timezone.localdate()
        orders = Order.objects.filter(created_at__date=today).exclude(status="cancelled")
        created = 0
        updated = 0

        for order in orders:
            if order.payment_method == "cash_delivery":
                method = "cash"
            elif order.payment_method in ["card_delivery", "online_card"]:
                method = "card"
            else:
                method = "cash"

            payment, was_created = Payment.objects.update_or_create(
                order=order,
                defaults={
                    "method": method,
                    "amount": order.total_amount,
                    "discount_amount": Decimal("0"),
                    # pay_on_delivery is not debt
                    "debt_amount": Decimal("0") if order.payment_status in ["paid", "pay_on_delivery"] else Decimal("0"),
                    "notes": "Auto rebuilt by v42.5 order source of truth",
                }
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return Response({
            "ok": True,
            "date": str(today),
            "orders": orders.count(),
            "created_payments": created,
            "updated_payments": updated,
        })




class RestaurantSettingsView(APIView):
    permission_classes = []

    def get_object(self):
        obj = RestaurantSettings.objects.first()
        if not obj:
            obj = RestaurantSettings.objects.create()
        return obj

    def get(self, request):
        return Response(RestaurantSettingsSerializer(self.get_object()).data)

    def put(self, request):
        if not request.user or not request.user.is_staff:
            return Response({"detail": "Admin access required."}, status=403)
        obj = self.get_object()
        serializer = RestaurantSettingsSerializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)





# =========================
# v43 Rider Auto Dispatch API
# =========================

class RiderCurrentAssignedDeliveryView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        phone_raw = str(request.query_params.get("phone", "")).strip()
        phone = normalize_rider_phone(phone_raw)
        if not phone:
            return Response({"has_order": False, "detail": "Rider phone is required."}, status=400)

        candidates = (
            DeliveryTracking.objects
            .select_related("order")
            .filter(is_active=True)
            .exclude(order__status__in=["delivered", "cancelled"])
            .order_by("-started_at")[:100]
        )

        tracking = None
        for item in candidates:
            if normalize_rider_phone(item.rider_phone) == phone:
                tracking = item
                break

        if not tracking:
            return Response({"has_order": False})

        order = tracking.order

        return Response({
            "has_order": True,
            # Token is kept only internally for GPS/complete APIs. It is not sent by WhatsApp anymore.
            "token": tracking.token,
            "order_id": order.id,
            "tracking_code": f"CDKT-{order.id:06d}",
            "customer_name": order.customer_name,
            "customer_phone": order.customer_phone,
            "customer_address": order.customer_address,
            "status": order.status,
            "payment_method": order.payment_method,
            "payment_status": order.payment_status,
            "total_amount": order.total_amount,
            "rider_name": tracking.rider_name,
            "rider_phone": tracking.rider_phone,
            "last_seen_at": tracking.last_seen_at,
            "items": [
                {
                    "name": item.menu_item.name,
                    "quantity": item.quantity,
                    "line_total": item.line_total,
                }
                for item in order.items.select_related("menu_item").all()
            ],
        })


class RiderAutoAcceptCurrentDeliveryView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone_raw = str(request.data.get("phone", "")).strip()
        phone = normalize_rider_phone(phone_raw)
        if not phone:
            return Response({"detail": "Rider phone is required."}, status=400)

        candidates = (
            DeliveryTracking.objects
            .select_related("order")
            .filter(is_active=True)
            .exclude(order__status__in=["delivered", "cancelled"])
            .order_by("-started_at")[:100]
        )
        tracking = None
        for item in candidates:
            if normalize_rider_phone(item.rider_phone) == phone:
                tracking = item
                break

        if not tracking:
            return Response({"detail": "No active assigned delivery for this rider."}, status=404)

        tracking.started_at = timezone.now()
        tracking.save(update_fields=["started_at"])

        tracking.order.status = "out_for_delivery"
        tracking.order.save(update_fields=["status"])

        return Response({
            "ok": True,
            "tracking_code": f"CDKT-{tracking.order.id:06d}",
            "status": tracking.order.status,
        })

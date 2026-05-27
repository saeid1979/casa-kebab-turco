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
    Expense,
    InventoryItem,
    MenuItemIngredient,
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
    OnlinePaymentAttemptSerializer,
    CustomerAccountRegisterSerializer,
    CustomerAccountLoginSerializer,
    CustomerTrackingOrderSerializer,
)



class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by("-updated_at")
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

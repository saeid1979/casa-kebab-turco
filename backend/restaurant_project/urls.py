from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from restaurant.views import (
    CustomerViewSet,
    CategoryViewSet,
    MenuItemViewSet,
    OrderViewSet,
    ExpenseViewSet,
    AccountingSummaryView,
    DashboardSummaryView,
    InventoryItemViewSet,
    MenuItemIngredientViewSet,
    CurrentUserView,
    PaymentViewSet,
    CashRegisterSessionViewSet,
    OnlinePaymentAttemptViewSet,
    CashierSummaryView,
    ProfitLossSummaryView,
    CloseCashRegisterView,
    DailyCashReportView,
    CreateOnlinePaymentView,
    ConfirmOnlinePaymentView,
    CustomerRegisterView,
    CustomerLoginView,
    CustomerMeView,
    CustomerMyOrdersView,
    PublicOrderTrackingView,
    RedsysCallbackView,
)


router = DefaultRouter()
router.register(r"customers", CustomerViewSet)
router.register(r"categories", CategoryViewSet)
router.register(r"menu-items", MenuItemViewSet)
router.register(r"orders", OrderViewSet)
router.register(r"expenses", ExpenseViewSet)
router.register(r"inventory-items", InventoryItemViewSet)
router.register(r"menu-item-ingredients", MenuItemIngredientViewSet)
router.register(r"payments", PaymentViewSet)
router.register(r"cash-register-sessions", CashRegisterSessionViewSet)
router.register(r"online-payment-attempts", OnlinePaymentAttemptViewSet)


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/customer/register/", CustomerRegisterView.as_view(), name="customer_register"),
    path("api/customer/login/", CustomerLoginView.as_view(), name="customer_login"),
    path("api/customer/me/", CustomerMeView.as_view(), name="customer_me"),
    path("api/customer/my-orders/", CustomerMyOrdersView.as_view(), name="customer_my_orders"),
    path("api/track-order/", PublicOrderTrackingView.as_view(), name="public_order_tracking"),
    path("api/current-user/", CurrentUserView.as_view(), name="current_user"),
    path("api/cashier-summary/", CashierSummaryView.as_view(), name="cashier_summary"),
    path("api/profit-loss-summary/", ProfitLossSummaryView.as_view(), name="profit_loss_summary"),
    path("api/close-cash-register/", CloseCashRegisterView.as_view(), name="close_cash_register"),
    path("api/daily-cash-report/", DailyCashReportView.as_view(), name="daily_cash_report"),
    path("api/create-online-payment/", CreateOnlinePaymentView.as_view(), name="create_online_payment"),
    path("api/confirm-online-payment/", ConfirmOnlinePaymentView.as_view(), name="confirm_online_payment"),
    path("api/redsys/callback/", RedsysCallbackView.as_view(), name="redsys_callback"),

    path("api/dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard_summary"),
    path("api/accounting/summary/", AccountingSummaryView.as_view(), name="accounting_summary"),

    path("api/", include(router.urls)),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

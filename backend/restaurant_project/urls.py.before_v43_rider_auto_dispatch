from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from restaurant.views import (
    ExecutiveFinanceDashboardView,
    ExecutiveExpenseCreateView,
    RiderPerformanceReportView,
    DeliveryRiderListCreateView,
    DeliveryRiderDetailView,
    CustomerViewSet,
    CustomerCRMOverviewView,
    CustomerCRMDetailView,
    CategoryViewSet,
    MenuItemViewSet,
    OrderViewSet,
    ExpenseViewSet,
    AccountingSummaryView,
    DashboardSummaryView,
    InventoryItemViewSet,
    MenuItemIngredientViewSet,
    CurrentUserView,
    RestaurantSettingsView,
    PaymentViewSet,
    CashRegisterSessionViewSet,
    OnlinePaymentAttemptViewSet,
    CashierSummaryView,
    ProfitLossSummaryView,
    CloseCashRegisterView,
    PaymentLedgerRebuildTodayView,
    CashRegisterProfessionalStatusView,
    CashRegisterProfessionalOpenView,
    CashRegisterProfessionalCloseView,
    CashRegisterProfessionalDailyReportView,
    DailyCashReportView,
    CreateOnlinePaymentView,
    ConfirmOnlinePaymentView,
    CustomerRegisterView,
    CustomerLoginView,
    CustomerMeView,
    CustomerMyOrdersView,
    DeliveryCreateTrackingView,
    DeliveryMobileInfoView,
    DeliveryLocationUpdateView,
    DeliveryStopTrackingView,
    CustomerLiveDeliveryLocationView,
    DeliveryAcceptView,
    DeliveryCompleteView,
    DeliveryAdminListView,
    ComingSoonVisitTrackView,
    ComingSoonVisitAdminListView,
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
    path("api/executive-finance-dashboard/", ExecutiveFinanceDashboardView.as_view(), name="executive_finance_dashboard"),
    path("api/executive-expenses/", ExecutiveExpenseCreateView.as_view(), name="executive_expenses"),
    path("api/delivery/rider-performance/", RiderPerformanceReportView.as_view(), name="rider_performance_report"),
    path("api/delivery/riders/", DeliveryRiderListCreateView.as_view(), name="delivery_rider_list_create"),
    path("api/delivery/riders/<int:rider_id>/", DeliveryRiderDetailView.as_view(), name="delivery_rider_detail"),
    path("admin/", admin.site.urls),

    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("api/customer/register/", CustomerRegisterView.as_view(), name="customer_register"),
    path("api/customer/login/", CustomerLoginView.as_view(), name="customer_login"),
    path("api/customer/me/", CustomerMeView.as_view(), name="customer_me"),
    path("api/customer/my-orders/", CustomerMyOrdersView.as_view(), name="customer_my_orders"),
    path("api/delivery/create-tracking/", DeliveryCreateTrackingView.as_view(), name="delivery_create_tracking"),
    path("api/delivery/info/", DeliveryMobileInfoView.as_view(), name="delivery_info"),
    path("api/delivery/location/", DeliveryLocationUpdateView.as_view(), name="delivery_location_update"),
    path("api/delivery/stop/", DeliveryStopTrackingView.as_view(), name="delivery_stop"),
    path("api/delivery/customer-location/", CustomerLiveDeliveryLocationView.as_view(), name="customer_live_delivery_location"),
    path("api/delivery/accept/", DeliveryAcceptView.as_view(), name="delivery_accept"),
    path("api/delivery/complete/", DeliveryCompleteView.as_view(), name="delivery_complete"),
    path("api/delivery/admin-list/", DeliveryAdminListView.as_view(), name="delivery_admin_list"),
    path("api/track-order/", PublicOrderTrackingView.as_view(), name="public_order_tracking"),
    path("api/coming-soon/visit/", ComingSoonVisitTrackView.as_view(), name="coming_soon_visit"),
    path("api/coming-soon/visits-admin/", ComingSoonVisitAdminListView.as_view(), name="coming_soon_visits_admin"),
    path("api/current-user/", CurrentUserView.as_view(), name="current_user"),
    path("api/restaurant-settings/", RestaurantSettingsView.as_view(), name="restaurant_settings"),
    path("api/customers/crm-overview/", CustomerCRMOverviewView.as_view(), name="customer_crm_overview"),
    path("api/customers/<int:customer_id>/crm-detail/", CustomerCRMDetailView.as_view(), name="customer_crm_detail"),
    path("api/cashier-summary/", CashierSummaryView.as_view(), name="cashier_summary"),
    path("api/profit-loss-summary/", ProfitLossSummaryView.as_view(), name="profit_loss_summary"),
    path("api/close-cash-register/", CloseCashRegisterView.as_view(), name="close_cash_register"),

    path("api/cash-register/pro/status/", CashRegisterProfessionalStatusView.as_view(), name="cash_register_pro_status"),
    path("api/cash-register/pro/open/", CashRegisterProfessionalOpenView.as_view(), name="cash_register_pro_open"),
    path("api/cash-register/pro/close/", CashRegisterProfessionalCloseView.as_view(), name="cash_register_pro_close"),
    path("api/cash-register/pro/daily-report/", CashRegisterProfessionalDailyReportView.as_view(), name="cash_register_pro_daily_report"),
    path("api/cash-register/pro/rebuild-payment-ledger-today/", PaymentLedgerRebuildTodayView.as_view(), name="payment_ledger_rebuild_today"),

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

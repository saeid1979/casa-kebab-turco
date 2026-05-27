from django.contrib import admin

from .models import (
    Customer,
    Category,
    MenuItem,
    Order,
    OrderItem,
    Expense,
    InventoryItem,
    MenuItemIngredient,
    UserProfile,
    Payment,
    CashRegisterSession,
    OnlinePaymentAttempt,
)



@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["name", "phone", "total_orders", "total_spent", "last_order_at", "updated_at"]
    search_fields = ["name", "phone", "address"]
    readonly_fields = ["total_orders", "total_spent", "created_at", "updated_at", "last_order_at"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "is_active"]
    search_fields = ["name"]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ["name", "price", "category", "is_available"]
    list_filter = ["category", "is_available"]
    search_fields = ["name"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "customer_name",
        "order_type",
        "status",
        "payment_method",
        "payment_status",
        "total_amount",
        "created_at",
    ]
    list_filter = ["status", "payment_method", "payment_status", "order_type"]
    search_fields = ["customer_name", "customer_phone"]
    inlines = [OrderItemInline]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["title", "amount", "created_at", "category"]
    list_filter = ["category", "created_at"]
    search_fields = ["title"]


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ["name", "unit", "current_stock", "minimum_stock", "unit_cost", "is_active"]
    search_fields = ["name"]


@admin.register(MenuItemIngredient)
class MenuItemIngredientAdmin(admin.ModelAdmin):
    list_display = ["menu_item", "inventory_item", "quantity_required"]


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "role"]
    list_filter = ["role"]


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ["order", "method", "amount", "discount_amount", "debt_amount", "created_at"]
    list_filter = ["method", "created_at"]


@admin.register(CashRegisterSession)
class CashRegisterSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "opened_by", "opening_cash", "closing_cash", "expected_cash", "difference", "is_closed"]


@admin.register(OnlinePaymentAttempt)
class OnlinePaymentAttemptAdmin(admin.ModelAdmin):
    list_display = [
        "order",
        "provider",
        "amount",
        "status",
        "reference",
        "bank_response_code",
        "bank_transaction_id",
        "created_at",
    ]
    list_filter = ["status", "provider", "created_at"]
    search_fields = ["reference", "bank_transaction_id", "order__customer_name"]

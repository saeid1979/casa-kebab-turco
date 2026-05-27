from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from rest_framework import serializers

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


class CustomerSerializer(serializers.ModelSerializer):
    last_order_id = serializers.SerializerMethodField()

    class Meta:
        model = Customer
        fields = [
            "id",
            "user",
            "name",
            "phone",
            "address",
            "last_order_at",
            "total_orders",
            "total_spent",
            "created_at",
            "updated_at",
            "last_order_id",
        ]

    def get_last_order_id(self, obj):
        last_order = Order.objects.filter(customer_phone=obj.phone).order_by("-created_at").first()
        return last_order.id if last_order else None


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class MenuItemIngredientSerializer(serializers.ModelSerializer):
    inventory_item_name = serializers.CharField(source="inventory_item.name", read_only=True)
    inventory_item_unit = serializers.CharField(source="inventory_item.unit", read_only=True)
    menu_item_name = serializers.CharField(source="menu_item.name", read_only=True)

    class Meta:
        model = MenuItemIngredient
        fields = "__all__"


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    image_display_url = serializers.SerializerMethodField()
    ingredients = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = "__all__"

    def get_image_display_url(self, obj):
        request = self.context.get("request")
        if getattr(obj, "image", None):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return getattr(obj, "image_url", "") or ""

    def get_ingredients(self, obj):
        if hasattr(obj, "ingredients"):
            return MenuItemIngredientSerializer(obj.ingredients.all(), many=True).data
        return []


class OrderItemReadSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source="menu_item.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "menu_item", "menu_item_name", "quantity", "unit_price", "line_total"]


class OrderItemWriteSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)
    order_items = OrderItemWriteSerializer(many=True, write_only=True)
    whatsapp_url = serializers.SerializerMethodField()
    telegram_notification = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "customer_address",
            "order_type",
            "status",
            "notes",
            "total_amount",
            "cost_amount",
            "profit_amount",
            "payment_method",
            "payment_status",
            "payment_reference",
            "bank_transaction_id",
            "created_at",
            "items",
            "order_items",
            "whatsapp_url",
            "telegram_notification",
        ]
        read_only_fields = [
            "total_amount",
            "cost_amount",
            "profit_amount",
            "payment_reference",
            "bank_transaction_id",
            "created_at",
        ]

    def get_whatsapp_url(self, obj):
        try:
            from .notifications import build_whatsapp_url
            return build_whatsapp_url(obj)
        except Exception:
            return ""

    def get_telegram_notification(self, obj):
        return getattr(obj, "_telegram_notification", None)

    def create(self, validated_data):
        order_items = validated_data.pop("order_items", [])
        payment_method = validated_data.get("payment_method", "cash_delivery")

        if payment_method in ["cash_delivery", "card_delivery"]:
            validated_data["payment_status"] = "pay_on_delivery"
        elif payment_method == "online_card":
            validated_data["payment_status"] = "pending"

        phone = validated_data.get("customer_phone", "").strip()
        name = validated_data.get("customer_name", "").strip()
        address = validated_data.get("customer_address", "").strip()

        customer_obj = None
        if phone:
            customer_obj, _ = Customer.objects.update_or_create(
                phone=phone,
                defaults={
                    "name": name,
                    "address": address,
                    "last_order_at": timezone.now(),
                },
            )

        order = Order.objects.create(**validated_data)

        total = Decimal("0")
        material_cost = Decimal("0")

        for item in order_items:
            menu_item = MenuItem.objects.get(id=item["menu_item_id"])
            quantity = item["quantity"]
            unit_price = menu_item.price
            line_total = unit_price * quantity

            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )

            total += line_total

            if hasattr(menu_item, "ingredients"):
                for ingredient in menu_item.ingredients.select_related("inventory_item").all():
                    used_quantity = ingredient.quantity_required * quantity
                    inventory_item = ingredient.inventory_item
                    inventory_item.current_stock = inventory_item.current_stock - used_quantity
                    inventory_item.save(update_fields=["current_stock"])
                    material_cost += used_quantity * inventory_item.unit_cost

        order.total_amount = total
        order.cost_amount = material_cost if material_cost > 0 else total * Decimal("0.55")
        order.profit_amount = order.total_amount - order.cost_amount
        order.save()

        if customer_obj:
            customer_orders = Order.objects.filter(customer_phone=phone)
            customer_obj.total_orders = customer_orders.count()
            customer_obj.total_spent = (
                customer_orders.exclude(status="cancelled").aggregate(total=models.Sum("total_amount"))["total"]
                or Decimal("0")
            )
            customer_obj.last_order_at = order.created_at
            customer_obj.save(update_fields=["total_orders", "total_spent", "last_order_at", "updated_at"])

        try:
            from .notifications import send_order_to_telegram
            telegram_ok, telegram_message = send_order_to_telegram(order)
            order._telegram_notification = {
                "sent": telegram_ok,
                "message": telegram_message,
            }
        except Exception as exc:
            order._telegram_notification = {
                "sent": False,
                "message": str(exc),
            }

        return order


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = "__all__"


class InventoryItemSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)
    stock_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InventoryItem
        fields = "__all__"


class CurrentUserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_admin = serializers.BooleanField(source="is_staff", read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_admin", "role"]

    def get_role(self, obj):
        if obj.is_superuser or obj.is_staff:
            return "admin"
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        return profile.role


class PaymentSerializer(serializers.ModelSerializer):
    order_customer = serializers.CharField(source="order.customer_name", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"


class CashRegisterSessionSerializer(serializers.ModelSerializer):
    opened_by_username = serializers.CharField(source="opened_by.username", read_only=True)

    class Meta:
        model = CashRegisterSession
        fields = "__all__"


class OnlinePaymentAttemptSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.id", read_only=True)

    class Meta:
        model = OnlinePaymentAttempt
        fields = "__all__"



class CustomerAccountRegisterSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=160)
    phone = serializers.CharField(max_length=40)
    address = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=4)

    def create(self, validated_data):
        phone = validated_data["phone"].strip()
        name = validated_data["name"].strip()
        address = validated_data.get("address", "").strip()
        password = validated_data["password"]

        user, created = User.objects.get_or_create(username=phone)
        user.set_password(password)
        user.first_name = name
        user.save()

        customer, _ = Customer.objects.update_or_create(
            phone=phone,
            defaults={
                "user": user,
                "name": name,
                "address": address,
                "last_order_at": timezone.now(),
            },
        )

        return customer


class CustomerAccountLoginSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=40)
    password = serializers.CharField(write_only=True)


class CustomerTrackingOrderSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_phone",
            "customer_address",
            "order_type",
            "status",
            "payment_method",
            "payment_status",
            "total_amount",
            "created_at",
            "items",
        ]

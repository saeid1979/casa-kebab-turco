from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.utils import timezone as django_timezone



class Customer(models.Model):
    name = models.CharField(max_length=160)
    phone = models.CharField(max_length=40, unique=True)
    address = models.TextField(blank=True)
    last_order_at = models.DateTimeField(null=True, blank=True)
    total_orders = models.PositiveIntegerField(default=0)
    total_spent = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} - {self.phone}"


class Category(models.Model):
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image_url = models.URLField(blank=True)
    image = models.ImageField(upload_to='menu_items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)
    preparation_minutes = models.PositiveIntegerField(default=10)

    class Meta:
        ordering = ['category__name', 'name']

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    ORDER_TYPE_CHOICES = [
        ('takeaway', 'Takeaway'),
        ('dine_in', 'Dine In'),
        ('delivery', 'Delivery'),
    ]

    customer_name = models.CharField(max_length=160)
    customer_phone = models.CharField(max_length=40)
    customer_address = models.TextField(blank=True)
    customer_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    customer_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    customer_geocoded_address = models.TextField(blank=True)
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='takeaway')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    notes = models.TextField(blank=True)

    PAYMENT_METHOD_CHOICES = [
        ('cash_delivery', 'Cash on delivery'),
        ('card_delivery', 'Card terminal on delivery'),
        ('online_card', 'Online card payment'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('pay_on_delivery', 'Pay on delivery'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    payment_method = models.CharField(max_length=30, choices=PAYMENT_METHOD_CHOICES, default='cash_delivery')
    payment_status = models.CharField(max_length=30, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_reference = models.CharField(max_length=120, blank=True)
    bank_transaction_id = models.CharField(max_length=120, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    profit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(default=django_timezone.now)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.line_total = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"


class Expense(models.Model):
    title = models.CharField(max_length=160)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=120, default='General')
    created_at = models.DateTimeField(default=django_timezone.now)
    note = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title



class InventoryItem(models.Model):
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('unit', 'Unit'),
        ('liter', 'Liter'),
        ('ml', 'Milliliter'),
        ('pack', 'Pack'),
    ]

    name = models.CharField(max_length=160)
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default='unit')
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    minimum_stock = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=django_timezone.now)

    class Meta:
        ordering = ['name']

    @property
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock

    @property
    def stock_value(self):
        return self.current_stock * self.unit_cost

    def __str__(self):
        return self.name


class MenuItemIngredient(models.Model):
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='ingredients')
    inventory_item = models.ForeignKey(InventoryItem, on_delete=models.PROTECT, related_name='menu_links')
    quantity_required = models.DecimalField(max_digits=10, decimal_places=2, default=1)

    class Meta:
        unique_together = ('menu_item', 'inventory_item')

    def __str__(self):
        return f"{self.menu_item.name} - {self.inventory_item.name}"



class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('cashier', 'Cashier'),
        ('kitchen', 'Kitchen'),
        ('delivery', 'Delivery'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='cashier')

    def __str__(self):
        return f"{self.user.username} - {self.role}"



class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('debt', 'Debt'),
        ('mixed', 'Mixed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    method = models.CharField(max_length=20, choices=METHOD_CHOICES, default='cash')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    debt_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)

    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order_id}"


class CashRegisterSession(models.Model):
    opened_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='cash_sessions')
    opening_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    closing_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    expected_cash = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    difference = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    opened_at = models.DateTimeField(default=django_timezone.now)
    closed_at = models.DateTimeField(null=True, blank=True)
    is_closed = models.BooleanField(default=False)

    def __str__(self):
        return f"Cash session #{self.id}"



class OnlinePaymentAttempt(models.Model):
    STATUS_CHOICES = [
        ('created', 'Created'),
        ('redirected', 'Redirected'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
    ]

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_attempts')
    provider = models.CharField(max_length=40, default='bbva_redsys_ready')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    reference = models.CharField(max_length=120, unique=True)
    bank_response_code = models.CharField(max_length=40, blank=True)
    bank_transaction_id = models.CharField(max_length=120, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.provider} - {self.reference}"



class ComingSoonVisit(models.Model):
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    country = models.CharField(max_length=120, blank=True)
    country_code = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=120, blank=True)
    region = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=120, blank=True)
    isp = models.CharField(max_length=200, blank=True)
    user_agent = models.TextField(blank=True)
    browser_language = models.CharField(max_length=80, blank=True)
    page_url = models.TextField(blank=True)
    referrer = models.TextField(blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.ip_address or 'unknown'} - {self.country or 'unknown'}"


class DeliveryTracking(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="delivery_tracking")
    token = models.CharField(max_length=80, unique=True, db_index=True)
    rider_name = models.CharField(max_length=120, blank=True)
    rider_phone = models.CharField(max_length=40, blank=True)
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(default=django_timezone.now)
    stopped_at = models.DateTimeField(null=True, blank=True)
    last_latitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    last_longitude = models.DecimalField(max_digits=10, decimal_places=7, null=True, blank=True)
    last_accuracy = models.FloatField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"DeliveryTracking order={self.order_id}"


class DeliveryLocationPoint(models.Model):
    tracking = models.ForeignKey(DeliveryTracking, on_delete=models.CASCADE, related_name="points")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    accuracy = models.FloatField(null=True, blank=True)
    speed = models.FloatField(null=True, blank=True)
    heading = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.tracking.order_id} - {self.latitude},{self.longitude}"


class DeliveryRider(models.Model):
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=40, unique=True)
    vehicle_type = models.CharField(max_length=80, blank=True, default="Moto")
    vehicle_plate = models.CharField(max_length=80, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=django_timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.phone}"



class RestaurantSettings(models.Model):
    name = models.CharField(max_length=120, default="Casa de Kebab Turco")
    phone = models.CharField(max_length=30, default="+34 613 473 564")
    subtitle_es = models.CharField(max_length=200, default="Kebab fresco, pedidos rápidos, auténtico sabor turco")
    subtitle_en = models.CharField(max_length=200, default="Fresh kebab, fast orders, authentic Turkish taste")
    address = models.CharField(max_length=255, default="Calle García Lorca, 1, 37004 Salamanca, España")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


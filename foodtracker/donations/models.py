from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class DonationCenter(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    website = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class FoodDonation(models.Model):
    FOOD_TYPES = [
        ('Fruit', 'Fruit'),
        ('Vegetable', 'Vegetable'),
        ('Meat', 'Meat'),
        ('Dairy', 'Dairy'),
        ('Bakery', 'Bakery'),
        ('Canned', 'Canned'),
        ('Other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Reserved', 'Reserved'),
        ('Donated', 'Donated'),
        ('Expired', 'Expired'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_donations', null=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=FOOD_TYPES)
    quantity = models.FloatField(validators=[MinValueValidator(0.1)])
    expiration_date = models.DateField()
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='donations/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    donation_center = models.ForeignKey(DonationCenter, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.username if self.user else 'Anonymous'}"

    def is_expired(self):
        return self.expiration_date < timezone.now().date()

class FoodWaste(models.Model):
    WASTE_REASONS = [
        ('Spoilage', 'Spoilage'),
        ('Overproduction', 'Overproduction'),
        ('Expired', 'Expired'),
        ('Damaged', 'Damaged'),
        ('Other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='waste_logs', null=True)
    name = models.CharField(max_length=100)
    reason = models.CharField(max_length=50, choices=WASTE_REASONS)
    quantity = models.FloatField(validators=[MinValueValidator(0.1)])
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='waste/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.reason}"

class DonationRequest(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
        ('Completed', 'Completed'),
    ]

    donation = models.ForeignKey(FoodDonation, on_delete=models.CASCADE, related_name='requests')
    donation_center = models.ForeignKey(DonationCenter, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Request for {self.donation.name} by {self.donation_center.name}"

class Donation(models.Model):
    STATUS_CHOICES = [
        ('Available', 'Available'),
        ('Reserved', 'Reserved'),
        ('Collected', 'Collected'),
    ]

    TYPE_CHOICES = [
        ('Fruit', 'Fruit'),
        ('Vegetable', 'Vegetable'),
        ('Meat', 'Meat'),
        ('Dairy', 'Dairy'),
        ('Bakery', 'Bakery'),
        ('Canned', 'Canned'),
        ('Other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    expiration_date = models.DateField()
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Available')
    donor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='donations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.type} ({self.quantity})"

    class Meta:
        ordering = ['-created_at']

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('warning', 'Warning'),
        ('success', 'Success'),
        ('info', 'Info'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES, default='info')
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    email_verified = models.BooleanField(default=False)
    verification_token = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
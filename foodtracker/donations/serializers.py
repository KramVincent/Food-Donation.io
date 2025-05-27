from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FoodDonation, FoodWaste, DonationCenter, DonationRequest, Donation, Notification, UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'phone_number')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return data

    def create(self, validated_data):
        # Remove confirm_password from the data
        validated_data.pop('confirm_password')
        
        # Create the user
        user = User.objects.create_user(
            username=validated_data['email'],  # Use email as username
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        
        # Create or update profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        if 'phone_number' in validated_data:
            profile.phone_number = validated_data['phone_number']
            profile.save()
        
        return user

class DonationCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationCenter
        fields = '__all__'

class FoodDonationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    donation_center = DonationCenterSerializer(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = FoodDonation
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'updated_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FoodWasteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FoodWaste
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class DonationRequestSerializer(serializers.ModelSerializer):
    donation = FoodDonationSerializer(read_only=True)
    donation_center = DonationCenterSerializer(read_only=True)

    class Meta:
        model = DonationRequest
        fields = '__all__'
        read_only_fields = ('status', 'created_at', 'updated_at')

class DonationRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DonationRequest
        fields = ('donation', 'donation_center', 'message')

class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'name', 'type', 'quantity', 'expiration_date', 
                 'description', 'status', 'donor', 'donor_name', 'created_at', 
                 'updated_at']
        read_only_fields = ['donor', 'created_at', 'updated_at']

    def get_donor_name(self, obj):
        return f"{obj.donor.first_name} {obj.donor.last_name}" if obj.donor else "Anonymous"

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'read', 'created_at']
        read_only_fields = ['created_at']

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        return data

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email']
        extra_kwargs = {
            'email': {'required': False}
        }
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from .models import Donation, FoodDonation, FoodWaste, DonationCenter, DonationRequest, Notification
from .serializers import (
    DonationSerializer, UserSerializer, UserRegistrationSerializer,
    FoodDonationSerializer, FoodWasteSerializer,
    DonationCenterSerializer, DonationRequestSerializer, NotificationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UserProfileUpdateSerializer
)
from rest_framework.decorators import action
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        try:
            print("Received login data:", attrs)  # Log received data
            
            # Check if user exists
            email = attrs.get('email')
            password = attrs.get('password')
            
            # Try to authenticate the user
            user = authenticate(username=email, password=password)
            
            if user is None:
                print(f"Authentication failed for email: {email}")  # Log authentication failure
                raise serializers.ValidationError({
                    'detail': ['Invalid email or password']
                })
            
            print(f"User authenticated successfully: {user.email}")  # Log success
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            
        except Exception as e:
            print(f"Login error: {str(e)}")  # Log the error
            raise serializers.ValidationError({
                'detail': ['Invalid email or password']
            })

class CustomTokenObtainPairView(APIView):
    permission_classes = []  # Allow any user to access this view

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response(
                {'detail': ['Please provide both email and password']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Try to authenticate the user
        user = authenticate(username=email, password=password)

        if user is None:
            return Response(
                {'detail': ['Invalid email or password']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })

class UserRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("Received registration data:", request.data)  # Log received data
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                print(f"User created successfully: {user.email}")  # Log successful creation
                
                # Send verification email
                token = get_random_string(length=32)
                user.profile.verification_token = token
                user.profile.save()
                
                verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
                send_mail(
                    'Verify Your Email',
                    f'Click the following link to verify your email: {verification_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': 'Registration successful. Please check your email to verify your account.',
                    'user': UserSerializer(user).data
                }, status=status.HTTP_201_CREATED)
            except Exception as e:
                print(f"Error during user creation: {str(e)}")  # Log creation error
                return Response({
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        print("Validation errors:", serializer.errors)  # Log validation errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(donor=self.request.user)

    def get_queryset(self):
        queryset = Donation.objects.all()
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        return queryset

class FoodDonationViewSet(viewsets.ModelViewSet):
    queryset = FoodDonation.objects.all()
    serializer_class = FoodDonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FoodWasteViewSet(viewsets.ModelViewSet):
    queryset = FoodWaste.objects.all()
    serializer_class = FoodWasteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DonationCenterViewSet(viewsets.ModelViewSet):
    queryset = DonationCenter.objects.all()
    serializer_class = DonationCenterSerializer
    permission_classes = [permissions.IsAuthenticated]

class DonationRequestViewSet(viewsets.ModelViewSet):
    queryset = DonationRequest.objects.all()
    serializer_class = DonationRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(read=True)
        return Response({'status': 'success'})

class ReportsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            time_range = request.query_params.get('time_range', 'month')
            
            # Calculate date range
            end_date = timezone.now()
            if time_range == 'week':
                start_date = end_date - timedelta(days=7)
            elif time_range == 'year':
                start_date = end_date - timedelta(days=365)
            else:  # month
                start_date = end_date - timedelta(days=30)

            # Initialize empty data structures
            waste_trends = []
            donation_stats = []
            waste_categories = []
            center_performance = []
            total_food_saved = 0

            try:
                # Get waste trends
                waste_trends = list(FoodWaste.objects.filter(
                    created_at__range=[start_date, end_date]
                ).values('created_at__date').annotate(
                    amount=Sum('quantity')
                ).order_by('created_at__date'))
            except Exception as e:
                print(f"Error in waste trends query: {str(e)}")

            try:
                # Get donation statistics
                donation_stats = list(FoodDonation.objects.filter(
                    created_at__range=[start_date, end_date]
                ).values('type').annotate(
                    amount=Sum('quantity')
                ))
            except Exception as e:
                print(f"Error in donation stats query: {str(e)}")

            try:
                # Get waste categories
                waste_categories = list(FoodWaste.objects.filter(
                    created_at__range=[start_date, end_date]
                ).values('reason').annotate(
                    value=Sum('quantity')
                ))
            except Exception as e:
                print(f"Error in waste categories query: {str(e)}")

            try:
                # Get center performance
                center_performance = list(DonationCenter.objects.annotate(
                    donations=Count('fooddonation', distinct=True),
                    waste=Count('foodwaste', distinct=True)
                ).values('name', 'donations', 'waste'))
            except Exception as e:
                print(f"Error in center performance query: {str(e)}")

            try:
                # Calculate environmental impact
                total_food_saved = FoodDonation.objects.filter(
                    created_at__range=[start_date, end_date],
                    status='Donated'
                ).aggregate(total=Sum('quantity'))['total'] or 0
            except Exception as e:
                print(f"Error in environmental impact calculation: {str(e)}")

            # Format dates for waste trends
            formatted_waste_trends = [
                {
                    'date': item['created_at__date'].strftime('%Y-%m-%d'),
                    'amount': float(item['amount'] or 0)
                }
                for item in waste_trends
            ]

            # Format donation stats
            formatted_donation_stats = [
                {
                    'category': item['type'],
                    'amount': float(item['amount'] or 0)
                }
                for item in donation_stats
            ]

            # Format waste categories
            formatted_waste_categories = [
                {
                    'name': item['reason'],
                    'value': float(item['value'] or 0)
                }
                for item in waste_categories
            ]

            environmental_impact = {
                'co2Saved': round(float(total_food_saved) * 2.5, 2),
                'waterSaved': round(float(total_food_saved) * 1000, 2),
                'foodSaved': round(float(total_food_saved), 2)
            }

            return Response({
                'wasteTrends': formatted_waste_trends,
                'donationStats': formatted_donation_stats,
                'wasteCategories': formatted_waste_categories,
                'centerPerformance': center_performance,
                'environmentalImpact': environmental_impact
            })

        except Exception as e:
            import traceback
            error_details = traceback.format_exc()
            print(f"Detailed error: {error_details}")
            return Response(
                {
                    'error': str(e),
                    'details': error_details
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ExpirationViewSet(viewsets.ModelViewSet):
    serializer_class = FoodDonationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FoodDonation.objects.filter(
            user=self.request.user,
            status='available'
        ).order_by('expiration_date')

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only allow users to see their own profile unless they're staff
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
                
                send_mail(
                    'Password Reset Request',
                    f'Click the following link to reset your password: {reset_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                return Response({'message': 'Password reset email sent'})
            except User.DoesNotExist:
                return Response({'message': 'If an account exists with this email, you will receive a password reset link'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uid = force_str(urlsafe_base64_decode(uidb64))
                user = User.objects.get(pk=uid)
                if default_token_generator.check_token(user, token):
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    return Response({'message': 'Password has been reset'})
                return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
            except (TypeError, ValueError, User.DoesNotExist):
                return Response({'error': 'Invalid user'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        serializer = UserProfileUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmailVerificationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)
        
        if request.user.profile.email_verified:
            return Response({'message': 'Email already verified'})
        
        token = get_random_string(length=32)
        request.user.profile.verification_token = token
        request.user.profile.save()
        
        verification_url = f"{settings.FRONTEND_URL}/verify-email/{token}"
        send_mail(
            'Verify Your Email',
            f'Click the following link to verify your email: {verification_url}',
            settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=False,
        )
        return Response({'message': 'Verification email sent'})

    def get(self, request, token):
        try:
            user = User.objects.get(profile__verification_token=token)
            user.profile.email_verified = True
            user.profile.verification_token = None
            user.profile.save()
            return Response({'message': 'Email verified successfully'})
        except User.DoesNotExist:
            return Response({'error': 'Invalid verification token'}, status=status.HTTP_400_BAD_REQUEST)
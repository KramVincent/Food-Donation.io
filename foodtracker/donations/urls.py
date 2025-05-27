from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    UserRegistrationView, UserProfileView,
    FoodDonationViewSet, FoodWasteViewSet,
    DonationCenterViewSet, DonationRequestViewSet,
    DonationViewSet, NotificationViewSet,
    ReportsView, ExpirationViewSet,
    UserViewSet, PasswordResetRequestView,
    PasswordResetConfirmView, UserProfileUpdateView,
    EmailVerificationView, CustomTokenObtainPairView
)

router = routers.DefaultRouter()
router.register(r'donations', DonationViewSet, basename='donation')
router.register(r'food-donations', FoodDonationViewSet, basename='food-donation')
router.register(r'waste', FoodWasteViewSet, basename='waste')
router.register(r'centers', DonationCenterViewSet, basename='center')
router.register(r'requests', DonationRequestViewSet, basename='request')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'expiration', ExpirationViewSet, basename='expiration')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/profile/', UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', UserProfileUpdateView.as_view(), name='profile-update'),
    path('auth/password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('auth/password-reset/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('auth/verify-email/', EmailVerificationView.as_view(), name='verify-email'),
    path('auth/verify-email/<str:token>/', EmailVerificationView.as_view(), name='verify-email-confirm'),
    path('auth/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reports/', ReportsView.as_view(), name='reports'),
]
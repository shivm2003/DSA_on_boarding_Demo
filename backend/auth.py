import os
import jwt
import datetime
from functools import wraps
from flask import Blueprint, request, jsonify
from models import User
from db import db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

JWT_SECRET = os.getenv('JWT_SECRET', 'fallback_secret_key')
JWT_EXPIRY_HOURS = 24


def generate_token(user):
    """Generate a JWT token for the given user."""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'role': user.role,
        'display_name': user.display_name,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=JWT_EXPIRY_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def token_required(f):
    """Decorator to protect routes that require authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication token is missing.'}), 401

        try:
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'error': 'User not found.'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired. Please login again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return a JWT token."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required.'}), 400

    username = data.get('username', '').strip()
    password = data.get('password', '')

    if not username or not password:
        return jsonify({'error': 'Username and password are required.'}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid username or password.'}), 401

    token = generate_token(user)

    return jsonify({
        'success': True,
        'token': token,
        'user': user.to_dict()
    })


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    """Return the currently authenticated user's profile."""
    return jsonify({
        'success': True,
        'user': current_user.to_dict()
    })

import random

@auth_bp.route('/forgot-password/generate-otp', methods=['POST'])
def generate_otp():
    """Generate an OTP for password reset and return it for demo purposes."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required.'}), 400

    username = data.get('username', '').strip()
    dob = data.get('dob', '').strip()
    mobile = data.get('mobile', '').strip()

    if not username or not dob or not mobile:
        return jsonify({'error': 'Employee Code, DOB, and Mobile are required.'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'No user found with that Employee Code.'}), 404

    # Verify DOB and Mobile match the database
    if user.dob != dob or user.mobile != mobile:
        return jsonify({'error': 'DOB or Mobile number does not match our records.'}), 400

    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    user.reset_otp = otp
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'OTP generated successfully.',
        'otp': otp  # Sent back for demo purposes
    })


@auth_bp.route('/forgot-password/verify-otp', methods=['POST'])
def verify_otp():
    """Verify if the OTP is correct."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required.'}), 400

    username = data.get('username', '').strip()
    otp_submitted = data.get('otp', '').strip()

    if not username or not otp_submitted:
        return jsonify({'error': 'Username and OTP are required.'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    if not user.reset_otp or user.reset_otp != otp_submitted:
        return jsonify({'error': 'Invalid or expired OTP.'}), 400

    return jsonify({
        'success': True,
        'message': 'OTP verified successfully.'
    })


@auth_bp.route('/forgot-password/reset', methods=['POST'])
def reset_password():
    """Set the new password."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Request body is required.'}), 400

    username = data.get('username', '').strip()
    otp_submitted = data.get('otp', '').strip()
    new_password = data.get('new_password', '')

    if not username or not otp_submitted or not new_password:
        return jsonify({'error': 'Username, OTP, and new password are required.'}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({'error': 'User not found.'}), 404

    # Double-check the OTP before resetting
    if not user.reset_otp or user.reset_otp != otp_submitted:
        return jsonify({'error': 'Invalid or expired OTP.'}), 400

    user.set_password(new_password)
    user.reset_otp = None  # Clear the OTP
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Password successfully reset! You can now log in.'
    })







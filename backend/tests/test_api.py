from datetime import date, timedelta

def test_signup_and_login(client):
    # 1. Sign up user
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "tester@example.com",
            "password": "testpassword",
            "first_name": "Test",
            "last_name": "User",
            "bio": "Developer testing the API",
            "profile_image": "http://example.com/img.jpg"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "tester@example.com"
    token = data["access_token"]
    
    # 2. Login user
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "tester@example.com",
            "password": "testpassword"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert isinstance(data["access_token"], str)

def test_listing_creation_and_booking_collision(client):
    # 1. Sign up user
    signup_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "host@test.com",
            "password": "password",
            "first_name": "Host",
            "last_name": "Test"
        }
    )
    token = signup_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create listing
    listing_resp = client.post(
        "/api/v1/listings",
        headers=headers,
        json={
            "title": "Malibu Ocean Villa",
            "description": "Lovely beach side stay",
            "category": "Beachfront",
            "price_per_night": 500.0,
            "cleaning_fee": 100.0,
            "service_fee": 50.0,
            "address": "123 Ocean Drive",
            "city": "Malibu",
            "country": "USA",
            "latitude": 34.0,
            "longitude": -118.0,
            "max_guests": 4,
            "bedrooms": 2,
            "beds": 2,
            "bathrooms": 2.0,
            "amenities": ["WiFi", "Kitchen"]
        }
    )
    assert listing_resp.status_code == 201
    listing_id = listing_resp.json()["id"]
    
    # 3. Create a Guest user to make bookings
    guest_resp = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "guest@test.com",
            "password": "password",
            "first_name": "Guest",
            "last_name": "Test"
        }
    )
    guest_token = guest_resp.json()["access_token"]
    guest_headers = {"Authorization": f"Bearer {guest_token}"}
    
    # 4. Make successful booking (Dates: today+1 to today+3)
    today = date.today()
    check_in_1 = (today + timedelta(days=1)).isoformat()
    check_out_1 = (today + timedelta(days=3)).isoformat()
    
    booking_resp = client.post(
        "/api/v1/bookings",
        headers=guest_headers,
        json={
            "listing_id": listing_id,
            "check_in": check_in_1,
            "check_out": check_out_1,
            "guest_count": 2
        }
    )
    assert booking_resp.status_code == 201
    assert booking_resp.json()["status"] == "confirmed"
    
    # 5. Attempt overlapping booking (Dates: today+2 to today+4) - Should fail with 400 Bad Request
    check_in_2 = (today + timedelta(days=2)).isoformat()
    check_out_2 = (today + timedelta(days=4)).isoformat()
    
    conflict_resp = client.post(
        "/api/v1/bookings",
        headers=guest_headers,
        json={
            "listing_id": listing_id,
            "check_in": check_in_2,
            "check_out": check_out_2,
            "guest_count": 2
        }
    )
    assert conflict_resp.status_code == 400
    assert "no longer available" in conflict_resp.json()["detail"]

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, Base, engine
from app.domains.user.models import User, HostProfile
from app.domains.listing.models import Listing, ListingImage, Amenity, ListingAvailability
from app.domains.booking.models import Booking
from app.domains.favorite.models import Favorite
from app.domains.review.models import Review
from app.core.security import get_password_hash
from app.extra_seed_data import EXTRA_LISTINGS

def seed_db():
    print("Clearing database...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        print("Creating users...")
        # 1. Host 1: Jane
        host1 = User(
            email="host@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="Jane",
            last_name="Host",
            bio="Passionate explorer and architectural designer. I love hosting travelers in spaces that merge nature with modern style.",
            profile_image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
        )
        db.add(host1)
        
        # 2. Host 2: Carlos
        host2 = User(
            email="carlos@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="Carlos",
            last_name="Mendoza",
            bio="Boutique hotelier based in Greece. Dedicated to creating high-end stays and providing insider travel tips.",
            profile_image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
        )
        db.add(host2)
        
        # 3. Guest 1: John (Default logged-in guest)
        guest1 = User(
            email="guest@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="John",
            last_name="Guest",
            bio="Digital nomad and adventure writer. Always looking for cozy cabins, workspaces with high-speed internet, and quiet retreats.",
            profile_image="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        )
        db.add(guest1)
        
        # 4. Guest 2: Sarah
        guest2 = User(
            email="sarah@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="Sarah",
            last_name="Conner",
            bio="Landscape photographer exploring remote corners of the world. Lover of clean design, skylights, and hot tubs.",
            profile_image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
        )
        db.add(guest2)
        db.flush()  # Get IDs

        # Create host profiles
        db.add(HostProfile(user_id=host1.id, is_superhost=True, response_rate=99.0, response_time="within an hour"))
        db.add(HostProfile(user_id=host2.id, is_superhost=True, response_rate=97.0, response_time="within an hour"))
        db.flush()
        
        print("Creating amenities...")
        amenity_data = [
            ("WiFi", "wifi"),
            ("Kitchen", "utensils"),
            ("Free parking", "car"),
            ("Pool", "droplet"),
            ("Hot tub", "thermometer"),
            ("Air conditioning", "wind"),
            ("Heating", "sun"),
            ("Washer", "archive"),
            ("Dryer", "activity"),
            ("TV", "tv"),
            ("Workspace", "briefcase"),
            ("Gym", "dumbbell")
        ]
        
        amenities = {}
        for name, icon in amenity_data:
            db_amenity = Amenity(name=name, icon=icon)
            db.add(db_amenity)
            amenities[name] = db_amenity
        db.flush()
        
        print("Creating listings...")
        listings_data = [
            {
                "host_id": host1.id,
                "title": "Ultra Luxury Malibu Beachfront Villa",
                "description": "Perched directly over the sand in Malibu, this smart villa offers slide-away glass walls, a private beach deck, and an outdoor hot tub with panoramic ocean views.",
                "category": "Beachfront",
                "price_per_night": 720.00,
                "cleaning_fee": 150.00,
                "service_fee": 85.00,
                "address": "24500 Pacific Coast Hwy",
                "city": "Malibu",
                "country": "United States",
                "latitude": 34.0259,
                "longitude": -118.7798,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 3.0,
                "images": [
                    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Hot tub", "Air conditioning", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Cozy Aspen A-Frame Log Cabin",
                "description": "Escape to this enchanting A-frame cabin surrounded by pines. Features a stone fireplace, wood-fired hot tub, and large windows with mountain views.",
                "category": "Cabins",
                "price_per_night": 280.00,
                "cleaning_fee": 80.00,
                "service_fee": 40.00,
                "address": "450 Ute Ave",
                "city": "Aspen",
                "country": "United States",
                "latitude": 39.1911,
                "longitude": -106.8175,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 1.5,
                "images": [
                    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Hot tub", "Heating", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Stunning French Riviera Estate",
                "description": "An architectural masterpiece in Saint-Tropez. This villa boasts an infinity pool, private vineyard, wine cellar, and panoramic sea views.",
                "category": "Mansions",
                "price_per_night": 1450.00,
                "cleaning_fee": 250.00,
                "service_fee": 180.00,
                "address": "Chemin de l'Oumede",
                "city": "Saint-Tropez",
                "country": "France",
                "latitude": 43.2678,
                "longitude": 6.6406,
                "max_guests": 10,
                "bedrooms": 5,
                "beds": 6,
                "bathrooms": 5.5,
                "images": [
                    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Hot tub", "Air conditioning", "Free parking", "Gym", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Modern Lakefront Container Eco-Home",
                "description": "Award-winning container retreat on the edge of Lake Wakatipu. Features an outdoor wood-fired hot tub, fire pit, kayaks, and alpine views.",
                "category": "Lakefront",
                "price_per_night": 340.00,
                "cleaning_fee": 90.00,
                "service_fee": 45.00,
                "address": "150 Glenorchy Road",
                "city": "Queenstown",
                "country": "New Zealand",
                "latitude": -45.0312,
                "longitude": 168.6626,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Hot tub", "Heating", "TV", "Workspace", "Washer", "Dryer"]
            },
            {
                "host_id": host2.id,
                "title": "Traditional Santorini Cave Dome",
                "description": "Whitewashed Cycladic cave home carved into Oia cliffs. Relax in your private infinity plunge pool while watching the Santorini sunset sweep the caldera.",
                "category": "Trending",
                "price_per_night": 510.00,
                "cleaning_fee": 120.00,
                "service_fee": 65.00,
                "address": "Oia Rim Path",
                "city": "Santorini",
                "country": "Greece",
                "latitude": 36.4618,
                "longitude": 25.3753,
                "max_guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1.0,
                "images": [
                    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Air conditioning", "TV", "Workspace"]
            },
            {
                "host_id": host2.id,
                "title": "Architectural Joshua Tree Desert Oasis",
                "description": "Minimalist concrete glass home set amidst giant boulders. Enjoy an outdoor pool, steel hot tub, stargazing deck, and complete privacy.",
                "category": "Desert",
                "price_per_night": 460.00,
                "cleaning_fee": 110.00,
                "service_fee": 55.00,
                "address": "8400 Bighorn Road",
                "city": "Joshua Tree",
                "country": "United States",
                "latitude": 34.1347,
                "longitude": -116.3131,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Hot tub", "Air conditioning", "Free parking"]
            },
            {
                "host_id": host2.id,
                "title": "Chic Minimalist Loft in Shibuya",
                "description": "Sleek loft in Shibuya with concrete accents, Japanese styling, high-end appliances, and a private terrace offering views of the Tokyo skyline.",
                "category": "Trending",
                "price_per_night": 210.00,
                "cleaning_fee": 60.00,
                "service_fee": 30.00,
                "address": "1-5 Udagawacho",
                "city": "Tokyo",
                "country": "Japan",
                "latitude": 35.6618,
                "longitude": 139.7016,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV", "Workspace", "Washer"]
            },
            {
                "host_id": host1.id,
                "title": "Secluded Bali Bamboo Eco-Villa",
                "description": "An incredible split-level bamboo villa nestled in the lush jungle of Bali. Features open-air layouts, a private pool, and stunning river views.",
                "category": "Islands",
                "price_per_night": 320.00,
                "cleaning_fee": 60.00,
                "service_fee": 30.00,
                "address": "Jalan Raya Ayung",
                "city": "Bali",
                "country": "Indonesia",
                "latitude": -8.4095,
                "longitude": 115.1889,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Air conditioning", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Renovated Florentine Renaissance Tower",
                "description": "Stay inside a historic 14th-century tower overlooking Florence. Features vintage fresco details, exposed brickwork, and a view of the Duomo.",
                "category": "Countryside",
                "price_per_night": 320.00,
                "cleaning_fee": 80.00,
                "service_fee": 45.00,
                "address": "Via dei Bardi",
                "city": "Florence",
                "country": "Italy",
                "latitude": 43.7687,
                "longitude": 11.2569,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "images": [
                    "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV", "Workspace"]
            },
            {
                "host_id": host2.id,
                "title": "Northern Lights Glass Cabin",
                "description": "Watch the Aurora Borealis dance from your bed. This glass-walled cabin offers heated concrete floors, a private sauna, and geothermal hot tub.",
                "category": "Cabins",
                "price_per_night": 480.00,
                "cleaning_fee": 100.00,
                "service_fee": 60.00,
                "address": "Golden Circle Route",
                "city": "Reykjavik",
                "country": "Iceland",
                "latitude": 64.1466,
                "longitude": -21.9426,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "images": [
                    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Hot tub", "Heating", "Workspace"]
            },
            {
                "host_id": host2.id,
                "title": "Dramatic Cliffside Villa in Cape Town",
                "description": "Perched on the side of Table Mountain, this luxury house features an infinity pool overlooking the Atlantic, glass elevators, and fire pits.",
                "category": "Mansions",
                "price_per_night": 880.00,
                "cleaning_fee": 180.00,
                "service_fee": 100.00,
                "address": "Victoria Road, Clifton",
                "city": "Cape Town",
                "country": "South Africa",
                "latitude": -33.9375,
                "longitude": 18.3784,
                "max_guests": 8,
                "bedrooms": 4,
                "beds": 5,
                "bathrooms": 4.5,
                "images": [
                    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Hot tub", "Air conditioning", "Free parking", "Gym"]
            },
            {
                "host_id": host1.id,
                "title": "Maui Oceanfront Surf Penthouse",
                "description": "Perched directly over the surf in Lahaina. Features a large wraparound balcony, premium binoculars for whale watching, and beach gear.",
                "category": "Beachfront",
                "price_per_night": 550.00,
                "cleaning_fee": 130.00,
                "service_fee": 70.00,
                "address": "505 Front Street",
                "city": "Maui",
                "country": "United States",
                "latitude": 20.8783,
                "longitude": -156.6825,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Air conditioning", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Charming Lakefront Cottage",
                "description": "Restored cottage directly on Lake Geneva. Features a private wooden boat dock, kayaks, stone fireplace, and views of the Swiss Alps.",
                "category": "Lakefront",
                "price_per_night": 420.00,
                "cleaning_fee": 100.00,
                "service_fee": 50.00,
                "address": "Quai de Cologny",
                "city": "Geneva",
                "country": "Switzerland",
                "latitude": 46.2231,
                "longitude": 6.1837,
                "max_guests": 5,
                "bedrooms": 3,
                "beds": 3,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Heating", "TV", "Workspace", "Washer", "Dryer"]
            },
            {
                "host_id": host2.id,
                "title": "High-End Roman Penthouse near Colosseum",
                "description": "Luxury apartment located in the heart of Rome. High arched ceilings, modern Italian furniture, and a private terrace overlooking the ancient ruins.",
                "category": "Mansions",
                "price_per_night": 390.00,
                "cleaning_fee": 100.00,
                "service_fee": 50.00,
                "address": "Via Labicana 12",
                "city": "Rome",
                "country": "Italy",
                "latitude": 41.8902,
                "longitude": 12.4922,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV", "Workspace"]
            },
            {
                "host_id": host2.id,
                "title": "Rustic Tuscan Vineyard Farmhouse",
                "description": "Charming stone farmhouse in the heart of Chianti. Features an olive grove patio, wood fire oven, shared pool, and cooking classes.",
                "category": "Countryside",
                "price_per_night": 240.00,
                "cleaning_fee": 70.00,
                "service_fee": 35.00,
                "address": "Strada Provinciale 22",
                "city": "Siena",
                "country": "Italy",
                "latitude": 43.3188,
                "longitude": 11.3308,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 3,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Heating", "TV", "Workspace", "Free parking"]
            },
            {
                "host_id": host1.id,
                "title": "Artist Loft in SoHo with Skyline Views",
                "description": "Stunning historical loft in SoHo, New York. Incredible high ceilings, brick walls, curated contemporary art pieces, and large skylight windows.",
                "category": "Trending",
                "price_per_night": 450.00,
                "cleaning_fee": 120.00,
                "service_fee": 60.00,
                "address": "120 Prince St",
                "city": "New York City",
                "country": "United States",
                "latitude": 40.7246,
                "longitude": -73.9998,
                "max_guests": 3,
                "bedrooms": 1,
                "beds": 2,
                "bathrooms": 1.5,
                "images": [
                    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "Heating", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Chic Parisian Apartment overlooking the Seine",
                "description": "Classic Haussmann-style flat in Paris. Beautiful crown moldings, vintage chandeliers, marble fireplaces, and a balcony viewing the river Seine.",
                "category": "Trending",
                "price_per_night": 350.00,
                "cleaning_fee": 90.00,
                "service_fee": 45.00,
                "address": "15 Quai de la Mégisserie",
                "city": "Paris",
                "country": "France",
                "latitude": 48.8575,
                "longitude": 2.3444,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.0,
                "images": [
                    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Heating", "TV", "Workspace"]
            },
            {
                "host_id": host1.id,
                "title": "Elegant Kensington Townhouse with Garden Patio",
                "description": "Sophisticated multi-level townhouse in historic Kensington, London. Features modern interiors, a fully stocked chef kitchen, and private walled garden.",
                "category": "Countryside",
                "price_per_night": 410.00,
                "cleaning_fee": 110.00,
                "service_fee": 55.00,
                "address": "40 Earls Court Rd",
                "city": "London",
                "country": "United Kingdom",
                "latitude": 51.4988,
                "longitude": -0.1983,
                "max_guests": 6,
                "bedrooms": 3,
                "beds": 4,
                "bathrooms": 2.5,
                "images": [
                    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Heating", "TV", "Workspace", "Washer", "Dryer"]
            },
            {
                "host_id": host1.id,
                "title": "Modern Harbour View Loft near Opera House",
                "description": "Contemporary industrial-style loft in Sydney. Massive double-height windows provide direct views of Sydney Harbour, the bridge, and the Opera House.",
                "category": "Beachfront",
                "price_per_night": 380.00,
                "cleaning_fee": 100.00,
                "service_fee": 50.00,
                "address": "1 Hickson Rd",
                "city": "Sydney",
                "country": "Australia",
                "latitude": -33.8568,
                "longitude": 151.2093,
                "max_guests": 2,
                "bedrooms": 1,
                "beds": 1,
                "bathrooms": 1.5,
                "images": [
                    "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "TV", "Workspace"]
            },
            {
                "host_id": host2.id,
                "title": "Stunning Rooftop Oasis with Great Pyramids View",
                "description": "Incredible penthouse in Giza. Sit on your private terrace garden and watch the sunset directly over the ancient Great Pyramids of Egypt.",
                "category": "Countryside",
                "price_per_night": 190.00,
                "cleaning_fee": 50.00,
                "service_fee": 25.00,
                "address": "Pyramids Road 120",
                "city": "Cairo",
                "country": "Egypt",
                "latitude": 29.9853,
                "longitude": 31.1342,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Air conditioning", "TV", "Workspace", "Free parking"]
            },
            {
                "host_id": host2.id,
                "title": "Panoramic Penthouse Overlooking Copacabana Beach",
                "description": "Watch Rio's skyline from your private terrace jacuzzi. High-end modern design, open layout, and seconds away from the sand.",
                "category": "Beachfront",
                "price_per_night": 320.00,
                "cleaning_fee": 80.00,
                "service_fee": 40.00,
                "address": "Avenida Atlântica 1420",
                "city": "Rio de Janeiro",
                "country": "Brazil",
                "latitude": -22.9698,
                "longitude": -43.1795,
                "max_guests": 4,
                "bedrooms": 2,
                "beds": 2,
                "bathrooms": 2.0,
                "images": [
                    "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&q=80&w=800"
                ],
                "amenities": ["WiFi", "Kitchen", "Pool", "Hot tub", "Air conditioning", "TV"]
            }
        ]
        
        # Transform and append extra global seed listings dataset
        for item in EXTRA_LISTINGS:
            host_id = host1.id if item["host_type"] == 1 else host2.id
            listing_item = {
                "host_id": host_id,
                "title": item["title"],
                "description": item["description"],
                "category": item["category"],
                "price_per_night": item["price_per_night"],
                "cleaning_fee": item["cleaning_fee"],
                "service_fee": item["service_fee"],
                "address": item["address"],
                "city": item["city"],
                "country": item["country"],
                "latitude": item["latitude"],
                "longitude": item["longitude"],
                "max_guests": item["max_guests"],
                "bedrooms": item["bedrooms"],
                "beds": item["beds"],
                "bathrooms": item["bathrooms"],
                "images": item["images"],
                "amenities": item["amenities"]
            }
            listings_data.append(listing_item)
        
        db_listings = []
        for l in listings_data:
            db_listing = Listing(
                host_id=l["host_id"],
                title=l["title"],
                description=l["description"],
                category=l["category"],
                price_per_night=l["price_per_night"],
                cleaning_fee=l["cleaning_fee"],
                service_fee=l["service_fee"],
                address=l["address"],
                city=l["city"],
                country=l["country"],
                latitude=l["latitude"],
                longitude=l["longitude"],
                max_guests=l["max_guests"],
                bedrooms=l["bedrooms"],
                beds=l["beds"],
                bathrooms=l["bathrooms"],
                amenities=[amenities[name] for name in l["amenities"]]
            )
            db.add(db_listing)
            db.flush()
            db_listings.append(db_listing)
            
            # Add images
            for idx, img_url in enumerate(l["images"]):
                db_image = ListingImage(
                    listing_id=db_listing.id,
                    url=img_url,
                    is_primary=(idx == 0),
                    display_order=idx
                )
                db.add(db_image)
        db.flush()
        
        print("Creating reviews...")
        reviews_data = [
            # Villa Malibu reviews
            (db_listings[0].id, guest1.id, 5, "Unbelievable beachfront view! Sliding open the glass walls to let the sea breeze in was pure heaven. Jane was an exceptionally helpful host. Clean, stylish, and perfect."),
            (db_listings[0].id, guest2.id, 5, "Exceeded all expectations. The private deck and hot tub made it the perfect getaway. We could see dolphins swimming in the morning. Fully stocked smart kitchen!"),
            # Aspen cabin reviews
            (db_listings[1].id, guest1.id, 5, "Cozy, snow-capped paradise. The wood stove fireplace heats the space beautifully. The hot tub under the stars was our favorite highlight. Highly recommend!"),
            (db_listings[1].id, guest2.id, 4, "A gorgeous cabin. The loft is magical. The driveway is slightly steep in the snow, but standard winter tires make it no issue."),
            # Riviera estate reviews
            (db_listings[2].id, guest1.id, 5, "Stunning mansion. Felt like a celebrity. The vineyards and pool layout are incredible. Truly top-tier luxury."),
            # Queenstown reviews
            (db_listings[3].id, guest2.id, 5, "Modern container design done beautifully. Breathtaking lake and mountain views. The fireplace and outdoor tub were amazing. Sarah was super nice!"),
            # Santorini reviews
            (db_listings[4].id, guest1.id, 5, "A fairytale stay. The pool overlooks the caldera and Oia cliffs. Standard cave styling but premium finish. Worth every single cent!"),
            # Joshua Tree reviews
            (db_listings[5].id, guest2.id, 5, "Absolute isolation. Minimalist concrete glass home that looks like a museum. Joshua Tree boulders surrounding the pool is a dream. Stargazing was outstanding."),
            # Shibuya reviews
            (db_listings[6].id, guest1.id, 4, "Sleek and clean. Located right in Shibuya but very quiet. The private balcony offers cool views of the city at night. Carlos was super prompt.")
        ]
        
        for listing_id, author_id, rating, comment in reviews_data:
            db_review = Review(
                listing_id=listing_id,
                author_id=author_id,
                rating=rating,
                comment=comment
            )
            db.add(db_review)
            
        print("Creating calendar availability blocks...")
        # Block dates for the Malibu beachfront listing (e.g. tomorrow + 2 days)
        tomorrow = date.today() + timedelta(days=1)
        for i in range(3):
            blocked_date = tomorrow + timedelta(days=i)
            availability = ListingAvailability(
                listing_id=db_listings[0].id,
                date=blocked_date,
                is_available=False
            )
            db.add(availability)
            
        db.commit()
        print(f"Database successfully seeded with {len(db_listings)} rich listings!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()

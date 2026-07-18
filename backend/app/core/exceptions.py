from fastapi import HTTPException, status

class AirbnbException(HTTPException):
    def __init__(self, status_code: int, detail: str):
        super().__init__(status_code=status_code, detail=detail)

class UserAlreadyExistsException(AirbnbException):
    def __init__(self, email: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{email}' already exists."
        )

class InvalidCredentialsException(AirbnbException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

class NotAuthenticatedException(AirbnbException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )

class ForbiddenException(AirbnbException):
    def __init__(self, detail: str = "Operation not permitted."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )

class ListingNotFoundException(AirbnbException):
    def __init__(self, listing_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found."
        )

class BookingConflictException(AirbnbException):
    def __init__(self, detail: str = "The selected dates overlap with an existing booking."):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )

class BookingNotFoundException(AirbnbException):
    def __init__(self, booking_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id {booking_id} not found."
        )

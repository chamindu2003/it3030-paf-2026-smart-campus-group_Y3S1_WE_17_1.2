package com.SmartCampus.OperationHub.Controller;

import com.SmartCampus.OperationHub.DTO.CancelBookingRequest;
import com.SmartCampus.OperationHub.DTO.UpdateBookingStatusRequest;
import com.SmartCampus.OperationHub.Model.Booking;
import com.SmartCampus.OperationHub.Model.UserModel;
import com.SmartCampus.OperationHub.Repository.UserRepo;
import com.SmartCampus.OperationHub.Service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepo userRepo;

    public BookingController(BookingService bookingService, UserRepo userRepo) {
        this.bookingService = bookingService;
        this.userRepo = userRepo;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }
    //trigger the booking creation process, which includes validation and overlap checks
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        try {
            Long authenticatedUserId = resolveAuthenticatedUserId(authentication);
            //call the service method to create the booking, which will perform all necessary checks and persist the booking if valid
            Booking created = bookingService.createBooking(booking, authenticatedUserId);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getBookings(Authentication authentication) {
        try {
            Long authenticatedUserId = resolveAuthenticatedUserId(authentication);
            List<Booking> bookings = bookingService.getBookingsForUser(authenticatedUserId);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> adminSearchBookings(
            @RequestParam(value = "userId", required = false) Long userId,
            @RequestParam(value = "resourceId", required = false) Long resourceId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "actingRole") String actingRole
    ) {
        try {
            List<Booking> bookings = bookingService.searchBookingsForAdmin(userId, resourceId, status, actingRole);
            return ResponseEntity.ok(bookings);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(
            @PathVariable("id") Long bookingId,
            @RequestBody(required = false) CancelBookingRequest request,
            Authentication authentication
    ) {
        try {
            Long authenticatedUserId = resolveAuthenticatedUserId(authentication);
            Booking cancelled = bookingService.cancelBooking(bookingId, authenticatedUserId);
            return ResponseEntity.ok(cancelled);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable("id") Long bookingId,
            @RequestBody UpdateBookingStatusRequest request
    ) {
        try {
            Booking updated = bookingService.updateStatus(
                    bookingId,
                    request.getStatus(),
                    request.getRejectionReason(),
                    request.getActingRole()
            );
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    private Long resolveAuthenticatedUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Authenticated user is required");
        }

        String email = authentication.getName();
        UserModel user = userRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Authenticated user not found"));
        return user.getId();
    }
}


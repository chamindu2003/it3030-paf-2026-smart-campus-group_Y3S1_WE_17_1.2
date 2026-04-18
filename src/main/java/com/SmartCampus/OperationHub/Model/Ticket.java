package com.SmartCampus.OperationHub.Model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId; // The person who reported it

    @Column(nullable = false)
    private Long resourceId; // The room or equipment that is broken

    @Column(nullable = false)
    private String category;

    @Column(nullable = false, length = 1000)
    private String description;

    private String contactDetails;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN; // Defaults to OPEN when created

    // Stores up to 3 image file paths/URLs
    @ElementCollection
    @CollectionTable(name = "ticket_images", joinColumns = @JoinColumn(name = "ticket_id"))
    @Column(name = "image_url")
    private List<String> imageUrls;

    private String rejectionReason; // Admin can add this if rejected

    // --- GETTERS AND SETTERS ---
    // (You can use Lombok's @Data annotation if your team uses it,
    // otherwise we generate them manually like this)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getContactDetails() { return contactDetails; }
    public void setContactDetails(String contactDetails) { this.contactDetails = contactDetails; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
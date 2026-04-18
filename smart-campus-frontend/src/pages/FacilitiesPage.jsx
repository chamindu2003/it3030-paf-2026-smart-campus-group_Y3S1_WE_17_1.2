import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../styles/FacilitiesPage.css";

const FILTER_TYPES = ["All", "LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];

const FacilitiesPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await axios.get("http://localhost:8081/api/facilities");
        setFacilities(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to load facilities. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const filteredFacilities = useMemo(() => {
    return facilities.filter((facility) => {
      const matchesType = selectedType === "All" || facility?.type === selectedType;

      const name = (facility?.name || "").toLowerCase();
      const location = (facility?.location || "").toLowerCase();
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || name.includes(search) || location.includes(search);

      const isAvailable = facility?.status === "ACTIVE";
      const matchesAvailability = !availableOnly || isAvailable;

      return matchesType && matchesSearch && matchesAvailability;
    });
  }, [facilities, selectedType, searchTerm, availableOnly]);

  const handleBookNow = (facility) => {
    if (facility?.status === "ACTIVE") {
      alert("Booking feature coming soon!");
    }
  };

  return (
    <div className="facilities-page">
      <section className="facilities-header">
        <div>
          <h1>Facilities</h1>
          <p>Browse and book campus facilities</p>
        </div>

        <input
          type="text"
          className="facilities-search"
          placeholder="Search facilities..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </section>

      <section className="facilities-filter-row">
        <div className="filter-buttons">
          {FILTER_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-btn ${selectedType === type ? "active" : ""}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <label className="available-toggle" htmlFor="availableOnly">
          <span>Available Only</span>
          <span className="toggle-switch">
            <input
              id="availableOnly"
              type="checkbox"
              checked={availableOnly}
              onChange={(event) => setAvailableOnly(event.target.checked)}
            />
            <span className="toggle-slider" />
          </span>
        </label>
      </section>

      {loading ? (
        <p className="facilities-state-message">Loading facilities...</p>
      ) : error ? (
        <p className="facilities-state-message error">{error}</p>
      ) : filteredFacilities.length === 0 ? (
        <p className="facilities-state-message">No facilities found.</p>
      ) : (
        <section className="facilities-grid">
          {filteredFacilities.map((facility) => {
            const isActive = facility?.status === "ACTIVE";

            return (
              <article key={facility?.id || `${facility?.name}-${facility?.location}`} className="facility-card">
                <div className="facility-image-placeholder">
                  <span className={`status-badge ${isActive ? "available" : "unavailable"}`}>
                    {isActive ? "Available" : "Unavailable"}
                  </span>
                  <span className="type-badge">{facility?.type || "UNKNOWN"}</span>
                  <span className="placeholder-type-text">{facility?.type || "FACILITY"}</span>
                </div>

                <div className="facility-card-content">
                  <h3>{facility?.name || "Unnamed Facility"}</h3>

                  <p className="meta-row">
                    <span className="meta-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 22C12 22 19 16 19 10A7 7 0 1 0 5 10C5 16 12 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                    <span>{facility?.location || "Location not specified"}</span>
                  </p>

                  <p className="meta-row">
                    <span className="meta-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
                        <circle cx="17" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
                        <path
                          d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M14 20C14.2 17.8 16 16 18.2 16C20.4 16 22.2 17.8 22.4 20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>Capacity: {facility?.capacity ?? "N/A"}</span>
                  </p>

                  <button
                    type="button"
                    className={`book-btn ${!isActive ? "disabled" : ""}`}
                    disabled={!isActive}
                    onClick={() => handleBookNow(facility)}
                  >
                    {isActive ? "Book Now" : "Unavailable"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default FacilitiesPage;

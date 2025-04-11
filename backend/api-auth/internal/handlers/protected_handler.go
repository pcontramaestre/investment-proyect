package handlers

import (
	"context"
	"log"
	"net/http"

	"api-auth/internal/middleware"
	"api-auth/internal/models"
	"api-auth/internal/services"

	"github.com/gin-gonic/gin"
)

type ProtectedHandler struct {
	firebaseService *services.FirebaseService
}

func NewProtectedHandler(fs *services.FirebaseService) *ProtectedHandler {
	return &ProtectedHandler{
		firebaseService: fs,
	}
}

// GetProfile godoc
// @Summary Get user profile
// @Description Retrieves profile information for the authenticated user. Requires Bearer token.
// @Tags protected
// @Security BearerAuth
// @Produce  json
// @Success 200 {object} models.ProfileResponse "User profile data"
// @Failure 401 {object} models.ErrorResponse "Unauthorized (token missing, invalid, or expired)"
// @Failure 500 {object} models.ErrorResponse "Internal server error (failed to retrieve user data)"
// @Router /profile [get]
func (h *ProtectedHandler) GetProfile(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		// This should ideally not happen if middleware is correctly applied
		log.Println("Error: UserID not found in context after AuthMiddleware")
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Could not identify user"})
		return
	}

	ctx := context.Background() // or c.Request.Context()
	userRecord, err := h.firebaseService.GetUser(ctx, userID)
	if err != nil {
		log.Printf("Error fetching user data for UID %s: %v", userID, err)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to retrieve user profile"})
		return
	}

	profile := models.ProfileResponse{
		UserID: userRecord.UID,
		Email:  userRecord.Email,
		// Populate other fields from userRecord if needed
		// e.g., DisplayName: userRecord.DisplayName, PhotoURL: userRecord.PhotoURL,
	}

	c.JSON(http.StatusOK, profile)
}

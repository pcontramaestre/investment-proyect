package middleware

import (
	"context"
	"net/http"
	"strings"

	"api-auth/internal/models"
	"api-auth/internal/services"

	"github.com/gin-gonic/gin"
)

const (
	authorizationHeaderKey  = "Authorization"
	authorizationTypeBearer = "Bearer"
	authorizationPayloadKey = "authorization_payload_userid" // Key to store userID in Gin context
)

// AuthMiddleware creates a Gin middleware for Firebase token verification.
func AuthMiddleware(firebaseService *services.FirebaseService) gin.HandlerFunc {
	return func(c *gin.Context) {
		authorizationHeader := c.GetHeader(authorizationHeaderKey)

		if len(authorizationHeader) == 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Authorization header is missing"})
			return
		}

		fields := strings.Fields(authorizationHeader)
		if len(fields) < 2 || !strings.EqualFold(fields[0], authorizationTypeBearer) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid authorization header format"})
			return
		}

		accessToken := fields[1]
		ctx := context.Background() // Or c.Request.Context()

		token, err := firebaseService.VerifyFirebaseIDToken(ctx, accessToken)
		if err != nil {
			// Log the verification failure attempt
			logData := models.AccessLog{
				IPAddress:    c.ClientIP(),
				Action:       models.ActionTokenVerifyFail,
				ErrorDetails: err.Error(),
			}
			// We don't have user ID or email here reliably
			go firebaseService.LogAccess(context.Background(), logData) // Log in background

			c.AbortWithStatusJSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid or expired token: " + err.Error()})
			return
		}

		// Store user ID in context for downstream handlers
		c.Set(authorizationPayloadKey, token.UID)
		c.Next() // Proceed to the next handler
	}
}

// GetUserIDFromContext retrieves the user ID stored in the Gin context by the AuthMiddleware.
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	val, exists := c.Get(authorizationPayloadKey)
	if !exists {
		return "", false
	}
	userID, ok := val.(string)
	return userID, ok
}

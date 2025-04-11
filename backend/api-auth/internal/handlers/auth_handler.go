package handlers

import (
	"context"
	"log"
	"net/http"

	"api-auth/internal/models"
	"api-auth/internal/services"

	"firebase.google.com/go/v4/auth"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	firebaseService *services.FirebaseService
}

func NewAuthHandler(fs *services.FirebaseService) *AuthHandler {
	return &AuthHandler{
		firebaseService: fs,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Creates a new user account using email and password.
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   user body models.RegisterRequest true "Registration Info"
// @Success 201 {object} models.SuccessResponse "User created successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid input"
// @Failure 409 {object} models.ErrorResponse "User already exists"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	ctx := context.Background() // Use request context if preferred: c.Request.Context()

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Register bind error: %v", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	logData := models.AccessLog{
		Email:     req.Email,
		IPAddress: c.ClientIP(),
	}

	userRecord, err := h.firebaseService.RegisterUser(ctx, req.Email, req.Password)
	if err != nil {
		logData.Action = models.ActionRegisterFail
		logData.ErrorDetails = err.Error()
		h.firebaseService.LogAccess(ctx, logData)

		// Check if the error is because the user already exists
		if auth.IsEmailAlreadyExists(err) {
			c.JSON(http.StatusConflict, models.ErrorResponse{Error: "Email already registered"})
		} else {
			c.JSON(http.StatusInternalServerError, models.ErrorResponse{Error: "Failed to create user"})
		}
		return
	}

	logData.Action = models.ActionRegisterSuccess
	logData.UserID = userRecord.UID
	h.firebaseService.LogAccess(ctx, logData)

	c.JSON(http.StatusCreated, models.SuccessResponse{
		Message: "User registered successfully",
		UserID:  userRecord.UID,
	})
}

// Login godoc
// @Summary Login a user with Firebase ID Token
// @Description Verifies a Firebase ID token obtained via client-side SDK login (email/password or other methods).
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   token body models.LoginRequest true "Firebase ID Token"
// @Success 200 {object} models.SuccessResponse "Login successful"
// @Failure 400 {object} models.ErrorResponse "Invalid input"
// @Failure 401 {object} models.ErrorResponse "Invalid or expired token"
// @Failure 500 {object} models.ErrorResponse "Internal server error"
// @Router /login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	ctx := context.Background()

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	logData := models.AccessLog{
		IPAddress: c.ClientIP(),
	}

	token, err := h.firebaseService.VerifyFirebaseIDToken(ctx, req.IDToken)
	if err != nil {
		logData.Action = models.ActionLoginFail
		logData.ErrorDetails = err.Error()
		// Try to get email if possible, even from invalid token claims (use cautiously)
		// claims, _ := h.firebaseService.authClient.GetClaims(ctx, req.IDToken) // This is not a public method
		// if claims != nil && claims["email"] != nil { logData.Email = claims["email"].(string) }
		h.firebaseService.LogAccess(ctx, logData)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid or expired token"})
		return
	}

	// Successfully verified token
	logData.Action = models.ActionLoginSuccess
	logData.UserID = token.UID
	// Extract email from token claims
	if email, ok := token.Claims["email"].(string); ok {
		logData.Email = email
	}
	h.firebaseService.LogAccess(ctx, logData)

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Login successful",
		UserID:  token.UID,
	})
}

// SignInGoogle godoc
// @Summary Sign in a user with Google ID Token via Firebase
// @Description Verifies a Google ID token (obtained via client-side Firebase SDK Google Sign-In) and authenticates the user in Firebase.
// @Tags auth
// @Accept  json
// @Produce  json
// @Param   token body models.GoogleSignInRequest true "Google ID Token obtained via Firebase SDK"
// @Success 200 {object} models.SuccessResponse "Google sign-in successful"
// @Failure 400 {object} models.ErrorResponse "Invalid input"
// @Failure 401 {object} models.ErrorResponse "Invalid or expired Google token"
// @Failure 500 {object} models.ErrorResponse "Internal server error during Firebase authentication"
// @Router /auth/google/signin [post]
func (h *AuthHandler) SignInGoogle(c *gin.Context) {
	var req models.GoogleSignInRequest
	ctx := context.Background()

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{Error: "Invalid request body: " + err.Error()})
		return
	}

	logData := models.AccessLog{
		IPAddress: c.ClientIP(),
		// We don't have email/uid until token is verified
	}

	// Verifying the ID token from Google Sign-In (obtained via Firebase client SDK)
	// also authenticates the user with Firebase Auth.
	token, err := h.firebaseService.VerifyFirebaseIDToken(ctx, req.IDToken)
	if err != nil {
		logData.Action = models.ActionGoogleLoginFail
		logData.ErrorDetails = err.Error()
		h.firebaseService.LogAccess(ctx, logData)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{Error: "Invalid or expired Google token: " + err.Error()})
		return
	}

	// Successfully verified token & authenticated with Firebase
	logData.Action = models.ActionGoogleLoginSuccess
	logData.UserID = token.UID
	if email, ok := token.Claims["email"].(string); ok {
		logData.Email = email
	}
	h.firebaseService.LogAccess(ctx, logData)

	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Google sign-in successful",
		UserID:  token.UID,
	})
}

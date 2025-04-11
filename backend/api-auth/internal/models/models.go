package models

import "time"

// --- Request Structs ---

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	// Client should login using Firebase Client SDK and send the resulting ID Token
	IDToken string `json:"idToken" binding:"required"`
}

type GoogleSignInRequest struct {
	// Client should complete Google Sign-In using Firebase Client SDK
	// and send the resulting ID Token from Google
	IDToken string `json:"idToken" binding:"required"`
}

// --- Response Structs ---

type ErrorResponse struct {
	Error string `json:"error"`
}

type SuccessResponse struct {
	Message string `json:"message"`
	UserID  string `json:"userId,omitempty"` // Optionally return UserID
}

type ProfileResponse struct {
	UserID string `json:"userId"`
	Email  string `json:"email"`
	// Add other profile fields as needed
}

// --- Firestore Log Struct ---

type AccessLog struct {
	Timestamp    time.Time `firestore:"timestamp,serverTimestamp"` // Use ServerTimestamp
	UserID       string                     `firestore:"userId,omitempty"`
	Email        string                     `firestore:"email,omitempty"` // Email attempted
	Action       string                     `firestore:"action"`          // e.g., REGISTER_SUCCESS, LOGIN_FAIL
	IPAddress    string                     `firestore:"ipAddress"`
	ErrorDetails string                     `firestore:"errorDetails,omitempty"`
}

// --- Log Action Constants ---

const (
	ActionRegisterSuccess    = "REGISTER_SUCCESS"
	ActionRegisterFail       = "REGISTER_FAIL"
	ActionLoginSuccess       = "LOGIN_SUCCESS" // Based on ID Token verification
	ActionLoginFail          = "LOGIN_FAIL"    // Based on ID Token verification failure
	ActionGoogleLoginSuccess = "LOGIN_GOOGLE_SUCCESS"
	ActionGoogleLoginFail    = "LOGIN_GOOGLE_FAIL"
	ActionTokenVerifyFail    = "TOKEN_VERIFY_FAIL" // General token verification failure
)

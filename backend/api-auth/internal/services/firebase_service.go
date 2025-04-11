package services

import (
	"context"
	"log"
	"time"

	// Rutas de importación actualizadas
	"api-auth/internal/config"
	"api-auth/internal/models"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/v4/auth"
)

type FirebaseService struct {
	authClient      *auth.Client
	firestoreClient *firestore.Client
	logCollection   string
}

// NewFirebaseService creates a new instance of FirebaseService.
func NewFirebaseService(authClient *auth.Client, firestoreClient *firestore.Client, cfg *config.Config) *FirebaseService {
	return &FirebaseService{
		authClient:      authClient,
		firestoreClient: firestoreClient,
		logCollection:   cfg.FirestoreLogCollection,
	}
}

// --- Authentication Methods ---

// RegisterUser creates a new user in Firebase Authentication.
func (s *FirebaseService) RegisterUser(ctx context.Context, email, password string) (*auth.UserRecord, error) {
	params := (&auth.UserToCreate{}).
		Email(email).
		Password(password).
		EmailVerified(false). // Optional: set based on your flow
		Disabled(false)

	userRecord, err := s.authClient.CreateUser(ctx, params)
	if err != nil {
		log.Printf("Error creating user %s: %v", email, err)
		return nil, err
	}
	log.Printf("Successfully created user: %s (%s)", userRecord.Email, userRecord.UID)
	return userRecord, nil
}

// VerifyFirebaseIDToken verifies a Firebase ID token (could be from email/pass or Google sign-in).
func (s *FirebaseService) VerifyFirebaseIDToken(ctx context.Context, idToken string) (*auth.Token, error) {
	token, err := s.authClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		log.Printf("Error verifying ID token: %v", err)
		return nil, err
	}
	return token, nil
}

// GetUser retrieves user data by UID.
func (s *FirebaseService) GetUser(ctx context.Context, uid string) (*auth.UserRecord, error) {
	user, err := s.authClient.GetUser(ctx, uid)
	if err != nil {
		log.Printf("Error getting user %s: %v\n", uid, err)
		return nil, err
	}
	return user, nil
}

// --- Logging Method ---

// LogAccess logs an access attempt to Firestore.
func (s *FirebaseService) LogAccess(ctx context.Context, logData models.AccessLog) {
	// Add a timeout to the context for the Firestore operation
	writeCtx, cancel := context.WithTimeout(ctx, 10*time.Second) // 10 second timeout
	defer cancel()

	// No need to set ServerTimestamp, it's handled by Firestore automatically

	_, _, err := s.firestoreClient.Collection(s.logCollection).Add(writeCtx, logData)
	if err != nil {
		// Log the error but don't fail the request because of logging failure
		log.Printf("WARNING: Failed to write access log to Firestore: %v. Log data: %+v", err, logData)
	} else {
		log.Printf("Access log written successfully for action: %s", logData.Action)
	}
}

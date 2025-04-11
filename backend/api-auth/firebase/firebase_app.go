package firebase

import (
	"context"
	"log"

	"api-auth/internal/config"

	"cloud.google.com/go/firestore"
	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	App             *firebase.App
	AuthClient      *auth.Client
	FirestoreClient *firestore.Client
)

// InitFirebase initializes the Firebase app and clients.
func InitFirebase(cfg *config.Config) error {
	ctx := context.Background()
	opt := option.WithCredentialsFile(cfg.FirebaseCredentialsPath)

	var err error
	App, err = firebase.NewApp(ctx, nil, opt)
	if err != nil {
		log.Fatalf("Error initializing Firebase app: %v\n", err)
		return err
	}

	AuthClient, err = App.Auth(ctx)
	if err != nil {
		log.Fatalf("Error getting Firebase Auth client: %v\n", err)
		return err
	}

	FirestoreClient, err = App.Firestore(ctx)
	if err != nil {
		log.Fatalf("Error getting Firestore client: %v\n", err)
		return err
	}

	log.Println("Firebase App, Auth, and Firestore clients initialized successfully.")
	return nil
}

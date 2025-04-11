package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                    string
	FirebaseCredentialsPath string
	FirestoreLogCollection  string
}

// LoadConfig loads configuration from .env file or environment variables.
func LoadConfig() (*Config, error) {
	// Load .env file if it exists
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables.")
	} else {
		log.Println("Loaded configuration from .env file.")
	}

	cfg := &Config{
		Port:                    getEnv("PORT", "8080"), // Default port 8080
		FirebaseCredentialsPath: getEnv("GOOGLE_APPLICATION_CREDENTIALS", ""),
		FirestoreLogCollection:  getEnv("FIRESTORE_LOG_COLLECTION", "access_logs"),
	}

	if cfg.FirebaseCredentialsPath == "" {
		log.Fatal("FATAL: GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
	}

	return cfg, nil
}

// Helper function to get env var or default
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

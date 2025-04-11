package main

import (
	"fmt"
	"log"
	"net/http"

	// Importaciones con alias explícito para firebase
	firebaseapp "api-auth/firebase"
	"api-auth/internal/config"
	"api-auth/internal/handlers"
	"api-auth/internal/middleware"
	"api-auth/internal/services"

	"github.com/gin-gonic/gin"
)

// @title Firebase Auth API with Go & Gin
// @version 1.0
// @description This is a sample API for Firebase authentication using Go and Gin.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and Firebase ID token. Example: "Bearer {token}"
func main() {
	// 1. Load Configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 2. Initialize Firebase
	if err := firebaseapp.InitFirebase(cfg); err != nil {
		// Error is logged within InitFirebase, just exit
		return
	}

	// 3. Initialize Services
	firebaseService := services.NewFirebaseService(firebaseapp.AuthClient, firebaseapp.FirestoreClient, cfg)

	// 4. Initialize Handlers
	authHandler := handlers.NewAuthHandler(firebaseService)
	protectedHandler := handlers.NewProtectedHandler(firebaseService)

	// 5. Setup Gin Router
	// gin.SetMode(gin.ReleaseMode) // Uncomment for production
	router := gin.Default() // Includes logger and recovery middleware

	// --- Public Routes ---
	router.POST("/register", authHandler.Register)
	router.POST("/login", authHandler.Login)                     // Expects Firebase ID Token from client SDK login
	router.POST("/auth/google/signin", authHandler.SignInGoogle) // Expects Google ID Token from client SDK signin

	// --- Protected Routes ---
	// Create a group for routes requiring authentication
	protected := router.Group("/")
	protected.Use(middleware.AuthMiddleware(firebaseService)) // Apply auth middleware
	{
		protected.GET("/profile", protectedHandler.GetProfile)
		// Add other protected routes here...
		// protected.GET("/some-data", someOtherProtectedHandler.GetData)
	}

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP"})
	})

	// 6. Start Server
	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("Starting server on %s\n", serverAddr)
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}

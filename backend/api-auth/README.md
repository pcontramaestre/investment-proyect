# Firebase Auth API with Go & Gin

This project provides a backend API written in Go using the Gin framework for user authentication leveraging Firebase Authentication and Firestore for logging.

## Features

*   User registration (Email/Password) via Firebase Auth.
*   User login via Firebase ID Token verification (obtained from client-side Firebase SDK login - Email/Password, Google, etc.).
*   Google Sign-In integration (verifies Google ID token obtained via client-side Firebase SDK).
*   Protected endpoints using Firebase ID Token verification middleware.
*   Logging of authentication events (success/failure) to Firestore.
*   Configuration via `.env` file.

## Prerequisites

*   Go (version 1.18 or later recommended)
*   A Firebase project.
*   Firebase Admin SDK credentials (Service Account Key JSON file).

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd tu-proyecto-auth
    ```

2.  **Create Firebase Service Account Key:**
    *   Go to your Firebase project settings -> Service accounts.
    *   Click "Generate new private key" and download the JSON file.
    *   **IMPORTANT:** Keep this file secure and do not commit it to Git.

3.  **Configure Environment Variables:**
    *   Rename or copy `.env.example` to `.env` (or create `.env` from scratch).
    *   Open `.env` and set the following variables:
        ```dotenv
        PORT=8080
        # Replace with the actual path to your downloaded service account key
        GOOGLE_APPLICATION_CREDENTIALS="path/to/your/serviceAccountKey.json"
        FIRESTORE_LOG_COLLECTION="access_logs" # Or your preferred collection name
        ```

4.  **Install Dependencies:**
    ```bash
    go mod tidy
    ```

## Running the API

```bash
go run cmd/api/main.go
```

The server will start, typically on http://localhost:8080 (or the port specified in `.env`).

## API Endpoints

- **POST `/register`**: Register a new user with email and password.
  - Body: `{ "email": "user@example.com", "password": "yourpassword" }`

- **POST `/login`**: Verify a Firebase ID Token obtained from client-side login.
  - Body: `{ "idToken": "FIREBASE_ID_TOKEN_FROM_CLIENT_SDK" }`

- **POST `/auth/google/signin`**: Verify a Google ID Token obtained from client-side Firebase Google Sign-In.
  - Body: `{ "idToken": "GOOGLE_ID_TOKEN_FROM_CLIENT_SDK" }`

- **GET `/profile`**: (Protected) Get authenticated user's profile.
  - Requires `Authorization: Bearer <FIREBASE_ID_TOKEN>` header.

- **GET `/health`**: Health check endpoint.

## Firestore Logging

Authentication attempts (successes and failures) are logged to the Firestore collection specified by `FIRESTORE_LOG_COLLECTION` in your `.env` file. Each log document includes:

- **timestamp**: Server timestamp of the event.
- **userId**: Firebase UID (if available/applicable).
- **email**: Email involved in the attempt (if available).
- **action**: Type of action (e.g., `REGISTER_SUCCESS`, `LOGIN_FAIL`).
- **ipAddress**: Client IP address.
- **errorDetails**: Error message on failure (if applicable).

## Important Notes

- **Client-Side SDK**: This backend expects the client (web/mobile app) to use the Firebase Client SDKs (JavaScript, Swift, Kotlin/Java, etc.) to handle the actual sign-in flows (displaying Google popups, handling email/password forms). The client then sends the resulting ID Token to this backend API for verification or specific actions like registration.

- **Security**: Ensure your `serviceAccountKey.json` file and `.env` file are kept secure and are not exposed publicly or committed to version control. Add `.env` and your key file path to your `.gitignore`.

- **Error Handling**: Basic error handling is included. Enhance it as needed for production environments.

- **Context**: `context.Background()` is used for simplicity in some places. Consider using request-scoped contexts (`c.Request.Context()`) for better cancellation and deadline propagation in production.



**Para Ejecutar:**

1.  Asegúrate de tener Go instalado.
2.  Crea tu archivo `.env` y pon la ruta correcta a tus credenciales de Firebase.
3.  Abre tu terminal en la carpeta `api-auth`.
4.  Ejecuta `go mod tidy` para descargar las dependencias.
5.  Ejecuta `go run cmd/api/main.go`.

¡Ahora tendrás tu API de autenticación Go con Gin y Firebase funcionando! Recuerda que la lógica de `/login` y `/auth/google/signin` se basa en verificar los tokens que el *cliente* obtiene al usar los SDKs de Firebase del lado del cliente.
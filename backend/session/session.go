package session

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
)

var Store = sessions.NewCookieStore([]byte("infinityjewelry")) // TODO: replace with stronger secret
const SessionMaxAgeSeconds = 3600

func init() {
	Store.Options = CookieOptions(SessionMaxAgeSeconds)
}

func CookieOptions(maxAge int) *sessions.Options {
	return &sessions.Options{
		Path:     "/",
		MaxAge:   maxAge,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	}
}

func InitSession(w http.ResponseWriter, r *http.Request, username string) error {
	session, _ := Store.Get(r, "session-id")
	session.Values["username"] = username
	session.Values["expiresAt"] = time.Now().Add(time.Hour).Unix()
	session.Options = CookieOptions(SessionMaxAgeSeconds)
	return session.Save(r, w)
}

func GetUsername(r *http.Request) (string, bool) {
	session, _ := Store.Get(r, "session-id")
	username, ok := session.Values["username"].(string)
	return username, ok
}

func ClearSession(w http.ResponseWriter, r *http.Request) {
	session, _ := Store.Get(r, "session-id")
	session.Options = CookieOptions(-1)
	session.Save(r, w)
}

func SessionStatusHandler(w http.ResponseWriter, r *http.Request) {
	username, ok := GetUsername(r)
	setNoStoreHeaders(w)
	w.Header().Set("Content-Type", "application/json")

	if ok {
		expiresAt, _ := sessionExpiresAt(r)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"loggedIn": true,
			"username": username,
			"expiresAt": expiresAt,
		})
	} else {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"loggedIn": false,
		})
	}
}

// RequireAuthHandler returns 204 if logged in, otherwise 401.
// Intended for nginx auth_request.
func RequireAuthHandler(w http.ResponseWriter, r *http.Request) {
	setNoStoreHeaders(w)
	_, ok := GetUsername(r)
	if ok {
		w.WriteHeader(http.StatusNoContent)
		return
	}
	w.WriteHeader(http.StatusUnauthorized)
}

func sessionExpiresAt(r *http.Request) (int64, bool) {
	session, _ := Store.Get(r, "session-id")
	expiresAt, ok := session.Values["expiresAt"].(int64)
	return expiresAt, ok
}

func setNoStoreHeaders(w http.ResponseWriter) {
	w.Header().Set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
	w.Header().Set("Pragma", "no-cache")
	w.Header().Set("Expires", "0")
}

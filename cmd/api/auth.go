package main

import (
	"fmt"
	"github.com/golang-jwt/jwt/v4"
	"net/http"
	"time"
)

type Auth struct {
	Issuer        string
	Audience      string
	Secret        string
	TokenExpiry   time.Duration
	RefreshExpiry time.Duration
	CookieDomain  string
	CookiePath    string
	CookieName    string
}

type jwtUser struct {
	ID        int    `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type TokenPairs struct {
	Token        string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type Claims struct {
	jwt.RegisteredClaims
}

func (j *Auth) GenerateTokenPair(user *jwtUser) (TokenPairs, error) {
	// Generate access token
	token := jwt.New(jwt.SigningMethodHS256)

	// Set claims. Casting a value here to jwt.MapClaims.
	claims := token.Claims.(jwt.MapClaims)
	claims["name"] = fmt.Sprintf("%v %v", user.FirstName, user.LastName)
	claims["sub"] = fmt.Sprint(user.ID)
	claims["aud"] = j.Audience
	claims["iss"] = j.Issuer
	claims["iat"] = time.Now().UTC().Unix()
	claims["typ"] = "JWT"

	// Set the expiry for the token
	claims["exp"] = time.Now().UTC().Add(j.TokenExpiry).Unix()

	// Create a signed token
	signedAccessToken, err := token.SignedString([]byte(j.Secret))

	if err != nil {
		return TokenPairs{}, fmt.Errorf("error signing access token: %w", err)
	}

	// Create a refresh token and set claims
	refreshToken := jwt.New(jwt.SigningMethodHS256)
	refreshTokenClaims := refreshToken.Claims.(jwt.MapClaims)

	refreshTokenClaims["sub"] = fmt.Sprint(user.ID)
	refreshTokenClaims["iat"] = time.Now().UTC().Unix()

	// Set the exipry for the refresh token
	claims["exp"] = time.Now().UTC().Add(j.RefreshExpiry).Unix()

	// Create signed refresh token
	signedRefreshToken, err := refreshToken.SignedString([]byte(j.Secret))

	if err != nil {
		return TokenPairs{}, fmt.Errorf("error signing access token: %w", err)
	}

	// Crete TokenPairs and populate it with signed tokens
	var tokenPairs = TokenPairs{
		Token:        signedAccessToken,
		RefreshToken: signedRefreshToken,
	}

	// Return TokenPairs
	return tokenPairs, nil

}

func (j *Auth) GetRefreshCookie(refreshToken string) *http.Cookie {
	return &http.Cookie{
		Name:     j.CookieName,
		Path:     j.CookiePath,
		Value:    refreshToken,
		Expires:  time.Now().UTC().Add(j.TokenExpiry),
		MaxAge:   int(j.TokenExpiry.Seconds()),
		SameSite: http.SameSiteStrictMode,
		Domain:   j.CookieDomain,
		HttpOnly: true,
		Secure:   true,
	}
}

func (j *Auth) GetExpiredRefreshCookie(refreshToken string) *http.Cookie {
	return &http.Cookie{
		Name:     j.CookieName,
		Path:     j.CookiePath,
		Value:    "",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		SameSite: http.SameSiteStrictMode,
		Domain:   j.CookieDomain,
		HttpOnly: true,
		Secure:   true,
	}
}

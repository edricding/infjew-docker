package handlers

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"html"
	"net"
	"net/http"
	"net/mail"
	"net/smtp"
	"os"
	"path/filepath"
	"strings"
)

type ContactRequest struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	Message        string `json:"message"`
	RecaptchaToken string `json:"recaptchaToken"`
}

func ContactFormHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Method Not Allowed",
		})
		return
	}

	var req ContactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Invalid JSON",
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Email == "" || req.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Missing required fields",
		})
		return
	}

	if _, err := mail.ParseAddress(req.Email); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Invalid email",
		})
		return
	}

	if req.RecaptchaToken == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "reCAPTCHA required",
		})
		return
	}

	recaptchaResult, err := verifyRecaptcha(req.RecaptchaToken, "contact")
	if err != nil || !recaptchaResult.OK {
		msg := recaptchaResult.Message
		if msg == "" {
			msg = "reCAPTCHA failed"
		}
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": msg,
		})
		return
	}

	body, err := buildContactEmail(req.Name, req.Email, req.Message)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email template error",
		})
		return
	}

	if err := sendContactEmail(body); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"message": "Email send failed",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Message sent",
	})
}

func buildContactEmail(name, email, message string) (string, error) {
	templatePath := os.Getenv("CONTACT_EMAIL_TEMPLATE")
	if templatePath == "" {
		templatePath = filepath.Join("/app", "templates", "contact_email.html")
	}
	raw, err := os.ReadFile(templatePath)
	if err != nil {
		return "", err
	}
	content := string(raw)

	escapedName := html.EscapeString(name)
	escapedEmail := html.EscapeString(email)
	escapedMessage := html.EscapeString(message)

	content = injectInputValue(content, "template-email-name", escapedName)
	content = injectInputValue(content, "template-email-email", escapedEmail)
	content = injectTextareaValue(content, "template-email-message", escapedMessage)

	return content, nil
}

func injectInputValue(htmlStr, inputID, value string) string {
	search := fmt.Sprintf(`id="%s"`, inputID)
	idx := strings.Index(htmlStr, search)
	if idx == -1 {
		return htmlStr
	}
	// find the start of the tag
	tagStart := strings.LastIndex(htmlStr[:idx], "<input")
	if tagStart == -1 {
		return htmlStr
	}
	// find tag end
	tagEnd := strings.Index(htmlStr[idx:], ">")
	if tagEnd == -1 {
		return htmlStr
	}
	tagEnd = idx + tagEnd
	tag := htmlStr[tagStart : tagEnd+1]
	if strings.Contains(tag, "value=") {
		return htmlStr
	}
	newTag := strings.Replace(tag, search, fmt.Sprintf(`%s value="%s"`, search, value), 1)
	return htmlStr[:tagStart] + newTag + htmlStr[tagEnd+1:]
}

func injectTextareaValue(htmlStr, textareaID, value string) string {
	search := fmt.Sprintf(`id="%s"`, textareaID)
	idx := strings.Index(htmlStr, search)
	if idx == -1 {
		return htmlStr
	}
	tagStart := strings.LastIndex(htmlStr[:idx], "<textarea")
	if tagStart == -1 {
		return htmlStr
	}
	tagEnd := strings.Index(htmlStr[idx:], ">")
	if tagEnd == -1 {
		return htmlStr
	}
	tagEnd = idx + tagEnd
	closeTag := "</textarea>"
	closeIdx := strings.Index(htmlStr[tagEnd:], closeTag)
	if closeIdx == -1 {
		return htmlStr
	}
	closeIdx = tagEnd + closeIdx
	return htmlStr[:tagEnd+1] + value + htmlStr[closeIdx:]
}

func sendContactEmail(body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	fromName := os.Getenv("SMTP_FROM")
	if fromName == "" {
		fromName = "INFJEW"
	}

	if host == "" || port == "" || user == "" || pass == "" {
		return fmt.Errorf("smtp config missing")
	}

	from := mail.Address{Name: fromName, Address: user}
	to := mail.Address{Address: "edricding0108@gmail.com"}

	subject := "New contact message from infjew.com"
	msg := "MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		fmt.Sprintf("From: %s\r\n", from.String()) +
		fmt.Sprintf("To: %s\r\n", to.String()) +
		fmt.Sprintf("Subject: %s\r\n\r\n", subject) +
		body

	addr := net.JoinHostPort(host, port)

	auth := smtp.PlainAuth("", user, pass, host)

	if port == "465" {
		tlsConfig := &tls.Config{ServerName: host}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return err
		}
		c, err := smtp.NewClient(conn, host)
		if err != nil {
			return err
		}
		defer c.Quit()

		if err := c.Auth(auth); err != nil {
			return err
		}
		if err := c.Mail(from.Address); err != nil {
			return err
		}
		if err := c.Rcpt(to.Address); err != nil {
			return err
		}
		w, err := c.Data()
		if err != nil {
			return err
		}
		_, err = w.Write([]byte(msg))
		if err != nil {
			return err
		}
		return w.Close()
	}

	c, err := smtp.Dial(addr)
	if err != nil {
		return err
	}
	defer c.Quit()

	if ok, _ := c.Extension("STARTTLS"); ok {
		tlsConfig := &tls.Config{ServerName: host}
		if err := c.StartTLS(tlsConfig); err != nil {
			return err
		}
	}

	if err := c.Auth(auth); err != nil {
		return err
	}
	if err := c.Mail(from.Address); err != nil {
		return err
	}
	if err := c.Rcpt(to.Address); err != nil {
		return err
	}
	w, err := c.Data()
	if err != nil {
		return err
	}
	_, err = w.Write([]byte(msg))
	if err != nil {
		return err
	}
	return w.Close()
}

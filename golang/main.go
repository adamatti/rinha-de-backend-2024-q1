package main

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/timeout"
	"gorm.io/gorm"
)

func main() {
	db := buildDB()

	err := buildWebServer(db)
	if err != nil {
		panic(err)
	}
}

func buildWebServer(db *gorm.DB) error {
	LISTEN := os.Getenv("SERVER_HOST") + ":" + getEnvOrDefault("PORT", "9999")
	app := fiber.New(fiber.Config{
		Network: getEnvOrDefault("SERVER_NETWORK", "tcp6"),
	})
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON("Hello, World")
	})

	if os.Getenv("SERVER_USE_TIMEOUT") == "true" {
		app.Get("/clientes/:id/extrato", timeout.NewWithContext(buildExtratoHandler(db), 3*time.Second))
		app.Post("/clientes/:id/transacoes", timeout.NewWithContext(buildTransactionHandler(db), 3*time.Second))
	} else {
		app.Get("/clientes/:id/extrato", buildExtratoHandler(db))
		app.Post("/clientes/:id/transacoes", buildTransactionHandler(db))
	}

	println("Listening on " + LISTEN)
	return app.Listen(LISTEN)
}

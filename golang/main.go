package main

import (
	"encoding/json"
	"os"
	"time"

	"github.com/gofiber/fiber/v3"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Client struct {
	balance int
	limit   int
}

func main() {
	internalError := toJson(map[string]string{"error": "Internal error"})
	notFound := toJson(map[string]string{"error": "Not found"})

	PORT := ":" + os.Getenv("PORT")
	app := fiber.New()

	// FIXME get it from env vars
	dsn := "postgres://postgres:postgres@localhost:5432/postgres"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	app.Get("/", func(c fiber.Ctx) error {
		return c.SendString("Hello, World 👋!")
	})

	app.Get("/clientes/:id/extrato", func(c fiber.Ctx) error {
		c.Set("content-type", "application/json")

		rows, err := db.Table("clients c").
			Joins("LEFT JOIN transactions t ON c.id = t.client_id").
			Where("c.id = ?", c.Params("id")).
			Select("c.\"balance\", c.\"limit\", t.value, t.description, t.created_at").
			Order("t.id desc").
			Limit(10).
			Rows()

		if err != nil {
			return c.SendString(internalError)
		}

		if rows.Next() {
			var balance int
			var limit int
			var value int
			var description string
			var createdAt time.Time

			transactions := []map[string]interface{}{}
			rows.Scan(&balance, &limit, &value, &description, &createdAt)

			for {
				if value <= 0 {
					break
				}

				transactions = append(transactions, map[string]interface{}{
					"valor":        Abs(value),
					"tipo":         toType(value),
					"descricao":    description,
					"realizada_em": createdAt,
				})

				if !rows.Next() {
					break
				}
				rows.Scan(&balance, &limit, &value, &description, &createdAt)
			}

			c.SendStatus(200)
			return c.SendString(toJson(map[string]interface{}{
				"saldo": map[string]interface{}{
					"total":        balance,
					"limite":       limit,
					"data_extrato": time.Now().Format(time.RFC3339),
				},
				"ultimas_transacoes": transactions,
			}))
		}
		c.SendStatus(404)
		return c.SendString(notFound)
	})

	app.Listen(PORT)
}

func toType(value int) string {
	if value > 0 {
		return "c"
	}
	return "d"
}

func toJson(obj interface{}) string {
	js, err := json.Marshal(obj)
	if err != nil {
		panic("Error converting to JSON")
	}
	return string(js)
}

func Abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

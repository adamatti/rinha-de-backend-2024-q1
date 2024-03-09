package main

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func buildExtratoHandler(db *gorm.DB) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		c.Set("content-type", "application/json")

		rows, err := db.Table("clients c").
			Joins("LEFT JOIN transactions t ON c.id = t.client_id").
			Where("c.id = ?", c.Params("id")).
			Select("c.\"balance\", c.\"limit\", coalesce(t.value,0) as value, coalesce(t.description,'') as description, t.created_at").
			Order("t.id desc").
			Limit(10).
			Rows()

		if err != nil {
			println(`Error calling extrato query: ` + err.Error())
			return c.Status(500).JSON(internalError)
		}
		defer rows.Close()

		if rows != nil && rows.Next() {
			var balance int
			var limit int
			var value int
			var description string
			var createdAt time.Time

			transactions := []map[string]interface{}{}
			err := rows.Scan(&balance, &limit, &value, &description, &createdAt)
			if err != nil && !ignoreScanErrors {
				println("Error parsing rows(extrato): " + err.Error())
				return c.Status(500).JSON(internalError)
			}

			for {
				if value == 0 {
					break
				}

				transactions = append(transactions, map[string]interface{}{
					"valor":        abs(value),
					"tipo":         toType(value),
					"descricao":    description,
					"realizada_em": createdAt,
				})

				if !rows.Next() {
					break
				}
				err = rows.Scan(&balance, &limit, &value, &description, &createdAt)
				if err != nil && !ignoreScanErrors {
					println("Error parsing rows(extrato, second): " + err.Error())
					return c.Status(500).JSON(internalError)
				}
			}

			return c.Status(200).JSON(fiber.Map{
				"saldo": fiber.Map{
					"total":        balance,
					"limite":       limit,
					"data_extrato": time.Now(),
				},
				"ultimas_transacoes": transactions,
			})
		}
		return c.Status(404).JSON(notFound)
	}
}

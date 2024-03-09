package main

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CreateTransaction struct {
	Valor     int    `json:"valor" validate:"required,min=1"`
	Tipo      string `json:"tipo" validate:"required,min=1,max=1,eq=d|eq=c"`
	Descricao string `json:"descricao" validate:"required,min=1,max=10"`
}

func buildTransactionHandler(db *gorm.DB) func(c *fiber.Ctx) error {
	return func(c *fiber.Ctx) error {
		id := c.Params("id")
		c.Set("content-type", "application/json")

		transaction := new(CreateTransaction)
		if err := c.BodyParser(transaction); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error":   "Bad request",
				"details": err.Error(),
			})
		}

		if err := validate.Struct(transaction); err != nil {
			return c.Status(400).JSON(fiber.Map{
				"error":   "Bad request",
				"details": err.Error(),
			})
		}

		value := toValue(transaction.Tipo, transaction.Valor)

		rows, err := db.
			// Clauses(clause.Locking{Strength: "UPDATE"}).
			Table("clients c").
			Where("c.id = ?", id).
			Select("c.\"balance\", c.\"limit\"").
			Rows()

		if err != nil {
			// tx.Rollback()
			println("Error fetching client: " + err.Error())
			return c.Status(500).JSON(internalError)
		}
		defer rows.Close()

		if rows != nil && rows.Next() {
			var balance int
			var limit int
			err := rows.Scan(&balance, &limit)
			if err != nil && !ignoreScanErrors {
				// tx.Rollback()
				println("Error parsing rows(transaction): " + err.Error())
				return c.Status(500).JSON(internalError)
			}

			if transaction.Tipo == "d" && balance-transaction.Valor < -limit {
				// tx.Rollback()
				return c.Status(422).JSON(fiber.Map{
					"error":     "No funds",
					"saldo":     balance,
					"novoSaldo": balance - transaction.Valor,
					"limite":    limit,
				})
			}

			tx := db
			/*
				var tx *gorm.DB
				if os.Getenv("SERVER_USE_TIMEOUT") == "true" {
					tx = db.WithContext(c.UserContext()).Begin()
				} else {
					tx = db.Begin()
				}
			*/
			//if err := updateBalance(tx, id, value); err != nil {
			if err := performTransaction(tx, value, transaction.Descricao, id); err != nil {
				// tx.Rollback()
				if strings.Contains(err.Error(), "current_balance_within_limit") {
					return c.Status(422).JSON("no funds")
				}
				println("Update balance error: " + err.Error())
				return c.Status(500).JSON(internalError)
			}
			/*
				if err := insertTransaction(tx, value, transaction.Descricao, id); err != nil {
					tx.Rollback()
					println("Create transaction error: " + err.Error())
					return c.Status(500).JSON(internalError)
				} */

			/*
				if err := tx.Commit().Error; err != nil {
					println("Error during commit")
					return c.Status(500).JSON(internalError)
				}*/

			return c.JSON(fiber.Map{
				"limite": limit,
				"saldo":  balance + value,
			})

		}
		return c.Status(404).JSON(notFound)

	}
}

// Test using all together
func performTransaction(db *gorm.DB, value int, description string, id string) error {
	return db.Exec(`
		BEGIN;
		BEGIN TRANSACTION;
		UPDATE clients SET balance = balance + $1 WHERE id = $3;
		INSERT INTO transactions (value, description, client_id) VALUES ($1, $2, $3);
		COMMIT;
		END;
		`,
		value, description, id,
	).
		Error
}

func insertTransaction(db *gorm.DB, value int, description string, id string) error {
	// FIXME
	// not support LastInsertId()
	// https://github.com/lib/pq/issues/24
	/*
		tx.
			Table("transactions").
			Create(map[string]interface{}{
				"value":       toValue(transaction.Tipo, transaction.Valor),
				"description": transaction.Descricao,
				"client_id":   c.Params("id"),
			})
	*/

	return db.Exec(
		"INSERT INTO transactions (value, description, client_id) VALUES ($1, $2, $3);",
		value, description, id,
	).
		Error
}

func updateBalance(db *gorm.DB, id string, value int) error {
	return db.
		Table("clients").
		Where("id = ?", id).
		Update("balance", gorm.Expr("balance + ?", value)).
		Error
}

/*
func getTransactionRequest(c *fiber.Ctx) (*CreateTransaction, error) {
	transaction := new(CreateTransaction)
	if err := c.BodyParser(transaction); err != nil {
		return nil, c.Status(400).JSON(fiber.Map{
			"error":   "Bad request",
			"details": err.Error(),
		})
	}

	if err := validate.Struct(transaction); err != nil {
		return nil, c.Status(400).JSON(fiber.Map{
			"error":   "Bad request",
			"details": err.Error(),
		})
	}

	return transaction, nil
}
*/

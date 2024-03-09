package main

import (
	"os"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var internalError = fiber.Map{"error": "Internal error"}
var notFound = fiber.Map{"error": "Not found"}

var validate = validator.New(validator.WithRequiredStructEnabled())

const ignoreScanErrors = true

func buildDB() *gorm.DB {
	dsn := getEnvOrDefault("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres?sslmode=disable")

	pg := postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	})

	db, err := gorm.Open(pg, &gorm.Config{
		SkipDefaultTransaction:   true,
		DisableNestedTransaction: true,
		Logger:                   logger.Default.LogMode(logger.Silent),
		// Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		panic("failed to connect database:" + err.Error())
	}

	/*
		config, err := db.DB()
		if err != nil {
			panic("Error getting database configuration")
		}
		config.SetMaxOpenConns(50)
	*/
	return db
}

func toValue(t string, value int) int {
	if t == "c" {
		return value
	}
	return -value

}

func toType(value int) string {
	if value > 0 {
		return "c"
	}
	return "d"
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

func getEnvOrDefault(name string, def string) string {
	value, ok := os.LookupEnv(name)
	if !ok {
		return def
	}
	return value
}

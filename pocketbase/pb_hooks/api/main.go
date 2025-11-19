package api

import (
	"context"
	"net/http"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"google.golang.org/genai"
)

type GenerateDescriptionRequest struct {
	Url string `json:"url"`
}

func Init(app *pocketbase.PocketBase) error {
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		v1 := se.Router.Group("/api")
		v1.POST("/generate-description", func(e *core.RequestEvent) error {
			body := GenerateDescriptionRequest{}
			if err := e.BindBody(&body); err != nil {
				return e.BadRequestError("Invalid request body", err)
			}

			ctx := context.Background()
			geminiClient, err := genai.NewClient(ctx, nil)
			if err != nil {
				return e.InternalServerError("Something went wrong", err)
			}

			prompt := "Summarize the main purpose of the website at " + body.Url + " in 1-2 sentences. Output ONLY the description. Do not include any introductory text or mention that you are an AI."

			result, err := geminiClient.Models.GenerateContent(ctx, "gemini-2.5-flash", genai.Text(prompt), &genai.GenerateContentConfig{
				Tools: []*genai.Tool{
					{GoogleSearch: &genai.GoogleSearch{}},
					{URLContext: &genai.URLContext{}},
				},
			})
			if err != nil {
				e.App.Logger().Error("something went wrong when generating description", "error", err)
				return e.InternalServerError("Something went wrong", err)
			}

			return e.JSON(http.StatusOK, result.Text())
		}).Bind(apis.RequireAuth())

		return se.Next()
	})

	return nil
}

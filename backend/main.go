package main

import (
	"fmt"
	"net/http"

	"INFJEW/backend/db"
	"INFJEW/backend/handlers"
	"INFJEW/backend/middleware"
	"INFJEW/backend/session"
)

// 中间件组合器
func ApplyMiddlewares(h http.Handler, middlewares ...func(http.Handler) http.Handler) http.Handler {
	for _, m := range middlewares {
		h = m(h)
	}
	return h
}

func main() {
	db.InitDB()

	mux := http.NewServeMux()

	// 登录后访问接口，使用自动续期 + CORS
	mux.Handle("/api/check", ApplyMiddlewares(http.HandlerFunc(handlers.CheckIDHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/hello", ApplyMiddlewares(http.HandlerFunc(handlers.HelloHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/session/status", ApplyMiddlewares(http.HandlerFunc(session.SessionStatusHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/session/require", ApplyMiddlewares(http.HandlerFunc(session.RequireAuthHandler), middleware.WithSessionRefresh, middleware.WithCORS))`r`n	mux.Handle("/api/banners", ApplyMiddlewares(http.HandlerFunc(handlers.GetBannersHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/banner/delete", ApplyMiddlewares(http.HandlerFunc(handlers.DeleteBannerHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/banner/create", ApplyMiddlewares(http.HandlerFunc(handlers.CreateBannerHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/countingdown", ApplyMiddlewares(http.HandlerFunc(handlers.GetCountingDownHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/preciouslist", ApplyMiddlewares(http.HandlerFunc(handlers.GetPreciousListHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/preciouslist/delete", ApplyMiddlewares(http.HandlerFunc(handlers.DeletePreciousItemHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/preciouslist/create", ApplyMiddlewares(http.HandlerFunc(handlers.CreatePreciousItemHandler), middleware.WithSessionRefresh, middleware.WithCORS))
	mux.Handle("/api/preciouslist/update", ApplyMiddlewares(http.HandlerFunc(handlers.UpdatePreciousItemHandler), middleware.WithSessionRefresh, middleware.WithCORS))


	mux.Handle("/api/countingdown/update", ApplyMiddlewares(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		handlers.UpdateCountingDownHandler(w, r)
	}), middleware.WithSessionRefresh, middleware.WithCORS))

	// 登录 / 登出接口只加 CORS，不自动续期
	mux.Handle("/api/AuthLogin", ApplyMiddlewares(http.HandlerFunc(handlers.AuthLoginHandler), middleware.WithCORS))
	mux.Handle("/api/AuthLogout", ApplyMiddlewares(http.HandlerFunc(handlers.AuthLogoutHandler), middleware.WithCORS))




	// 以下是前端用api

	mux.Handle("/api/public/banners", ApplyMiddlewares(http.HandlerFunc(handlers.PublicGetBannersHandler), middleware.WithCORS))
	mux.Handle("/api/public/countingdown", ApplyMiddlewares(http.HandlerFunc(handlers.PublicGetCountingDownHandler), middleware.WithCORS))
	mux.Handle("/api/public/preciouslist", ApplyMiddlewares(http.HandlerFunc(handlers.PublicGetPreciousItemsHandler), middleware.WithCORS))


	fmt.Println("服务器启动中，监听端�?8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		fmt.Printf("服务器启动失败：%v\n", err)
	}
}

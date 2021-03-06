package app

import (
	"net/http"

	"github.com/GeertJohan/go.rice"
	"github.com/gorilla/mux"
	"github.com/hackedu/maestro/router"
)

func Handler() *mux.Router {
	m := router.App()
	m.Get(router.AppStatic).Handler(http.StripPrefix("/static/", http.FileServer(rice.MustFindBox("static").HTTPBox())))
	return m
}

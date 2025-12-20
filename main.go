package main

import (
	"context"
	"embed"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
	"github.com/urfave/cli/v3"

	gozerolog "github.com/meysam81/go-zerolog"
)

//go:embed dist/*
var frontend embed.FS

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
	builtBy = "unknown"

	cmdHost     string
	cmdPort     int
	cmdLogLevel string
	cmdDebug    bool
)

type Config struct {
	Host     string `env:"HOST" envDefault:"localhost"`
	Port     int    `env:"PORT" envDefault:"3000"`
	LogLevel string `env:"LOG_LEVEL" envDefault:"info"`
	Debug    bool   `env:"DEBUG" envDefault:"false"`

	ContentSecurityPolicy string `env:"CONTENT_SECURITY_POLICY" envDefault:""`
}

type AppState struct {
	Config *Config
	Logger *zerolog.Logger
}

func NewLogger(c *Config) *zerolog.Logger {
	logger := gozerolog.NewLogger(gozerolog.WithColor(c.Debug), gozerolog.WithLogLevel(c.LogLevel))
	return logger
}

func (a *AppState) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		if a.Config.ContentSecurityPolicy != "" {
			w.Header().Set("Content-Security-Policy", a.Config.ContentSecurityPolicy)
		}

		next.ServeHTTP(w, r)
	})
}

func cacheControl(maxAge int) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Cache-Control", fmt.Sprintf("public, max-age=%d", maxAge))
			next.ServeHTTP(w, r)
		})
	}
}

func startServer(ctx context.Context, appState *AppState) error {
	appState.Logger.Info().Msg("initializing server")

	distFS, err := fs.Sub(frontend, "dist")
	if err != nil {
		appState.Logger.Error().Err(err).Msg("error creating subdirectory filesystem")
		return fmt.Errorf("error creating subdirectory filesystem: %w", err)
	}

	fileServer := http.FileServer(http.FS(distFS))

	r := chi.NewRouter()

	r.Use(appState.securityHeaders)
	r.Use(cacheControl(3600))
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.CleanPath)
	r.Use(middleware.GetHead)
	r.Use(middleware.Heartbeat("/health"))

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		appState.Logger.Debug().Str("path", r.URL.Path).Msg("handling not found request")
		file, err := distFS.Open(r.URL.Path[1:])
		if err == nil {
			defer func() {
				if closeErr := file.Close(); closeErr != nil {
					appState.Logger.Error().Err(closeErr).Msg("error closing file")
				}
			}()
			if stat, err := file.Stat(); err == nil && !stat.IsDir() {
				appState.Logger.Debug().Str("path", r.URL.Path).Msg("serving static file")
				http.ServeContent(w, r, r.URL.Path, stat.ModTime(), file.(io.ReadSeeker))
				return
			}
		}

		indexFile, err := distFS.Open("index.html")
		if err != nil {
			appState.Logger.Error().Err(err).Msg("error reading index.html")
			http.Error(w, "Page not found", http.StatusNotFound)
			return
		}
		defer func() {
			if closeErr := indexFile.Close(); closeErr != nil {
				appState.Logger.Error().Err(closeErr).Msg("error closing index file")
			}
		}()

		stat, err := indexFile.Stat()
		if err != nil {
			appState.Logger.Error().Err(err).Msg("error getting index.html stat")
			fileServer.ServeHTTP(w, r)
			return
		}

		appState.Logger.Debug().Str("path", r.URL.Path).Msg("serving index.html for route")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		http.ServeContent(w, r, "/", stat.ModTime(), indexFile.(io.ReadSeeker))
	})

	httpServer := &http.Server{
		Addr:           fmt.Sprintf("%s:%d", appState.Config.Host, appState.Config.Port),
		Handler:        r,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	appState.Logger.Info().Str("address", httpServer.Addr).Msg("server started")

	errChan := make(chan error, 1)
	go func() {
		errChan <- httpServer.ListenAndServe()
	}()

	select {
	case <-ctx.Done():
		appState.Logger.Info().Msg("shutdown signal received, shutting down")
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if err := httpServer.Shutdown(shutdownCtx); err != nil {
			appState.Logger.Error().Err(err).Msg("error during server shutdown")
			return err
		}
		appState.Logger.Info().Msg("server shutdown completed")
		return nil
	case err := <-errChan:
		appState.Logger.Error().Err(err).Msg("server error")
		return err
	}
}

func runAction(ctx context.Context, cmd *cli.Command) error {
	cfg := &Config{}
	err := env.Parse(cfg)
	if err != nil {
		return err
	}

	// cli args have precedence over env vars
	if cmdHost != "" {
		cfg.Host = cmdHost
	}
	if cmdPort > 0 {
		cfg.Port = cmdPort
	}
	if cmdLogLevel != "" {
		cfg.LogLevel = cmdLogLevel
	}
	if cfg.Debug {
		cfg.Debug = cmdDebug
	}

	logger := NewLogger(cfg)
	appState := &AppState{
		Config: cfg,
		Logger: logger,
	}

	appState.Logger.Info().
		Str("host", cfg.Host).
		Int("port", cfg.Port).
		Str("log_level", cfg.LogLevel).
		Bool("debug", cfg.Debug).
		Msg("application initialized")

	return startServer(ctx, appState)
}

func main() {
	cmd := &cli.Command{
		Name:                  "ory-admin-ui",
		Usage:                 "Ory Admin UI server",
		Suggest:               true,
		EnableShellCompletion: true,
		Version:               version,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:        "host",
				Aliases:     []string{"h"},
				Usage:       "Server host",
				Value:       "localhost",
				Sources:     cli.EnvVars("HOST"),
				Destination: &cmdHost,
			},
			&cli.IntFlag{
				Name:        "port",
				Aliases:     []string{"p"},
				Usage:       "Server port",
				Value:       3000,
				Sources:     cli.EnvVars("PORT"),
				Destination: &cmdPort,
			},
			&cli.StringFlag{
				Name:        "log-level",
				Aliases:     []string{"l"},
				Usage:       "Log level",
				Value:       "info",
				Sources:     cli.EnvVars("LOG_LEVEL"),
				Destination: &cmdLogLevel,
			},
			&cli.BoolFlag{
				Name:        "debug",
				Aliases:     []string{"d"},
				Usage:       "Enable debug mode",
				Value:       false,
				Sources:     cli.EnvVars("DEBUG"),
				Destination: &cmdDebug,
			},
		},
		Commands: []*cli.Command{
			{
				Name:  "version",
				Usage: "Show version information",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					fmt.Printf("Version:    %s\n", version)
					fmt.Printf("Commit:     %s\n", commit)
					fmt.Printf("Build Date: %s\n", date)
					fmt.Printf("Built By:   %s\n", builtBy)
					return nil
				},
			},
		},
		Action: runAction,
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	if err := cmd.Run(ctx, os.Args); err != nil {
		fmt.Fprintf(os.Stderr, "application error: %v\n", err)
		os.Exit(1)
	}
}

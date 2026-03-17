package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/school-system/backend/internal/models"
	"gorm.io/gorm"
)

type WebVitalsHandler struct {
	db *gorm.DB
}

func NewWebVitalsHandler(db *gorm.DB) *WebVitalsHandler {
	return &WebVitalsHandler{db: db}
}

type WebVitalRequest struct {
	Name   string  `json:"name" binding:"required"`
	Value  float64 `json:"value" binding:"required"`
	Rating string  `json:"rating"`
	Delta  float64 `json:"delta"`
	ID     string  `json:"id"`
}

func (h *WebVitalsHandler) RecordWebVital(c *gin.Context) {
	var req WebVitalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetString("user_id")
	schoolID := c.GetString("tenant_school_id")

	vital := &models.WebVital{
		Name:      req.Name,
		Value:     req.Value,
		Rating:    req.Rating,
		Delta:     req.Delta,
		MetricID:  req.ID,
		URL:       c.Request.Referer(),
		UserAgent: c.Request.UserAgent(),
	}

	if userID != "" {
		if uid, err := parseUUID(userID); err == nil {
			vital.UserID = &uid
		}
	}

	if schoolID != "" {
		if sid, err := parseUUID(schoolID); err == nil {
			vital.SchoolID = &sid
		}
	}

	if err := h.db.Create(vital).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record metric"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *WebVitalsHandler) GetWebVitalsStats(c *gin.Context) {
	schoolID := c.GetString("tenant_school_id")
	metricName := c.Query("name")

	type Stats struct {
		Name    string  `json:"name"`
		Average float64 `json:"average"`
		P50     float64 `json:"p50"`
		P75     float64 `json:"p75"`
		P95     float64 `json:"p95"`
		Count   int64   `json:"count"`
	}

	query := h.db.Model(&models.WebVital{})
	
	if schoolID != "" {
		query = query.Where("school_id = ?", schoolID)
	}

	if metricName != "" {
		query = query.Where("name = ?", metricName)
	}

	var stats []Stats
	err := query.Select(`
		name,
		AVG(value) as average,
		PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
		PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY value) as p75,
		PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
		COUNT(*) as count
	`).Group("name").Scan(&stats).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

func parseUUID(s string) (uuid.UUID, error) {
	return uuid.Parse(s)
}

package utils

import (
	"bytes"
	"image"
	"image/jpeg"

	"io"

	"github.com/nfnt/resize"
)

// OptimizeStudentPhoto compresses and resizes student photo
func OptimizeStudentPhoto(file io.Reader, maxWidth uint) ([]byte, error) {
	// Decode image
	img, format, err := image.Decode(file)
	if err != nil {
		return nil, err
	}

	// Resize to max width (maintains aspect ratio)
	resized := resize.Resize(maxWidth, 0, img, resize.Lanczos3)

	// Encode to JPEG with compression
	var buf bytes.Buffer
	if format == "png" {
		// Convert PNG to JPEG for smaller size
		err = jpeg.Encode(&buf, resized, &jpeg.Options{Quality: 85})
	} else {
		err = jpeg.Encode(&buf, resized, &jpeg.Options{Quality: 85})
	}

	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

// CreateThumbnail creates a small thumbnail
func CreateThumbnail(file io.Reader, size uint) ([]byte, error) {
	img, _, err := image.Decode(file)
	if err != nil {
		return nil, err
	}

	// Create square thumbnail
	thumbnail := resize.Thumbnail(size, size, img, resize.Lanczos3)

	var buf bytes.Buffer
	err = jpeg.Encode(&buf, thumbnail, &jpeg.Options{Quality: 80})
	if err != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

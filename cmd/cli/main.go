package main

import (
	"flag"
	"fmt"
	"image"
	"log"
	"os"
	"path/filepath"

	"github.com/fogleman/gg"

	"github.com/kristofferostlund/gpx-to-gmaps/pkg/geo"
	"github.com/kristofferostlund/gpx-to-gmaps/pkg/gmapsurl"
	"github.com/kristofferostlund/gpx-to-gmaps/pkg/gpx"
	"github.com/kristofferostlund/gpx-to-gmaps/pkg/slices"
	"github.com/kristofferostlund/gpx-to-gmaps/pkg/staticmaps"
)

var (
	filenameF     = flag.String("filename", "", "name of gpx file")
	outputFolderF = flag.String("output-dir", "", "folder to output the maps in")
)

func main() {
	flag.Parse()
	gpxData, err := gpx.ReadGPXFile(*filenameF)
	if err != nil {
		log.Fatalf("getting gpx data from %s: %v", *filenameF, err)
	}
	polygons := slices.Map(gpx.PolygonsOf(gpxData), func(polygon geo.Polygon) geo.Polygon {
		return geo.ReduceSize(polygon, 25)
	})
	for _, polygon := range polygons {
		fmt.Println(gmapsurl.Of(polygon, gmapsurl.Bike))
	}

	if outputFolderF != nil && *outputFolderF != "" {
		if err := renderPNGs(*outputFolderF, polygons); err != nil {
			log.Fatalf("rendering PNGs: %v", err)
		}
	}
}

func renderPNGs(outputFolder string, polygons []geo.Polygon) error {
	imgs := make([]image.Image, 0, len(polygons))
	for _, polygon := range polygons {
		img, err := staticmaps.RenderOnMap(polygon)
		if err != nil {
			return fmt.Errorf("rendering image on map: %w", err)
		}
		imgs = append(imgs, img)
	}

	if err := os.MkdirAll(outputFolder, 0o700); err != nil {
		return fmt.Errorf("creating directory for %v: %w", outputFolder, err)
	}

	for i, img := range imgs {
		fp := filepath.Join(outputFolder, fmt.Sprintf("map-%d.png", i))
		log.Printf("output to: %s", fp)
		if err := gg.SavePNG(fp, img); err != nil {
			return fmt.Errorf("saving png for %s: %w", fp, err)
		}
	}

	return nil
}

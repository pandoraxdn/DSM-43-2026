import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useLocation } from '../hooks/useLocation';

export const LocationScreen = () => {

    const { location, error } = useLocation();

    if (error) {
        return (
          <View style={styles.center}>
            <Text style={styles.error}>{error}</Text>
          </View>
        );
    }

    if (!location) {
        return (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text>Obteniendo ubicación...</Text>
          </View>
        );
    }

    const { latitude, longitude } = location.coords;

    const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <base target="_top">
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Mobile tutorial - Leaflet</title>
            <link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
            <style>
                html, body {
                    height: 100%;
                    margin: 0;
                }
                .leaflet-container {
                    height: 400px;
                    width: 600px;
                    max-width: 100%;
                    max-height: 100%;
                }
            </style>
            <style>body { padding: 0; margin: 0; } #map { height: 100%; width: 100vw; }</style>
        </head>
        <body>
        <div id='map'></div>
        <script>
            let map = L.map('map').setView([${latitude}, ${longitude}], 15);
            let marker = L.marker([${latitude}, ${longitude}]).addTo(map);
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);
        </script>
        </body>
        </html>
    `;

      return (
        <View style={styles.container}>
          <WebView 
            originWhitelist={["*"]}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
          />
        </View>
      );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 18,
    padding: 20,
  },
  infoBox: {
    backgroundColor: "#fff",
    padding: 15,
    elevation: 4,
  },
  info: {
    fontSize: 16,
  },
  ok: {
    marginTop: 5,
    color: "green",
    fontWeight: "bold",
  },
});

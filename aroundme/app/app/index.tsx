import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Slider from "@react-native-community/slider";

/* ===========================
   TYPES
=========================== */
type Station = {
    _id: string;
    properties: { name?: string };
    geometry: { coordinates: [number, number] }; // [lng, lat]
};

/* ===========================
   SEARCH MODAL
=========================== */
function SearchModal({
    visible,
    onClose,
    onResults,
    mapRef,
}: {
    visible: boolean;
    onClose: () => void;
    onResults: (places: Station[]) => void;
    mapRef: React.RefObject<MapView>;
}) {
    const [categories, setCategories] = useState<string[]>([]);
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [radius, setRadius] = useState(10000);
    const [places, setPlaces] = useState<Station[]>([]);

    const LAT = 48.8347;
    const LNG = 2.2661;

    useEffect(() => {
        fetch("http://92.153.51.210:3000/categories")
            .then((res) => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    const searchPlaces = async () => {
        if (!category) return;

        setLoading(true);
        try {
            const res = await fetch(
                `http://92.153.51.210:3000/near?lat=${LAT}&lng=${LNG}&category=${category}&radius=${radius}`
            );
            const data: Station[] = await res.json();
            setPlaces(data);
            onResults(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const focusOnStation = (station: Station) => {
        const [lng, lat] = station.geometry.coordinates;
        mapRef.current?.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Rechercher un lieu</Text>

                {/* CATEGORY */}
                <Picker selectedValue={category} onValueChange={setCategory}>
                    <Picker.Item label="Choisir une catégorie" value="" />
                    {categories.map((c) => (
                        <Picker.Item key={c} label={c} value={c} />
                    ))}
                </Picker>

                {/* RADIUS */}
                <View style={styles.sliderContainer}>
                    <Text>Rayon : {radius} m</Text>
                    <Slider
                        minimumValue={0}
                        maximumValue={500000}
                        step={1000}
                        value={radius}
                        onValueChange={setRadius}
                        minimumTrackTintColor="#000"
                        maximumTrackTintColor="#ccc"
                        thumbTintColor="#000"
                    />
                </View>

                <TouchableOpacity style={styles.searchBtn} onPress={searchPlaces}>
                    <Text style={{ color: "#fff" }}>Rechercher</Text>
                </TouchableOpacity>

                {loading && <ActivityIndicator style={{ marginTop: 10 }} />}

                {/* RESULTS */}
                {places.length > 0 && (
                    <>
                        <Text style={styles.listTitle}>Résultats</Text>
                        <FlatList
                            data={places}
                            keyExtractor={(item) => item._id}
                            style={{ maxHeight: 250 }}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.stationItem}
                                    onPress={() => focusOnStation(item)}
                                >
                                    <Text style={styles.stationTitle}>
                                        {item.properties?.name ?? "Station"}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </>
                )}

                <TouchableOpacity
                    style={[styles.searchBtn, { backgroundColor: "#555", marginTop: 10 }]}
                    onPress={onClose}
                >
                    <Text style={{ color: "#fff" }}>Fermer</Text>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}

/* ===========================
   FLOATING BUTTONS
=========================== */
function FloatingButtons({
    onCenter,
    onSearch,
}: {
    onCenter: () => void;
    onSearch: () => void;
}) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={[
                styles.fabContainer,
                { paddingBottom: insets.bottom, paddingRight: insets.right },
            ]}
        >
            <TouchableOpacity
                style={[styles.fab, { marginBottom: 12 }]}
                onPress={onSearch}
            >
                <Text style={styles.fabText}>🔍</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.fab} onPress={onCenter}>
                <Text style={styles.fabText}>📍</Text>
            </TouchableOpacity>
        </View>
    );
}

/* ===========================
   MAP SCREEN
=========================== */
function MapScreen() {
    const mapRef = useRef<MapView>(null);

    const [hasPermission, setHasPermission] = useState(false);
    const [userLocation, setUserLocation] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [places, setPlaces] = useState<Station[]>([]);

    const parisRegion = {
        latitude: 48.8566,
        longitude: 2.3522,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    const centerOnUser = async () => {
        if (!hasPermission) {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission refusée");
                return;
            }
            setHasPermission(true);
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });

        mapRef.current?.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        });
    };

    return (
        <View style={{ flex: 1 }}>
            {/* MAP */}
            <MapView
                ref={mapRef}
                style={StyleSheet.absoluteFill}
                initialRegion={parisRegion}
                showsUserLocation={hasPermission}
            >
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="Vous êtes ici"
                        pinColor="blue"
                    />
                )}

                {/* PLACES */}
                {places.map((station) => {
                    const [lng, lat] = station.geometry.coordinates;
                    return (
                        <Marker
                            key={station._id}
                            coordinate={{ latitude: lat, longitude: lng }}
                            title={station.properties?.name ?? "Station"}
                            pinColor="orange"
                        />
                    );
                })}
            </MapView>

            <FloatingButtons
                onCenter={centerOnUser}
                onSearch={() => setModalVisible(true)}
            />

            <SearchModal
                visible={modalVisible}
                mapRef={mapRef}
                onClose={() => setModalVisible(false)}
                onResults={(data) => setPlaces(data)}
            />
        </View>
    );
}

/* ===========================
   APP ROOT
=========================== */
export default function App() {
    return (
        <SafeAreaProvider>
            <MapScreen />
        </SafeAreaProvider>
    );
}

/* ===========================
   STYLES
=========================== */
const styles = StyleSheet.create({
    fabContainer: {
        position: "absolute",
        bottom: 20,
        right: 20,
        alignItems: "flex-end",
    },
    fab: {
        backgroundColor: "#000",
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        elevation: 5,
    },
    fabText: {
        color: "#fff",
        fontSize: 22,
    },
    modalContainer: {
        flex: 1,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 10,
    },
    sliderContainer: {
        marginVertical: 10,
    },
    searchBtn: {
        backgroundColor: "#000",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    listTitle: {
        fontWeight: "600",
        fontSize: 16,
        marginTop: 15,
        marginBottom: 5,
    },
    stationItem: {
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderColor: "#ddd",
    },
    stationTitle: {
        fontWeight: "500",
    },
});

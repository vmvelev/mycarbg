// src/screens/main/CarManagementScreen.tsx
import { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  List,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { useCars } from "../../hooks/useCars";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";

export default function CarManagementScreen() {
  const { cars, loading, error, addCar, deleteCar, fetchCars } = useCars();
  const [visible, setVisible] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [oilChangeKm, setOilChangeKm] = useState("10000");
  const [oilChangeMonths, setOilChangeMonths] = useState("12");
  const [odometer, setOdometer] = useState("");
  const [lastOilChangeKm, setLastOilChangeKm] = useState("");
  const [lastOilChangeDate, setLastOilChangeDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchCars();
    }, [fetchCars])
  );

  const validateForm = () => {
    if (
      !brand ||
      !model ||
      !year ||
      !oilChangeKm ||
      !oilChangeMonths ||
      !odometer ||
      !lastOilChangeKm ||
      !lastOilChangeDate
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return false;
    }

    const yearNum = parseInt(year);
    if (
      isNaN(yearNum) ||
      yearNum < 1900 ||
      yearNum > new Date().getFullYear()
    ) {
      Alert.alert("Error", "Please enter a valid year");
      return false;
    }

    const odometerNum = parseInt(odometer);
    if (isNaN(odometerNum) || odometerNum < 0) {
      Alert.alert("Error", "Please enter a valid odometer reading");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const response = await addCar({
      brand,
      model,
      year: parseInt(year),
      oil_change_km: parseInt(oilChangeKm),
      oil_change_months: parseInt(oilChangeMonths),
      current_odometer_km: parseInt(odometer),
      last_oil_change_km: parseInt(lastOilChangeKm),
      last_oil_change_date: new Date(lastOilChangeDate).toISOString(),
    });

    setSubmitting(false);

    if (response.success) {
      setVisible(false);
      resetForm();
      // Refresh cars data after adding a new car
      await fetchCars();
      Alert.alert("Success", "Car added successfully");
    } else {
      Alert.alert("Error", response.error || "Failed to add car");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Car",
      "Are you sure you want to delete this car? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const response = await deleteCar(id);
            if (!response.success) {
              Alert.alert("Error", response.error || "Failed to delete car");
            } else {
              // Refresh cars data after deleting a car
              await fetchCars();
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setBrand("");
    setModel("");
    setYear("");
    setOilChangeKm("10000");
    setOilChangeMonths("12");
    setOdometer("");
    setLastOilChangeKm("");
    setLastOilChangeDate("");
  };

  if (loading && !cars.length) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error loading cars. Please try again.</Text>
        <Button onPress={() => window.location.reload()}>Reload</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {cars.length === 0 ? (
          <View style={styles.emptyCars}>
            <Text style={styles.emptyText}>No cars added yet</Text>
            <Button mode="contained" onPress={() => setVisible(true)}>
              Add Your First Car
            </Button>
          </View>
        ) : (
          <List.Section>
            <List.Subheader>My Cars</List.Subheader>
            {cars.map((car) => (
              <List.Item
                key={car.id}
                title={`${car.brand} ${car.model}`}
                description={`${
                  car.year
                } • ${car.current_odometer_km.toLocaleString()} km\nNext oil change: ${Math.max(
                  0,
                  car.last_oil_change_km +
                    car.oil_change_km -
                    car.current_odometer_km
                ).toLocaleString()} km or ${format(
                  new Date(car.last_oil_change_date),
                  "MMM dd, yyyy"
                )}`}
                left={(props) => <List.Icon {...props} icon="car" />}
                right={(props) => (
                  <IconButton
                    {...props}
                    icon="delete"
                    onPress={() => handleDelete(car.id)}
                  />
                )}
              />
            ))}
          </List.Section>
        )}

        {cars.length > 0 && (
          <Button
            mode="contained"
            onPress={() => setVisible(true)}
            style={styles.addButton}
          >
            Add Another Car
          </Button>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => {
            setVisible(false);
            resetForm();
          }}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Add New Car</Text>

          <TextInput
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            style={styles.input}
          />

          <TextInput
            label="Model"
            value={model}
            onChangeText={setModel}
            style={styles.input}
          />

          <TextInput
            label="Year of Manufacturing"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Oil Change Interval (km)"
            value={oilChangeKm}
            onChangeText={setOilChangeKm}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Oil Change Interval (months)"
            value={oilChangeMonths}
            onChangeText={setOilChangeMonths}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Current Odometer Reading (km)"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Last Oil Change Odometer Reading (km)"
            value={lastOilChangeKm}
            onChangeText={setLastOilChangeKm}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Last Oil Change Date"
            value={lastOilChangeDate}
            onChangeText={setLastOilChangeDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.button}
            loading={submitting}
            disabled={submitting}
          >
            Save Car
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyCars: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  addButton: {
    margin: 16,
  },
});

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
      Alert.alert("Грешка", "Въведи всички полета");
      return false;
    }

    const yearNum = parseInt(year);
    if (
      isNaN(yearNum) ||
      yearNum < 1900 ||
      yearNum > new Date().getFullYear()
    ) {
      Alert.alert("Грешка", "Въведи валидна година на производство");
      return false;
    }

    const odometerNum = parseInt(odometer);
    if (isNaN(odometerNum) || odometerNum < 0) {
      Alert.alert("Грешка", "Въведи валидни километри");
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
    } else {
      Alert.alert("Грешка", response.error || "Грешка при записване");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Изтриване на автомобил",
      "Сигурен ли си, че искаш да изтриеш този автомобил?",
      [
        { text: "Не", style: "cancel" },
        {
          text: "Да",
          style: "destructive",
          onPress: async () => {
            const response = await deleteCar(id);
            if (!response.success) {
              Alert.alert("Грешка", response.error || "Грешка при изтриване");
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
        <Text>Грешка при зареждане. Моля, опитай по-късно</Text>
        <Button onPress={() => window.location.reload()}>Презареди</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {cars.length === 0 ? (
          <View style={styles.emptyCars}>
            <Text style={styles.emptyText}>Все още нямаш автомобил</Text>
            <Button mode="contained" onPress={() => setVisible(true)}>
              Добави първия си автомобил
            </Button>
          </View>
        ) : (
          <List.Section>
            <List.Subheader>Автомобили</List.Subheader>
            {cars.map((car) => (
              <List.Item
                key={car.id}
                title={`${car.brand} ${car.model}`}
                description={`${
                  car.year
                } • ${car.current_odometer_km.toLocaleString()} км\nСледваща смяна на масло\n${Math.max(
                  0,
                  car.last_oil_change_km +
                    car.oil_change_km -
                    car.current_odometer_km
                ).toLocaleString()} км или ${format(
                  new Date(
                    new Date(car.last_oil_change_date).setMonth(
                      new Date(car.last_oil_change_date).getMonth() +
                        car.oil_change_months
                    )
                  ),
                  "dd MMM yyyy"
                )}`}
                descriptionNumberOfLines={3}
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
            Добави автомобил
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
          <Text style={styles.modalTitle}>Нов автомобил</Text>

          <TextInput
            label="Марка"
            value={brand}
            onChangeText={setBrand}
            style={styles.input}
          />

          <TextInput
            label="Модел"
            value={model}
            onChangeText={setModel}
            style={styles.input}
          />

          <TextInput
            label="Година на производство"
            value={year}
            onChangeText={setYear}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Интервал за смяна на масло (км)"
            value={oilChangeKm}
            onChangeText={setOilChangeKm}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Интервал за смяна на масло (месеци)"
            value={oilChangeMonths}
            onChangeText={setOilChangeMonths}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Текущи километри"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Километри при последната смяна на масло"
            value={lastOilChangeKm}
            onChangeText={setLastOilChangeKm}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Датата на последната смяня на масло"
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
            Добави
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

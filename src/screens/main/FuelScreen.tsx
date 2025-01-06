// src/screens/main/FuelScreen.tsx
import React, { useState, memo, useCallback, useEffect, useRef } from "react";
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
  SegmentedButtons,
} from "react-native-paper";
import { useCars } from "../../hooks/useCars";
import { useFuelEntries } from "../../hooks/useFuelEntries";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { bg } from "date-fns/locale";

// Memoized Form Component to prevent unnecessary re-renders
const AddFuelEntryForm = memo(
  ({
    visible,
    onDismiss,
    onSubmit,
    defaultOdometer,
  }: {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (formData: {
      date: string;
      station_name: string;
      liters: string;
      price_per_liter: string;
      total_price: string;
      odometer_km: string;
      is_full_tank: boolean;
    }) => void;
    defaultOdometer: number;
  }) => {
    const [priceInputMethod, setPriceInputMethod] = useState("total");
    const [formData, setFormData] = useState({
      date: format(new Date(), "yyyy-MM-dd"),
      station_name: "",
      liters: "",
      price_per_liter: "",
      total_price: "",
      odometer_km: defaultOdometer.toString(),
      is_full_tank: true,
    });

    const updateField = (field: string) => (value: string) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        if (
          field === "liters" ||
          field === "price_per_liter" ||
          field === "total_price"
        ) {
          const liters = parseFloat(newData.liters) || 0;
          const pricePerLiter = parseFloat(newData.price_per_liter) || 0;
          const totalPrice = parseFloat(newData.total_price) || 0;

          if (priceInputMethod === "per_liter" && liters && pricePerLiter) {
            newData.total_price = (liters * pricePerLiter).toFixed(2);
          } else if (priceInputMethod === "total" && liters && totalPrice) {
            newData.price_per_liter = (totalPrice / liters).toFixed(2);
          }
        }

        return newData;
      });
    };

    const handleSubmit = () => {
      onSubmit(formData);
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        station_name: "",
        liters: "",
        price_per_liter: "",
        total_price: "",
        odometer_km: defaultOdometer.toString(),
        is_full_tank: true,
      });
    };

    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <Text style={styles.modalTitle}>Добави зареждане</Text>

            <TextInput
              label="Дата"
              defaultValue={formData.date}
              onChangeText={updateField("date")}
              placeholder="YYYY-MM-DD"
              style={styles.input}
            />

            <TextInput
              label="Бензиностанция"
              defaultValue={formData.station_name}
              onChangeText={updateField("station_name")}
              style={styles.input}
            />

            <TextInput
              label="Литри"
              defaultValue={formData.liters}
              onChangeText={updateField("liters")}
              keyboardType="numeric"
              style={styles.input}
            />

            <SegmentedButtons
              value={priceInputMethod}
              onValueChange={setPriceInputMethod}
              buttons={[
                { value: "total", label: "Обща цена" },
                { value: "per_liter", label: "Цена за литър" },
              ]}
              style={styles.segmentedButton}
            />

            {priceInputMethod === "per_liter" ? (
              <TextInput
                label="Цена на литър"
                defaultValue={formData.price_per_liter}
                onChangeText={updateField("price_per_liter")}
                keyboardType="numeric"
                style={styles.input}
              />
            ) : (
              <TextInput
                label="Обща цена"
                defaultValue={formData.total_price}
                onChangeText={updateField("total_price")}
                keyboardType="numeric"
                style={styles.input}
              />
            )}

            <TextInput
              label="Километри на автомобила"
              defaultValue={defaultOdometer.toString()}
              onChangeText={updateField("odometer_km")}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.checkboxContainer}>
              <List.Item
                title="Пълен резервоар"
                onPress={() =>
                  setFormData((prev) => ({
                    ...prev,
                    is_full_tank: !prev.is_full_tank,
                  }))
                }
                left={(props) => (
                  <List.Icon
                    {...props}
                    icon={
                      formData.is_full_tank
                        ? "checkbox-marked"
                        : "checkbox-blank-outline"
                    }
                  />
                )}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.button}
            >
              Добави
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    );
  }
);

// Memoized Stats Card Component
const StatsCard = memo(
  ({ title, value, info }: { title: string; value: string; info?: string }) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{title}</Text>
      {info && <Text style={styles.statsInfo}>{info}</Text>}
    </View>
  )
);

// Main Screen Component
export default function FuelScreen() {
  const { cars, loading: carsLoading, fetchCars } = useCars();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const {
    entries,
    loading: entriesLoading,
    error,
    averageConsumption,
    addEntry,
    deleteEntry,
    refreshEntries,
  } = useFuelEntries(selectedCarId || "", fetchCars); // Pass fetchCars as callback

  useEffect(() => {
    if (isInitialMount.current && !selectedCarId && cars.length > 0) {
      setSelectedCarId(cars[0].id);
      isInitialMount.current = false;
    }
  }, [cars, selectedCarId]);

  useFocusEffect(
    useCallback(() => {
      if (selectedCarId) {
        fetchCars();
      }
    }, [fetchCars, selectedCarId])
  );

  const handleCarSelect = useCallback((newCarId: string) => {
    setSelectedCarId(newCarId);
  }, []);

  const [visible, setVisible] = useState(false);

  const currentCar = cars.find((car) => car.id === selectedCarId);

  const validateForm = (formData: any) => {
    const { station_name, liters, odometer_km } = formData;

    if (!station_name || !liters || !odometer_km) {
      Alert.alert("Грешка", "Въведи всички полета");
      return false;
    }

    const litersNum = parseFloat(liters);
    if (isNaN(litersNum) || litersNum <= 0) {
      Alert.alert("Грешка", "Литрите трябва да са положително число");
      return false;
    }

    const odometerNum = parseInt(odometer_km);
    if (isNaN(odometerNum) || odometerNum < 0) {
      Alert.alert("Грешка", "Километрите трябва да са положително число");
      return false;
    }

    // Disable for this version
    // if (currentCar && odometerNum <= currentCar.current_odometer_km) {
    //   Alert.alert(
    //     "Грешка",
    //     "Километрите трябва да са по-големи от текущите километри на автомобила"
    //   );
    //   return false;
    // }

    return true;
  };

  const handleSubmit = async (formData: any) => {
    if (!validateForm(formData)) return;
    if (!selectedCarId) {
      Alert.alert("Грешка", "Избери автомобил");
      return;
    }

    const response = await addEntry({
      date: formData.date,
      station_name: formData.station_name,
      liters: parseFloat(formData.liters),
      price_per_liter: parseFloat(formData.price_per_liter),
      total_price: parseFloat(formData.total_price),
      odometer_km: parseInt(formData.odometer_km),
      is_full_tank: formData.is_full_tank,
    });

    if (response.success) {
      setVisible(false);
      // Refresh both cars and entries data
      await Promise.all([fetchCars(), refreshEntries()]);
      // Alert.alert("Успех", "Fuel entry added successfully");
    } else {
      Alert.alert("Грешка", response.error || "Грешка при добавяне на запис");
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert("Изтриване", "Сигурен ли си, че искаш да изтриеш записа?", [
      { text: "Не", style: "cancel" },
      {
        text: "Да",
        style: "destructive",
        onPress: async () => {
          const response = await deleteEntry(id);
          if (response.success) {
            // Refresh both cars and entries data after deletion
            await Promise.all([fetchCars(), refreshEntries()]);
          } else {
            Alert.alert(
              "Грешка",
              response.error || "Грешка при изтриване на запис"
            );
          }
        },
      },
    ]);
  };

  if (carsLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (cars.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Моля добави автомобил</Text>
        <Button mode="contained" style={styles.button} onPress={() => {}}>
          Добави автомобил
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Car Selection */}
        {cars.length === 1 && (
          <Button
            mode="outlined"
            style={styles.addButton}
            onPress={() => setSelectedCarId(cars[0].id)}
          >
            {`${cars[0].brand} ${cars[0].model}`}
          </Button>
        )}
        {cars.length > 1 && (
          <SegmentedButtons
            value={selectedCarId || ""}
            onValueChange={handleCarSelect}
            buttons={cars.map((car) => ({
              value: car.id,
              label: `${car.brand} ${car.model}`,
              style: cars.length === 1 ? styles.singleCarButton : undefined,
            }))}
            style={[
              styles.carSelector,
              cars.length === 1 && styles.singleCarSelector,
            ]}
          />
        )}

        {selectedCarId && (
          <>
            {/* Stats Section */}
            {!entriesLoading && (
              <List.Section>
                <StatsCard
                  title="Среден разход"
                  value={
                    entries.length > 0 && averageConsumption !== null
                      ? `${averageConsumption.toFixed(1)} л/100км`
                      : "Няма данни"
                  }
                  info="Разходът се изчислява само между последователни пълни зареждания"
                />
              </List.Section>
            )}

            {/* Entries List */}
            {entries.length > 0 && (
              <List.Section>
                <List.Subheader>Последни зареждания</List.Subheader>
                {entriesLoading ? (
                  <ActivityIndicator style={styles.listLoader} />
                ) : (
                  entries.map((entry) => (
                    <List.Item
                      key={entry.id}
                      title={
                        <View style={styles.entryTitleContainer}>
                          <Text>{entry.station_name}</Text>
                          {entry.is_full_tank && (
                            <View style={styles.fullTankBadge}>
                              <Text style={styles.fullTankText}>
                                Пълен резервоар
                              </Text>
                            </View>
                          )}
                        </View>
                      }
                      description={`${entry.liters}л • ${
                        entry.price_per_liter
                      } лв/л • ${format(new Date(entry.date), "d MMM yyyy", {
                        locale: bg,
                      })}${
                        entry.calculated_l_per_100km
                          ? `\n${entry.calculated_l_per_100km.toFixed(
                              1
                            )} л/100км`
                          : ""
                      }`}
                      right={(props) => (
                        <IconButton
                          {...props}
                          icon="delete"
                          onPress={() => handleDelete(entry.id)}
                        />
                      )}
                    />
                  ))
                )}
              </List.Section>
            )}

            {/* Add Entry Button */}
            <Button
              mode="contained"
              onPress={() => setVisible(true)}
              style={styles.addButton}
            >
              Добави зареждане
            </Button>

            {/* Add Entry Modal */}
            <AddFuelEntryForm
              key={`fuel-form-${selectedCarId}-${currentCar?.current_odometer_km}`}
              visible={visible}
              onDismiss={() => setVisible(false)}
              onSubmit={handleSubmit}
              defaultOdometer={currentCar?.current_odometer_km || 0}
            />
          </>
        )}
      </ScrollView>
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
  carSelector: {
    margin: 16,
  },
  singleCarSelector: {
    width: "75%",
    // borderRadius: 8,
    // overflow: "hidden",
  },
  singleCarButton: {
    // borderTopLeftRadius: 8,
    // borderTopRightRadius: 8,
    // borderBottomLeftRadius: 8,
    // borderBottomRightRadius: 8,
  },
  statsCard: {
    backgroundColor: "white",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  statsLabel: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  modal: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: "90%",
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
  listLoader: {
    margin: 20,
  },
  segmentedButton: {
    marginBottom: 16,
  },
  checkboxContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    borderRadius: 4,
  },
  statsInfo: {
    fontSize: 12,
    color: "#666",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },

  entryTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fullTankBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  fullTankText: {
    fontSize: 12,
    color: "#1976D2",
  },
});

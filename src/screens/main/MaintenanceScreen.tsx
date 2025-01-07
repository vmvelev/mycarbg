import React, { useState, memo, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  List,
  ActivityIndicator,
  SegmentedButtons,
  ProgressBar,
} from "react-native-paper";
import { useCars } from "../../hooks/useCars";
import { useMaintenance } from "../../hooks/useMaintenance";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { bg } from "date-fns/locale";

// Memoized Form Component
const RecordOilChangeForm = memo(
  ({
    visible,
    onDismiss,
    onSubmit,
    defaultOdometer,
  }: {
    visible: boolean;
    onDismiss: () => void;
    onSubmit: (formData: { date: string; odometer_km: string }) => void;
    defaultOdometer: number;
  }) => {
    const [formData, setFormData] = useState({
      date: format(new Date(), "yyyy-MM-dd"),
      odometer_km: defaultOdometer.toString(),
    });

    const updateField = (field: string) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
      onSubmit(formData);
      setFormData({
        date: format(new Date(), "yyyy-MM-dd"),
        odometer_km: defaultOdometer.toString(),
      });
    };

    return (
      <Portal>
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Смяна на масло</Text>

          <TextInput
            label="Дата"
            defaultValue={formData.date}
            onChangeText={updateField("date")}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <TextInput
            label="Километри на автомобила"
            defaultValue={formData.odometer_km}
            onChangeText={updateField("odometer_km")}
            keyboardType="numeric"
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Добави
          </Button>
        </Modal>
      </Portal>
    );
  }
);

// Memoized Status Card Component
const StatusCard = memo(
  ({
    title,
    value,
    subtitle,
  }: {
    title: string;
    value: string;
    subtitle?: string;
  }) => (
    <View style={styles.statsCard}>
      <Text style={styles.statsLabel}>{title}</Text>
      <Text style={styles.statsValue}>{value}</Text>
      {subtitle && <Text style={styles.statsSubtitle}>{subtitle}</Text>}
    </View>
  )
);

export default function MaintenanceScreen() {
  const { cars, loading: carsLoading, fetchCars } = useCars();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const currentCar = cars.find((car) => car.id === selectedCarId);
  const { loading, getMaintenanceStatus, recordOilChange } = useMaintenance(
    currentCar || null,
    fetchCars
  );

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

  const [visible, setVisible] = useState(false);

  const status = currentCar ? getMaintenanceStatus() : null;

  const validateForm = (formData: any) => {
    if (!currentCar) return false;

    const { odometer_km } = formData;
    const odometerNum = parseInt(odometer_km);

    if (isNaN(odometerNum) || odometerNum < 0) {
      Alert.alert("Грешка", "Въведи валидни километри");
      return false;
    }

    // Disable this check for now
    // if (odometerNum <= currentCar.current_odometer_km) {
    //   Alert.alert(
    //     "Грешка",
    //     "Километрите трябва да са повече от текущите километри на автомобила"
    //   );
    //   return false;
    // }

    return true;
  };

  const handleSubmit = async (formData: any) => {
    if (!validateForm(formData)) return;

    const response = await recordOilChange(
      formData.date,
      parseInt(formData.odometer_km)
    );

    if (response.success) {
      setVisible(false);
      // Refresh car data after successful oil change recording
      await fetchCars();
    } else {
      Alert.alert("Грешка", response.error || "Грешка при записване");
    }
  };

  const getProgressBarColor = (kmLeft: number, isOverdue: boolean) => {
    if (isOverdue) return "#FF5252";
    if (kmLeft < 1000) return "#FFC107";
    return "#4CAF50";
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
            onValueChange={setSelectedCarId}
            buttons={cars.map((car) => ({
              value: car.id,
              label: `${car.brand} ${car.model}`,
            }))}
            style={styles.carSelector}
          />
        )}

        {selectedCarId && status && (
          <>
            <List.Section>
              <StatusCard
                title="Километри до следващата смяна"
                value={`${Math.abs(
                  status.kmUntilNextService
                ).toLocaleString()} км`}
                subtitle={status.isOverdueByKm ? "ПРОСРОЧЕНИ" : "остават"}
              />

              <View style={styles.progressBarContainer}>
                <ProgressBar
                  progress={parseFloat(
                    Math.max(
                      0,
                      Math.min(
                        1,
                        (currentCar!.current_odometer_km -
                          status.lastServiceKm) /
                          currentCar!.oil_change_km
                      )
                    ).toFixed(2)
                  )}
                  color={getProgressBarColor(
                    status.kmUntilNextService,
                    status.isOverdueByKm
                  )}
                  style={styles.progressBar}
                />
              </View>

              <StatusCard
                title="Време до следващата смяна"
                value={`${Math.abs(status.daysUntilNextService)} дни`}
                subtitle={status.isOverdueByTime ? "ПРОСРОЧЕНИ" : "остават"}
              />

              <StatusCard
                title="Последна смяна"
                value={format(status.lastServiceDate, "d MMM yyyy", {
                  locale: bg,
                })}
                subtitle={`при ${status.lastServiceKm.toLocaleString()} км`}
              />
            </List.Section>

            <Button
              mode="contained"
              onPress={() => setVisible(true)}
              style={styles.addButton}
            >
              Запиши смяна на масло
            </Button>

            <RecordOilChangeForm
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
  statsCard: {
    backgroundColor: "white",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statsSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  progressBarContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
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
});

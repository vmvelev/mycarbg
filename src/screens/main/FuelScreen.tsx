import { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Button,
  Portal,
  Modal,
  TextInput,
  List,
  FAB,
} from "react-native-paper";
import { format } from "date-fns";

export default function FuelScreen() {
  const [visible, setVisible] = useState(false);
  const [stationName, setStationName] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [odometer, setOdometer] = useState("");
  const [date, setDate] = useState(new Date());

  const handleSubmit = async () => {
    // TODO: Implement fuel entry submission
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Last Fuel Entry Summary */}
        <List.Section>
          <List.Subheader>Last Refuel</List.Subheader>
          <View style={styles.statsCard}>
            <Text style={styles.statsValue}>8.2 L/100km</Text>
            <Text style={styles.statsLabel}>Average Consumption</Text>
          </View>
        </List.Section>

        {/* Recent Fuel Entries */}
        <List.Section>
          <List.Subheader>Recent Entries</List.Subheader>
          <List.Item
            title="Shell"
            description={`45.6L • 2.45 BGN/L • ${format(
              new Date(),
              "dd MMM yyyy"
            )}`}
            left={(props) => <List.Icon {...props} icon="gas-station" />}
          />
        </List.Section>
      </ScrollView>

      {/* Add Fuel Entry FAB */}
      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />

      {/* Add Fuel Entry Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Add Fuel Entry</Text>

          <TextInput
            label="Gas Station Name"
            value={stationName}
            onChangeText={setStationName}
            style={styles.input}
          />

          <TextInput
            label="Liters"
            value={liters}
            onChangeText={setLiters}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Price per Liter (BGN)"
            value={pricePerLiter}
            onChangeText={setPricePerLiter}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Total Price (BGN)"
            value={totalPrice}
            onChangeText={setTotalPrice}
            keyboardType="numeric"
            style={styles.input}
          />

          <TextInput
            label="Odometer Reading (km)"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
            Save Entry
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
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    margin: 16,
  },
  progress: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
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

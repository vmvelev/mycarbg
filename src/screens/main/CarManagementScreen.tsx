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

export default function CarManagementScreen() {
  const [visible, setVisible] = useState(false);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [oilChangeKm, setOilChangeKm] = useState("10000");
  const [oilChangeMonths, setOilChangeMonths] = useState("12");
  const [odometer, setOdometer] = useState("");

  const handleSubmit = async () => {
    // TODO: Implement car registration
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Car List */}
        <List.Section>
          <List.Subheader>My Cars</List.Subheader>
          <List.Item
            title="Toyota Camry"
            description="2020 • Last service: 5,000 km ago"
            left={(props) => <List.Icon {...props} icon="car" />}
          />
        </List.Section>

        <Button
          mode="contained"
          onPress={() => setVisible(true)}
          style={styles.addButton}
        >
          Add New Car
        </Button>
      </ScrollView>

      {/* Add Car Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
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
            label="Current Odometer Reading"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            style={styles.input}
          />

          <Button mode="contained" onPress={handleSubmit} style={styles.button}>
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

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

export default function MaintenanceScreen() {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Maintenance Status */}
        <List.Section>
          <List.Subheader>Oil Change Status</List.Subheader>
          <View style={styles.statsCard}>
            <Text style={styles.statsValue}>3,500 km</Text>
            <Text style={styles.statsLabel}>Until Next Oil Change</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progress, { width: "65%" }]} />
          </View>
        </List.Section>

        {/* Maintenance History */}
        <List.Section>
          <List.Subheader>Service History</List.Subheader>
          <List.Item
            title="Oil Change"
            description="10,000 km • 12 months • Done on 15 Jan 2024"
            left={(props) => <List.Icon {...props} icon="oil" />}
          />
        </List.Section>
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setVisible(true)} />

      {/* Add Maintenance Record Modal */}
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={styles.modal}
          children={undefined}
        >
          {/* TODO: Implement maintenance form */}
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

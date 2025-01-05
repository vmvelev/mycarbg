import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Title, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../contexts/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const { resetPassword } = useAuthContext();

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert("Грешка", "Въведи имейла си");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(email);
      if (!response.success) {
        Alert.alert(
          "Грешка",
          response.error?.message || "Грешка при изпращане на инструкции"
        );
      } else {
        Alert.alert("Успех", "Инструкциите са изпратени на имейла ти", [
          { text: "OK", onPress: () => navigation.navigate("Login") },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Забравена парола</Title>
          <Text style={styles.subtitle}>
            Въведи имейла си, за да изпратим инструкции за новата парола
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Имейл"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.button}
          >
            Изпрати инструкции
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.textButton}
          >
            Вход
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    padding: 4,
    marginTop: 8,
  },
  textButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

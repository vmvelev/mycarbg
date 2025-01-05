import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { TextInput, Button, Title, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../../contexts/AuthContext";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp } = useAuthContext();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Грешка", "Попълнете всички полета");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Грешка", "Сгрешена парола");
      return;
    }

    setLoading(true);
    try {
      const response = await signUp(email, password);
      if (!response.success) {
        Alert.alert(
          "Грешка",
          response.error?.message || "Грешка при регистриране"
        );
      } else {
        Alert.alert("Успех", "Регистрацията е успешна", [
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
          <Title style={styles.title}>Създаване на акаунт</Title>
          <Text style={styles.subtitle}>
            Регистирай се, за да започнеш да следиш автомобила си
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

          <TextInput
            label="Парола"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            style={styles.input}
          />

          <TextInput
            label="Потвърдете паролата"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          >
            Регистрация
          </Button>
        </View>

        <View style={styles.footer}>
          <Text>Вече имаш акаунт? </Text>
          <Button
            mode="text"
            compact
            onPress={() => navigation.navigate("Login")}
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

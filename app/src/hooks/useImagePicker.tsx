import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { File } from "expo-file-system";

interface UseImagePicker{
  image64: string | null;
  pickImage: () => void;
}

export const useImagePicker = (): UseImagePicker => {

  const [ image64, setImage64]  = useState<string|null>(null);

  const pickImage = async () => {

    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    (status !== "granted") &&
    Alert.alert(
        "Permisos requeridos",
        "Se requieren permisos para usar la cámara",
        [{ text: "Aceptar" }]
    );

    (status === "granted") &&
    (async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.3,
            base64: true,
        });

        (!result.canceled) &&
        (() => {
            const file = new File(result.assets[0].uri);
            const base64 = file.base64Sync();
            setImage64(base64);
        })();
    })();

  };

  return { image64, pickImage };

}

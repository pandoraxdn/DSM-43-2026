import { useState, useEffect } from 'react';
import { View, Text, Alert, Image } from 'react-native';
import { appTheme } from '../theme/appTheme';
import { BtnTouch } from '../components/BtnTouch';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

export const ImagePickerScreen = () => {

  const [ image64, setImage64 ] = useState<string|null>(null);

  useEffect( () => {
    ( async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if ( status !== "granted" ){
        Alert.alert(
          "Permiso Requerido",
          "Debes otorgar el permiso para acceder a tu galería."
        )
      }
    })();
  },[]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ 'images' ],
      allowsEditing: true,
      aspect: [4,3],
      quality: 0.9
    });
    
    ( !result.canceled ) && ( () => {
      const file = new FileSystem.File( result.assets[0].uri );
      const base64 = file.base64Sync();
      setImage64( base64 );
    })();
  }

  return(
    <View
      style={ appTheme.container }
    >
      <Text
        style={ appTheme.text }
      >
        ImagePickerScreen
      </Text>
      <BtnTouch
        text='Abrir galería'
        color='purple'
        borderColor='violet'
        onPress={ () => pickImage() }
      />
      {
        (image64) && (
          <Image
            style={{
              width: 200,
              height: 200,
              borderRadius: 20,
              borderColor: 'violet',
              borderWidth: 5
            }}
            source={{
              uri: `data:image/png;base64,${image64}`
            }}
          />
        )
      }
    </View>
  );
}

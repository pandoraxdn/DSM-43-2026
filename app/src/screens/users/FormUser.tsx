import { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { appTheme } from '../../theme/appTheme';
import { BtnTouch } from '../../components/BtnTouch';
import { StackScreenProps } from '@react-navigation/stack';
import { StackUserParams } from '../../navigator/UserStackNavigator';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useLocation } from '../../hooks/useLocation';
import { useUserForm } from '../../hooks/useUserForm';

interface Props extends StackScreenProps<StackUserParams,'FormUser'>{};

export const FormUser = ( { route, navigation }:Props ) => {

  const { state, handleInputChange, handleSubmit, handleDelete  } = useUserForm();
  const { location } = useLocation();
  const { image64, pickImage } = useImagePicker()

  useEffect( () => {
    const user = route.params;
    handleInputChange('id_user', user.id_user);
    handleInputChange('username', user.username);
    handleInputChange('email', user.email);
    handleInputChange('imagen', user.imagen);
    handleInputChange('location', `${location?.coords.altitude},${location?.coords.latitude}`);
  },[]);

  useEffect( () => {
    image64 && handleInputChange('imagen',image64);
  },[ image64 ]);

  return(
    <View
      style={ appTheme.container }
    >
      <Text
        style={ appTheme.text }
      >
        FormScreen
      </Text>
      <View>
        <TextInput
          style={ appTheme.textInput }
          value={ state.username }
          onChangeText={ (text) => handleInputChange('username',text) }
          placeholder='Ingresa el nombre del usuario'
          placeholderTextColor='black'
        />
        <TextInput
          style={ appTheme.textInput }
          value={ state.password }
          onChangeText={ (text) => handleInputChange('password',text) }
          placeholder='Contraseña del usuario'
          placeholderTextColor='black'
          keyboardType='default'
          secureTextEntry={true}
        />
        <TextInput
          style={ appTheme.textInput }
          value={ state.email }
          onChangeText={ (text) => handleInputChange('email',text) }
          placeholder='correo'
          placeholderTextColor='black'
          keyboardType='default'
        />
        <View
          style={{
            alignContent: "center",
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <BtnTouch
            text='Seleccionar Imagen'
            color='olive'
            borderColor='yellow'
            onPress={ () => pickImage() }
          />
          {
            (state.imagen) && (
              <Image
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 100,
                  borderWidth: 5,
                  borderColor: "yellow"
                }}
                source={{
                  uri: `data:image/png;base64,${state.imagen}`
                }}
              />
            )
          }
        </View>
        <TouchableOpacity
          onPress={ () => {
            handleSubmit();
            navigation.popToTop();
          }}
        >
          <View
            style={{  
              alignContent: 'center',
              alignItems: 'center',
              backgroundColor: 'violet',
              borderRadius: 10,
              height: 50,
              justifyContent: 'center',
              marginTop: 10,
              width: 200,
              alignSelf: 'center'
            }}
          >
            <Text
              style={{ fontSize: 30, textAlign: 'center' }}
            >
              { state.id_user == 0 ? 'Crear usuario' : 'Actualizar Usuario' }
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

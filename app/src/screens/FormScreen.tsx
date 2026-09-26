import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { appTheme } from '../theme/appTheme';
import { userForm } from '../hooks/useForm';

export const FormScreen = () => {

  const { state, handleInputChange  } = userForm();

  return(
    <View
      style={ appTheme.container }
    >
      <Text
        style={ appTheme.text }
      >
        FormScreen
      </Text>
      {/*Form User Data*/}
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
        <TextInput
          style={ appTheme.textInput }
          value={ state.phone }
          onChangeText={ (text) => handleInputChange('phone',text) }
          placeholder='Número teléfonico'
          placeholderTextColor='black'
          keyboardType='number-pad'
        />
        <TextInput
          style={ appTheme.textInput }
          value={ state.age }
          onChangeText={ (text) => handleInputChange('age',text) }
          placeholder='Edad'
          placeholderTextColor='black'
          keyboardType='number-pad'
        />
        <TextInput
          style={ appTheme.textInput }
          value={ state.stateCivil }
          onChangeText={ (text) => handleInputChange('stateCivil',text) }
          placeholder='Estado civil'
          placeholderTextColor='black'
          keyboardType='number-pad'
        />
        <TouchableOpacity
          onPress={ () => console.log(state) }
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
              Enviar Datos
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

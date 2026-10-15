import { useEffect } from 'react';
import { View, Text, FlatList, RefreshControl} from 'react-native';
import { appTheme } from '../../theme/appTheme';
import { UserReponse } from '../../interfaces/pandoraApiResponse';
import { useUserApi } from '../../hooks/useUserApi';
import { UserCard } from '../../components/UserCard';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import {BtnTouch} from '../../components/BtnTouch';

export const HomeUser = () => {

  const { isLoading, loadUsers, listUser } = useUserApi();

  const focused = useIsFocused();

  const navigation = useNavigation();

  useEffect( ()  => {
    (!isLoading) && loadUsers(); 
  },[ focused ]);

  const create: UserReponse = {
    id_user: 0,
    username: '',
    password: '',
    email: '',
    imagen: '',
    location: '',
    update: new Date()
  }

  return(
    <View
      style={ appTheme.container }
    >
      <FlatList
        data={ listUser }
        keyExtractor={ (item) => `#${item.id_user}` }
        ListHeaderComponent={(
          <View
            style={ appTheme.container }
          >
            <Text
              style={{
                ...appTheme.text,
                color: "olive"
              }}
            >
              Lista de usuarios
            </Text>
            <BtnTouch
              color='olive'
              borderColor='yellow'
              text='Crear usuario'
              onPress={ () => navigation.navigate('FormUser',{...create}) }
            />
          </View>
        )}
        refreshControl={(
          <RefreshControl
            refreshing={ isLoading }
            onRefresh={ loadUsers }
            colors={[ "olive", "yellow", "black" ]}
            progressBackgroundColor='black'
          />
        )}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        renderItem={ ({ item }) => (
          <UserCard
            user={ item }
          />
        )}
      />
    </View>
  );
}

import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { ThemeProvider } from 'styled-components';
import { preventAutoHideAsync, hideAsync } from 'expo-splash-screen';

import {
	useFonts,
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';
import { Routes } from './src/routes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/hooks/auth';

export default function App() {
	const [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold
	})

	const { userStorageLoading } = useAuth();

	useEffect(() => {
		async function prepare() {
        await preventAutoHideAsync();
			}
			prepare();
	}, [])
	
	if(!fontsLoaded || userStorageLoading){
		return null;
	}
	
	hideAsync();

  return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ThemeProvider theme={theme}>
				<StatusBar barStyle="light-content"/>
				<AuthProvider>
					<Routes />
				</AuthProvider>	
			</ThemeProvider>
		</GestureHandlerRootView>
  );
}
import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants'
import MapView, { Marker, LocalTile } from 'react-native-maps';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import * as Location from 'expo-location'

import { 
    View, 
    Text,
    Image,
    TouchableOpacity,
    StyleSheet, 
    ScrollView,
    Alert
} from 'react-native';

import api from '../../services/api';

interface Item {
    id: number,
    titulo: string,
    imagem_url: string
}

interface Ponto {
  id: number,
  nome: string,
  imagem: string,
  imagem_url: string,
  latitude: number,
  longitude: number
}

interface Params {
  uf: string,
  cidade: string
}

const Pontos = () => {  
  
    const [ itens, setItens ] = useState<Item[]>([]);
    const [ itensSelecionados, setItensSelecionados ] = useState<number[]>([]);
    const [ pontos, setPontos ] = useState<Ponto[]>([]);

    const [ posicaoInicial, setPosicaoInicial ] = useState<[number, number]>([0, 0]);

    const navigation = useNavigation();
    const route = useRoute();

    const routeParams = route.params as Params;

    //Carrega itens do servidor
    useEffect(() => {
      api.get('/itens').then(response => {
          setItens(response.data)
      });
    }, []);

    //Carreega mapa na posicao do usuario
    useEffect(() => {
      async function carregaPosicaoMapa() {
        const { status } = await Location.requestPermissionsAsync();

        if (status !== 'granted') {
          Alert.alert('Ooops...', 'Precisamos de sua permissão para obter a localização!')
          return;
        }

        const location = await Location.getCurrentPositionAsync();

        const { latitude, longitude } = location.coords;

        setPosicaoInicial([
          latitude, 
          longitude
        ]);

      }

      carregaPosicaoMapa();

    }, []);

    //Carrega os pontos cadastrados a cada vez que o itens é selecionado
    useEffect(() => {
        api.get('pontos', {
          params: {
            cidade: routeParams.cidade,
            uf: routeParams.uf,
            itens: itensSelecionados
          }
        }).then(response => {
          setPontos(response.data)
        })
    },[itensSelecionados])


    function controlaNavegacaoParaVoltar() {
        navigation.goBack();
    }

    function controlaNavegacaoParaDetalhes(id: number){
        navigation.navigate('Detalhes', {id_ponto: id})
    }

    //Controla os itens selecionados
    function controlaItensSelecionados(id: number) {

      const jaSelecionado = itensSelecionados.findIndex(item => item === id);

      if (jaSelecionado >= 0) {
          const filtraItensSelecionados = itensSelecionados.filter(item => item !== id);
          setItensSelecionados(filtraItensSelecionados);
      } else {
          //Guarda o já selecionado, adiciona o novo selecionado
          setItensSelecionados([ ...itensSelecionados, id ]);
      }
  }

    return(
        <>
        <View style={styles.container}>
            <TouchableOpacity onPress={controlaNavegacaoParaVoltar}>
                <Icon name="arrow-left" size={30} color="#34cb79" />
            </TouchableOpacity>

            <Text style={styles.title}>Bem vindo!</Text>
            <Text style={styles.description}>Encontre no mapa um ponto de coleta.</Text>

            <View style={styles.mapContainer}>
                { posicaoInicial[0] !== 0  && (
                  <MapView 
                    style={styles.map}
                    initialRegion={{ 
                        latitude: posicaoInicial[0],
                        longitude: posicaoInicial[1],
                        latitudeDelta: 0.013,
                        longitudeDelta: 0.013
                    }}
                  >
                    { pontos.map(ponto => (
                      <Marker 
                        key={String(ponto.id)}
                        style={styles.mapMarker}
                        onPress={() => controlaNavegacaoParaDetalhes(ponto.id)}
                        coordinate={{
                          latitude: ponto.latitude,
                          longitude: ponto.longitude,
                        }}
                      >
                        <View style={styles.mapMarkerContainer}>
                          <Image 
                            style={styles.mapMarkerImage}
                            source={{ uri: ponto.imagem_url}}
                          />
                          <Text style={styles.mapMarkerTitle}>{ponto.nome}</Text>
                        </View>
                      </Marker>

                    ))
                    }
                  </MapView>
                )
                }
            </View>
        </View>
    
        <View style={styles.itemsContainer}>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingHorizontal: 20}}
            >

              { itens.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.item,
                    itensSelecionados.includes(item.id) ? styles.selectedItem : {}
                  ]}
                  onPress={() => controlaItensSelecionados(item.id)}
                  activeOpacity={0.4}
                >
                  <SvgUri width={42} height={42} uri={item.imagem_url} />
                  <Text style={styles.itemTitle}>{item.titulo}</Text>
                </TouchableOpacity>
              ))}

            </ScrollView>
        </View>
        </>
    );
}

export default Pontos;



const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    title: {
      fontSize: 20,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 4,
      fontFamily: 'Roboto_400Regular',
    },
  
    mapContainer: {
      flex: 1,
      width: '100%',
      borderRadius: 10,
      overflow: 'hidden',
      marginTop: 16,
    },
  
    map: {
      width: '100%',
      height: '100%',
    },
  
    mapMarker: {
      width: 90,
      height: 80, 
    },
  
    mapMarkerContainer: {
      width: 90,
      height: 70,
      backgroundColor: '#34CB79',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
      alignItems: 'center'
    },
  
    mapMarkerImage: {
      width: 90,
      height: 45,
      resizeMode: 'cover',
    },
  
    mapMarkerTitle: {
      flex: 1,
      fontFamily: 'Roboto_400Regular',
      color: '#FFF',
      fontSize: 13,
      lineHeight: 23,
    },
  
    itemsContainer: {
      flexDirection: 'row',
      marginTop: 16,
      marginBottom: 32,
    },
  
    item: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#eee',
      height: 120,
      width: 120,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 16,
      marginRight: 8,
      alignItems: 'center',
      justifyContent: 'space-between',
  
      textAlign: 'center',
    },
  
    selectedItem: {
      borderColor: '#34CB79',
      borderWidth: 2,
    },
  
    itemTitle: {
      fontFamily: 'Roboto_400Regular',
      textAlign: 'center',
      fontSize: 13,
    },
  });
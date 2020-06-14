import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, SafeAreaView, Linking } from 'react-native';
import Constants from 'expo-constants';
import { Feather as Icon, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RectButton } from 'react-native-gesture-handler'
import * as MailComposer from 'expo-mail-composer';
import api from '../../services/api';

//Crio uma interface para pegar o parametro recebido
interface Params {
  id_ponto: number;
}

//Cria objeto que coleta as informações da busca na api
interface DadosPonto {
  ponto: {
    imagem: string,
    nome: string,
    email: string,
    whatsapp: string,
    cidade: string,
    uf: string
  };
  itens: {
    titulo: string
  }[];
}

const Detalhes = () => {

    const [dadosPonto, setDadosPonto ] = useState<DadosPonto>({} as DadosPonto);

    //Crio a navegação
    const navigation = useNavigation();

    //Recebedo todos meus parametros 
    const route = useRoute();

    //Faz com que o TS assuma que o parametro recebido é do formato Params
    const routeParams = route.params as Params;

    //Carrega as informações do mercado pelo id recebido
    useEffect(() => {
      api.get(`ponto/${routeParams.id_ponto}`).then(response => {
        setDadosPonto(response.data)
      });
    },[]);

    //Navegação para voltar uma aba
    function controlaNavegacaoParaVoltar() {
        navigation.goBack();
    }

    function controlaComposeMail() {
      MailComposer.composeAsync({
        subject: 'Interesse na colata de resíduos',
        recipients: [dadosPonto.ponto.email]
      });
    }

    function controlaWhatsapp() {
      Linking.openURL(`whatsapp://send?phone=${dadosPonto.ponto.whatsapp}&text=Tenho interesse sobre coleta de resíduos`)
    }

    //Aqui nessa verificação, o certo é ter uma tela de carregamento, até que os dados sejam buscados.
    if (!dadosPonto.ponto) {
        return null;
    }

    
    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={styles.container}>
                <TouchableOpacity onPress={controlaNavegacaoParaVoltar}>
                    <Icon name="arrow-left" size={30} color="#34cb79" />
                </TouchableOpacity>

                <Image 
                    style={styles.pointImage} 
                    source={{ uri: dadosPonto.ponto.imagem }}
                />
                
                <Text style={styles.pointName}>{dadosPonto.ponto.nome}</Text>
                <Text style={styles.pointItems}>
                  {dadosPonto.itens.map(item => item.titulo).join(', ')}
                </Text>

                <View style={styles.address}>
                    <Text style={styles.addressTitle}>Endereço</Text>
                    <Text style={styles.addressContent}>{dadosPonto.ponto.cidade}, {dadosPonto.ponto.uf}</Text>
                </View>
            </View>
            <View style={styles.footer}>
                <RectButton 
                    style={styles.button}
                    onPress={controlaWhatsapp}
                >
                    <FontAwesome name="whatsapp" size={20} color="#FFF"/>
                    <Text style={styles.buttonText}>Whatsapp</Text>
                </RectButton>

                <RectButton 
                    style={styles.button}
                    onPress={controlaComposeMail}
                >
                    <Icon name="mail" size={20} color="#FFF"/>
                    <Text style={styles.buttonText}>E-mail</Text>
                </RectButton>
            </View>
        </SafeAreaView>
    )
}

export default Detalhes;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
      paddingTop: 20 + Constants.statusBarHeight,
    },
  
    pointImage: {
      width: '100%',
      height: 120,
      resizeMode: 'cover',
      borderRadius: 10,
      marginTop: 32,
    },
  
    pointName: {
      color: '#322153',
      fontSize: 28,
      fontFamily: 'Ubuntu_700Bold',
      marginTop: 24,
    },
  
    pointItems: {
      fontFamily: 'Roboto_400Regular',
      fontSize: 16,
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    address: {
      marginTop: 32,
    },
    
    addressTitle: {
      color: '#322153',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    },
  
    addressContent: {
      fontFamily: 'Roboto_400Regular',
      lineHeight: 24,
      marginTop: 8,
      color: '#6C6C80'
    },
  
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderColor: '#999',
      paddingVertical: 20,
      paddingHorizontal: 32,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    
    button: {
      width: '48%',
      backgroundColor: '#34CB79',
      borderRadius: 10,
      height: 50,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      marginLeft: 8,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Roboto_500Medium',
    },
  });
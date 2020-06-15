import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api';
import axios from 'axios';

import Dropzone from '../../components/Dropzone/index';

import './styles.css'

import logo from '../../assets/logo.svg';

const CriaPontoColeta = () => {

    interface Item {
        id: number;
        titulo: string;
        imagem_url: string;
    }

    interface IBGEUF {
        sigla: string;
    } 

    interface IBGECidade {
        nome: string;
    } 

    const [ itens , setItens ] = useState<Item[]>([]);
    const [ ufs, setUfs ] = useState<string[]>([]);
    const [ cidades, setCidade ] = useState<string[]>([]);
    const [ posicaoInicialMapa, setPosicaoInicialMapa ] = useState<[number, number]>([0, 0]);
    const [ dadosFormulario, setDadosFormulario ] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })
    const [ ufSelecionada, setUfSelecionada] = useState('0');
    const [ cidadeSelecionada, setCidadeSelecionada ] = useState('0')
    const [ posicaoSelecionada, setPosicaoSelecionada ] = useState<[number, number]>([0, 0]);
    const [ itemSelecionado, setItemSelecionado ] = useState<number[]>([]);
    const [ arquivoSelecionado, setArquivoSelecionado ] = useState<File>();

    const history = useHistory();

    /*
        Carrega em tela cada vez que algo mudar. 
        Recebe 2 parâmetro: 
        1 - A function que deve ser rodada quando ocorrer uma mudança.
        2 - A variável/estado que fica sendo monitorado para ver se ocorre mudança nele.
        caso eu deixe o [] vazio, ele sempre vai rodar a function que o componente é carregado.
    */
    useEffect(() => {
        api.get('itens').then(response => {
            setItens(response.data)
        })
    }, []);

    // Carrega posição atual do usuário no mapa
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(posicao => {
            const { latitude, longitude } = posicao.coords;

            setPosicaoInicialMapa([latitude, longitude])
        })
    }, []);

    //Busca as siglas dos estados BR
    useEffect(() => {
        axios.get<IBGEUF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
           const siglasUf = response.data.map(uf => uf.sigla); 
           setUfs(siglasUf);
        });
    }, [])

    // Carrega as cidades sempre que a UF mudar
    useEffect(() => {
        if(ufSelecionada === '0'){
            return;
        }

        axios.get<IBGECidade[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelecionada}/municipios`)
            .then(response => {
                const nomeCidades = response.data.map(cidade => cidade.nome); 
                setCidade(nomeCidades)
            }
        )

    }, [ufSelecionada]);

    // Cada vez que selecionar uma UF diferente, mudamos o estado.
    function controlaSelecaoUf(event: ChangeEvent<HTMLSelectElement>) {
        const ufSelecionada = event.target.value;
        setUfSelecionada(ufSelecionada);
    }

    // Cada vez que a cidade mudar o valor, pegamos o atual
    function controlaSelecaoCidade(event: ChangeEvent<HTMLSelectElement>) {
        const cidade = event.target.value;
        setCidadeSelecionada(cidade);
    }

    //Pega posição do marker ao plicar no mapa
    function controlaMarkerDoMap(event: LeafletMouseEvent) {
        setPosicaoSelecionada([
            event.latlng.lat,
            event.latlng.lng
        ])
    }

    //Coleta informações dos inputs
    function controlaDadosInput(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        // Carrego as informações já existente com o ...dadosFormulario
        setDadosFormulario({ ...dadosFormulario, [ name ]: value });
    }   

    //Controla os itens selecionados
    function controlaItensSelecionados(id: number) {

        const jaSelecionado = itemSelecionado.findIndex(item => item === id);

        if (jaSelecionado >= 0) {
            const filtraItensSelecionados = itemSelecionado.filter(item => item !== id);
            setItemSelecionado(filtraItensSelecionados);
        } else {
            //Guarda o já selecionado, adiciona o novo selecionado
            setItemSelecionado([ ...itemSelecionado, id ]);
        }
    }

    async function controlaEnvioDeDados(event: FormEvent) {
        //mantem na mesma tela assim que clicar
        event.preventDefault();

        const { name, email, whatsapp } = dadosFormulario;
        const uf = ufSelecionada;
        const cidade = cidadeSelecionada;
        const [latitude, longitude] = posicaoSelecionada;
        const itens = itemSelecionado;

        const dados = new FormData();

        dados.append("nome", name);
        dados.append("email", email);
        dados.append("whatsapp", whatsapp);
        dados.append("latitude", String(latitude));
        dados.append("longitude", String(longitude));
        dados.append("cidade", cidade);
        dados.append("uf", uf);
        dados.append("itens", (itens).join(','));
        
        //Aqui só envia se a imagem estiver selecionada
        if (arquivoSelecionado) {
            dados.append('imagem', arquivoSelecionado);
        }



        await api.post('/ponto', dados);

        alert('Ponto de coleta criado!')

        //Permite a navegação sem nenhuma interação do usuário
        history.push('/')
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />

                <Link to="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={controlaEnvioDeDados}>
                <h1>Cadatro do <br/> ponto de coleta</h1>

                <Dropzone arquivoEnviado={setArquivoSelecionado} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label> 
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={controlaDadosInput}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label> 
                                <input 
                                    type="email"
                                    name="email"
                                   id="email"
                                   onChange={controlaDadosInput}
                                />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label> 
                                <input 
                                    type="text"
                                    name="whatsapp"
                                   id="whatsapp"
                                   onChange={controlaDadosInput}
                                />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço do mapa</span>
                    </legend>

                    <Map 
                        center={posicaoInicialMapa} 
                        zoom={15}
                        onClick={controlaMarkerDoMap}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={posicaoSelecionada} />
                    </Map>

                    <div className="field-group"> 
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={ufSelecionada} 
                                onChange={controlaSelecaoUf}
                            >
                                <option value="0">
                                    Selecione uma UF
                                </option>
                                    {ufs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city"
                                value={cidadeSelecionada}
                                onChange={controlaSelecaoCidade}
                            >
                                <option value="0">
                                    Selecione uma cidade
                                </option>
                                {cidades.map(cidade => (
                                    <option key={cidade} value={cidade}>{cidade}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mias ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {itens.map(item => (
                            <li 
                                key={item.id} 
                                onClick={() => controlaItensSelecionados(item.id)}
                                className={itemSelecionado.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.imagem_url} alt={item.titulo} />
                                <span>{item.titulo}</span>
                            </li>
                        ))}
                    </ul>

                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>

            </form>

        </div>
    );
}

export default CriaPontoColeta;
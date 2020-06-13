import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom';

import Home from './pages/Home'
import CriaPontoColeta from './pages/CriaPontoColeta'

const Rotas = () => {
    return (
        <BrowserRouter>
            <Route component={Home} path="/" exact={true} />
            <Route component={CriaPontoColeta} path="/cria-ponto" />
        </BrowserRouter>
    );
}

export default Rotas;
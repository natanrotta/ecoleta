import express from 'express';
import PontoController from './controllers/PontoController';
import ItemController from './controllers/ItemController';

const rotas = express.Router();
const pontoContoller = new PontoController;
const itemController = new ItemController;

rotas.get('/itens', itemController.buscaItens);

rotas.post('/ponto', pontoContoller.criaPonto); 
rotas.get('/ponto/:id', pontoContoller.buscaPontoEspecifico);
rotas.get('/pontos', pontoContoller.buscarPontos); 


export default rotas;
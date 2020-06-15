import express from 'express';
import PontoController from './controllers/PontoController';
import ItemController from './controllers/ItemController';
import { celebrate, Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

const rotas = express.Router();

const upload = multer(multerConfig);

const pontoContoller = new PontoController;
const itemController = new ItemController;

rotas.get('/itens', itemController.buscaItens);

rotas.get('/ponto/:id', pontoContoller.buscaPontoEspecifico);
rotas.get('/pontos', pontoContoller.buscarPontos); 

//Adiciona a validação no cadastro do ponto
rotas.post(
    '/ponto', 
    upload.single('imagem'),
    celebrate({
        body: Joi.object().keys({
            nome: Joi.string().required(),
            email: Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required(),
            cidade: Joi.string().required(),
            uf: Joi.string().required().max(2).min(2),
            itens: Joi.string().required(),
        })
    }, {
        abortEarly: false
    }),
    pontoContoller.criaPonto);


export default rotas;


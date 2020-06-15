import knex from '../database/conexao';
import { Request, Response } from 'express';

class PontosController {
    async criaPonto(request: Request, response: Response) {
        const {
            nome, 
            email,
            whatsapp,
            latitude,
            longitude,
            cidade, 
            uf,
            itens
        } = request.body;

        const ponto = {
            imagem: request.file.filename,
            nome, 
            email,
            whatsapp,
            latitude,
            longitude,
            cidade, 
            uf
        }
    
        const transaction = await knex.transaction();
    
        const idPontoInserido = await transaction('ponto').insert(ponto);
    
        const idPonto = idPontoInserido[0];
    
        const pontoItens = itens
            .split(',')
            .map((item: string) => Number(item.trim()))
            .map((item_id: number) => {
                return {
                    id_item: item_id,
                    id_ponto: idPonto
                };
        });
    
        await transaction('ponto_item').insert(pontoItens);

        await transaction.commit();
    
        return response.json({
            id: idPonto,
            ...ponto,
        })
    }

    async buscaPontoEspecifico(request: Request, response: Response) {
        const idPontoColeta = request.params.id;

        const ponto = await knex('ponto').where('id', idPontoColeta).first();

        if (!ponto) {
            return response.status(400).json({ mensagem: 'Ponto não encontrado'});
        }

        const serealizaPonto = {
            ...ponto,
            imagem_url: `http://192.168.0.104:3333/uploads/${ponto.imagem}`,
        };


        const itens = await knex('item')
            .join('ponto_item', 'item.id', '=', 'ponto_item.id_item')
            .where('ponto_item.id_ponto', idPontoColeta)
            .select('item.titulo')

        return response.json({ ponto: serealizaPonto, itens });
    }

    async buscarPontos(request: Request, response: Response) {
        const { cidade, uf, itens } = request.query;

        const separaItens = String(itens)
            .split(',')
            .map(item => Number(item.trim()));

        const pontos = await knex('ponto')
            .join('ponto_item', 'ponto.id', '=', 'ponto_item.id_ponto')
            .whereIn('ponto_item.id_item', separaItens)
            .where('cidade', String(cidade))
            .where('uf', String(uf))
            .distinct()
            .select('ponto.*');

        const serealizaPontos = pontos.map(ponto => {
            return {
                ...ponto,
                imagem_url: `http://192.168.0.104:3333/uploads/${ponto.imagem}`,
            }
        });


        return response.json(serealizaPontos);
    }
}

export default PontosController;
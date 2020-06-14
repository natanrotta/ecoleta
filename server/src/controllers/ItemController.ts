import knex from '../database/conexao';
import { Request, Response } from 'express';

class ItemController {
    async buscaItens (request: Request, response: Response) {

        const itens = await knex('item').select('*');
    
        const serealizaItens = itens.map(item => {
            return {
                id: item.id,
                titulo: item.titulo,
                imagem_url: `http://192.168.0.104:3333/uploads/${item.imagem}`,
            }
        });
    
        return response.json(serealizaItens);
    }
}

export default ItemController;
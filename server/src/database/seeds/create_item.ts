import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('item').insert([
        { imagem: 'lampadas.svg', titulo: 'Lâmpada'},
        { imagem: 'baterias.svg', titulo: 'Pilhas e Baterias'},
        { imagem: 'papeis-papelao.svg', titulo: 'Papéis e Papelão' },
        { imagem: 'eletronicos.svg', titulo: 'Risíduos Eletrônicos' },
        { imagem: 'organicos.svg', titulo: 'Resíduos Orgânicos' },
        { imagem: 'oleo.svg', titulo: 'Óleo de cozinha' },
    ])
}

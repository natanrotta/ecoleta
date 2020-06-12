import Knex from 'knex';

export async function up(knex: Knex) {
    return knex.schema.createTable('ponto_item', table => {
        table.increments('id').primary();

        table.integer('id_ponto')
        .notNullable()
        .references('id')
        .inTable('ponto');
        
        table.integer('id_item')
        .notNullable()
        .references('id')
        .inTable('item');
    });
}

export async function down(knex: Knex) {
    return knex.schema.dropTable('ponto_item');
}
const { Pool } = require('pg');

class DBUtils {
    constructor() {
        this._pool = new Pool();
    }

    async executeQuery(query) {
        const { rows } = await this._pool.query(query);
        return rows;
    }

    async select(columns, table, condition = '', values = [], joinTables = [], joinConditions = []) {
        let queryText = `SELECT `;
        queryText = (columns.length === 0) ? queryText + '*' : queryText + columns.join(', ');
        queryText += ` FROM ${table}`;

        if (joinTables.length > 0) joinTables.forEach((tab, index) => queryText += ` JOIN ${tab} ON ${table}.${joinConditions[index]} = ${tab}.id`);

        if (condition) queryText += ` WHERE ${condition}`;

        const query = {
            text: queryText,
            values: values
        };

        return this.executeQuery(query);
    }

    async insert(table, values) {
        const placeHolder = values.map((_, i) => `$${i + 1}`).join(', ');
        const queryText = `INSERT INTO ${table} VALUES (${placeHolder}) RETURNING id`;

        const query = {
            text: queryText,
            values: values
        };

        return this.executeQuery(query);
    }

    async update(table, columns, condition, values) {
        const setColumns = columns.map((column, i) => `${column} = $${i + 1}`).join(', ');
        const queryText = `UPDATE ${table} SET ${setColumns} WHERE ${condition} RETURNING id`;

        const query = {
            text: queryText,
            values: values
        };

        return this.executeQuery(query);
    }

    async delete(table, condition, values) {
        const queryText = `DELETE FROM ${table} WHERE ${condition} RETURNING id`;

        const query = {
            text: queryText,
            values: values
        };

        return this.executeQuery(query);
    }
}

module.exports = DBUtils;
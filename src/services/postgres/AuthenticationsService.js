const { nanoid } = require('nanoid');

const DBUtils = require('../../utils/DBUtils');

const InvariantError = require('../../exceptions/InvariantError');

const tableNames = 'authentications';

class AuthenticationsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addRefreshToken(token) {
        const id = `AS-${nanoid(14)}`;
        const values = [id, token];
        await this._dbUtils.insert(tableNames, values);
    }

    async verifyRefreshToken(token) {
        const rows = await this._dbUtils.select(['token'], tableNames, `token = $1`, [token]);
        if (!rows.length) throw new InvariantError('Refresh token tidak valid');
    }

    async deleteRefreshToken(token) { await this._dbUtils.delete(tableNames, `token = $1`, [token]) }
}

module.exports = AuthenticationsService;
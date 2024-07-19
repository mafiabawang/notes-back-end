const { nanoid } = require('nanoid');
const DBUtils = require('../../utils/DBUtils');
const { hashPassword, comparePassword } = require('../../utils/PasswordUtils');
const { InvariantError, AuthenticationError, NotFoundError } = require('../../exceptions');
const tableNames = 'users';

class UsersService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async verifyNewUsername(username) {
        const rows = await this._dbUtils.select(['username'], tableNames, `username = $1`, [username]);
        if (rows.length) throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }

    async verifyUserCredential(username, password) {
        const rows = await this._dbUtils.select(['id', 'password'], tableNames, `username = $1`, [username]);
        if (!rows.length) throw new AuthenticationError('Kredensial yang Anda berikan salah');

        const { id, password: hashedPassword } = rows[0];
        const match = await comparePassword(password, hashedPassword);
        if (!match) throw new AuthenticationError('Kredensial yang Anda berikan salah');

        return id;
    }

    async addUser({ username, password, fullname }) {
        await this.verifyNewUsername(username);
        const id = `US-${nanoid(14)}`;

        const hashedPassword = await hashPassword(password);

        const values = [id, username, hashedPassword, fullname];
        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0].id) throw new InvariantError('User gagal ditambahkan');

        return rows[0].id;
    }

    async getUserById(id) {
        const rows = await this._dbUtils.select(['id', 'username', 'fullname'], tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('User tidak ditemukan');

        return rows[0];
    }

    async getUsersByUsername(username) {
        const rows = await this._dbUtils.select(['id', 'username', 'fullname'], tableNames, `username LIKE $1`, [`%${username}%`]);
        return rows;
    }
}

module.exports = UsersService;
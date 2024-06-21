const { nanoid } = require('nanoid');

const DBUtils = require('../../utils/DBUtils');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

const tableNames = 'notes';

class NotesService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async verifyNoteOwner(id, owner) {
        const rows = await this.getNoteById(id);
        if (rows.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    async addNote({ title, body, tags, owner }) {
        const id = `NS-${nanoid(14)}`;
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const values = [id, title, body, tags, created_at, updated_at, owner];
        const rows = await this._dbUtils.insert(tableNames, values);

        if (!rows[0].id) throw new InvariantError('Gagal Menambahkan Catatan');

        return rows[0].id;
    }

    async getNotes(owner) { return await this._dbUtils.select([], tableNames, `owner = $1`, [owner]); }

    async getNoteById(id) {
        const rows = await this._dbUtils.select([], tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Catatan tidak ditemukan');

        return rows[0];
    }

    async editNoteById(id, { title, body, tags }) {
        const updated_at = new Date().toISOString();
        const columns = ['title', 'body', 'tags', 'updated_at'];

        const values = [title, body, tags, updated_at, id];
        const rows = await this._dbUtils.update(tableNames, columns, `id = $${values.length}`, values);

        if (!rows.length) throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    async deleteNoteById(id) {
        const rows = await this._dbUtils.delete(tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Gagal menghapus catatan. Id tidak ditemukan');
    }
}

module.exports = NotesService;